<template>
  <div>
    <div class="bg-blue-100 p-8 rounded-lg text-center mb-8">
      <h1 class="text-3xl font-bold mb-4">Witaj w systemie API Apteka</h1>
      <p class="text-lg mb-6">
        System do zarządzania lekami i zamówieniami aptecznymi.
      </p>

      <div class="flex justify-center space-x-4">
        <router-link
          to="/drugs"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Przeglądaj leki
        </router-link>

        <router-link
          v-if="!isAuthenticated"
          to="/login"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Zaloguj się
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Przeglądaj leki</h2>
        <p class="mb-4">
          Zobacz dostępne leki w naszej bazie, sprawdź ceny i dostępność.
        </p>
        <router-link to="/drugs" class="text-blue-600 hover:underline">
          Zobacz ofertę →
        </router-link>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Zamów leki</h2>
        <p class="mb-4">Złóż zamówienie na potrzebne leki z naszej oferty.</p>
        <router-link to="/drugs" class="text-blue-600 hover:underline">
          Złóż zamówienie →
        </router-link>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Historia zamówień</h2>
        <p class="mb-4">
          Przeglądaj historię swoich zamówień i śledź ich status.
        </p>
        <router-link to="/history" class="text-blue-600 hover:underline">
          Zobacz historię →
        </router-link>
      </div>
    </div>

    <div
      v-if="isAdmin"
      class="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-8"
    >
      <h2 class="text-xl font-bold mb-4">Panel administracyjny</h2>
      <p class="mb-4">
        Jako farmaceuta/administrator, masz dostęp do zaawansowanych funkcji
        zarządzania lekami i raportami.
      </p>
      <router-link
        to="/admin"
        class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        Przejdź do panelu administracyjnego
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "HomeView",
  computed: {
    ...mapGetters("auth", ["isAuthenticated", "getCurrentUser"]),
    isAdmin() {
      const user = this.getCurrentUser;
      return user && user.permission >= 2; // Pharmacist or admin
    },
  },
};
</script>
