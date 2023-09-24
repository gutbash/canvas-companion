import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const tools = [];
const chat = new ChatOpenAI({ modelName: "gpt-4", temperature: 0, openAIApiKey: apiKey });

const executor = await initializeAgentExecutorWithOptions(tools, chat, {
    agentType: "openai-functions",
    verbose: true,
  });

const result = await executor.run();