const posts = [
  {
    id: 1,
    category: "music",
    label: "AI MUSIC",
    date: "2026.06.30",
    title: "ダークテンポの曲を作るメモ",
    excerpt: "低いベース、暗いピアノ、静かなノイズで、かっこいい曲を作るための制作メモです。",
    body: "ダークテンポの曲は、低いベース、短いピアノ、静かなノイズを重ねると雰囲気が出ます。明るい音を入れすぎず、余白を作ると大人っぽくなります。"
  },
  {
    id: 2,
    category: "design",
    label: "WEB DESIGN",
    date: "2026.06.30",
    title: "GitHub Pagesでブログを作る",
    excerpt: "HTML、CSS、JavaScriptだけで公開できるブログサイトを作るメモです。",
    body: "GitHub Pagesは、index.htmlを置くだけでサイトを公開できます。style.cssで見た目を作り、script.jsで検索やカテゴリ切り替えを動かします。"
  },
  {
    id: 3,
    category: "video",
    label: "VIDEO EDIT",
    date: "2026.06.29",
    title: "MV用の短い動画をまとめる",
    excerpt: "TikTokやYouTube Shortsに使える短いMVを、記事として整理できます。",
    body: "短いMVは、サビの一番強いところを使うと見てもらいやすいです。最初の1秒でタイトルや動きのある映像を見せると止まりやすくなります。"
  },
  {
    id: 4,
    category: "game",
    label: "GAME DEV",
    date: "2026.06.28",
    title: "自作ゲームの更新メモ",
    excerpt: "追加した機能、直したバグ、次に作りたいアイデアを残すページです。",
    body: "ゲーム制作では、直したバグと次に作る機能をメモすると進めやすくなります。小さい更新でもブログに残すと、あとで作品紹介になります。"
  },
  {
    id: 5,
    category: "music",
    label: "AI MUSIC",
    date: "2026.06.27",
    title: "曲のジャケットをブログに載せる",
    excerpt: "曲名、世界観、ジャケット画像、リンクを1つの記事にまとめる形です。",
    body: "曲の記事には、曲名、テーマ、歌詞の一部、制作メモ、YouTubeやTikTokのリンクを入れると見やすくなります。"
  },
  {
    id: 6,
    category: "design",
    label: "DESIGN",
    date: "2026.06.26",
    title: "男っぽいダークUIの作り方",
    excerpt: "黒、グレー、青アクセントを使って、硬くてクールな雰囲気を作ります。",
    body: "男っぽいダークUIは、背景を黒に近くして、文字は白すぎないグレー、アクセントは青にするとまとまります。角丸を少し小さくするとシャープになります。"
  }
];

const postList = document.getElementById("postList");
const searchInput = document.getElementById("searchInput");
const categoryTabs = document.getElementById("categoryTabs");
const menuButton = document.getElementById("menuButton");
const nav = document.getElementById("nav");

const modal = document.getElementById("postModal");
const modalBg = document.getElementById("modalBg");
const modalClose = document.getElementById("modalClose");
const modalMeta = document.getElementById("modalMeta");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

let currentCategory = "all";

function renderPosts() {
  const keyword = searchInput.value.trim().toLowerCase();

  const filteredPosts = posts.filter((post) => {
    const matchCategory =
      currentCategory === "all" || post.category === currentCategory;

    const matchKeyword =
      post.title.toLowerCase().includes(keyword) ||
      post.excerpt.toLowerCase().includes(keyword) ||
      post.label.toLowerCase().includes(keyword);

    return matchCategory && matchKeyword;
  });

  if (filteredPosts.length === 0) {
    postList.innerHTML = '<div class="empty">記事が見つかりませんでした。</div>';
    return;
  }

  postList.innerHTML = filteredPosts
    .map((post) => {
      return `
        <article class="post-card">
          <div class="post-thumb"></div>

          <div>
            <p class="post-meta">${post.label} / ${post.date}</p>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <button class="text-button" data-post-id="${post.id}">
              READ MORE →
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function setCategory(category) {
  currentCategory = category;

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });

  renderPosts();
}

function openPost(postId) {
  const post = posts.find((item) => item.id === Number(postId));

  if (!post) {
    return;
  }

  modalMeta.textContent = `${post.label} / ${post.date}`;
  modalTitle.textContent = post.title;
  modalBody.textContent = post.body;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closePost() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");

  if (!button) {
    return;
  }

  setCategory(button.dataset.category);
});

document.addEventListener("click", (event) => {
  const readButton = event.target.closest("[data-post-id]");

  if (readButton) {
    openPost(readButton.dataset.postId);
  }

  const sideCategory = event.target.closest("[data-side-category]");

  if (sideCategory) {
    setCategory(sideCategory.dataset.sideCategory);
  }
});

searchInput.addEventListener("input", renderPosts);

menuButton.addEventListener("click", () => {
  nav.classList.toggle("show");
});

modalBg.addEventListener("click", closePost);
modalClose.addEventListener("click", closePost);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePost();
  }
});

renderPosts();
