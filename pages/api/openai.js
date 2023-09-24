const { Configuration, OpenAIApi } = require("openai");

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: apiKey,
});

const openai = new OpenAIApi(configuration);

function getAssignments(course, days) {
  const assignments = {
      "course": course,
      "days": days,
      "assignments": [{"name": "assignment 1", "due": "09-25-23", "points": "100"}],
  };
  return JSON.stringify(assignments);
}

export default async (req, res) => {

  try{

    const messages = req.body.query

    console.log('_______________PROMPT__________________-')
    console.log(messages)
    console.log('_______________/PROMPT___________________-')
    
    const courses = ["Math", "Science"];
    const functions = [
      {
          "name": "get_assignments",
          "description": "Get assignments from a window of days.",
          "parameters": {
              "type": "object",
              "properties": {
                  "course": {
                    "type": "string",
                    "enum": courses,
                    "description": "Which course to grab assignments from.",
                  },
                  "days": {
                    "type": "integer",
                    "description": "Window of days to search forward and back.",
                  },
              },
              "required": ["course", "days"],
          },
      }
    ];

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        functions: functions,
        function_call: "auto",
    });

    let response = completion.data.choices[0].message.content;

    const responseMessage = completion.data.choices[0].message;

    if (responseMessage.function_call) {
      const availableFunctions = {
        get_assignments: getAssignments,
      };  // only one function in this example, but you can have multiple
      const functionName = responseMessage.function_call.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      const functionResponse = functionToCall(
          functionArgs.course,
          functionArgs.days,
      );

      console.log('________________FUNCTION CALL__________________-')
      console.log(responseMessage)
      console.log('________________/FUNCTION CALL__________________-')
      
      messages.push(responseMessage);
      messages.push({
        "role": "function",
        "name": functionName,
        "content": functionResponse,
      });

      const secondResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
      });  // get a new response from GPT where it can see the function response

      response = secondResponse.data.choices[0].message.content;

      console.log('________________SECOND RESPONSE__________________-')
      console.log(secondResponse)
      console.log('________________/SECOND RESPONSE__________________-')

    } else {
      console.log('________________RESPONSE__________________-')
      console.log(response)
      console.log('________________/RESPONSE__________________-')
    }

    res.status(200).json(`${response}`)

  } catch (error) {
    console.log('________________ERROR__________________-')
    console.error(error);
    res.status(500).json({ error: 'An error occurred with the OpenAI API.' });
  }
}