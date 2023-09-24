import os
import canvas


from dotenv import load_dotenv
from flask_cors import CORS
from flask import Flask, request, jsonify

from langchain.chat_models import ChatOpenAI
from langchain.agents import initialize_agent, AgentType, Tool, AgentExecutor
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools.render import format_tool_to_openai_function
from langchain.agents.format_scratchpad import format_to_openai_functions
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser

print(canvas.gradeData)


app = Flask(__name__)

# Load .env.local file
load_dotenv(dotenv_path='.env.local')

# Access keys using os.environ.get('KEY_NAME')
openai_api_key = os.environ.get('NEXT_PUBLIC_OPENAI_API_KEY')
#database_url = os.environ.get('DATABASE_URL')

def get_assignments(course: str, recency_days: int):
  courseIndex = canvas.findCourseIndex(course)
  if(courseIndex == False):
    return "Sorry this is not a valid class"
  else: 
    return canvas.getAssignments(courseIndex)
     
  pass

def get_quizzes(course: str, recency_days: int):
  courseIndex = canvas.findCourseIndex(course)
  if(courseIndex == False):
    return "Sorry this is not a valid class"
  else: 
    return canvas.getQuizzes(courseIndex)
  pass

def get_announcements(course: str, recency_days: int):
  courseIndex = canvas.findCourseIndex(course)
  if(courseIndex == False):
    return "Sorry this is not a valid class"
  else: 
    canvas.getScore(courseIndex)
  pass

def get_grades(course: str):
  if(course in dict):
    return("Your grade is: " + dict[course])
  pass

llm = ChatOpenAI(
  openai_api_key=openai_api_key,
  model_name="gpt-3.5-turbo",
  temperature=0,
)

tools = [
    Tool(
        name = "Assigments",
        func=get_assignments,
        description="useful for when you need to answer questions about current events. You should ask targeted questions."
    ),
    Tool(
        name = "Quizzes",
        func=get_quizzes,
        description="useful for when you need to answer questions about current events. You should ask targeted questions."
    ),
    Tool(
        name = "Announcements",
        func=get_announcements,
        description="useful for when you need to answer questions about current events. You should ask targeted questions."
    ),
    Tool(
        name = "Grades",
        func=get_grades,
        description="useful for when you need to answer questions about current events. You should ask targeted questions."
    ),
]

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful educational assistant for the Canvas Learning Management System."),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

llm_with_tools = llm.bind(
    functions=[format_tool_to_openai_function(t) for t in tools]
)

agent = {
    "input": lambda x: x["input"],
    "agent_scratchpad": lambda x: format_to_openai_functions(x['intermediate_steps'])
} | prompt | llm_with_tools | OpenAIFunctionsAgentOutputParser()

#agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
agent_executor = initialize_agent(tools, llm, agent=AgentType.OPENAI_FUNCTIONS, verbose=True)

CORS(app)

print(openai_api_key)          # Outputs: your_api_key_value
#print(database_url)     # Outputs: your_database_url

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    data = request.get_json()
    user_input = data.get('message')
    
    agent_response = agent_executor.run(user_input)
    
    return jsonify({'response': agent_response})

if __name__ == '__main__':
    app.run(port=5000)