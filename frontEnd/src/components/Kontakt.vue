<template>
  <div class="min-h-screen bg-gray-50 py-12 px-6">
    <section class="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md">
      <h1 class="text-4xl font-bold text-center mb-8">Skontaktuj się z nami</h1>

      <form @submit.prevent="submitForm" class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-1" for="name"
            >Imię i nazwisko</label
          >
          <input
            type="text"
            id="name"
            v-model="form.name"
            required
            class="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1" for="email"
            >E-mail</label
          >
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            class="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1" for="message"
            >Wiadomość</label
          >
          <textarea
            id="message"
            v-model="form.message"
            required
            rows="5"
            class="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <button
          type="submit"
          class="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Wyślij wiadomość
        </button>
      </form>

      <div class="mt-10 text-center text-gray-600">
        <p><strong>Adres:</strong> ul. Zdrowa 12, 00-123 Warszawa</p>
        <p><strong>Telefon:</strong> +48 123 456 789</p>
        <p><strong>Email:</strong> kontakt@apteka.pl</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const form = reactive({
  name: "",
  email: "",
  message: "",
});

const submitForm = () => {
  alert("Dziękujemy za wiadomość, " + form.name + "!");
  form.name = "";
  form.email = "";
  form.message = "";
};
</script>

<style scoped></style>
