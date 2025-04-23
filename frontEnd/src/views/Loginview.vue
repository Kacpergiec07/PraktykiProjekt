<template>
  <div class="max-w-lg mx-auto py-8 mt-5">
    <h1 class="text-2xl font-bold mb-6 text-center">Logowanie</h1>

    <auth-form
      :loading="loading"
      :error="error"
      :is-register="false"
      @submit="handleLogin"
    >
      <template #footer>
        <p>
          Nie masz konta?
          <router-link to="/register" class="text-blue-600 hover:underline"
            >Zarejestruj się</router-link
          >
        </p>
      </template>
    </auth-form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import AuthForm from "../components/AuthForm.vue";

export default {
  name: "LoginView",
  components: {
    AuthForm,
  },
  data() {
    return {
      loading: false,
      error: "",
    };
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated"]),
    redirect() {
      return this.$route.query.redirect || "/";
    },
  },
  methods: {
    ...mapActions("auth", ["login"]),
    async handleLogin(credentials) {
      if (!credentials?.password) {
        return;
      }
      this.error = "";
      this.loading = true;

      try {
        await this.login(credentials);
        this.$router.push(this.redirect);
      } catch (error) {
        this.error =
          error.response?.data?.message || "Błąd logowania. Spróbuj ponownie.";
      } finally {
        this.loading = false;
      }
    },
  },
  created() {
    if (this.isAuthenticated) {
      this.$router.push(this.redirect);
    }
  },
};
</script>
