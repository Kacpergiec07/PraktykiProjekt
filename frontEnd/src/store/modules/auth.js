import authService from "../../services/auth.service";

const initialState = {
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
};

export default {
  namespaced: true,
  state: { ...initialState },
  getters: {
    isAuthenticated: (state) => !!state.token,
    getCurrentUser: (state) => state.user,
    userPermission: (state) => (state.user ? state.user.permission : 0),
  },
  mutations: {
    SET_AUTH(state, { token, user }) {
      state.token = token;
      state.user = user;
      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    CLEAR_AUTH(state) {
      state.token = null;
      state.user = null;
      // Remove from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    SET_USER(state, user) {
      state.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
  },
  actions: {
    // Register a new user
    async register({ commit, dispatch }, userData) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await authService.register(userData);
        commit("SET_AUTH", {
          token: response.data.token,
          user: response.data.user,
        });
        return response;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Registration failed";
        dispatch("setError", errorMessage, { root: true });
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },

    // Login a user
    async login({ commit, dispatch }, credentials) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await authService.login(credentials);
        commit("SET_AUTH", {
          token: response.data.token,
          user: response.data.user,
        });
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Login failed";
        dispatch("setError", errorMessage, { root: true });
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },

    // Logout a user
    logout({ commit }) {
      commit("CLEAR_AUTH");
    },

    // Check if the user is authenticated
    async checkAuth({ commit, dispatch, state }) {
      if (!state.token) return;

      try {
        dispatch("setLoading", true, { root: true });
        const response = await authService.getUserInfo();

        // Add permission property if not present
        // This is a workaround since the API doesn't return permission in the /me endpoint
        const userData = {
          ...response.data,
          permission: state.user ? state.user.permission : 0,
        };

        commit("SET_USER", userData);
      } catch (error) {
        // Token might be invalid or expired
        commit("CLEAR_AUTH");
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },
  },
};
