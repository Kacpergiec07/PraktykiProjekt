<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Zarządzanie statusami zamówień</h2>

    <div class="mb-6 p-4 bg-gray-50 rounded border">
      <h3 class="text-lg font-semibold mb-3">Filtry zamówień</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block mb-1">Status zamówienia</label>
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border rounded"
          >
            <option value="">Wszystkie statusy</option>
            <option value="PENDING">Oczekujące</option>
            <option value="COMPLETED">Zrealizowane</option>
            <option value="CANCELLED">Anulowane</option>
          </select>
        </div>

        <div>
          <label class="block mb-1">Sortuj wg</label>
          <select v-model="sortBy" class="w-full px-3 py-2 border rounded">
            <option value="orderDate">Data zamówienia</option>
            <option value="status">Status</option>
            <option value="createdAt">Data utworzenia</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          @click="fetchOrders"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? "Ładowanie..." : "Zastosuj filtry" }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center p-8">
      <div
        class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
      ></div>
    </div>

    <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>

    <div v-else-if="orders.length === 0" class="text-center p-8">
      <p class="text-gray-500">Brak zamówień do wyświetlenia</p>
    </div>

    <div v-else>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-3 text-left border">ID zamówienia</th>
              <th class="p-3 text-left border">Użytkownik</th>
              <th class="p-3 text-left border">Data zamówienia</th>
              <th class="p-3 text-left border">Status</th>
              <th class="p-3 text-left border">Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in orders"
              :key="order.id"
              class="hover:bg-gray-50"
            >
              <td class="p-3 border">{{ order.id }}</td>
              <td class="p-3 border">
                {{ order.user?.firstName }} {{ order.user?.lastName }}
              </td>
              <td class="p-3 border">
                {{ formatDate(order.orderDate || order.createdAt) }}
              </td>
              <td class="p-3 border">
                <span
                  class="px-2 py-1 rounded text-xs font-semibold"
                  :class="{
                    'bg-yellow-100 text-yellow-800': order.status === 'PENDING',
                    'bg-green-100 text-green-800': order.status === 'COMPLETED',
                    'bg-red-100 text-red-800': order.status === 'CANCELLED',
                  }"
                >
                  {{ translateStatus(order.status) }}
                </span>
              </td>
              <td class="p-3 border">
                <div class="flex space-x-2">
                  <button
                    v-if="order.status === 'PENDING'"
                    @click="openStatusModal(order)"
                    class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Zmień status
                  </button>
                  <button
                    @click="viewOrderDetails(order.id)"
                    class="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Szczegóły
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center mt-6">
        <div class="flex space-x-1">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="changePage(page)"
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
    </div>

    <div
      v-if="detailsModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-bold">Szczegóły zamówienia</h3>
          <button
            @click="detailsModal = false"
            class="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        <div v-if="selectedOrder">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p>
                <span class="font-semibold">ID zamówienia:</span>
                {{ selectedOrder.id }}
              </p>
              <p>
                <span class="font-semibold">Data zamówienia:</span>
                {{
                  formatDate(selectedOrder.orderDate || selectedOrder.createdAt)
                }}
              </p>
              <p>
                <span class="font-semibold">Status:</span>
                <span
                  class="px-2 py-1 rounded text-xs font-semibold"
                  :class="{
                    'bg-yellow-100 text-yellow-800':
                      selectedOrder.status === 'PENDING',
                    'bg-green-100 text-green-800':
                      selectedOrder.status === 'COMPLETED',
                    'bg-red-100 text-red-800':
                      selectedOrder.status === 'CANCELLED',
                  }"
                >
                  {{ translateStatus(selectedOrder.status) }}
                </span>
              </p>
            </div>
            <div>
              <p>
                <span class="font-semibold">Użytkownik:</span>
                {{ selectedOrder.user?.firstName }}
                {{ selectedOrder.user?.lastName }}
              </p>
              <p>
                <span class="font-semibold">Email:</span>
                {{ selectedOrder.user?.email }}
              </p>
            </div>
          </div>

          <h4 class="text-lg font-semibold mb-2">Zamówione produkty</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-100">
                  <th class="p-3 text-left border">Produkt</th>
                  <th class="p-3 text-left border">Producent</th>
                  <th class="p-3 text-left border">Ilość</th>
                  <th class="p-3 text-left border">Cena</th>
                  <th class="p-3 text-left border">Wartość</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in selectedOrder.orderItems"
                  :key="item.id"
                  class="hover:bg-gray-50"
                >
                  <td class="p-3 border">{{ item.drug?.name }}</td>
                  <td class="p-3 border">{{ item.drug?.companyName }}</td>
                  <td class="p-3 border">{{ item.quantity }}</td>
                  <td class="p-3 border">{{ formatCurrency(item.price) }}</td>
                  <td class="p-3 border">
                    {{ formatCurrency(item.price * item.quantity) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-gray-100">
                  <td colspan="4" class="p-3 border text-right font-semibold">
                    Suma:
                  </td>
                  <td class="p-3 border font-semibold">
                    {{ formatCurrency(calculateTotal()) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="statusModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Zmień status zamówienia</h3>

        <p class="mb-4">
          Zmiana statusu dla zamówienia:
          <strong>{{ selectedOrder?.id }}</strong>
        </p>

        <div class="mb-4">
          <label class="block mb-1">Nowy status</label>
          <select v-model="newStatus" class="w-full px-3 py-2 border rounded">
            <option value="PENDING">Oczekujące</option>
            <option value="COMPLETED">Zrealizowane</option>
            <option value="CANCELLED">Anulowane</option>
          </select>
        </div>

        <div class="mt-6 flex justify-end space-x-2">
          <button
            type="button"
            @click="statusModal = false"
            class="px-4 py-2 border rounded"
          >
            Anuluj
          </button>
          <button
            @click="updateOrderStatus"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            :disabled="actionLoading"
          >
            {{ actionLoading ? "Aktualizowanie..." : "Zapisz zmiany" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import orderService from "../services/order.service";
import notification from "../utils/notification";

export default {
  name: "OrderStatusManager",
  data() {
    return {
      orders: [],
      statusFilter: "",
      sortBy: "orderDate",
      descending: true,
      currentPage: 0,
      totalPages: 1,
      loading: false,
      error: null,

      detailsModal: false,
      statusModal: false,
      selectedOrder: null,
      newStatus: "",
      actionLoading: false,
    };
  },
  methods: {
    ...mapActions(["setLoading", "setError", "clearError"]),

    async fetchOrders(page = 0) {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page,
          limit: 10,
          sortBy: this.sortBy,
          sortOrder: this.descending ? "desc" : "asc",
        };

        if (this.statusFilter) {
          params.status = this.statusFilter;
        }

        const response = await orderService.getOrderReports(
          params.page,
          params.limit,
          this.statusFilter ? [{ status: this.statusFilter }] : [],
          this.descending,
          this.sortBy
        );

        if (response && response.data) {
          const orderMap = new Map();

          response.data.orders.forEach((item) => {
            const orderId = item.orderId;

            if (!orderMap.has(orderId)) {
              orderMap.set(orderId, {
                id: orderId,
                status: item.status,
                orderDate: item.date,
                user: {
                  firstName: item.userName,
                  lastName: item.userSurname,
                  email: item.userEmail,
                },
                orderItems: [],
              });
            }

            const order = orderMap.get(orderId);
            order.orderItems.push({
              id: item.id.split("_")[1],
              drugId: item.drugId || "",
              quantity: item.amount,
              price: item.price || 0,
              drug: {
                name: item.name,
                companyName: item.companyName,
              },
            });
          });

          this.orders = Array.from(orderMap.values());
          this.totalPages = response.data.totalPages;
          this.currentPage = page;
        } else {
          throw new Error("Failed to fetch orders");
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch orders";
        notification.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async updateOrderStatus() {
      if (!this.selectedOrder || !this.newStatus) return;

      this.actionLoading = true;

      try {
        await orderService.updateOrderStatus(
          this.selectedOrder.id,
          this.newStatus
        );

        const order = this.orders.find((o) => o.id === this.selectedOrder.id);
        if (order) {
          order.status = this.newStatus;
        }

        this.statusModal = false;

        notification.success(
          `Status zamówienia został zmieniony na "${this.translateStatus(
            this.newStatus
          )}"`
        );
      } catch (error) {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to update order status";
        notification.error(errorMsg);
      } finally {
        this.actionLoading = false;
      }
    },

    openStatusModal(order) {
      this.selectedOrder = order;
      this.newStatus = order.status;
      this.statusModal = true;
    },

    viewOrderDetails(orderId) {
      this.selectedOrder = this.orders.find((o) => o.id === orderId);
      this.detailsModal = true;
    },

    changePage(page) {
      this.fetchOrders(page - 1); // API page is 0-based, UI is 1-based
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

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

    formatCurrency(value) {
      return new Intl.NumberFormat("pl-PL", {
        style: "currency",
        currency: "PLN",
      }).format(value);
    },

    translateStatus(status) {
      const statusMap = {
        PENDING: "Oczekujące",
        COMPLETED: "Zrealizowane",
        CANCELLED: "Anulowane",
      };

      return statusMap[status] || status;
    },

    calculateTotal() {
      if (!this.selectedOrder || !this.selectedOrder.orderItems) return 0;

      return this.selectedOrder.orderItems.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
    },
  },
  created() {
    this.fetchOrders();
  },
};
</script>
