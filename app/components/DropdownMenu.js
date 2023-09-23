import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TrashIcon, DuplicateIcon, CheckIcon, CopyIcon, PencilIcon, EyeClosedIcon, EyeIcon } from '@primer/octicons-react';
import { UndoIcon, KebabHorizontalIcon, TriangleRightIcon, PlusIcon, BookmarkFillIcon, BookmarkIcon,SquareIcon, StackIcon,CheckboxIcon } from '@primer/octicons-react';

const DropdownMenu = ({ chatId, message, onClose, chats, setChats, setDropdownMessageId, setDropdownOpen, setEditMessageId, setEdit}) => {

  const [copyClicked, setCopyClicked] = useState(false);

  const deleteMessage = () => {
    setChats(prevChats => {
      const newChats = {...prevChats};
      const newMessages = newChats[chatId].filter(msg => msg.id !== message.id);
      newChats[chatId] = newMessages;
      return newChats;
    });
    setDropdownMessageId(null);
    setDropdownOpen(false);
    onClose();
  };

  const duplicateMessage = () => {
    let duplicatedMessage = { id: uuidv4(), role: message.role, content: message.content, visible: message.visible };
    setChats(prevChats => {
      const newChats = {...prevChats};
      const messages = newChats[chatId];
      const index = messages.indexOf(message);
      const updateList = [
        ...messages.slice(0, index + 1),
        duplicatedMessage,
        ...messages.slice(index + 1)
      ];
      newChats[chatId] = updateList;
      return newChats;
    });
    onClose();
  };

  const copyText = () => {
    navigator.clipboard.writeText(message.content);
    // Set copyClicked state to true when the button is clicked
    setCopyClicked(true);
    // Change it back to false after 2 seconds
    setTimeout(() => {
      setCopyClicked(false);
    }, 500);
  };

  const editMessage = () => {
    setEditMessageId(message.id);
    setEdit(message.content.toLowerCase());
    onClose();
  };

  const editVisibility = () => {
    setChats(prevChats => {
      const newChats = {...prevChats};
      const messages = newChats[chatId];
      const messageIndex = messages.findIndex(msg => msg.id === message.id);
      if (messageIndex !== -1) {
        messages[messageIndex].visible = !messages[messageIndex].visible;
      }
      return newChats;
    });
    onClose();
  };

  return (
    <div className="dropdown-menu">
      <button title={message.visible ? "Hide" : "Show"} onClick={editVisibility}>
        {message.visible ? <EyeClosedIcon size={16} /> : <EyeIcon size={16} />}
      </button>
      <button title="Duplicate" onClick={duplicateMessage}><DuplicateIcon size={16} /></button>
      <button title="Delete" onClick={deleteMessage}><TrashIcon size={16} /></button>
    </div>
  )
};

export default DropdownMenu;
