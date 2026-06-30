const postList = document.getElementById("postList");
const postCount = document.getElementById("postCount");
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

let posts = [];
let currentCategory = "all";

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function simpleMarkdown(text) {
  const safe = escapeHtml(text || "");
  const lines = safe.split("\n");
  let html = "";
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h3>${trimmed.replace("## ", "")}</h3>`;
      continue;
    }

    if (trimmed.startsWith("- ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${trimmed.replace("- ", "")}</li>`;
      continue;
    }

    if (trimmed === "") {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      continue;
    }

    if (inList) {
      html += "</ul>";
      inList = false;
    }

    html += `<p>${trimmed}</p>`;
  }

  if (inList) {
    html += "</ul>";
  }

  return html;
}

async function loadPosts() {
  try {
    const response = await fetch("posts.json?time=" + Date.now());

    if (!response.ok) {
      throw new Error("posts.jsonが見つかりません");
    }

    posts = await response.json();
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    postCount.textContent = posts.length;
    renderPosts();
  } catch (error) {
    postList.innerHTML = `<div class="empty">記事を読み込めませんでした。posts.jsonを確認してください。</div>`;
    console.error(error);
  }
}

function renderPosts() {
  const keyword = searchInput.value.trim().toLowerCase();

  const filteredPosts = posts.filter((post) => {
    const matchCategory = currentCategory === "all" || post.category === currentCategory;
    const matchKeyword =
      post.title.toLowerCase().includes(keyword) ||
      post.excerpt.toLowerCase().includes(keyword) ||
      post.body.toLowerCase().includes(keyword) ||
      post.category.toLowerCase().includes(keyword);

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
          <p class="post-meta">${escapeHtml(post.label)} / ${escapeHtml(post.date)}</p>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.excerpt)}</p>
          <button class="text-button" data-post-id="${escapeHtml(post.id)}">READ MORE →</button>
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
  const post = posts.find((item) => String(item.id) === String(postId));

  if (!post) {
    return;
  }

  modalMeta.textContent = `${post.label} / ${post.date}`;
  modalTitle.textContent = post.title;
  modalBody.innerHTML = simpleMarkdown(post.body);

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

loadPosts();
