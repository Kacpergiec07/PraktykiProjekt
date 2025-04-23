<template>
  <div class="m-[5px] w-[calc(100%-10px)] max-w-full bg-white p-6 rounded-lg">
    <slot name="header"></slot>

    <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>

    <form @submit.prevent="submitForm">
      <!-- Registration fields -->
      <template v-if="isRegister">
        <div class="mb-4">
          <label class="block mb-1" for="name">Imię</label>
          <input
            type="text"
            id="name"
            placeholder="Wprowadź imię..."
            v-model="form.name"
            class="w-full px-3 py-2 border rounded"
            required
            minlength="1"
            maxlength="64"
          />
        </div>

        <div class="mb-4">
          <label class="block mb-1" for="surname">Nazwisko</label>
          <input
            type="text"
            id="surname"
            placeholder="Wprowadź nazwisko..."
            v-model="form.surname"
            class="w-full px-3 py-2 border rounded"
            required
            minlength="1"
            maxlength="64"
          />
        </div>
      </template>

      <!-- Common fields for both login and register -->
      <div class="mb-4">
        <label class="block mb-1" for="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Wprowadź e-mail..."
          v-model="form.email"
          class="w-full px-3 py-2 border rounded"
          required
          minlength="3"
          maxlength="64"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-1" for="password">Hasło</label>
        <input
          type="password"
          id="password"
          placeholder="Wprowadź hasło..."
          v-model="form.password"
          class="w-full px-3 py-2 border rounded"
          required
          minlength="8"
          maxlength="64"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-mint text-white py-2 px-4 rounded hover:bg-lightmint"
        :disabled="loading"
      >
        <span v-if="loading">Ładowanie...</span>
        <span v-else>{{ isRegister ? "Zarejestruj się" : "Zaloguj się" }}</span>
      </button>
    </form>

    <div class="mt-4 text-center">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "AuthForm",
  props: {
    isRegister: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      form: {
        name: "",
        surname: "",
        email: "",
        password: "",
      },
    };
  },
  methods: {
    submitForm() {
      const formData = this.isRegister
        ? { ...this.form }
        : { email: this.form.email, password: this.form.password };

      this.$emit("submit", formData);
    },
  },
};
</script>
