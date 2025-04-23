<template>
  <div class="mt-5">
    <h1 class="text-2xl font-bold mb-6">Panel administracyjny</h1>

    <div v-if="error" class="mb-6 p-4 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      <div class="lg:col-span-1">
        <div class="sticky top-4">
          <div class="bg-white p-4 rounded-lg shadow-md mb-4">
            <h2 class="text-lg font-semibold mb-3">Menu</h2>

            <div class="relative">
              <div class="absolute inset-0 bg-gray-50 rounded"></div>

              <div
                class="absolute rounded bg-indigo-100 transition-all duration-400 ease-out"
                :style="{
                  height: '40px',
                  width: '100%',
                  top: `${activeTabIndex * 40}px`,
                  left: '0',
                }"
              ></div>

              <div class="relative z-10">
                <button
                  v-for="(tab, index) in tabs"
                  :key="index"
                  @click="setCurrentTab(tab.value)"
                  class="w-full text-left px-4 py-2 h-10 mb-0 block transition-colors"
                  :class="
                    currentTab === tab.value
                      ? 'text-indigo-700 font-medium'
                      : 'text-gray-700 hover:text-indigo-600'
                  "
                >
                  {{ tab.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-3">
        <div v-if="currentTab === 'orderReports'">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Raporty zamówień</h2>
            <p class="text-gray-600 mb-6">
              Pełny raport ze wszystkich zamówień w systemie.
            </p>

            <order-history
              :orders="reports"
              :loading="loading"
              :total-pages="totalPages"
              :current-page="currentPage"
              :is-report="true"
              @filter-change="applyReportFilters"
            />
          </div>
        </div>

        <div v-else-if="currentTab === 'orderManagement'">
          <order-status-manager />
        </div>

        <div v-else-if="currentTab === 'revenueStats'">
          <revenue-stats />
        </div>

        <div v-else-if="currentTab === 'drugManagement'">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Zarządzanie lekami</h2>

            <div class="mb-6">
              <button
                @click="showAddDrugForm = !showAddDrugForm"
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {{ showAddDrugForm ? "Ukryj formularz" : "Dodaj nowy lek" }}
              </button>
            </div>

            <div
              v-if="showAddDrugForm"
              class="mb-8 p-4 bg-gray-50 rounded border"
            >
              <h3 class="text-lg font-semibold mb-3">Dodaj nowy lek</h3>

              <form @submit.prevent="submitNewDrug">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block mb-1">Nazwa</label>
                    <input
                      type="text"
                      v-model="newDrug.name"
                      class="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label class="block mb-1">Dawka</label>
                    <input
                      type="number"
                      v-model="newDrug.dose"
                      step="1"
                      min="0"
                      class="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label class="block mb-1">Cena</label>
                    <input
                      type="number"
                      v-model="newDrug.price"
                      step="1"
                      min="0"
                      class="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label class="block mb-1">Typ</label>
                    <input
                      type="text"
                      v-model="newDrug.type"
                      class="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label class="block mb-1">Producent</label>
                    <input
                      type="text"
                      v-model="newDrug.companyName"
                      class="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label class="block mb-1">Ilość</label>
                    <input
                      type="number"
                      v-model="newDrug.amount"
                      step="1"
                      min="0"
                      class="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                </div>

                <div class="mt-4 flex justify-end">
                  <button
                    type="submit"
                    class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    :disabled="addDrugLoading"
                  >
                    {{ addDrugLoading ? "Dodawanie..." : "Dodaj lek" }}
                  </button>
                </div>
              </form>
            </div>

            <div>
              <h3 class="text-lg font-semibold mb-3">Istniejące leki</h3>

              <drugs-list
                :drugs="drugs"
                :loading="drugsLoading"
                :total-pages="drugsTotalPages"
                :current-page="drugsCurrentPage"
                @refresh="loadDrugs"
                @page-change="changeDrugsPage"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from "vuex";
import OrderHistory from "../components/Orderhistory.vue";
import DrugsList from "../components/Drugslist.vue";
import RevenueStats from "../components/RevenueStats.vue";
import OrderStatusManager from "../components/OrderStatusManager.vue";
import notification from "../utils/notification";

export default {
  name: "AdminView",
  components: {
    OrderHistory,
    DrugsList,
    RevenueStats,
    OrderStatusManager,
  },
  data() {
    return {
      currentTab: "orderReports",
      showAddDrugForm: false,
      newDrug: {
        name: "",
        dose: "",
        price: "",
        type: "",
        companyName: "",
        amount: "",
      },
      addDrugLoading: false,
      drugsLoading: false,
      tabs: [
        { label: "Raporty zamówień", value: "orderReports" },
        { label: "Zarządzanie zamówieniami", value: "orderManagement" },
        { label: "Statystyki przychodów", value: "revenueStats" },
        { label: "Zarządzanie lekami", value: "drugManagement" },
      ],
    };
  },
  computed: {
    ...mapState({
      loading: (state) => state.loading,
      error: (state) => state.error,
    }),
    ...mapGetters("orders", ["allReports", "totalPages", "currentPage"]),
    ...mapGetters("drugs", [
      "allDrugs",
      "totalPages as drugsTotalPages",
      "currentPage as drugsCurrentPage",
    ]),

    reports() {
      return this.allReports;
    },

    drugs() {
      return this.allDrugs;
    },

    activeTabIndex() {
      return this.tabs.findIndex((tab) => tab.value === this.currentTab);
    },
  },
  methods: {
    ...mapActions("orders", ["fetchOrderReports"]),
    ...mapActions("drugs", ["fetchDrugs", "addDrug"]),
    ...mapActions(["clearError"]),

    setCurrentTab(tabValue) {
      this.currentTab = tabValue;
    },

    async applyReportFilters({ page, limit, filter, descending, orderBy }) {
      try {
        await this.fetchOrderReports({
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

    async loadDrugs() {
      this.drugsLoading = true;
      try {
        await this.fetchDrugs(0);
      } catch (error) {
        console.error("Failed to load drugs:", error);
      } finally {
        this.drugsLoading = false;
      }
    },

    async changeDrugsPage(page) {
      this.drugsLoading = true;
      try {
        await this.fetchDrugs(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Failed to change page:", error);
      } finally {
        this.drugsLoading = false;
      }
    },

    async submitNewDrug() {
      this.addDrugLoading = true;
      try {
        const drugData = {
          name: this.newDrug.name,
          dose: parseFloat(this.newDrug.dose),
          price: parseFloat(this.newDrug.price),
          type: this.newDrug.type,
          companyName: this.newDrug.companyName,
          amount: parseFloat(this.newDrug.amount),
        };

        await this.addDrug(drugData);

        this.newDrug = {
          name: "",
          dose: "",
          price: "",
          type: "",
          companyName: "",
          amount: "",
        };

        this.showAddDrugForm = false;

        notification.success("Lek został dodany pomyślnie");

        this.loadDrugs();
      } catch (error) {
        console.error("Failed to add drug:", error);
        notification.error(
          "Nie udało się dodać leku: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        this.addDrugLoading = false;
      }
    },
  },
  created() {
    this.fetchOrderReports({
      page: 0,
      descending: true,
      orderBy: "orderDate",
    });

    this.loadDrugs();
  },
  beforeUnmount() {
    this.clearError();
  },
};
</script>
