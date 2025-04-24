<template>
  <div
    class="bg-white/70 border rounded-lg p-4 hover:shadow-md transition-shadow backdrop-blur-md"
  >
    <div class="flex justify-between items-start">
      <div class="w-2/5">
        <h3 class="text-lg font-semibold">{{ drug.name }}</h3>
        <p class="text-sm text-gray-600">Dawka: {{ drug.dose }}</p>
        <p class="text-sm text-gray-600">Typ: {{ drug.type }}</p>
        <p class="text-sm text-gray-600">Producent: {{ drug.companyName }}</p>
      </div>

      <div :class="{ 'mt-5': !open, 'mt-2': open }">
        <div class="grid grid-cols-1 gap-2 max-w-xs mx-auto text-center w-full">
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
              class="w-full px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Szczegóły
            </router-link>
          </template>
          <button
            @click.stop="$emit('remove')"
            class="w-full px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Usuń
          </button>
          <button
            v-if="drug.amount > 0 && isAuthenticated"
            @click.stop="$emit('order')"
            class="w-full px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Zamów
          </button>
          <div class="flex flex-col items-end space-y-1 w-full">
            <button
              v-if="drug.amount > 0 && isAuthenticated"
              @click="addToCart"
              class="px-3 py-1 bg-purple-100 text-indigo-700 rounded hover:bg-indigo-200 w-fit"
            > 
            Do koszyka
            </button>
        
          </div>
          <p v-if="showLimitMessage" class="text-sm text-red-600">Przekroczono maksymalną liczbę sztuk w magazynie</p>
        </div>

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
      cartQuantity: 0,
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
    isAdmin() {
      const user = this.getCurrentUser;
      return user && user.permission >= 2;
    },
    cardStyles() {
      if (!this.open) return {};

      const maxHeight = Math.min(
        this.originalDimensions.height * 1.5,
        window.innerHeight * 0.7
      );

      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) scale(1.5)",
        width: `${this.originalDimensions.width}px`,
        maxHeight: `${maxHeight}px`,
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
    addToCart() {
      if (this.cartQuantity < this.drug.amount) {
        this.cartQuantity++;
        this.$emit("add-to-cart", this.drug);
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
