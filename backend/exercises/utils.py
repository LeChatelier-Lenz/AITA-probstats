import os
from openai import OpenAI
from dotenv import load_dotenv

# 调用 DeepSeek API 的函数
def call_deepseek_api(question:str, user_answer: str, correct_answer: str) -> (bool,str):
    """
    调用 DeepSeek 或其他判题服务
    返回 bool，表示用户答案是否正确
    """
    load_dotenv()
    client = OpenAI(
        api_key=os.getenv('DEEPSEEK_API_KEY'),
        base_url="https://api.deepseek.com")
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {   
                    "role": "system", 
                    "content": "你是一个专门用于判断数学题目给定答案正确与否的聊天机器人，你在回答过程中不应包含任何人称词语，而是客观进行判断和解释"},
                {
                    "role": "user", 
                    "content": f"假设你需要进行对一个数学问题的正确答案与给定答案之间的判定（对或错），并给出判定的解释，假如题目为 {question}, 正确答案为 {correct_answer}, 给出的解答为 {user_answer},请你比对给定的解答和正确答案之间的关系，判定给定的解答是否正确回答了题目，并最终按照如下的JSON格式返回（注意除此之外不要带上任何标识符） {{'is_correct': 'true', 'explanation': '具体解释内容（用中文回答）'}}"
                }
            ],
            stream=False,
        )
        result = response.choices[0].message.content 
        result_json = eval(result)   
        is_correct_str = result_json.get('is_correct')
        is_correct = True if is_correct_str  == "true" else False
        explanation = result_json.get('explanation')

    except Exception as e:
        # 出现异常时可以记录日志并默认返回 False
        print(f"[DeepSeek API Error] {e}")
        return False
    
    return is_correct,explanation