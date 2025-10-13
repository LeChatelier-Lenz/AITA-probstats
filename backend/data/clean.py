import pandas as pd

df = pd.read_csv('labeled_quiz.csv')

# 读取所有question列和answer列，识别\[ 和 \]，更换为$$; 识别\( 和 \)，更换为$
df['question'] = df['question'].str.replace(r'\\\[', '$$', regex=True)
df['question'] = df['question'].str.replace(r'\\\]', '$$', regex=True)
df['question'] = df['question'].str.replace(r'\\\(', '$', regex=True)
df['question'] = df['question'].str.replace(r'\\\)', '$', regex=True)
df['answer'] = df['answer'].str.replace(r'\\\[', '$$', regex=True)
df['answer'] = df['answer'].str.replace(r'\\\]', '$$', regex=True)
df['answer'] = df['answer'].str.replace(r'\\\(', '$', regex=True)
df['answer'] = df['answer'].str.replace(r'\\\)', '$', regex=True)
df.to_csv('cleaned_quiz.csv', index=False)