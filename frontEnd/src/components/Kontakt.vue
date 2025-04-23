<template>
  <div class="min-h-screen bg-gray-50 py-12 px-6">
    <section
      class="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md animate-fade-in"
    >
      <h1
        class="text-4xl font-bold text-center mb-8 animate-fade-in-up delay-100"
      >
        Skontaktuj się z nami
      </h1>

      <form
        @submit.prevent="submitForm"
        class="space-y-6 animate-fade-in-up delay-200"
      >
        <div class="animate-fade-in-up delay-300">
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

        <div class="animate-fade-in-up delay-400">
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

        <div class="animate-fade-in-up delay-500">
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
          class="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition animate-fade-in-up delay-600"
        >
          Wyślij wiadomość
        </button>
      </form>

      <div
        class="mt-10 text-center text-gray-600 space-y-2 animate-fade-in-up delay-700"
      >
        <p><strong>Adres:</strong> ul. Zdrowa 12, 00-123 Warszawa</p>
        <p><strong>Telefon:</strong> +48 123 456 789</p>
        <p><strong>Email:</strong> kontakt@apteka.pl</p>
      </div>

      <div class="mt-8 animate-fade-in-up delay-800">
        <iframe
          width="100%"
          height="400"
          frameborder="0"
          scrolling="no"
          marginheight="0"
          marginwidth="0"
          class="rounded-xl shadow"
          src="https://www.openstreetmap.org/export/embed.html?bbox=20.984%2C52.237%2C20.986%2C52.239&layer=mapnik&marker=52.238%2C20.985"
        ></iframe>
        <p class="text-sm text-center mt-2">
          <a
            href="https://www.openstreetmap.org/?mlat=52.238&mlon=20.985#map=18/52.238/20.985"
            target="_blank"
            class="text-blue-600 hover:underline"
          >
            Zobacz większą mapę
          </a>
        </p>
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

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
  opacity: 0;
}
.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
  opacity: 0;
}
</style>
