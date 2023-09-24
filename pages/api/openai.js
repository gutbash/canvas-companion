import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export default async (req, res) => {

  try{

    console.log('_______________PROMPT__________________-')
    console.log(req.body.query)
    console.log('_______________/PROMPT___________________-')

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-0613",
        messages: req.body.query,
        temperature: 1.0,
        top_p: 1.0,
        max_tokens: 220,
    });

    const response = completion.data.choices[0].message.content;

    console.log('________________RESPONSE__________________-')
    console.log(response)
    console.log('________________/RESPONSE__________________-')

    res.status(200).json(`${response}`)

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred with the OpenAI API.' });
  }
}