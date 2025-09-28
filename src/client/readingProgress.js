// src/client/readingProgress.js

function initReadingProgress() {
  // 创建进度条元素
  const progressBar = document.createElement("div");
  progressBar.className = "reading-progress-bar";
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #6366f1, #818cf8);
    transform-origin: left;
    z-index: 999;
    transition: transform 0.2s ease;
    transform: scaleX(0);
  `;
  document.body.appendChild(progressBar);

  // 更新进度函数
  const updateProgress = () => {
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPosition = window.scrollY;

    if (scrollHeight > 0) {
      const progress = (scrollPosition / scrollHeight) * 100;
      progressBar.style.transform = `scaleX(${progress / 100})`;
    }
  };

  // 监听事件
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });

  // 初始化
  updateProgress();

  // 路由变化时更新
  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(history, arguments);
    setTimeout(updateProgress, 100);
  };
}

// 确保 DOM 加载完成后执行
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReadingProgress);
  } else {
    initReadingProgress();
  }
}
