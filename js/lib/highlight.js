mixins.highlight = {
    data() {
        return { copying: false };
    },
    created() {
        hljs.configure({ ignoreUnescapedHTML: true });
        this.renderers.push(this.highlight);
    },
    methods: {
        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        getHighlightOptions() {
            const conf = window.__PARTICLEX_HIGHLIGHT__ || {};
            return {
                wrap: conf.wrap !== false,
                collapseEnable: conf.collapseEnable !== false,
                collapseLines: Math.max(1, Number(conf.collapseLines) || 20),
            };
        },
        countCodeLines(code) {
            if (!code) return 0;
            const normalized = code.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
            const parts = normalized.split("\n");
            if (parts.length && parts[parts.length - 1] === "") {
                return Math.max(1, parts.length - 1);
            }
            return Math.max(1, parts.length);
        },
        getCodeLanguage(pre) {
            const code = pre.querySelector("code");
            const classNames = [
                ...(code ? code.classList : []),
                ...pre.classList,
            ];
            const markedLanguage = classNames.find((name) =>
                name.startsWith("language-")
            );

            if (markedLanguage) {
                return markedLanguage.slice("language-".length) || "plaintext";
            }

            return (
                classNames.find(
                    (name) =>
                        name !== "highlight" &&
                        name !== "code-block" &&
                        !name.startsWith("is-")
                ) || "plaintext"
            );
        },
        highlight() {
            const opts = this.getHighlightOptions();
            const codes = document.querySelectorAll("pre");
            for (const i of codes) {
                const code = i.textContent;
                const language = this.getCodeLanguage(i);
                let highlighted;
                try {
                    highlighted = hljs.highlight(code, { language }).value;
                } catch {
                    highlighted = code;
                }

                const lineCount = this.countCodeLines(code);
                const shouldCollapse =
                    opts.collapseEnable && lineCount > opts.collapseLines;

                i.classList.add("code-block");
                if (opts.wrap) i.classList.add("is-wrap");
                if (shouldCollapse) i.classList.add("is-collapsed");

                i.innerHTML = `
                <div class="code-toolbar">
                    <div class="language">${language}</div>
                    <div class="code-actions">
                        ${
                            shouldCollapse
                                ? `<button type="button" class="code-fold" aria-expanded="false">
                            <i class="fa-solid fa-chevron-down fa-fw" aria-hidden="true"></i>
                            <span class="code-fold-label">展开全部 (${lineCount} 行)</span>
                        </button>`
                                : ""
                        }
                        <div class="copycode" title="复制代码">
                            <i class="fa-solid fa-copy fa-fw"></i>
                            <i class="fa-solid fa-check fa-fw"></i>
                        </div>
                    </div>
                </div>
                <div class="code-content hljs">${highlighted}</div>
                `;

                const content = i.querySelector(".code-content");
                hljs.lineNumbersBlock(content, { singleLine: true });

                if (shouldCollapse) {
                    content.style.setProperty(
                        "--code-collapse-lines",
                        String(opts.collapseLines)
                    );
                    const foldBtn = i.querySelector(".code-fold");
                    const foldLabel = foldBtn.querySelector(".code-fold-label");
                    foldBtn.addEventListener("click", () => {
                        const expanded = i.classList.toggle("is-expanded");
                        i.classList.toggle("is-collapsed", !expanded);
                        foldBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
                        foldLabel.textContent = expanded
                            ? "收起"
                            : `展开全部 (${lineCount} 行)`;
                        const icon = foldBtn.querySelector("i");
                        if (icon) {
                            icon.classList.toggle("fa-chevron-down", !expanded);
                            icon.classList.toggle("fa-chevron-up", expanded);
                        }
                    });
                }

                const copycode = i.querySelector(".copycode");
                copycode.addEventListener("click", async () => {
                    if (this.copying) return;
                    this.copying = true;
                    copycode.classList.add("copied");
                    await navigator.clipboard.writeText(code);
                    await this.sleep(1000);
                    copycode.classList.remove("copied");
                    this.copying = false;
                });
            }
        },
    },
};
