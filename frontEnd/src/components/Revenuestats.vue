<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Statystyki przychodów</h2>

    <div class="mb-6 p-4 bg-gray-50 rounded border">
      <h3 class="text-lg font-semibold mb-3">Filtry</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block mb-1">Data od</label>
          <input
            type="date"
            v-model="fromDate"
            class="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label class="block mb-1">Data do</label>
          <input
            type="date"
            v-model="toDate"
            class="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          @click="fetchRevenue"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? "Ładowanie..." : "Zastosuj filtry" }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center p-8">
      <div
        class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
      ></div>
    </div>

    <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>

    <div v-else class="mt-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 class="text-lg font-semibold mb-2">Całkowity przychód</h3>
          <div class="text-3xl font-bold text-blue-700">
            {{ formatCurrency(totalRevenue) }}
          </div>
          <p class="text-sm text-gray-600 mt-2">
            {{ getDateRangeText() }}
          </p>
        </div>

        <div class="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 class="text-lg font-semibold mb-2">Średni dzienny przychód</h3>
          <div class="text-3xl font-bold text-green-700">
            {{ formatCurrency(calculateDailyAverage()) }}
          </div>
          <p class="text-sm text-gray-600 mt-2">
            Obliczony na podstawie wybranego zakresu dat
          </p>
        </div>
      </div>

      <div class="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
        <h3 class="text-lg font-semibold mb-2">Informacje dodatkowe</h3>
        <p>
          Statystyki obejmują tylko zrealizowane zamówienia (status COMPLETED).
          <span v-if="fromDate && toDate">
            Wybrano okres {{ getDateRangeText() }}.
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import orderService from "../services/order.service";
import notification from "../utils/notification";

export default {
  name: "RevenueStats",
  data() {
    return {
      fromDate: "",
      toDate: "",
      totalRevenue: 0,
      loading: false,
      error: null,
    };
  },
  methods: {
    ...mapActions(["setLoading", "setError", "clearError"]),

    async fetchRevenue() {
      this.error = null;
      this.loading = true;

      try {
        if (this.fromDate && this.toDate) {
          const fromDateObj = new Date(this.fromDate);
          const toDateObj = new Date(this.toDate);

          if (fromDateObj > toDateObj) {
            throw new Error(
              "Data początkowa nie może być późniejsza niż data końcowa"
            );
          }
        }

        const response = await orderService.getRevenueStats(
          this.fromDate,
          this.toDate
        );

        if (response.data && response.data.status === "success") {
          this.totalRevenue = response.data.data.totalRevenue;
          notification.success("Statystyki przychodów zostały zaktualizowane");
        } else {
          throw new Error("Nie udało się pobrać statystyk przychodów");
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.message ||
          "Wystąpił błąd podczas pobierania statystyk";
        notification.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("pl-PL", {
        style: "currency",
        currency: "PLN",
      }).format(value);
    },

    getDateRangeText() {
      if (this.fromDate && this.toDate) {
        return `od ${new Date(this.fromDate).toLocaleDateString(
          "pl-PL"
        )} do ${new Date(this.toDate).toLocaleDateString("pl-PL")}`;
      } else if (this.fromDate) {
        return `od ${new Date(this.fromDate).toLocaleDateString("pl-PL")}`;
      } else if (this.toDate) {
        return `do ${new Date(this.toDate).toLocaleDateString("pl-PL")}`;
      } else {
        return "dla wszystkich zrealizowanych zamówień";
      }
    },

    calculateDailyAverage() {
      if (!this.totalRevenue) return 0;

      let days = 1;

      if (this.fromDate && this.toDate) {
        const fromDateObj = new Date(this.fromDate);
        const toDateObj = new Date(this.toDate);

        const diffTime = Math.abs(toDateObj - fromDateObj);
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      }

      return this.totalRevenue / days;
    },
  },
  mounted() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    this.fromDate = firstDay.toISOString().split("T")[0];
    this.toDate = today.toISOString().split("T")[0];

    this.fetchRevenue();
  },
  beforeUnmount() {
    this.clearError();
  },
};
</script>
