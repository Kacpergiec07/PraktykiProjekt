<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 mt-5">Historia zamówień</h1>

    <div v-if="error" class="mb-6 p-4 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>

    <order-history
      :orders="orders"
      :loading="loading"
      :total-pages="totalPages"
      :current-page="currentPage"
      :is-report="false"
      @filter-change="applyFilters"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from "vuex";
import OrderHistory from "../components/OrderHistory.vue";

export default {
  name: "OrderHistoryView",
  components: {
    OrderHistory,
  },
  computed: {
    ...mapState({
      loading: (state) => state.loading,
      error: (state) => state.error,
    }),
    ...mapGetters("orders", ["userOrders", "totalPages", "currentPage"]),

    orders() {
      return this.userOrders;
    },
  },
  methods: {
    ...mapActions("orders", ["fetchOrderHistory"]),
    ...mapActions(["clearError"]),

    async applyFilters({ page, limit, filter, descending, orderBy }) {
      try {
        await this.fetchOrderHistory({
          page,
          limit,
          filter,
          descending,
          orderBy,
        });

        if (page !== this.currentPage) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch (error) {
        console.error("Failed to apply filters:", error);
      }
    },
  },
  created() {
    this.fetchOrderHistory({
      page: 0,
      descending: true,
      orderBy: "orderDate",
    });
  },
  beforeUnmount() {
    this.clearError();
  },
};
</script>
