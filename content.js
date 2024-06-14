// 隐藏包含关键词的元素
function hideElements(keyword) {
  const elements = document.querySelectorAll(".bili-dyn-title__text");
  elements.forEach((element) => {
    if (element.textContent.includes(keyword)) {
      const parent = element.closest(".bili-dyn-list__item");
      if (parent) {
        parent.style.display = "none";
      }
    }
  });
}

// 显示所有元素
function showAllElements() {
  const elements = document.querySelectorAll(".bili-dyn-list__item");
  elements.forEach((element) => {
    element.style.display = "";
  });
}

// 获取存储的关键词并隐藏相应的元素
function applyKeywords() {
  chrome.storage.sync.get(["keywords"], (result) => {
    const keywords = result.keywords || [];
    keywords.forEach((keyword) => {
      hideElements(keyword);
    });
  });
}

// 初始化函数，包含观察者
function init() {
  showAllElements();
  applyKeywords();

  // 创建一个观察者实例，监视 DOM 的变化
  const observer = new MutationObserver(() => {
    applyKeywords();
  });

  // 配置观察选项
  const config = { childList: true, subtree: true };

  // 选择要观察的节点
  const targetNode = document.querySelector(".bili-dyn-list__items");

  if (targetNode) {
    // 传入目标节点和观察选项
    observer.observe(targetNode, config);
  }
}

// 执行初始化函数
init();
