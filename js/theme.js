(function () {
    var STORAGE_KEY = "theme";
    var DEFAULT_THEME = "dark";

    function getStoredTheme() {
        try {
            var t = localStorage.getItem(STORAGE_KEY);
            if (t === "light" || t === "dark") return t;
        } catch (e) {}
        return DEFAULT_THEME;
    }

    function syncHighlightTheme(theme) {
        var dark = document.getElementById("hljs-theme-dark");
        var light = document.getElementById("hljs-theme-light");
        if (!dark || !light) return;
        var isLight = theme === "light";
        dark.disabled = isLight;
        light.disabled = !isLight;
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        var btn = document.getElementById("theme-toggle");
        if (btn) {
            btn.setAttribute(
                "aria-label",
                theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            );
        }
        syncHighlightTheme(theme);
        try {
            window.dispatchEvent(
                new CustomEvent("themechange", { detail: { theme: theme } })
            );
        } catch (e) {}
    }

    function setTheme(theme) {
        applyTheme(theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {}
    }

    function toggleTheme() {
        var current =
            document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
        setTheme(current === "dark" ? "light" : "dark");
    }

    function bindButton() {
        var btn = document.getElementById("theme-toggle");
        if (!btn || btn.dataset.bound === "1") return;
        btn.dataset.bound = "1";
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
        });
        applyTheme(getStoredTheme());
    }

    applyTheme(getStoredTheme());
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindButton);
    } else {
        bindButton();
    }
})();
