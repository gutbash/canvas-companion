import os
from dotenv import load_dotenv
from flask_cors import CORS
from flask import Flask, request, jsonify
import openai

app = Flask(__name__)

# Load .env.local file
load_dotenv(dotenv_path='.env.local')

# Access keys using os.environ.get('KEY_NAME')
api_key = os.environ.get('API_KEY')
database_url = os.environ.get('DATABASE_URL')

CORS(app)

print(api_key)          # Outputs: your_api_key_value
print(database_url)     # Outputs: your_database_url

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    data = request.get_json()
    user_message = data.get('message')
    
    response = openai.Completion.create(
      engine="davinci",
      prompt=user_message,
      max_tokens=150
    )

    bot_response = response.choices[0].text.strip()
    return jsonify({'response': bot_response})

if __name__ == '__main__':
    app.run(port=5000)