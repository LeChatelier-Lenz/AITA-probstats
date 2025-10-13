import pandas as pd

# 从labeled_quiz.csv中随机读取10条数据
df = pd.read_csv('labeled_quiz.csv', encoding='utf-8-sig')
sample_df = df.sample(n=10, random_state=42)
print(sample_df)