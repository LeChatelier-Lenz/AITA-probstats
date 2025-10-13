import pandas as pd

df = pd.read_csv('labeled_quiz.csv')

# 读取所有question列和answer列，识别\[ 和 \]，前者在其之前额外附加一个空行，后者在其之后额外附加一个空行
df['question'] = df['question'].str.replace(r'\\\[', '\\n\\n\\[', regex=True)
df['question'] = df['question'].str.replace(r'\\\]', '\\]\\n\\n', regex=True)
df['answer'] = df['answer'].str.replace(r'\\\[', '\\n\\n\\[', regex=True)
df['answer'] = df['answer'].str.replace(r'\\\]', '\\]\\n\\n', regex=True)
df.to_csv('trans_quiz.csv', index=False)