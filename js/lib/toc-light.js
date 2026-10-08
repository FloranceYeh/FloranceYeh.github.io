document.addEventListener("DOMContentLoaded", function () {
    var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc-link"));
    var sections = Array.prototype.slice.call(
        document.querySelectorAll(".content h1, .content h2, .content h3, .content h4, .content h5, .content h6")
    );
    var tocWrapper = document.getElementById("toc-wrapper");
    var tocScroll = tocWrapper
        ? tocWrapper.querySelector(".toc") || tocWrapper
        : null;
    var tocSidebar = document.getElementById("toc-sidebar");
    var tocFab = document.getElementById("toc-fab");
    var tocClose = document.getElementById("toc-close");
    var btnTop = document.getElementById("toc-btn-top");
    var btnComment = document.getElementById("toc-btn-comment");

    if (!tocLinks.length || !sections.length) return;

    var MENU_OFFSET = 80;
    var isProgrammaticScroll = false;
    var programmaticTimer = null;
    var activeId = "";

    function getMenuOffset() {
        var menu = document.getElementById("menu");
        if (!menu || menu.classList.contains("hidden")) return 24;
        return menu.offsetHeight + 16;
    }

    function openToc() {
        if (!tocSidebar) return;
        tocSidebar.classList.add("is-open");
        document.body.classList.add("toc-drawer-open");
        if (tocFab) tocFab.setAttribute("aria-expanded", "true");
    }

    function closeToc() {
        if (!tocSidebar) return;
        tocSidebar.classList.remove("is-open");
        document.body.classList.remove("toc-drawer-open");
        if (tocFab) tocFab.setAttribute("aria-expanded", "false");
    }

    function highlight(id) {
        if (!id || id === activeId) {
            if (id) activeId = id;
            return;
        }
        activeId = id;
        var activeLink = null;
        tocLinks.forEach(function (link) {
            var href = decodeURIComponent(link.getAttribute("href") || "");
            if (href === "#" + id) {
                link.classList.add("active");
                activeLink = link;
            } else {
                link.classList.remove("active");
            }
        });
        if (activeLink && tocScroll) {
            var linkRect = activeLink.getBoundingClientRect();
            var wrapRect = tocScroll.getBoundingClientRect();
            if (linkRect.top < wrapRect.top + 8 || linkRect.bottom > wrapRect.bottom - 8) {
                activeLink.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        }
    }

    function scrollSpy() {
        if (isProgrammaticScroll) return;
        var offset = getMenuOffset() + 12;
        var currentId = sections[0] ? sections[0].getAttribute("id") : "";
        for (var i = 0; i < sections.length; i++) {
            var rect = sections[i].getBoundingClientRect();
            if (rect.top <= offset) {
                currentId = sections[i].getAttribute("id");
            } else {
                break;
            }
        }
        var doc = document.documentElement;
        if (window.innerHeight + window.scrollY >= doc.scrollHeight - 24) {
            currentId = sections[sections.length - 1].getAttribute("id");
        }
        if (currentId) highlight(currentId);
    }

    function scrollToHeading(id) {
        var target = document.getElementById(id);
        if (!target) return;
        var offset = getMenuOffset();
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        isProgrammaticScroll = true;
        highlight(id);
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        if (programmaticTimer) clearTimeout(programmaticTimer);
        programmaticTimer = setTimeout(function () {
            isProgrammaticScroll = false;
            scrollSpy();
        }, 800);
        try {
            history.replaceState(null, "", "#" + encodeURIComponent(id));
        } catch (e) {}
    }

    tocLinks.forEach(function (link) {
        link.addEventListener("click", function (e) {
            var href = decodeURIComponent(link.getAttribute("href") || "");
            if (!href || href.charAt(0) !== "#") return;
            e.preventDefault();
            var id = href.substring(1);
            scrollToHeading(id);
            closeToc();
        });
    });

    if (btnTop) {
        btnTop.addEventListener("click", function (e) {
            e.preventDefault();
            isProgrammaticScroll = true;
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (programmaticTimer) clearTimeout(programmaticTimer);
            programmaticTimer = setTimeout(function () {
                isProgrammaticScroll = false;
                scrollSpy();
            }, 800);
            closeToc();
        });
    }

    if (btnComment) {
        btnComment.addEventListener("click", function () {
            closeToc();
        });
    }

    if (tocFab) {
        tocFab.addEventListener("click", function () {
            if (tocSidebar && tocSidebar.classList.contains("is-open")) {
                closeToc();
            } else {
                openToc();
            }
        });
    }

    if (tocClose) {
        tocClose.addEventListener("click", closeToc);
    }

    if (tocSidebar) {
        tocSidebar.addEventListener("click", function (e) {
            if (e.target === tocSidebar) closeToc();
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeToc();
    });

    var ticking = false;
    window.addEventListener(
        "scroll",
        function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                scrollSpy();
                ticking = false;
            });
        },
        { passive: true }
    );

    window.addEventListener("resize", function () {
        if (window.innerWidth > 1200) closeToc();
    });

    sections.forEach(function (el) {
        el.style.scrollMarginTop = MENU_OFFSET + "px";
    });

    if (location.hash) {
        var hashId = decodeURIComponent(location.hash.replace(/^#/, ""));
        if (document.getElementById(hashId)) {
            setTimeout(function () {
                scrollToHeading(hashId);
            }, 50);
        }
    }

    scrollSpy();
});
