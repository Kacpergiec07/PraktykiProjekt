<template>
  <div class="app">
    <NavBar />
    <main class="container mx-auto px-4 py-6 margin-bottom: 200px">
      <router-view />
    </main>
    <InteractiveFooter />

    <!-- Add the AI Agent component -->
    <AiAgent />
  </div>
</template>

<script>
import NavBar from "./components/NavBar.vue";
import InteractiveFooter from "./components/InteractiveFooter.vue";
import { mapActions } from "vuex";
import "./assets/App.css";

export default {
  name: "App",
  components: {
    NavBar,
    InteractiveFooter,
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
