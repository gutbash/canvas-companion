import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const tools = [];
const chat = new ChatOpenAI({ modelName: "gpt-4", temperature: 0, openAIApiKey: apiKey });

const executor = await initializeAgentExecutorWithOptions(tools, chat, {
    agentType: "openai-functions",
    verbose: true,
  });

export default async (req, res) => {

  try{

    console.log('_______________PROMPT__________________-')
    console.log(req.body.query)
    console.log('_______________/PROMPT___________________-')

    const response = await executor.run(req.body.query);

    console.log('________________RESPONSE__________________-')
    console.log(response)
    console.log('________________/RESPONSE__________________-')

    res.status(200).json(`${response}`)

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred with the OpenAI API.' });
  }
}