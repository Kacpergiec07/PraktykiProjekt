<template>
  <div
    class="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-x1 shadow-sm mb-20"
  >
    <div v-if="loading" class="flex justify-center p-12">
      <div
        class="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full shadow-lg"
      ></div>
    </div>

    <div
      v-else-if="drugs.length === 0"
      class="text-center p-12 bg-gray-50 rounded-lg shadow-sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 12H4M12 4v16m8-8H4"
        />
      </svg>
      <p class="text-gray-500 font-medium">Brak leków do wyświetlenia</p>
      <p class="text-gray-400 text-sm mt-2">Dodaj leki, aby rozpocząć</p>
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

    <div v-if="totalPages > 1" class="flex justify-center mt-8">
      <div class="inline-flex rounded-md shadow-sm">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="$emit('page-change', page)"
          class="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-300 border"
          :class="[
            currentPage === page
              ? 'bg-blue-600 text-white border-blue-600 shadow-md z-10'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
            page === 1 ? 'rounded-l-md' : '',
            page === totalPages ? 'rounded-r-md' : '',
          ]"
        >
          {{ page }}
        </button>
      </div>
    </div>

    <div
      v-if="orderModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300"
    >
      <div
        class="bg-white rounded-lg max-w-md w-full shadow-xl transform transition-all duration-300"
      >
        <div class="container"></div>

        <div
          class="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-4 rounded-t-lg border-b border-blue-200"
        >
          <h3 class="text-xl font-bold text-gray-800">
            Zamów lek: {{ selectedDrug.name }}
          </h3>
        </div>

        <div class="p-6">
          <div
            class="flex justify-between items-center mb-6 bg-blue-50 p-4 rounded-lg"
          >
            <div class="flex items-center">
              <div class="bg-blue-100 p-2 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-600">Dostępna ilość</p>
                <p class="font-medium text-gray-800">
                  {{ selectedDrug.amount }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Cena za jednostkę</p>
              <p class="font-medium text-gray-800">
                {{ selectedDrug.price.toFixed(2) }} zł
              </p>
            </div>
          </div>

          <form @submit.prevent="submitOrder" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Ilość do zamówienia</label
              >
              <div class="relative rounded-md shadow-sm">
                <input
                  type="number"
                  v-model="orderAmount"
                  step="1"
                  min="1"
                  :max="selectedDrug.amount"
                  class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 py-3 sm:text-sm border-gray-300 rounded-md transition-all duration-200"
                  required
                  @input="validateIntegerInput"
                />
                <div
                  class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                >
                  <span class="text-gray-500 sm:text-sm">szt.</span>
                </div>
              </div>
              <p class="mt-2 text-sm text-gray-500">
                Całkowity koszt:
                {{ (orderAmount * selectedDrug.price).toFixed(2) }} zł
              </p>
            </div>

            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="orderModal = false"
                class="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
              >
                Anuluj
              </button>

              <button
                type="submit"
                class="relative overflow-hidden rounded-md transition-all duration-300 px-8 py-2 text-white font-medium w-40 shadow-sm bg-green-600"
                :class="{
                  'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700':
                    !orderLoading && !orderSuccess,
                  'bg-green-600': orderLoading && !orderSuccess,
                  'bg-green-700': orderSuccess,
                }"
                :disabled="orderLoading || orderSuccess"
              >
                <span
                  class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                  :class="{
                    'opacity-0': orderLoading || orderSuccess,
                    'opacity-100': !orderLoading && !orderSuccess,
                  }"
                >
                  Zamów
                </span>
                <span
                  class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                  :class="{
                    'opacity-0': !orderLoading || orderSuccess,
                    'opacity-100': orderLoading && !orderSuccess,
                  }"
                >
                  <svg
                    class="animate-spin h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Przetwarzanie
                </span>
                <span
                  class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                  :class="{
                    'opacity-0': !orderSuccess,
                    'opacity-100': orderSuccess,
                  }"
                >
                  <svg
                    class="h-5 w-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Zamówiono
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div
      v-if="editModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300"
    >
      <div
        class="bg-white rounded-lg max-w-md w-full shadow-xl transform transition-all duration-300"
      >
        <div
          class="bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-4 rounded-t-lg border-b border-yellow-200"
        >
          <h3 class="text-xl font-bold text-gray-800">
            Edytuj lek: {{ selectedDrug.name }}
          </h3>
        </div>

        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Pole do edycji</label
            >
            <select
              v-model="editField"
              class="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm transition-all duration-200"
              @change="updateEditValue"
            >
              <option value="name">Nazwa</option>
              <option value="dose">Dawka</option>
              <option value="price">Cena</option>
              <option value="type">Typ</option>
              <option value="companyName">Producent</option>
              <option value="amount">Ilość</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Nowa wartość</label
            >
            <div class="relative rounded-md shadow-sm">
              <input
                v-if="editField === 'price' || editField === 'dose'"
                type="number"
                v-model="editValue"
                step="1"
                min="0"
                class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 py-3 sm:text-sm border-gray-300 rounded-md transition-all duration-200"
                required
              />
              <input
                v-else-if="editField === 'amount'"
                type="number"
                v-model="editValue"
                step="1"
                min="0"
                class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 py-3 sm:text-sm border-gray-300 rounded-md transition-all duration-200"
                required
                @input="validateIntegerInput"
              />
              <input
                v-else
                type="text"
                v-model="editValue"
                class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-3 py-3 sm:text-sm border-gray-300 rounded-md transition-all duration-200"
                required
              />
              <div
                v-if="editField === 'price'"
                class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm">zł</span>
              </div>
              <div
                v-if="editField === 'dose'"
                class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm">mg</span>
              </div>
              <div
                v-if="editField === 'amount'"
                class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm">szt.</span>
              </div>
            </div>
            <p class="mt-2 text-sm text-gray-500">
              Aktualna wartość: {{ getFieldCurrentValue() }}
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="editModal = false"
              class="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
            >
              Anuluj
            </button>
            <button
              @click="submitEdit"
              class="relative overflow-hidden rounded-md transition-all duration-300 px-20 py-2 text-white font-medium min-w-32 shadow-sm bg-yellow-600"
              :class="{
                'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700':
                  !editLoading && !editSuccess,
                'bg-yellow-600': editLoading && !editSuccess,
                'bg-blue-500': editSuccess,
              }"
              :disabled="editLoading || editSuccess"
            >
              <span
                class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                :class="{
                  'opacity-0': editLoading || editSuccess,
                  'opacity-100': !editLoading && !editSuccess,
                }"
              >
                Zapisz zmiany
              </span>
              <span
                class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                :class="{
                  'opacity-0': !editLoading || editSuccess,
                  'opacity-100': editLoading && !editSuccess,
                }"
              >
                <svg
                  class="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Aktualizowanie
              </span>
              <span
                class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                :class="{
                  'opacity-0': !editSuccess,
                  'opacity-100': editSuccess,
                }"
              >
                <svg
                  class="h-5 w-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Zaktualizowano
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="removeModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300"
    >
      <div
        class="bg-white rounded-lg max-w-md w-full shadow-xl transform transition-all duration-300"
      >
        <div
          class="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 rounded-t-lg border-b border-red-200"
        >
          <h3 class="text-xl font-bold text-red-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 mr-2 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Potwierdź usunięcie
          </h3>
        </div>

        <div class="p-6">
          <div class="bg-gray-50 p-4 rounded-lg mb-6">
            <p class="text-gray-700">Czy na pewno chcesz usunąć lek:</p>
            <p class="font-semibold text-lg text-gray-900 mt-1">
              {{ selectedDrug.name }}
              <span class="text-sm font-normal text-gray-500">
                ({{ selectedDrug.companyName }})
              </span>
            </p>
            <p class="text-sm text-gray-500 mt-2">
              Ta operacja jest nieodwracalna.
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="removeModal = false"
              class="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
            >
              Anuluj
            </button>
            <button
              @click="submitRemove"
              class="relative overflow-hidden rounded-md transition-all duration-300 px-8 py-2 text-white font-medium min-w-32 shadow-sm bg-red-600"
              :class="{
                'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700':
                  !removeLoading && !removeSuccess,
                'bg-red-600': removeLoading && !removeSuccess,
                'bg-red-500': removeSuccess,
              }"
              :disabled="removeLoading || removeSuccess"
            >
              <span
                class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                :class="{
                  'opacity-0': removeLoading || removeSuccess,
                  'opacity-100': !removeLoading && !removeSuccess,
                }"
              >
                Usuń
              </span>
              <span
                class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                :class="{
                  'opacity-0': !removeLoading || removeSuccess,
                  'opacity-100': removeLoading && !removeSuccess,
                }"
              >
                <svg
                  class="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Usuwanie
              </span>
              <span
                class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                :class="{
                  'opacity-0': !removeSuccess,
                  'opacity-100': removeSuccess,
                }"
              >
                <svg
                  class="h-5 w-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Usunięto
              </span>
            </button>
          </div>
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
      orderSuccess: false,
      editField: "name",
      editValue: "",
      editLoading: false,
      editSuccess: false,
      removeLoading: false,
      removeSuccess: false,
    };
  },
  methods: {
    ...mapActions("drugs", ["updateDrug", "removeDrug"]),
    ...mapActions("orders", ["orderDrug"]),

    validateIntegerInput(event) {
      if (event.target.value.includes(".")) {
        this.orderAmount = parseInt(event.target.value);
      }
    },

    openOrderModal(drug) {
      this.selectedDrug = drug;
      this.orderAmount = 1;
      this.orderModal = true;
      this.orderSuccess = false;
    },

    openEditModal(drug) {
      this.selectedDrug = drug;
      this.editField = "name";
      this.editValue = drug[this.editField];
      this.editModal = true;
      this.editSuccess = false;
    },

    updateEditValue() {
      this.editValue = this.selectedDrug[this.editField];

      if (
        this.editField === "amount" &&
        this.editValue.toString().includes(".")
      ) {
        this.editValue = parseInt(this.editValue);
      }
    },

    getFieldCurrentValue() {
      const value = this.selectedDrug[this.editField];
      if (this.editField === "price") {
        return `${value.toFixed(2)} zł`;
      } else if (this.editField === "dose") {
        return `${value} mg`;
      } else if (this.editField === "amount") {
        return `${value} szt.`;
      }
      return value;
    },

    confirmRemove(drug) {
      this.selectedDrug = drug;
      this.removeModal = true;
      this.removeSuccess = false;
    },

    async submitOrder() {
      try {
        this.orderLoading = true;
        await this.orderDrug({
          id: this.selectedDrug.idDrug,
          amount: parseInt(this.orderAmount),
        });
        this.orderSuccess = true;

        setTimeout(() => {
          this.$emit("refresh");
          this.orderModal = false;

          setTimeout(() => {
            this.orderLoading = false;
            this.orderSuccess = false;
          }, 300);
        }, 1000);
      } catch (error) {
        console.error("Order failed:", error);
        this.orderLoading = false;
      }
    },

    async submitEdit() {
      try {
        this.editLoading = true;

        let value = this.editValue;
        if (this.editField === "price" || this.editField === "dose") {
          value = parseFloat(value);
        } else if (this.editField === "amount") {
          value = parseInt(value);
        }

        await this.updateDrug({
          id: this.selectedDrug.idDrug,
          field: this.editField,
          value,
        });

        this.editSuccess = true;

        setTimeout(() => {
          this.$emit("refresh");
          this.editModal = false;

          setTimeout(() => {
            this.editLoading = false;
            this.editSuccess = false;
          }, 300);
        }, 1000);
      } catch (error) {
        console.error("Edit failed:", error);
        this.editLoading = false;
      }
    },

    async submitRemove() {
      try {
        this.removeLoading = true;
        await this.removeDrug(this.selectedDrug.idDrug);

        this.removeSuccess = true;

        setTimeout(() => {
          this.$emit("refresh");
          this.removeModal = false;

          setTimeout(() => {
            this.removeLoading = false;
            this.removeSuccess = false;
          }, 300);
        }, 1000);
      } catch (error) {
        console.error("Remove failed:", error);
        this.removeLoading = false;
      }
    },
  },
};
</script>
