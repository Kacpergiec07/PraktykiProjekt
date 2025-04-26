<template>
  <div class="relative">
    <!-- Overlay for expanded card -->
    <div
      v-if="open"
      class="fixed inset-0 bg-white/60 backdrop-blur-sm z-40"
      @click="toggleOpen"
    ></div>

    <!-- Drug card -->
    <div
      ref="card"
      class="border rounded-lg bg-white transition-all duration-500 ease-in-out transform cursor-pointer"
      :class="{
        'fixed shadow-2xl z-50 overflow-auto p-4': open,
        'relative z-10 hover:shadow-md p-4 h-full flex flex-col': !open,
      }"
      :style="cardStyles"
      @click="toggleOpen"
    >
      <!-- Card content -->
      <div class="flex justify-between items-start mb-4">
        <!-- Drug information -->
        <div class="w-2/5 space-y-2">
          <h3 class="text-lg font-semibold">{{ drug.name }}</h3>
          <p class="text-sm text-gray-600">Dawka: {{ drug.dose }}</p>
          <p class="text-sm text-gray-600">Typ: {{ drug.type }}</p>
          <p class="text-sm text-gray-600">Producent: {{ drug.companyName }}</p>
          <p v-if="showLimitMessage" class="text-sm text-red-600">
            Przekroczono maksymalną liczbę sztuk w magazynie
          </p>
        </div>

        <!-- Price and availability -->
        <div class="text-right">
          <p class="text-lg font-bold">{{ drug.price.toFixed(2) }} zł</p>
          <p
            class="text-sm"
            :class="{
              'text-green-600': drug.amount > 10,
              'text-yellow-600': drug.amount > 0 && drug.amount <= 10,
              'text-red-600': drug.amount === 0,
            }"
          >
            Dostępność: {{ drug.amount > 0 ? `${drug.amount}` : "Niedostępne" }}
          </p>
        </div>
      </div>

      <!-- Action buttons with consistent heights -->
      <div class="mt-auto">
        <div class="grid grid-cols-1 gap-2 max-w-xs mx-auto text-center w-full">
          <!-- Admin buttons -->
          <template v-if="isAdmin">
            <button
              @click.stop="$emit('edit')"
              class="w-full px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
            >
              Edytuj
            </button>
            <router-link
              :to="`/drugs/${drug.idDrug}`"
              @click.stop
              class="block w-full px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-center"
            >
              Szczegóły
            </router-link>
          </template>

          <!-- Delete button -->
          <button
            @click.stop="$emit('remove')"
            class="w-full px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Usuń
          </button>

          <!-- Order button or placeholder -->
          <div class="h-8">
            <button
              v-if="drug.amount > 0 && isAuthenticated"
              @click.stop="$emit('order')"
              class="w-full px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Zamów
            </button>
          </div>

          <!-- Add to cart button or placeholder -->
          <div class="h-8">
            <button
              v-if="drug.amount > 0 && isAuthenticated"
              @click.stop="handleAddToCart"
              class="w-full px-2 py-1 bg-purple-100 text-indigo-700 rounded hover:bg-indigo-200"
            >
              Do koszyka
            </button>
          </div>
        </div>

        <!-- Close button when expanded -->
        <div v-if="open" class="mt-3 text-center">
          <button
            @click.stop="toggleOpen"
            class="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Zamknij podgląd
          </button>
        </div>
      </div>
    </div>

    <!-- Placeholder to maintain layout when card is expanded -->
    <div v-if="open" class="invisible" :style="placeholderStyle"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "DrugItem",
  props: {
    drug: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showLimitMessage: false,
      open: false,
      originalDimensions: {
        width: 0,
        height: 0,
      },
    };
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated", "getCurrentUser"]),
    ...mapGetters("cart", ["getQuantityById"]),
    isAdmin() {
      const user = this.getCurrentUser;
      return user && user.permission >= 2;
    },
    cardStyles() {
      if (!this.open) return {};
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) scale(1.2)",
        width: `${this.originalDimensions.width}px`,
        maxHeight: "80vh",
        minHeight: "300px",
      };
    },
    placeholderStyle() {
      return {
        width: `${this.originalDimensions.width}px`,
        height: `${this.originalDimensions.height}px`,
      };
    },
  },
  methods: {
    toggleOpen() {
      if (!this.open) {
        const rect = this.$refs.card.getBoundingClientRect();
        this.originalDimensions = {
          width: rect.width,
          height: rect.height,
        };
      }
      this.open = !this.open;
    },
    handleAddToCart(event) {
      // Zapobiega propagacji zdarzenia kliknięcia do karty
      event.stopPropagation();
      this.addToCart();
    },
    addToCart() {
      const currentQuantity = this.getQuantityById(this.drug.idDrug);
      if (currentQuantity < this.drug.amount) {
        this.$store.commit("cart/ADD_TO_CART", {
          drug: this.drug,
          maxAmount: this.drug.amount,
        });
        this.showLimitMessage = false;
      } else {
        this.showLimitMessage = true;
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      const rect = this.$refs.card.getBoundingClientRect();
      this.originalDimensions = {
        width: rect.width,
        height: rect.height,
      };
    });
  },
};
</script>
