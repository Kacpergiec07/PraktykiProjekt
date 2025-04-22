<template>
  <div>
    <div class="flex justify-between items-center mb-6 mt-10">
      <h1 class="text-2xl font-bold">Dostępne leki</h1>
      <div class="flex space-x-2">
        <button
          @click="refresh"
          class="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          Odśwież
        </button>
      </div>
    </div>

    <!-- Global error display -->
    <div v-if="error" class="mb-6 p-4 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>

    <!-- Success message -->
    <div
      v-if="successMessage"
      class="mb-6 p-4 bg-green-100 text-green-700 rounded"
    >
      {{ successMessage }}
    </div>

    <drugs-list
      :drugs="drugs"
      :loading="loading"
      :total-pages="totalPages"
      :current-page="currentPage"
      @refresh="refresh"
      @page-change="changePage"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from "vuex";
import DrugsList from "../components/DrugsList.vue";

export default {
  name: "DrugsView",
  components: {
    DrugsList,
  },
  data() {
    return {
      successMessage: "",
      timer: null,
    };
  },
  computed: {
    ...mapState({
      loading: (state) => state.loading,
      error: (state) => state.error,
    }),
    ...mapGetters("drugs", ["allDrugs", "totalPages", "currentPage"]),
    drugs() {
      return this.allDrugs;
    },
  },
  methods: {
    ...mapActions("drugs", ["fetchDrugs"]),
    ...mapActions(["clearError"]),

    async refresh() {
      try {
        await this.fetchDrugs(this.currentPage);
        this.showSuccessMessage("Lista leków została odświeżona");
      } catch (error) {
        console.error("Failed to refresh drugs list:", error);
      }
    },

    async changePage(page) {
      try {
        await this.fetchDrugs(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Failed to change page:", error);
      }
    },

    showSuccessMessage(message) {
      this.successMessage = message;

      // Clear the message after 3 seconds
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.successMessage = "";
      }, 3000);
    },
  },
  created() {
    this.fetchDrugs(0);
  },
  beforeUnmount() {
    if (this.timer) clearTimeout(this.timer);
    this.clearError();
  },
};
</script>
