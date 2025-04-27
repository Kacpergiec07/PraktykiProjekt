<template>
  <div>
    <div class="mb-4 mt-4">
      <router-link
        to="/drugs"
        class="px-3 py-2 text-gray-600 font-medium text-l rounded transition-colors duration-200 flex items-center w-fit"
      >
        <span class="text-xl">&larr;</span>
        <span class="ml-1">Powrót do listy leków</span>
      </router-link>
    </div>

    <div v-if="loading" class="flex justify-center p-8">
      <div
        class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
      ></div>
    </div>

    <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>

    <div
      v-if="successMessage"
      class="mb-6 p-4 bg-green-100 text-green-700 rounded"
    >
      {{ successMessage }}
    </div>

    <div v-else-if="drug" class="bg-white p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-bold mb-2">{{ drug.name }}</h1>
          <p class="text-gray-600 mb-4">ID leku: {{ drug.idDrug }}</p>
          <p v-if="showLimitMessage" class="text-sm text-red-600">
            Przekroczono maksymalną liczbę sztuk w magazynie ({{ drug.amount }})
          </p>
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

          <div
            v-if="drug.amount > 0 && isAuthenticated"
            class="flex gap-6 mt-6"
          >
            <button
              @click="openOrderModal"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Zamów lek
            </button>
            <button
              v-if="drug.amount > 0 && isAuthenticated"
              @click="addToCart"
              class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Do koszyka
            </button>
          </div>
          <br />
        </div>
      </div>
    </div>

    <div v-else class="p-4 bg-yellow-100 text-yellow-700 rounded">
      Nie znaleziono leku o podanym ID.
    </div>

    <div
      v-if="orderModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300"
    >
      <div
        class="bg-white rounded-lg max-w-md w-full shadow-xl transform transition-all duration-300"
      >
        <div
          class="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-4 rounded-t-lg border-b border-blue-200"
        >
          <h3 class="text-xl font-bold text-gray-800">
            Zamów lek: {{ drug.name }}
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
                <p class="font-medium text-gray-800">{{ drug.amount }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Cena za jednostkę</p>
              <p class="font-medium text-gray-800">
                {{ drug.price.toFixed(2) }} zł
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
                  :max="drug.amount"
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
                Całkowity koszt: {{ (orderAmount * drug.price).toFixed(2) }} zł
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
            Edytuj lek: {{ drug.name }}
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
                step="0.01"
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
                class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 py-3 sm:text-sm border-gray-300 rounded-md transition-all duration-200"
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
              {{ drug.name }}
              <span class="text-sm font-normal text-gray-500">
                ({{ drug.companyName }})
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
      cartQuantity: 0,
      showLimitMessage: false,
      orderModal: false,
      editModal: false,
      removeModal: false,
      orderAmount: 1,
      editField: "name",
      editValue: "",
      orderLoading: false,
      orderSuccess: false,
      editLoading: false,
      editSuccess: false,
      removeLoading: false,
      removeSuccess: false,
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
      return user && user.permission >= 2;
    },
  },
  methods: {
    ...mapActions("drugs", ["fetchDrugById", "updateDrug", "removeDrug"]),
    ...mapActions("orders", ["orderDrug"]),
    ...mapActions(["clearError"]),

    validateIntegerInput(event) {
      if (event.target.value.includes(".")) {
        this.orderAmount = parseInt(event.target.value);
      }
    },

    updateEditValue() {
      this.editValue = this.drug[this.editField];

      if (
        this.editField === "amount" &&
        this.editValue.toString().includes(".")
      ) {
        this.editValue = parseInt(this.editValue);
      }
    },

    addToCart() {
      const currentQty = this.$store.getters["cart/getQuantityById"](
        this.drug.idDrug
      );
      if (currentQty < this.drug.amount) {
        this.$store.commit("cart/ADD_TO_CART", {
          drug: this.drug,
          maxAmount: this.drug.amount,
        });
        this.showLimitMessage = false;
      } else {
        this.showLimitMessage = true;
      }
    },

    getFieldCurrentValue() {
      const value = this.drug[this.editField];
      if (this.editField === "price") {
        return `${value.toFixed(2)} zł`;
      } else if (this.editField === "dose") {
        return `${value} mg`;
      } else if (this.editField === "amount") {
        return `${value} szt.`;
      }
      return value;
    },

    openOrderModal() {
      this.orderAmount = 1;
      this.orderModal = true;
      this.orderSuccess = false;
    },

    openEditModal() {
      this.editField = "name";
      this.editValue = this.drug[this.editField];
      this.editModal = true;
      this.editSuccess = false;
    },

    openRemoveModal() {
      this.removeModal = true;
      this.removeSuccess = false;
    },

    async submitOrder() {
      try {
        this.orderLoading = true;
        await this.orderDrug({
          id: this.drug.idDrug,
          amount: parseInt(this.orderAmount),
        });

        this.orderSuccess = true;

        setTimeout(() => {
          this.orderModal = false;
          this.showSuccessMessage("Zamówienie zostało złożone pomyślnie");

          this.fetchDrugById(this.id);

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
          id: this.drug.idDrug,
          field: this.editField,
          value,
        });

        this.editSuccess = true;

        setTimeout(() => {
          this.editModal = false;
          this.showSuccessMessage("Lek został zaktualizowany pomyślnie");

          this.fetchDrugById(this.id);

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
        await this.removeDrug(this.drug.idDrug);

        this.removeSuccess = true;

        setTimeout(() => {
          this.removeModal = false;
          this.showSuccessMessage("Lek został usunięty pomyślnie");

          setTimeout(() => {
            this.$router.push("/drugs");
          }, 1000);

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

    showSuccessMessage(message) {
      this.successMessage = message;

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
