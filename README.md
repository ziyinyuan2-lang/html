# WorldFun AI Auto Blog

GitHub ActionsでAIが自動で記事を書いて、GitHub Pagesに表示するブログです。

## 必要なファイル

- index.html
- style.css
- script.js
- posts.json
- scripts/auto_blog.py
- .github/workflows/auto-blog.yml

## 使い方

1. このZIPを解凍します。
2. 中のファイルをGitHubの `html` リポジトリにアップロードします。
3. GitHubで `Settings` → `Secrets and variables` → `Actions` を開きます。
4. `OPENAI_API_KEY` を追加します。
5. Actionsタブで `Auto Blog Writer` を実行します。

## 自動時間

`auto-blog.yml` の `cron: "0 0 * * *"` は、毎日9:00ごろ（日本時間）に動く設定です。
