<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-bold">
        {{ isReport ? "Raport zamówień" : "Historia zamówień" }}
      </h2>

      <div class="mt-4 p-4 bg-gray-50 rounded border">
        <h3 class="text-lg font-semibold mb-3">Filtry</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block mb-1">Sortuj według</label>
            <select v-model="orderBy" class="w-full px-3 py-2 border rounded">
              <option value="orderDate">Data zamowienia</option>
              <option value="status">Status</option>
              <option value="createdAt">Data utworzenia</option>
            </select>
          </div>

          <div>
            <label class="block mb-1">Kierunek sortowania</label>
            <select
              v-model="descending"
              class="w-full px-3 py-2 border rounded"
            >
              <option :value="true">Malejąco</option>
              <option :value="false">Rosnąco</option>
            </select>
          </div>

          <div>
            <label class="block mb-1">Wyniki na stronę</label>
            <select v-model="limit" class="w-full px-3 py-2 border rounded">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="20">20</option>
            </select>
          </div>
        </div>

        <div class="mt-4">
          <div class="flex items-center space-x-2 mb-3">
            <h4 class="font-medium">Dodatkowe filtry</h4>
            <button
              @click="addFilter"
              class="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              + Dodaj filtr
            </button>
          </div>

          <div
            v-for="(filter, index) in filters"
            :key="index"
            class="flex mb-2 space-x-2"
          >
            <select
              v-model="filter.field"
              class="w-1/3 px-3 py-2 border rounded"
            >
              <option value="companyName">Producent</option>
              <option value="purchase_amount">Ilość</option>
              <option value="purchase_date">Data</option>
              <option value="drug_name">Nazwa leku</option>
            </select>

            <input
              type="text"
              v-model="filter.value"
              class="w-1/2 px-3 py-2 border rounded"
              placeholder="Wartość"
            />

            <button
              @click="removeFilter(index)"
              class="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Usuń
            </button>
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <button
            @click="applyFilters"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Zastosuj filtry
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center p-8">
      <div
        class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
      ></div>
    </div>

    <div v-else-if="orders.length === 0" class="text-center p-8">
      <p class="text-gray-500">Brak zamówień do wyświetlenia</p>
    </div>

    <div v-else>
      <div class="overflow-x-auto mb-8">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-3 text-left border">Nazwa leku</th>
              <th class="p-3 text-left border">Producent</th>
              <th class="p-3 text-left border">Ilość</th>
              <th class="p-3 text-left border">Data zamówienia</th>
              <th v-if="isReport" class="p-3 text-left border">Użytkownik</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in orders"
              :key="order.id"
              class="hover:bg-gray-50"
            >
              <td class="p-3 border">{{ order.name }}</td>
              <td class="p-3 border">{{ order.companyName }}</td>
              <td class="p-3 border">{{ order.amount }}</td>
              <td class="p-3 border">{{ formatDate(order.date) }}</td>
              <td v-if="isReport" class="p-3 border">
                {{ order.userName }} {{ order.userSurname }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center my-8">
        <div class="flex space-x-1">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="changePage(page)"
            class="px-3 py-1 rounded"
            :class="
              currentPage === page - 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            "
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OrderHistory",
  props: {
    orders: {
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
    isReport: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      orderBy: "orderDate",
      descending: true,
      limit: 15,
      filters: [],
    };
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },

    addFilter() {
      this.filters.push({ field: "companyName", value: "" });
    },

    removeFilter(index) {
      this.filters.splice(index, 1);
    },

    applyFilters() {
      const filterArray = this.filters
        .filter((f) => f.value.trim() !== "")
        .map((f) => ({ [f.field]: f.value.trim() }));

      this.$emit("filter-change", {
        page: 0,
        limit: this.limit,
        orderBy: this.orderBy,
        descending: this.descending,
        filter: filterArray,
      });
    },

    changePage(page) {
      const pageIndex = page - 1;
      const filterArray = this.filters
        .filter((f) => f.value.trim() !== "")
        .map((f) => ({ [f.field]: f.value.trim() }));

      this.$emit("filter-change", {
        page: pageIndex,
        limit: this.limit,
        orderBy: this.orderBy,
        descending: this.descending,
        filter: filterArray,
      });
    },
  },
};
</script>
