<template>
  <div>
    <div v-if="loading" class="flex justify-center p-8">
      <div
        class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
      ></div>
    </div>

    <div v-else-if="drugs.length === 0" class="text-center p-8">
      <p class="text-gray-500">Brak leków do wyświetlenia</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <drug-item
        v-for="drug in drugs"
        :key="drug.idDrug"
        :drug="drug"
        @order="openOrderModal(drug)"
        @edit="openEditModal(drug)"
        @remove="confirmRemove(drug)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-6">
      <div class="flex space-x-1">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="$emit('page-change', page)"
          class="px-3 py-1 rounded"
          :class="
            currentPage === page
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          "
        >
          {{ page }}
        </button>
      </div>
    </div>

    <!-- Order Modal -->
    <div
      v-if="orderModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">
          Zamów lek: {{ selectedDrug.name }}
        </h3>
        <p>Dostępna ilość: {{ selectedDrug.amount }}</p>
        <p>Cena: {{ selectedDrug.price.toFixed(2) }} zł</p>

        <form @submit.prevent="submitOrder">
          <div class="my-4">
            <label class="block mb-1">Ilość</label>
            <input
              type="number"
              v-model="orderAmount"
              step="0.01"
              min="0.01"
              :max="selectedDrug.amount"
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
              :disabled="orderLoading"
            >
              {{ orderLoading ? "Przetwarzanie..." : "Zamów" }}
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
        <h3 class="text-xl font-bold mb-4">
          Edytuj lek: {{ selectedDrug.name }}
        </h3>

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
            :disabled="editLoading"
          >
            {{ editLoading ? "Aktualizowanie..." : "Zapisz zmiany" }}
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
          Czy na pewno chcesz usunąć lek:
          <strong>{{ selectedDrug.name }}</strong
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
            :disabled="removeLoading"
          >
            {{ removeLoading ? "Usuwanie..." : "Usuń" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import DrugItem from "./DrugItem.vue";

export default {
  name: "DrugsList",
  components: {
    DrugItem,
  },
  props: {
    drugs: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    totalPages: {
      type: Number,
      default: 1,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      orderModal: false,
      editModal: false,
      removeModal: false,
      selectedDrug: null,
      orderAmount: 1,
      orderLoading: false,
      editField: "name",
      editValue: "",
      editLoading: false,
      removeLoading: false,
    };
  },
  methods: {
    ...mapActions("drugs", ["updateDrug", "removeDrug"]),
    ...mapActions("orders", ["orderDrug"]),

    openOrderModal(drug) {
      this.selectedDrug = drug;
      this.orderAmount = 1;
      this.orderModal = true;
    },

    openEditModal(drug) {
      this.selectedDrug = drug;
      this.editField = "name";
      this.editValue = drug[this.editField];
      this.editModal = true;
    },

    confirmRemove(drug) {
      this.selectedDrug = drug;
      this.removeModal = true;
    },

    async submitOrder() {
      try {
        this.orderLoading = true;
        await this.orderDrug({
          id: this.selectedDrug.idDrug,
          amount: parseFloat(this.orderAmount),
        });
        this.$emit("refresh");
        this.orderModal = false;
      } catch (error) {
        console.error("Order failed:", error);
      } finally {
        this.orderLoading = false;
      }
    },

    async submitEdit() {
      try {
        this.editLoading = true;

        let value = this.editValue;
        if (
          this.editField === "price" ||
          this.editField === "dose" ||
          this.editField === "amount"
        ) {
          value = parseFloat(value);
        }

        await this.updateDrug({
          id: this.selectedDrug.idDrug,
          field: this.editField,
          value,
        });

        this.$emit("refresh");
        this.editModal = false;
      } catch (error) {
        console.error("Edit failed:", error);
      } finally {
        this.editLoading = false;
      }
    },

    async submitRemove() {
      try {
        this.removeLoading = true;
        await this.removeDrug(this.selectedDrug.idDrug);
        this.$emit("refresh");
        this.removeModal = false;
      } catch (error) {
        console.error("Remove failed:", error);
      } finally {
        this.removeLoading = false;
      }
    },
  },
};
</script>
