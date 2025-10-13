from pathlib import Path
import os
from openai import OpenAI
from dotenv import load_dotenv
import pandas as pd
from tqdm import tqdm

load_dotenv() 

folder = Path('./quiz_data')

# 获取所有 .md 文件
md_files = list(folder.glob('*.md'))

quiz_lists = []

for file in md_files:
    content = file.read_text(encoding='utf-8')
    # print(f'--- {file.name} ---')
    # print(content)
    quizzes = content.split('<problem>')
    quiz_pairs = []
    for quiz in quizzes:
        if '<answer>' in quiz:
            question, answer = quiz.split('<answer>')
            question = question.strip().replace('<problem/>', '').strip()
            answer = answer.strip().replace('<answer/>', '').strip()
            if question and answer:
                quiz_pairs.append((question, answer))
                # print(f'Q: {question}\nA: {answer}\n')
    quiz_lists.append((file.name, quiz_pairs))


difficulty = ['easy', 'medium', 'hard']
topic = ['sample-space', 'probability','random-variable', 'distribution', 'expectation', 'limit-theorem', 'statistics']

# api_key = 'sk-97c2df9a79734b6b9a6f193074b6feee'

client = OpenAI(
    api_key=os.getenv('DEEPSEEK_API_KEY'),
    base_url="https://api.deepseek.com")

records = []
for quiz in tqdm(quiz_lists):
    print(f'File: {quiz[0]}')
    for q, a in quiz[1]:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {   
                    "role": "system", 
                    "content": "You are a helpful assistant that helps to label the question with difficulty and topic."},
                {
                    "role": "user", 
                    "content": f"please label the question with difficulty and topic, and add a hint for the question (corresponding to the answer). The difficulty can be {difficulty}, and the topic can be {topic}. The question is: {q} The answer is: {a}. Please only give me the result in json format like(and please don't add any other tags or characters or signs into the final strings) {{'difficulty': 'easy', 'topic': 'probability', 'hint': '解答改题目的提示（注意用中文回答，如果涉及到公式，则要符合markdown格式下Latex语法，同时注意转义字符要多加一个反斜杠）'}}"
                }
            ],
            stream=False,
        )
        result = response.choices[0].message.content
        if result is not None:
            result_json = eval(result)  # Convert string representation of dict to actual dict
            d, t, h = result_json.get('difficulty'), result_json.get('topic'), result_json.get('hint')
            record = (q, a, d, t, h)
            records.append(record)

# 保存结果到csv文件,标题为 question, answer, difficulty, topic
df = pd.DataFrame(records, columns=['question', 'answer', 'difficulty', 'topic', 'hint'])
df.to_csv('labeled_quiz.csv', index=False, encoding='utf-8-sig')


# print(response.choices[0].message.content)





