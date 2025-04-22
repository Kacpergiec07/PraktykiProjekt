<template>
  <div class="mt-5">
    <h1 class="text-2xl font-bold mb-6">Profil użytkownika</h1>

    <div v-if="user" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- User Information -->
      <div class="bg-white p-6 rounded-lg shadow-md col-span-1">
        <h2 class="text-lg font-semibold mb-4">Dane osobowe</h2>

        <div class="space-y-3">
          <div><span class="font-medium">Imię:</span> {{ user.name }}</div>
          <div>
            <span class="font-medium">Nazwisko:</span> {{ user.surname }}
          </div>
          <div><span class="font-medium">Email:</span> {{ user.email }}</div>
          <div>
            <span class="font-medium">Uprawnienia:</span> {{ permissionLabel }}
          </div>
        </div>

        <div class="mt-6">
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Wyloguj się
          </button>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white p-6 rounded-lg shadow-md col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Ostatnie zamówienia</h2>
          <router-link to="/history" class="text-blue-600 hover:underline">
            Zobacz wszystkie
          </router-link>
        </div>

        <div v-if="loading" class="flex justify-center p-4">
          <div
            class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"
          ></div>
        </div>

        <div v-else-if="orders.length === 0" class="text-center p-4">
          <p class="text-gray-500">Brak zamówień do wyświetlenia</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-3 text-left border">Nazwa leku</th>
                <th class="p-3 text-left border">Producent</th>
                <th class="p-3 text-left border">Ilość</th>
                <th class="p-3 text-left border">Data zamówienia</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in orders.slice(0, 5)"
                :key="order.id"
                class="hover:bg-gray-50"
              >
                <td class="p-3 border">{{ order.name }}</td>
                <td class="p-3 border">{{ order.companyName }}</td>
                <td class="p-3 border">{{ order.amount }}</td>
                <td class="p-3 border">{{ formatDate(order.date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "ProfileView",
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    ...mapGetters("auth", ["getCurrentUser", "userPermission"]),
    ...mapGetters("orders", ["userOrders"]),

    user() {
      return this.getCurrentUser;
    },

    orders() {
      return this.userOrders;
    },

    permissionLabel() {
      // Get permission as a number from store getter
      const permission = this.userPermission;

      switch (permission) {
        case 0:
          return "Klient";
        case 1:
          return "Pracownik";
        case 2:
          return "Farmaceuta";
        case 3:
          return "Administrator";
        default:
          return "Nieznany";
      }
    },
  },
  methods: {
    ...mapActions("auth", ["logout"]),
    ...mapActions("orders", ["fetchOrderHistory"]),

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },

    handleLogout() {
      this.logout();
      this.$router.push("/login");
    },

    async loadOrders() {
      this.loading = true;
      try {
        await this.fetchOrderHistory({
          page: 1,
          limit: 5,
          descending: true,
          orderBy: "purchase_date",
        });
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        this.loading = false;
      }
    },
  },
  created() {
    this.loadOrders();
  },
};
</script>
