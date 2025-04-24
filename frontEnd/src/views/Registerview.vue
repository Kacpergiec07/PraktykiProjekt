<template>
  <div class="max-w-lg mx-auto py-8 mt-5">
    <h1 class="text-2xl font-bold mb-6 text-center">Rejestracja</h1>

    <div
      class="group relative z-10 rounded-xl border magic-border border-border bg-background p-0 overflow-hidden"
    >
      <!-- MagicCard inner -->
      <div class="relative z-10 rounded-xl backdrop-blur-md">
        <auth-form
          :loading="loading"
          :error="error"
          :is-register="true"
          @submit="handleRegister"
        >
          <template #footer>
            <p>
              Masz już konto?
              <router-link to="/login" class="text-blue-600 hover:underline">
                Zaloguj się
              </router-link>
            </p>
          </template>
        </auth-form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import AuthForm from "../components/AuthForm.vue";

export default {
  name: "RegisterView",
  components: {
    AuthForm,
  },
  data() {
    return {
      loading: false,
      error: "",
      gradientColor: "#3b82f6", // blue-500
    };
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated"]),
    redirect() {
      return this.$route.query.redirect || "/";
    },
  },
  methods: {
    ...mapActions("auth", ["register"]),
    async handleRegister(userData) {
      this.error = "";
      this.loading = true;

      try {
        await this.register(userData);
        this.$router.push(this.redirect);
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Błąd rejestracji. Spróbuj ponownie.";
      } finally {
        this.loading = false;
      }
    },
    setMouseCoords(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
      e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
    },
  },
<<<<<<< HEAD
  mounted() {
    const container = this.$el.querySelector(".magic-border");
    if (container) {
      container.addEventListener("mousemove", this.setMouseCoords);
    }
  },
  beforeUnmount() {
    const container = this.$el.querySelector(".magic-border");
    if (container) {
      container.removeEventListener("mousemove", this.setMouseCoords);
=======
  created() {
    if (this.isAuthenticated) {
      this.$router.push(this.redirect);
>>>>>>> 277295599ff10c4857053e573e5d8e6d7d1865be
    }
  },
};
</script>

<style scoped>
.border-border {
  border-color: rgba(0, 0, 0, 0.1);
}
.bg-background {
  background-color: white;
}
.dark .bg-background {
  background-color: #0f0f0f;
}

.magic-border {
  position: relative;
  border-width: 2px;
}
.magic-border::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: radial-gradient(
    400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(62,180,137, 0.9),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  pointer-events: none;
}
.magic-border:hover::before {
  opacity: 1;
}
</style>
