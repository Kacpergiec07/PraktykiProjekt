<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4">Zawartość koszyka</h2>

    <div v-if="cartItems.length === 0" class="text-gray-500">
      Koszyk jest pusty.
    </div>

    <div v-else>
      <ul class="divide-y divide-gray-200 mb-4">
        <li
          v-for="item in cartItems"
          :key="item.id"
          class="flex justify-between items-center py-2"
        >
          <div>
            <p class="font-semibold">{{ item.name }}</p>
            <p class="text-sm text-gray-600">Ilość: {{ item.quantity }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <span class="font-semibold">
              {{ (item.price * item.quantity).toFixed(2) }} zł
            </span>
            <button
              @click="decreaseQuantity(item)"
              class="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Usuń
            </button>
          </div>
        </li>
      </ul>

      <div class="flex justify-between items-center mb-4">
        <span class="font-semibold">Łączna kwota:</span>
        <span class="text-lg font-bold">{{ totalPrice.toFixed(2) }} zł</span>
      </div>

      <div class="flex justify-end">
        <button
          @click="checkout"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Złóż zamówienie
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";

export default {
  name: "Cart",
  computed: {
    cartItems() {
      return this.$store.state.cart.items;
    },
    ...mapGetters("cart", ["totalPrice"]),
  },
  methods: {
    ...mapActions("orders", ["orderDrug"]),
    ...mapMutations("cart", ["REMOVE_FROM_CART", "DECREASE_QUANTITY"]),

    decreaseQuantity(item) {
      if (item.quantity > 1) {
        this.DECREASE_QUANTITY(item.id);
      } else {
        this.REMOVE_FROM_CART(item.id);
      }
    },

    async checkout() {
      const user = this.$store.getters["auth/getCurrentUser"];
      if (!user?.id) {
        alert("Musisz być zalogowany, aby złożyć zamówienie.");
        return;
      }

      try {
        for (const item of [...this.cartItems]) {
          const res = await fetch(`/api/drugs/${item.id}`);
          const drug = await res.json();

          if (item.quantity > drug.amount) {
            alert(
              `Brak wystarczającej ilości leku: ${drug.name}. Dostępne: ${drug.amount}`
            );
            return;
          }

          await this.orderDrug({ id: item.id, amount: item.quantity });
          this.REMOVE_FROM_CART(item.id);
        }

        alert("Zamówienie zostało złożone i ilości leków zostały zaktualizowane.");
      } catch (err) {
        alert("Wystąpił błąd przy składaniu zamówienia.");
        console.error(err);
      }
    },
  },
};
</script>
