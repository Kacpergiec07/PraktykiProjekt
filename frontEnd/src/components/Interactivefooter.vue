<template>
  <footer
    class="interactive-footer bg-mint text-white py-4 relative overflow-hidden"
  >
    <div class="relative w-full h-px mb-2">
      <div
        @mouseenter="manageMouseEnter"
        @mousemove="manageMouseMove"
        @mouseleave="manageMouseLeave"
        class="relative z-10 h-6 w-full top-[-24px]"
      ></div>
      <svg
        class="absolute w-full h-[100px] top-[-50px]"
        style="pointer-events: none"
      >
        <path
          ref="path"
          class="stroke-current text-white stroke-[1px] fill-none"
        ></path>
      </svg>
    </div>

    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between">
        <div class="mb-4 md:mb-0 md:w-2/5">
          <h2 class="text-xl font-bold mb-2">API Apteka</h2>
          <p class="text-white/80 mb-3 text-sm">
            Łączymy nowoczesną technologię z tradycyjną apteką, aby dostarczyć
            Ci najlepsze produkty i usługi farmaceutyczne online.
          </p>
        </div>
      </div>

      <div
        class="mt-4 pt-2 border-t border-white/20 flex flex-col md:flex-row justify-between items-center"
      >
        <div class="footerP">
          <p class="text-sm text-center md:text-left">
            &copy; {{ currentYear }} API Apteka. Wszelkie prawa zastrzeżone.
          </p>
        </div>
        <div class="dock-list">
          <div
            class="dock-container flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 text-center mr-30"
          >
            <a
              href="https://github.com/Kacpergiec07/PraktykiProjekt"
              class="dock-item"
              target="_blank"
              ><img
                src="../assets/github-logo.png"
                alt=""
                class="w-8 h-8 object-contain rounded-full filter invert"
            /></a>

            <a href="/" class="dock-item"
              ><img
                src="../assets/home.png"
                alt=""
                class="w-8 h-8 object-contain filter invert"
            /></a>
          </div>
        </div>
        <div class="mt-4 md:mt-0">
          <ul
            class="flex flex-col md:flex-row md:space-x-6 space-y-1 md:space-y-0 text-center text-sm"
          >
            <li>
              <router-link
                to="/drugs"
                class="hover:text-white/70 transition-colors"
                >Leki</router-link
              >
            </li>
            <li>
              <router-link
                to="/about"
                class="hover:text-white/70 transition-colors"
                >O nas</router-link
              >
            </li>
            <li>
              <router-link
                to="/kontakt"
                class="hover:text-white/70 transition-colors"
                >Kontakt</router-link
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "InteractiveFooter",
  data() {
    return {
      progress: 0,
      x: 0.5,
      time: Math.PI / 2,
      reqId: null,
      currentYear: new Date().getFullYear(),
    };
  },
  mounted() {
    this.setPath(this.progress);

    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    if (this.reqId) {
      cancelAnimationFrame(this.reqId);
    }
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    setPath(progress) {
      const width = window.innerWidth;

      if (this.$refs.path) {
        this.$refs.path.setAttributeNS(
          null,
          "d",
          `M0 50 Q${width * this.x} ${50 + progress}, ${width} 50`
        );
      }
    },

    lerp(x, y, a) {
      return x * (1 - a) + y * a;
    },

    manageMouseEnter() {
      if (this.reqId) {
        cancelAnimationFrame(this.reqId);
        this.resetAnimation();
      }
    },

    manageMouseMove(e) {
      const { movementY, clientX } = e;

      const pathBound = this.$refs.path?.getBoundingClientRect();

      if (pathBound) {
        this.x = (clientX - pathBound.left) / pathBound.width;
        this.progress += movementY;
        this.setPath(this.progress);
      }
    },

    manageMouseLeave() {
      this.animateOut();
    },

    animateOut() {
      const newProgress = this.progress * Math.sin(this.time);

      this.progress = this.lerp(this.progress, 0, 0.025);

      this.time += 0.2;

      this.setPath(newProgress);

      if (Math.abs(this.progress) > 0.75) {
        this.reqId = requestAnimationFrame(this.animateOut);
      } else {
        this.resetAnimation();
      }
    },

    resetAnimation() {
      this.time = Math.PI / 2;
      this.progress = 0;
      this.setPath(0);
    },

    handleResize() {
      this.resetAnimation();
    },
  },
};
</script>

<style scoped>
.interactive-footer {
  position: relative;
  z-index: 10;
}
</style>
