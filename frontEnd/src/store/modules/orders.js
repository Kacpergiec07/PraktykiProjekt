import orderService from "../../services/order.service";

export default {
  namespaced: true,
  state: {
    orders: [],
    reports: [],
    totalPages: 0,
    currentPage: 0,
    orderDetails: null,
  },
  getters: {
    userOrders: (state) => state.orders,
    allReports: (state) => state.reports,
    totalPages: (state) => state.totalPages,
    currentPage: (state) => state.currentPage,
    orderDetails: (state) => state.orderDetails,
  },
  mutations: {
    SET_ORDERS(state, orders) {
      state.orders = orders;
    },
    SET_REPORTS(state, reports) {
      state.reports = reports;
    },
    SET_PAGINATION(state, { totalPages, currentPage }) {
      state.totalPages = totalPages;
      state.currentPage = currentPage;
    },
    ADD_ORDER(state, order) {
      state.orders.unshift(order);
    },
    SET_ORDER_DETAILS(state, order) {
      state.orderDetails = order;
    },
  },
  actions: {
    async fetchOrderHistory(
      { commit, dispatch },
      {
        page = 0,
        limit = 15,
        filter = [],
        descending = true,
        orderBy = "createdAt",
      }
    ) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await orderService.getOrderHistory(
          page,
          limit,
          filter,
          descending,
          orderBy
        );
        commit("SET_ORDERS", response.data.orders);
        commit("SET_PAGINATION", {
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
        });
        return response.data;
      } catch (error) {
        dispatch(
          "setError",
          error.response?.data?.message || "Failed to fetch order history",
          { root: true }
        );
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },

    async fetchOrderReports(
      { commit, dispatch },
      {
        page = 0,
        limit = 15,
        filter = [],
        descending = true,
        orderBy = "createdAt",
      }
    ) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await orderService.getOrderReports(
          page,
          limit,
          filter,
          descending,
          orderBy
        );
        commit("SET_REPORTS", response.data.orders);
        commit("SET_PAGINATION", {
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage,
        });
        return response.data;
      } catch (error) {
        dispatch(
          "setError",
          error.response?.data?.message || "Failed to fetch order reports",
          { root: true }
        );
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },

    async orderDrug({ commit, dispatch }, { id, amount }) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await orderService.orderDrug(id, amount);

        if (response.data && response.data.status === "success") {
          const orderData = response.data.data;

          const orderItems = orderData.orderItems || [];
          if (orderItems.length > 0) {
            const item = orderItems[0];
            const newOrder = {
              id: `${orderData.id}_${item.id}`,
              orderId: orderData.id,
              name: item.drug ? item.drug.name : "Unknown Drug",
              companyName: item.drug ? item.drug.companyName : "",
              amount: item.quantity,
              date: orderData.orderDate || orderData.createdAt,
              status: orderData.status,
            };

            commit("ADD_ORDER", newOrder);
          } else {
            const newOrder = {
              id: orderData.id,
              orderId: orderData.id,
              name: "Ordered medication",
              amount: amount,
              date: orderData.orderDate || orderData.createdAt,
              status: orderData.status,
            };

            commit("ADD_ORDER", newOrder);
          }
        } else {
          const newOrder = {
            id: Date.now(),
            name: "Ordered medication",
            amount: amount,
            date: new Date().toISOString(),
          };

          commit("ADD_ORDER", newOrder);
        }

        dispatch("drugs/fetchDrugById", id, { root: true });
        return response.data;
      } catch (error) {
        dispatch(
          "setError",
          error.response?.data?.message || "Failed to order drug",
          { root: true }
        );
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },

    async fetchOrderById({ commit, dispatch }, id) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await orderService.getOrderById(id);

        if (response.data && response.data.status === "success") {
          commit("SET_ORDER_DETAILS", response.data.data);
        }

        return response.data;
      } catch (error) {
        dispatch(
          "setError",
          error.response?.data?.message || "Failed to fetch order details",
          { root: true }
        );
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },

    async cancelOrder({ commit, dispatch }, id) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await orderService.cancelOrder(id);

        dispatch("fetchOrderHistory", {
          page: 0,
          descending: true,
          orderBy: "createdAt",
        });

        return response.data;
      } catch (error) {
        dispatch(
          "setError",
          error.response?.data?.message || "Failed to cancel order",
          { root: true }
        );
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },

    async updateOrderStatus({ commit, dispatch }, { id, status }) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await orderService.updateOrderStatus(id, status);

        dispatch("fetchOrderReports", {
          page: 0,
          descending: true,
          orderBy: "createdAt",
        });

        return response.data;
      } catch (error) {
        dispatch(
          "setError",
          error.response?.data?.message || "Failed to update order status",
          { root: true }
        );
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },

    async getRevenueStats({ dispatch }, { fromDate, toDate }) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await orderService.getRevenueStats(fromDate, toDate);
        return response.data;
      } catch (error) {
        dispatch(
          "setError",
          error.response?.data?.message || "Failed to fetch revenue statistics",
          { root: true }
        );
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },
  },
};
