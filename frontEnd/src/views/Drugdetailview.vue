<template>
  <div>
    <div class="mb-4">
      <router-link to="/drugs" class="text-blue-600 hover:underline">
        &larr; Powrót do listy leków
      </router-link>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center p-8">
      <div
        class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
      ></div>
    </div>

    <!-- Error message -->
    <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>

    <!-- Success message -->
    <div
      v-if="successMessage"
      class="mb-6 p-4 bg-green-100 text-green-700 rounded"
    >
      {{ successMessage }}
    </div>

    <!-- Drug details -->
    <div v-else-if="drug" class="bg-white p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-bold mb-2">{{ drug.name }}</h1>
          <p class="text-gray-600 mb-4">ID leku: {{ drug.idDrug }}</p>
        </div>
        <div v-if="isAdmin" class="flex space-x-2">
          <button
            @click="openEditModal"
            class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
          >
            Edytuj
          </button>
          <button
            @click="openRemoveModal"
            class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Usuń
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h2 class="text-lg font-semibold mb-3">Informacje o leku</h2>
          <div class="space-y-2">
            <p><span class="font-medium">Dawka:</span> {{ drug.dose }}</p>
            <p><span class="font-medium">Typ:</span> {{ drug.type }}</p>
            <p>
              <span class="font-medium">Producent:</span> {{ drug.companyName }}
            </p>
          </div>
        </div>

        <div>
          <h2 class="text-lg font-semibold mb-3">Dostępność i cena</h2>
          <div class="space-y-2">
            <p>
              <span class="font-medium">Cena:</span>
              {{ drug.price.toFixed(2) }} zł
            </p>
            <p>
              <span class="font-medium">Dostępność:</span>
              <span
                :class="{
                  'text-green-600': drug.amount > 10,
                  'text-yellow-600': drug.amount > 0 && drug.amount <= 10,
                  'text-red-600': drug.amount === 0,
                }"
              >
                {{ drug.amount > 0 ? `${drug.amount}` : "Niedostępne" }}
              </span>
            </p>
          </div>

          <div v-if="drug.amount > 0 && isAuthenticated" class="mt-6">
            <button
              @click="openOrderModal"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Zamów lek
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No drug found -->
    <div v-else class="p-4 bg-yellow-100 text-yellow-700 rounded">
      Nie znaleziono leku o podanym ID.
    </div>

    <!-- Order Modal -->
    <div
      v-if="orderModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Zamów lek: {{ drug.name }}</h3>
        <p>Dostępna ilość: {{ drug.amount }}</p>
        <p>Cena: {{ drug.price.toFixed(2) }} zł</p>

        <form @submit.prevent="submitOrder">
          <div class="my-4">
            <label class="block mb-1">Ilość</label>
            <input
              type="number"
              v-model="orderAmount"
              step="0.01"
              min="0.01"
              :max="drug.amount"
              class="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div class="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              @click="orderModal = false"
              class="px-4 py-2 border rounded"
            >
              Anuluj
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              :disabled="actionLoading"
            >
              {{ actionLoading ? "Przetwarzanie..." : "Zamów" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="editModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Edytuj lek: {{ drug.name }}</h3>

        <div class="my-4">
          <label class="block mb-1">Pole do edycji</label>
          <select v-model="editField" class="w-full px-3 py-2 border rounded">
            <option value="name">Nazwa</option>
            <option value="dose">Dawka</option>
            <option value="price">Cena</option>
            <option value="type">Typ</option>
            <option value="companyName">Producent</option>
            <option value="amount">Ilość</option>
          </select>
        </div>

        <div class="my-4">
          <label class="block mb-1">Nowa wartość</label>
          <input
            v-if="
              editField === 'price' ||
              editField === 'dose' ||
              editField === 'amount'
            "
            type="number"
            v-model="editValue"
            step="0.01"
            min="0"
            class="w-full px-3 py-2 border rounded"
            required
          />
          <input
            v-else
            type="text"
            v-model="editValue"
            class="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div class="mt-6 flex justify-end space-x-2">
          <button
            type="button"
            @click="editModal = false"
            class="px-4 py-2 border rounded"
          >
            Anuluj
          </button>
          <button
            @click="submitEdit"
            class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            :disabled="actionLoading"
          >
            {{ actionLoading ? "Aktualizowanie..." : "Zapisz zmiany" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Remove Confirmation Modal -->
    <div
      v-if="removeModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Potwierdź usunięcie</h3>
        <p>
          Czy na pewno chcesz usunąć lek: <strong>{{ drug.name }}</strong
          >?
        </p>

        <div class="mt-6 flex justify-end space-x-2">
          <button
            type="button"
            @click="removeModal = false"
            class="px-4 py-2 border rounded"
          >
            Anuluj
          </button>
          <button
            @click="submitRemove"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            :disabled="actionLoading"
          >
            {{ actionLoading ? "Usuwanie..." : "Usuń" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";

export default {
  name: "DrugDetailView",
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      orderModal: false,
      editModal: false,
      removeModal: false,
      orderAmount: 1,
      editField: "name",
      editValue: "",
      actionLoading: false,
      successMessage: "",
      timer: null,
    };
  },
  computed: {
    ...mapState({
      loading: (state) => state.loading,
      error: (state) => state.error,
    }),
    ...mapGetters("drugs", ["currentDrug"]),
    ...mapGetters("auth", ["isAuthenticated", "getCurrentUser"]),

    drug() {
      return this.currentDrug;
    },

    isAdmin() {
      const user = this.getCurrentUser;
      return user && user.permission >= 2; // Pharmacist or admin
    },
  },
  methods: {
    ...mapActions("drugs", ["fetchDrugById", "updateDrug", "removeDrug"]),
    ...mapActions("orders", ["orderDrug"]),
    ...mapActions(["clearError"]),

    openOrderModal() {
      this.orderAmount = 1;
      this.orderModal = true;
    },

    openEditModal() {
      this.editField = "name";
      this.editValue = this.drug[this.editField];
      this.editModal = true;
    },

    openRemoveModal() {
      this.removeModal = true;
    },

    async submitOrder() {
      try {
        this.actionLoading = true;
        await this.orderDrug({
          id: this.drug.idDrug,
          amount: parseFloat(this.orderAmount),
        });
        this.orderModal = false;
        this.showSuccessMessage("Zamówienie zostało złożone pomyślnie");

        // Refresh drug details to update the amount
        await this.fetchDrugById(this.id);
      } catch (error) {
        console.error("Order failed:", error);
      } finally {
        this.actionLoading = false;
      }
    },

    async submitEdit() {
      try {
        this.actionLoading = true;

        let value = this.editValue;
        if (
          this.editField === "price" ||
          this.editField === "dose" ||
          this.editField === "amount"
        ) {
          value = parseFloat(value);
        }

        await this.updateDrug({
          id: this.drug.idDrug,
          field: this.editField,
          value,
        });

        this.editModal = false;
        this.showSuccessMessage("Lek został zaktualizowany pomyślnie");
      } catch (error) {
        console.error("Edit failed:", error);
      } finally {
        this.actionLoading = false;
      }
    },

    async submitRemove() {
      try {
        this.actionLoading = true;
        await this.removeDrug(this.drug.idDrug);
        this.removeModal = false;
        this.showSuccessMessage("Lek został usunięty pomyślnie");

        // Redirect to drugs list after a brief delay
        setTimeout(() => {
          this.$router.push("/drugs");
        }, 1500);
      } catch (error) {
        console.error("Remove failed:", error);
      } finally {
        this.actionLoading = false;
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
  async created() {
    try {
      await this.fetchDrugById(this.id);
      if (!this.drug) {
        // No drug found
      }
    } catch (error) {
      console.error("Failed to fetch drug details:", error);
    }
  },
  beforeUnmount() {
    if (this.timer) clearTimeout(this.timer);
    this.clearError();
  },
};
</script>
