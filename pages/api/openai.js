const { Configuration, OpenAIApi } = require("openai");
const { getCourses, getGrades, getAssignments, getCoursesUtil, getCoursesList } = require('app/utils/canvas');

const apiKey = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: apiKey,
});

const openai = new OpenAIApi(configuration);

export default async (req, res) => {

  try {

    const courses = await getCoursesList();
    const courseDictionary= await getCoursesUtil();
    console.log(courseDictionary)

    const messages = req.body.query

    console.log('_______________PROMPT__________________-')
    console.log(messages)
    console.log('_______________/PROMPT___________________-')
    
    const functions = [
      {
          "name": "get_assignments_and_quizzes",
          "description": "Get assignments and quizzes for a given course.",
          "parameters": {
              "type": "object",
              "properties": {
                  "course": {
                    "type": "string",
                    "enum": courses,
                    "description": "Which course to grab assignments and quizzes from.",
                  },
              },
              "required": ["course"],
          },
      },
      {
        "name": "get_grades",
        "description": "Get list of grades for each course.",
        "parameters": {
          "type": "object",
          "properties": {},
          "required": [],
        },
      },
      {
        "name": "get_courses",
        "description": "Get list of courses student is currently enrolled in.",
        "parameters": {
          "type": "object",
          "properties": {},
          "required": [],
        },
      },
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
      console.log("----------------FUNCTION CALL DETECTED----------------");
      const availableFunctions = {
        get_assignments_and_quizzes: getAssignments,
        get_grades: getGrades,
        get_courses: getCourses,
      };  // only one function in this example, but you can have multiple
      const functionName = responseMessage.function_call.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      const courseId = courseDictionary[functionArgs.course]
      console.log(responseMessage.function_call.arguments)
      console.log(functionArgs)
      console.log(courseId)
      const functionResponse = await functionToCall(courseId);

      console.log('________________FUNCTION CALL__________________-')
      console.log(responseMessage)
      console.log(functionResponse)
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
    // console.error(error);
    res.status(500).json({ error: 'An error occurred with the OpenAI API.' });
  }
}