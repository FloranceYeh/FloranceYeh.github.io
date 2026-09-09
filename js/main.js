const app = Vue.createApp({
    mixins: Object.values(mixins),
    data() {
        return {
            loading: true,
            hiddenMenu: false,
            showMenuItems: false,
            menuColor: false,
            scrollTop: 0,
            renderers: [],
        };
    },
    created() {
        window.addEventListener("load", () => {
            this.loading = false;
        });
    },
    mounted() {
        window.addEventListener("scroll", this.handleScroll, true);
        this.render();
    },
    methods: {
        render() {
            for (let i of this.renderers) i();
        },
        handleScroll() {
            let wrap = this.$refs.homePostsWrap;
            let newScrollTop = document.documentElement.scrollTop;
            if (this.scrollTop < newScrollTop) {
                this.hiddenMenu = true;
                this.showMenuItems = false;
            } else this.hiddenMenu = false;
            if (wrap) {
                if (newScrollTop <= window.innerHeight - 100) this.menuColor = true;
                else this.menuColor = false;
                if (newScrollTop <= 400) wrap.style.top = "-" + newScrollTop / 5 + "px";
                else wrap.style.top = "-80px";
            }
            this.scrollTop = newScrollTop;
        },
    },
});
app.mount("#layout");

document.addEventListener("click", function (e) {
    var btn = e.target.closest(".tabs-tab");
    if (!btn) return;
    var id = btn.getAttribute("data-tabs-id");
    var tab = btn.getAttribute("data-tab");
    var container = document.getElementById(id);
    if (!container) return;
    container.querySelectorAll(".tabs-tab").forEach(function (b) { b.classList.remove("active"); });
    container.querySelectorAll(".tabs-pane").forEach(function (p) { p.classList.remove("active"); });
    btn.classList.add("active");
    var pane = container.querySelector('.tabs-pane[data-tab="' + tab + '"]');
    if (pane) pane.classList.add("active");
});
