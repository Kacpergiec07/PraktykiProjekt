<template>
  <div class="app">
    <NavBar />
    <main class="container mx-auto px-4 py-6">
      <router-view />
    </main>
    <Footer></Footer>
  </div>
</template>

<script>
import NavBar from "./components/NavBar.vue";
import { mapActions } from "vuex";
import Footer from "./components/Footer.vue";
import "./assets/App.css";

export default {
  name: "App",
  components: {
    NavBar,
    Footer,
  },
  methods: {
    ...mapActions("auth", ["checkAuth"]),
  },
  created() {
    // Check if there's a stored token and validate it
    this.checkAuth();
  },
};
</script>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
