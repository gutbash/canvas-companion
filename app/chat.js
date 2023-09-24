'use client';

import { runLLM } from './utils/api';
const { TextArea } = Input;
import { LoadingOutlined, SwitcherOutlined, UndoOutlined } from '@ant-design/icons';
const antIcon = <LoadingOutlined className='typing-indicator' spin />;
import {Input} from 'antd';
import 'styles/chat.css';
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "framer-motion";
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { UndoIcon, TriangleRightIcon, PlusIcon, StackIcon, DuplicateIcon, DashIcon } from '@primer/octicons-react';

export default function Chat() {
  const [chats, setChats] = useState({ [`chat-${uuidv4()}`]: [] });
  const [messages, setMessages] = useState({});
  const [editMessageId, setEditMessageId] = useState(null);
  const [edit, setEdit] = useState("")
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [dropdownMessageId, setDropdownMessageId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleDropdownId, setRoleDropdownId] = useState(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selected, setSelected] = useState([]);
  const [summaryPrompt, setSummaryPrompt] = useState('Create a very concise summary of the above messages.');
  const textAreaRef = useRef(null);
  const editTextAreaRef = useRef(null);
  const now = new Date()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const day = now.getDate();
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const second = now.getSeconds().toString().padStart(2, '0');
  
  const dateTime = `${month} ${day}, ${year} ${hour}:${minute}`;

  useEffect(() => {
    textAreaRef.current.style.height = '20px';
  }, [])

  useEffect(() => {
    if (editMessageId && editTextAreaRef.current) {
      const textarea = editTextAreaRef.current;
      textarea.focus();
    }
  }, [editMessageId, edit]);

  const handleMouseEnter = (id) => {
    setHoveredMessageId(id);
  };

  const handleMouseLeave = () => {
    setHoveredMessageId(null);
  };

  const handleInputChange = (e, chatId) => {
    const newMessage = e.target.value;
    setMessages(prevMessages => ({ ...prevMessages, [chatId]: newMessage }));
  };

  const handleEditChange = (e) => {
    setEdit(e.target.value);
    e.target.style.height = '20px';
    e.target.style.height = `${e.target.scrollHeight - 10}px`;
  };

  const handleEdit = (chatId, messageId, edit) => {
    setChats(prevChats => {
      const newChats = { ...prevChats };
      const chat = newChats[chatId];
      const messageIndex = chat.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        chat[messageIndex].content = edit;
      }
      return newChats;
    });
    setEditMessageId(null);
    setEdit('');
  };

  const handleDropdownToggle = (id) => {
    if (dropdownOpen) {
      setDropdownMessageId(null);
      setDropdownOpen(false);
      if (dropdownMessageId != id) {
        setDropdownMessageId(id);
        setDropdownOpen(true);
      };
    } else {
      setDropdownMessageId(id);
      setDropdownOpen(true);
    };
  };

  const handleRoleDropdownToggle = (id) => {
    if (roleDropdownOpen) {
      setRoleDropdownId(null);
      setRoleDropdownOpen(false);
      if (roleDropdownId != id) {
        setRoleDropdownId(id);
        setRoleDropdownOpen(true);
      };
    } else {
      setRoleDropdownId(id);
      setRoleDropdownOpen(true);
    };
  };

  const handleSelect = (checked, message) => {
    if (checked && !selected.some(e => e.id === message.id)) {
      setSelected(prevSelected => [...prevSelected, { id: message.id, content: message.content, role: message.role, visible: message.visible, child: message.child }]);
    } else {
      setSelected(prevSelected => prevSelected.filter(select => select.id !== message.id));
    }
  };

  const handleChatReset = (chatId) => {
    setChats(prevChats => {
      const newChats = { ...prevChats };
      newChats[chatId] = [];
      return newChats;
    });
    setEditMessageId(null);
    setEdit("");
    setHoveredMessageId(null);
    setDropdownMessageId(null);
    setDropdownOpen(false);
    setIsTyping(false);
    setSelected([]);
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceChatItems = Array.from(chats[source.droppableId]);
      const destChatItems = Array.from(chats[destination.droppableId]);
      const [removed] = sourceChatItems.splice(source.index, 1);
      destChatItems.splice(destination.index, 0, removed);

      const newChats = {
        ...chats,
        [source.droppableId]: sourceChatItems,
        [destination.droppableId]: destChatItems
      };

      setChats(newChats);
    } else {
      const chatItems = Array.from(chats[source.droppableId]);
      const [reorderedItem] = chatItems.splice(source.index, 1);
      chatItems.splice(destination.index, 0, reorderedItem);

      setChats({ ...chats, [source.droppableId]: chatItems });
    }
  };

  const handleSend = async (chatId) => {
    const systemMessage = {
      role: "system",
      content: `It is ${dateTime}. You are a student's helpful educational companion of for their Canvas Learning Management System. Help the student keep up with assignments, quizzes, announcements, and more. Respond in full markdown format.`,
    };

    const prompt = messages[chatId].trim();
    const userMessage = { id: `message-${uuidv4()}`, role: "user", content: String(prompt), visible: true, child: false };
    const visibleMessages = chats[chatId].filter(msg => msg.visible && (msg.content !== ""));

    if (prompt === "" && visibleMessages.length === 0) {
      return;
    } else {
      setChats(prevChats => {
        const newChats = { ...prevChats };
        const newChat = [...newChats[chatId]];

        if (prompt !== "") {
          newChat.push(userMessage);
        }

        setMessages(prevMessages => ({ ...prevMessages, [chatId]: '' }));

        const messageList = [systemMessage, ...newChat
          .filter(msg => msg.visible)
          .map(msg => ({
            role: msg.role,
            content: msg.content
          }))];

        setIsTyping(true);

        runLLM(messageList).then(response => {
          setIsTyping(false);
          const assistantMessage = { id: `message-${uuidv4()}`, role: "assistant", content: String(response), visible: true, child: false };
          newChat.push(assistantMessage);
        });

        newChats[chatId] = newChat;
        return newChats;
      });
    }
  };

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter wrapLines={true} style={coy} language={match[1]} PreTag="div" children={String(children).replace(/\n$/, '')} {...props} />
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  }

  const titleVariants = {
    hidden: { opacity: 0, y: -50, x: -65 },
    visible: { opacity: 0.1, y: -200, x: -65, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -300, transition: { duration: 0.2 } }
  }

  return (
    <div className="chat-container">
      <div className="header">
        <div className="logo">
          <img src="static/canvas.png" alt="canvas logo" />
        </div>
        <h1>Companion</h1>
      </div>
      <AnimatePresence>
        {Object.values(chats).every(chat => chat.length === 0) &&
          <motion.div
            className="title"
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
          </motion.div>
        }
      </AnimatePresence>
      <motion.div layoutId='message-list' className="message-list">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <div className="chat-instances-container">
            {Object.keys(chats).map((chatId) => (
              <div key={chatId} className="chat-container">
                <Droppable key={chatId} droppableId={chatId}>
                  {(provided) => (
                    <ul className="message-list" {...provided.droppableProps} ref={provided.innerRef}>
                      {chats[chatId].map((msg, index) =>
                        <Draggable key={msg.id} draggableId={msg.id} index={index}>
                          {(provided) => (
                            <AnimatePresence>
                              <motion.li
                                className={msg.child ? "child-message" : ""}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                onMouseEnter={() => handleMouseEnter(msg.id)}
                                onMouseLeave={handleMouseLeave}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                              >
                                <li {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} onMouseEnter={() => handleMouseEnter(msg.id)} onMouseLeave={handleMouseLeave}>
                                  <div className={msg.visible ? 'message-wrapper' : 'message-wrapper message-hidden'}>
                                    <div className="message-role">
                                      <div className='role-box'>
                                      
                                        <span className="role" >
                                          {msg.role}
                                        </span>
                                      </div>
                                      <AnimatePresence>
                                        {roleDropdownId === msg.id && roleDropdownOpen && (
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                            transition={{ duration: 0.1 }}
                                          >
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                    <div className="message-content">
                                      {editMessageId === msg.id ? (
                                        <TextArea
                                          ref={editTextAreaRef}
                                          autoSize
                                          size='small'
                                          className='edit-box'
                                          type='text'
                                          defaultValue={edit}
                                          onChange={e => { handleEditChange(e) }}
                                          onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                              e.preventDefault();
                                              handleEdit(chatId, msg.id, edit);
                                            }
                                          }}
                                        />
                                      ) : (
                                        <div className='message-text'>
                                          <div className="markdown-container">
                                            {
                                              msg.content.trim() !== '' ?
                                                <ReactMarkdown components={components} children={msg.content.toLowerCase().split('\n').map(line => line + '  ').join('\n')} remarkPlugins={remarkGfm} /> :
                                                <p className='placeholder-markdown' >type a message...</p>
                                            }
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              </motion.li>
                            </AnimatePresence>
                          )}
                        </Draggable>
                      )}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
                <motion.div layoutId={`input-container-layout-id-${chatId}`} layout transition={{ duration: 0.5 }} className="input-container" key={`input-container-key-${chatId}`} id={`input-container-id-${chatId}`}>
                  <div className="input-container" style={{ marginTop: 'auto' }}>

                    <button title='Reset Chat' onClick={() => handleChatReset(chatId)} className='input-button'><UndoIcon size={16} /></button>                    
                    <textarea
                      ref={textAreaRef}
                      type="text"
                      className='input-box'
                      value={messages[chatId] || ''}
                      onChange={(e) => handleInputChange(e, chatId)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(chatId);
                        }
                      }}
                    />
                    <button title='Send' onClick={() => handleSend(chatId)} className='input-button'><TriangleRightIcon size={24} /></button>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </motion.div>
    </div>
  );
}
