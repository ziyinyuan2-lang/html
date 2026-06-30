import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

POSTS_PATH = Path("posts.json")
JST = timezone(timedelta(hours=9))

TOPICS = [
    {"category": "music", "label": "音楽", "topic": "AI音楽でダークテンポの曲を作るコツ"},
    {"category": "video", "label": "動画", "topic": "TikTok向けMVを短く見せる編集メモ"},
    {"category": "design", "label": "デザイン", "topic": "黒と青で作る男っぽいWebデザイン"},
    {"category": "game", "label": "ゲーム", "topic": "小さなHTMLゲームを作るときの考え方"},
    {"category": "ai", "label": "AI", "topic": "AIを使って作品づくりを続ける方法"},
    {"category": "diary", "label": "日記", "topic": "今日の制作ログと次にやること"}
]


def load_posts():
    if not POSTS_PATH.exists():
        return []

    with POSTS_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_posts(posts):
    with POSTS_PATH.open("w", encoding="utf-8") as file:
        json.dump(posts, file, ensure_ascii=False, indent=2)


def clean_json_text(text):
    text = text.strip()

    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)

    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1:
        return text[start:end + 1]

    return text


def fallback_article(selected, today):
    title = selected["topic"]
    body = f"""## 今日のテーマ
今日は「{selected["topic"]}」についての制作メモです。

## ポイント
- まず小さく作る
- 見た目より先に中身を決める
- 完成したらすぐ公開して直す

## 次にやること
次は、この記事を見ながら作品ページや動画説明文にも使える形に整えます。
"""
    return {
        "title": title,
        "excerpt": f"{selected['topic']}について、初心者でも進めやすい形でまとめました。",
        "body": body
    }


def call_openai(selected):
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()

    if not api_key:
        return None

    model = os.environ.get("OPENAI_MODEL", "gpt-5.5").strip()

    prompt = f"""
あなたは日本語ブログを書くプロです。
小学生でも読めるくらいわかりやすく、でも見た目はクールなブログに合う文章を書いてください。

テーマ:
{selected["topic"]}

条件:
- 日本語
- 文字数は600〜900字くらい
- タイトルは短く
- excerptは70字以内
- bodyはMarkdown風で、## 見出し と - 箇条書きを使う
- 著作権のある歌詞や作品本文は書かない
- 最後に「次にやること」を入れる

次のJSONだけで返してください。
{{
  "title": "記事タイトル",
  "excerpt": "短い説明",
  "body": "本文"
}}
"""

    payload = {
        "model": model,
        "input": prompt
    }

    request = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        },
        method="POST"
    )

    with urllib.request.urlopen(request, timeout=90) as response:
        data = json.loads(response.read().decode("utf-8"))

    text = data.get("output_text", "")

    if not text:
        parts = []
        for item in data.get("output", []):
            for content in item.get("content", []):
                if content.get("type") in ["output_text", "text"]:
                    parts.append(content.get("text", ""))
        text = "\n".join(parts)

    if not text:
        raise RuntimeError("OpenAI APIから本文を取得できませんでした。")

    article = json.loads(clean_json_text(text))
    return article


def make_post():
    posts = load_posts()
    today = datetime.now(JST).strftime("%Y-%m-%d")
    selected = TOPICS[len(posts) % len(TOPICS)]

    already_today = any(post.get("date") == today for post in posts)

    if already_today and os.environ.get("FORCE_NEW_POST", "").lower() != "true":
        print(f"{today} の記事はすでにあります。")
        return

    try:
        article = call_openai(selected)
    except Exception as error:
        print(f"OpenAI APIで失敗しました。テンプレート記事を作ります: {error}", file=sys.stderr)
        article = None

    if article is None:
        article = fallback_article(selected, today)

    new_post = {
        "id": f"post-{today}-{len(posts) + 1}",
        "category": selected["category"],
        "label": selected["label"],
        "date": today,
        "title": str(article.get("title", selected["topic"])).strip(),
        "excerpt": str(article.get("excerpt", "")).strip()[:120],
        "body": str(article.get("body", "")).strip()
    }

    posts.insert(0, new_post)
    posts = posts[:50]
    save_posts(posts)

    print(f"新しい記事を作りました: {new_post['title']}")


if __name__ == "__main__":
    make_post()
