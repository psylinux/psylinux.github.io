(() => {
  function replaceMermaidBlocks() {
    const blocks = document.querySelectorAll("code.language-mermaid");
    blocks.forEach((codeEl) => {
      const text = codeEl.textContent.trim();
      if (!text) {
        return;
      }

      let container = codeEl.closest(".highlight");
      if (!container) {
        container = codeEl.closest("pre") || codeEl;
      }

      const mermaidDiv = document.createElement("div");
      mermaidDiv.className = "mermaid";
      mermaidDiv.textContent = text;

      container.replaceWith(mermaidDiv);
    });
  }

  function initMermaid() {
    if (!window.mermaid) {
      return;
    }

    window.mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
    });

    replaceMermaidBlocks();
    window.mermaid.init(undefined, document.querySelectorAll(".mermaid"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMermaid);
  } else {
    initMermaid();
  }
})();
