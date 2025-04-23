<template>
  <div class="relative h-full">
    <div
      v-if="open"
      class="fixed inset-0 bg-white/60 backdrop-blur-sm z-40"
      @click="toggleOpen"
    ></div>

    <div
      ref="card"
      class="border rounded-lg p-4 bg-white transition-all duration-500 ease-in-out transform cursor-pointer h-full flex flex-col justify-between"
      :class="{
        'fixed shadow-2xl z-50 bg-white overflow-auto': open,
        'relative z-10 hover:shadow-md': !open,
      }"
      :style="cardStyles"
      @click="toggleOpen"
    >
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-semibold">{{ drug.name }}</h3>
          <p class="text-sm text-gray-600">Dawka: {{ drug.dose }}</p>
          <p class="text-sm text-gray-600">Typ: {{ drug.type }}</p>
          <p class="text-sm text-gray-600">Producent: {{ drug.companyName }}</p>
        </div>
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

      <div :class="{ 'mt-auto': !open, 'mt-2': open }">
        <div class="grid grid-cols-2 gap-2 max-w-xs mx-auto text-center w-full">
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
