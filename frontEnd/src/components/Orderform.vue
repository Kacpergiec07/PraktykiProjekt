<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Zamów lek</h2>

    <div v-if="drug">
      <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="font-medium">Nazwa:</p>
          <p>{{ drug.name }}</p>
        </div>
        <div>
          <p class="font-medium">Producent:</p>
          <p>{{ drug.companyName }}</p>
        </div>
        <div>
          <p class="font-medium">Dostępna ilość:</p>
          <p>{{ drug.amount }}</p>
        </div>
        <div>
          <p class="font-medium">Cena:</p>
          <p>{{ drug.price.toFixed(2) }} zł</p>
        </div>
      </div>

      <form @submit.prevent="submitOrder">
        <div class="mb-4">
          <label class="block mb-1">Ilość do zamówienia</label>
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

        <div class="flex justify-end">
          <button
            type="submit"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            :disabled="loading || orderAmount <= 0 || orderAmount > drug.amount"
          >
            {{ loading ? "Przetwarzanie..." : "Złóż zamówienie" }}
          </button>
        </div>
      </form>
    </div>
    <div v-else class="text-center py-4">
      <p class="text-gray-500">Wybierz lek, aby złożyć zamówienie</p>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "OrderForm",
  props: {
    drug: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      orderAmount: 1,
    };
  },
  watch: {
    drug() {
      // Reset amount when drug changes
      this.orderAmount = 1;
    },
  },
  methods: {
    ...mapActions("orders", ["orderDrug"]),

    async submitOrder() {
      if (!this.drug) return;

      try {
        await this.orderDrug({
          id: this.drug.idDrug,
          amount: parseFloat(this.orderAmount),
        });

        this.$emit("success", {
          drugName: this.drug.name,
          amount: this.orderAmount,
        });

        // Reset form
        this.orderAmount = 1;
      } catch (error) {
        this.$emit("error", error);
      }
    },
  },
};
</script>
