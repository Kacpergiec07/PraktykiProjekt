<template>
  <footer
    class="interactive-footer bg-mint text-white py-8 relative overflow-hidden"
  >
    <!-- Interactive line animation -->
    <div class="relative w-full h-px mb-5">
      <div
        @mouseenter="manageMouseEnter"
        @mousemove="manageMouseMove"
        @mouseleave="manageMouseLeave"
        class="relative z-10 h-10 w-full top-[-40px]"
      ></div>
      <svg
        class="absolute w-full h-[200px] top-[-100px]"
        style="pointer-events: none"
      >
        <path
          ref="path"
          class="stroke-current text-white stroke-[1px] fill-none"
        ></path>
      </svg>
    </div>

    <!-- Footer content -->
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between">
        <!-- Company info -->
        <div class="mb-8 md:mb-0 md:w-2/5">
          <h2 class="text-2xl font-bold mb-4">API Apteka</h2>
          <p class="text-white/80 mb-6">
            Łączymy nowoczesną technologię z tradycyjną apteką, aby dostarczyć
            Ci najlepsze produkty i usługi farmaceutyczne online.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="hover:text-white/70 transition-colors">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" class="hover:text-white/70 transition-colors">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="hover:text-white/70 transition-colors">
              <i class="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>

      <div
        class="mt-12 pt-4 border-t border-white/20 flex flex-col md:flex-row justify-between items-center"
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
            class="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 text-center"
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
// --test--

// -----

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

    // Add resize event listener
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    // Cleanup animation and event listener
    if (this.reqId) {
      cancelAnimationFrame(this.reqId);
    }
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    setPath(progress) {
      // Get the width of the footer
      const width = window.innerWidth;

      // Set the "d" attribute of the SVG path element using a quadratic Bézier curve
      if (this.$refs.path) {
        this.$refs.path.setAttributeNS(
          null,
          "d",
          `M0 100 Q${width * this.x} ${100 + progress}, ${width} 100`
        );
      }
    },

    // Linear interpolation function
    lerp(x, y, a) {
      return x * (1 - a) + y * a;
    },

    manageMouseEnter() {
      // If there is an animation frame request, cancel it and reset the animation
      if (this.reqId) {
        cancelAnimationFrame(this.reqId);
        this.resetAnimation();
      }
    },

    manageMouseMove(e) {
      // Get the movementY and clientX properties from the event
      const { movementY, clientX } = e;

      // Get the bounding rectangle of the SVG path element
      const pathBound = this.$refs.path?.getBoundingClientRect();

      // If the bounding rectangle exists, update x and progress and set the path
      if (pathBound) {
        this.x = (clientX - pathBound.left) / pathBound.width;
        this.progress += movementY;
        this.setPath(this.progress);
      }
    },

    manageMouseLeave() {
      // Start animating out
      this.animateOut();
    },

    animateOut() {
      // Calculate newProgress using sine of time
      const newProgress = this.progress * Math.sin(this.time);

      // Update progress using linear interpolation towards zero
      this.progress = this.lerp(this.progress, 0, 0.025);

      // Increment time by 0.2
      this.time += 0.2;

      // Set the path using newProgress
      this.setPath(newProgress);

      // If progress is greater than a threshold, request another animation frame,
      // otherwise reset the animation.
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
      // Reset and update the path when window is resized
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
