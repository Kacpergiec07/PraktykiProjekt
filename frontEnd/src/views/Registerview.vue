<template>
  <div class="max-w-lg mx-auto py-8 mt-5">
    <h1 class="text-2xl font-bold mb-6 text-center">Rejestracja</h1>

    <auth-form
      :loading="loading"
      :error="error"
      :is-register="true"
      @submit="handleRegister"
    >
      <template #footer>
        <p>
          Masz już konto?
          <router-link to="/login" class="text-blue-600 hover:underline"
            >Zaloguj się</router-link
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
  name: "RegisterView",
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
  },
  created() {
    if (this.isAuthenticated) {
      this.$router.push(this.redirect);
    }
  },
};
</script>
