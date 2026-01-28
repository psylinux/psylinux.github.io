(() => {
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (ok) {
          resolve();
        } else {
          reject(new Error("copy failed"));
        }
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    });
  }

  function extractCodeText(codeEl) {
    const children = Array.from(codeEl.children).filter(
      (el) => el.tagName === "SPAN"
    );
    const lineWrappers = children.filter((el) => {
      if (el.classList.contains("line")) {
        return true;
      }
      const style = el.getAttribute("style") || "";
      return style.includes("display:flex");
    });

    if (lineWrappers.length) {
      return lineWrappers
        .map((line) => {
          const text = line.textContent;
          return text.endsWith("\n") ? text.slice(0, -1) : text;
        })
        .join("\n");
    }

    return codeEl.textContent;
  }

  function getCodeText(container) {
    const table = container.querySelector("table");
    if (table) {
      const tds = table.querySelectorAll("td");
      if (tds.length >= 2) {
        const codeEl = tds[tds.length - 1].querySelector("pre code");
        if (codeEl) {
          return extractCodeText(codeEl);
        }
      }
    }
    const codeInline = container.querySelector("code.code-inline");
    if (codeInline) {
      return extractCodeText(codeInline);
    }
    const codeEl = container.querySelector("pre code");
    if (codeEl) {
      return extractCodeText(codeEl);
    }
    const pre = container.querySelector("pre");
    return pre ? pre.textContent : "";
  }

  function trimTrailingEmptyLines(codeEl) {
    if (!codeEl) {
      return;
    }
    const lineWrappers = Array.from(codeEl.children).filter(
      (el) => el.tagName === "SPAN"
    );
    if (!lineWrappers.length) {
      return;
    }
    for (let i = lineWrappers.length - 1; i >= 0; i -= 1) {
      const text = lineWrappers[i].textContent;
      if (text.trim() === "") {
        lineWrappers[i].remove();
      } else {
        break;
      }
    }
  }

  function addCopyButton(container) {
    if (container.dataset.copyReady === "true") {
      return;
    }

    container.dataset.copyReady = "true";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy-btn";
    button.setAttribute("aria-label", "Copy code block");
    button.textContent = "Copy";

    button.addEventListener("click", async () => {
      const text = getCodeText(container);

      try {
        await copyText(text);
        button.textContent = "Copied";
        button.classList.add("copied");
      } catch (err) {
        button.textContent = "Failed";
      }

      window.setTimeout(() => {
        button.textContent = "Copy";
        button.classList.remove("copied");
      }, 1500);
    });

    container.appendChild(button);
  }

  function install() {
    document.querySelectorAll("div.highlight").forEach((container) => {
      if (container.dataset.copyReady === "true") {
        return;
      }
      if (container.querySelector("code.language-mermaid")) {
        return;
      }

      container.querySelectorAll(".code-copy-btn").forEach((btn) => btn.remove());
      container.dataset.copyReady = "true";

      const table = container.querySelector("table");
      if (table) {
        const tds = table.querySelectorAll("td");
        const codeCell = tds[tds.length - 1];
        if (codeCell) {
          const codeEl = codeCell.querySelector("pre code");
          trimTrailingEmptyLines(codeEl);
          codeCell.classList.add("code-block");
          addCopyButton(codeCell);
        }
        return;
      }

      container.classList.add("code-block");
      addCopyButton(container);
    });

    document.querySelectorAll("pre").forEach((pre) => {
      if (pre.closest("div.highlight")) {
        return;
      }
      if (pre.querySelector("code.language-mermaid")) {
        return;
      }
      if (pre.closest(".code-block")) {
        return;
      }
      const wrapper = document.createElement("div");
      wrapper.className = "code-block";
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      addCopyButton(wrapper);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();
