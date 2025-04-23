import { createStore } from "vuex";
import auth from "./modules/auth";
import drugs from "./modules/drugs";
import orders from "./modules/orders";
import ai from "./modules/ai"; // Add the AI module

export default createStore({
  state: {
    loading: false,
    error: null,
  },
  getters: {
    isLoading: (state) => state.loading,
    error: (state) => state.error,
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
  },
  actions: {
    setLoading({ commit }, loading) {
      commit("SET_LOADING", loading);
    },
    setError({ commit }, error) {
      commit("SET_ERROR", error);
    },
    clearError({ commit }) {
      commit("CLEAR_ERROR");
    },
  },
  modules: {
    auth,
    drugs,
    orders,
    ai, // Add the AI module to the store
  },
});
