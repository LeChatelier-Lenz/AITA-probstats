import os
from openai import OpenAI
from dotenv import load_dotenv

# 调用 DeepSeek API 的函数
def call_deepseek_api(question: str, user_answer: str, correct_answer: str) -> tuple[bool, str]:
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
        result = response.choices[0].message.content or ''
        # 期望 deepseek 返回形如 {'is_correct': 'true', 'explanation': '...'} 的文本
        # 为安全起见尽量不用 eval，这里假定后端已严格 prompt，若失败则回退默认
        try:
            result_json = eval(result)
        except Exception:
            result_json = {}
        is_correct_str = result_json.get('is_correct')
        is_correct = True if is_correct_str  == "true" else False
        explanation = result_json.get('explanation')

    except Exception as e:
        # 出现异常时可以记录日志并默认返回 False
        print(f"[DeepSeek API Error] {e}")
        return False, ""
    
    return is_correct, (explanation or "")


def generate_error_report(analysis_list: list[dict]) -> str:
    """根据多条错因分析生成综合易错报告（Markdown），委托 deepseek 完成整理。"""
    load_dotenv()
    client = OpenAI(
        api_key=os.getenv('DEEPSEEK_API_KEY'),
        base_url="https://api.deepseek.com")
    try:
        # 将分析合并为一个精简提示（只传递错因解释的要点，避免逐题复述导致过长）
        bullets = []
        for i, a in enumerate(analysis_list, start=1):
            ex = (a.get('explanation') or '')[:160]
            if ex:
                bullets.append(f"{i}. {ex}")
        joined = "\n".join(bullets) or "(暂无数据)"
        prompt = (
            "基于以下若干道题的错因解释要点，请归纳近期学习中的共性易错点，"
            "避免逐题复述与冗长细节，聚焦宏观规律。\n\n"
            "输出要求：\n"
            "- 使用中文 Markdown；\n"
            "- 结构简洁，包含：# 近期易错概览、## 核心易错点（3-5条清单）、## 改进建议（2-3条）、## 需要巩固的知识点（关键词）；\n"
            "- 总字数不超过300字；\n"
            "- 不要包含具体题目或长篇公式。\n\n"
            f"错因要点：\n{joined}"
        )
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "你是一个学习助手，负责汇总错因，输出结构化中文 Markdown 报告。"},
                {"role": "user", "content": prompt},
            ],
            stream=False,
        )
        content = response.choices[0].message.content or ""
        return content
    except Exception as e:
        print(f"[DeepSeek ErrorReport Error] {e}")
        return ""