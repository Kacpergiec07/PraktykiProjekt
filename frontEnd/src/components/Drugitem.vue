<template>
  <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
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

    <div class="mt-4 flex space-x-2 justify-end">
      <router-link
        :to="`/drugs/${drug.idDrug}`"
        class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
      >
        Szczegóły
      </router-link>

      <button
        v-if="drug.amount > 0 && isAuthenticated"
        @click="$emit('order')"
        class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
      >
        Zamów
      </button>

      <template v-if="isAdmin">
        <button
          @click="$emit('edit')"
          class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
        >
          Edytuj
        </button>

        <button
          @click="$emit('remove')"
          class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Usuń
        </button>
      </template>
    </div>
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
  computed: {
    ...mapGetters("auth", ["isAuthenticated", "getCurrentUser"]),
    isAdmin() {
      const user = this.getCurrentUser;
      return user && user.permission >= 2; // Pharmacist or admin
    },
  },
};
</script>
