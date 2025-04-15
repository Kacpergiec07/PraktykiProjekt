import orderService from "../../services/order.service";

export default {
  namespaced: true,
  state: {
    orders: [],
    reports: [],
    totalPages: 0,
    currentPage: 0,
  },
  getters: {
    userOrders: (state) => state.orders,
    allReports: (state) => state.reports,
    totalPages: (state) => state.totalPages,
    currentPage: (state) => state.currentPage,
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
      state.orders.unshift(order); // Add to beginning of array
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
        orderBy = "purchase_date",
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
        orderBy = "purchase_date",
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

        // Create a new order object with available information
        const newOrder = {
          id: Date.now(), // Temporary ID until we refresh data
          name: "Ordered medication", // This will be updated when we fetch order history
          amount: amount,
          date: new Date().toISOString(),
        };

        commit("ADD_ORDER", newOrder);

        // Update the drug quantity in the drugs store
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
  },
};
