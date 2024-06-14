document.addEventListener("DOMContentLoaded", () => {
  const keywordInput = document.getElementById("keyword");
  const addKeywordButton = document.getElementById("addKeyword");
  const keywordList = document.getElementById("keywordList");
  const drawerToggle = document.getElementById("drawerToggle");
  const drawer = document.getElementById("drawer");
  const importButton = document.getElementById("importButton");
  const exportButton = document.getElementById("exportButton");
  const importFileInput = document.getElementById("importFile");

  // 处理抽屉的展开和收起
  drawerToggle.addEventListener("click", () => {
    drawer.classList.toggle("open");
    drawerToggle.textContent = drawer.classList.contains("open")
      ? "折叠用户列表"
      : "显示已屏蔽的用户";
  });

  addKeywordButton.addEventListener("click", () => {
    const keyword = keywordInput.value.trim();
    if (keyword) {
      chrome.storage.sync.get(["keywords"], (result) => {
        const keywords = result.keywords || [];
        keywords.push(keyword);
        chrome.storage.sync.set({ keywords }, () => {
          keywordInput.value = "";
          displayKeywords();
          executeContentScript();
        });
      });
    }
  });

  const displayKeywords = () => {
    chrome.storage.sync.get(["keywords"], (result) => {
      const keywords = result.keywords || [];
      keywordList.innerHTML = "";

      // 遍历关键词数组
      keywords.forEach((keyword, index) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = keyword;

        const removeButton = document.createElement("button");
        removeButton.textContent = "移除";
        removeButton.addEventListener("click", () => {
          // 点击移除按钮的事件处理
          keywords.splice(index, 1);
          chrome.storage.sync.set({ keywords }, () => {
            displayKeywords();
            showAllElementsAndHideCurrent();
          });
        });

        li.appendChild(span);
        li.appendChild(removeButton);

        // 将新创建的 li 元素插入到 keywordList 的第一个子元素之前
        if (keywordList.firstChild) {
          keywordList.insertBefore(li, keywordList.firstChild);
        } else {
          keywordList.appendChild(li); // 如果 keywordList 没有子元素，则直接添加
        }
      });
    });
  };

  const executeContentScript = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"],
      });
    });
  };

  const showAllElementsAndHideCurrent = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            const elements = document.querySelectorAll(".bili-dyn-list__item");
            elements.forEach((element) => {
              element.style.display = "";
            });
          },
        },
        () => {
          executeContentScript();
        }
      );
    });
  };

  // 导出关键词为 JSON 文件
  exportButton.addEventListener("click", () => {
    chrome.storage.sync.get(["keywords"], (result) => {
      const keywords = result.keywords || [];
      const blob = new Blob([JSON.stringify(keywords)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "keywords.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  // 导入关键词
  importButton.addEventListener("click", () => {
    importFileInput.click();
  });

  importFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedKeywords = JSON.parse(e.target.result);
          chrome.storage.sync.get(["keywords"], (result) => {
            let keywords = result.keywords || [];
            keywords = keywords.concat(importedKeywords);
            chrome.storage.sync.set({ keywords }, () => {
              displayKeywords();
              executeContentScript();
            });
          });
        } catch (error) {
          alert("Failed to import keywords: Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  });
  displayKeywords();
});
