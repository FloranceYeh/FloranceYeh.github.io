function updateHomeCardScroll() {
    const card = document.querySelector("#home-card #card-style");
    if (!card) return;
    card.classList.remove("is-scrollable");
    card.style.maxHeight = "";
    const maxHeight = Math.floor(window.innerHeight * 0.8);
    if (card.scrollHeight > maxHeight + 1) {
        card.classList.add("is-scrollable");
    }
}

mixins.home = {
    mounted() {
        let background = this.$refs.homeBackground;
        let images = background.dataset.images.split(",");
        let id = Math.floor(Math.random() * images.length);
        background.style.backgroundImage = `url('${images[id]}')`;
        this.menuColor = true;
        this.$nextTick(() => {
            updateHomeCardScroll();
            window.addEventListener("resize", updateHomeCardScroll);
            const card = document.querySelector("#home-card #card-style");
            if (card && window.ResizeObserver) {
                this._homeCardRO = new ResizeObserver(updateHomeCardScroll);
                this._homeCardRO.observe(card);
            }
        });
    },
    beforeUnmount() {
        window.removeEventListener("resize", updateHomeCardScroll);
        if (this._homeCardRO) this._homeCardRO.disconnect();
    },
    methods: {
        homeClick() {
            window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
        },
    },
};
