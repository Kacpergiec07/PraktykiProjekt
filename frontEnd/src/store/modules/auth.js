import authService from "../../services/auth.service";

const initialState = {
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
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
    SET_AUTH(state, { token, refreshToken, user }) {
      state.token = token;
      state.refreshToken = refreshToken;
      state.user = user;

      localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    },
    CLEAR_AUTH(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
    SET_USER(state, user) {
      state.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
  },
  actions: {
    async register({ commit, dispatch }, userData) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await authService.register(userData);
        commit("SET_AUTH", {
          token: response.data.token,
          refreshToken: response.data.refreshToken,
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

    async login({ commit, dispatch }, credentials) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await authService.login(credentials);
        commit("SET_AUTH", {
          token: response.data.token,
          refreshToken: response.data.refreshToken,
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

    async logout({ commit, dispatch }) {
      try {
        await authService.logout();
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        commit("CLEAR_AUTH");
      }
    },

    async refreshToken({ commit, dispatch, state }) {
      if (!state.refreshToken) return;

      try {
        dispatch("setLoading", true, { root: true });
        const response = await authService.refreshToken();

        if (response.data.token) {
          commit("SET_AUTH", {
            token: response.data.token,
            refreshToken: state.refreshToken,
            user: state.user,
          });
        }

        return response;
      } catch (error) {
        commit("CLEAR_AUTH");
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },

    async checkAuth({ commit, dispatch, state }) {
      if (!state.token) return;

      try {
        dispatch("setLoading", true, { root: true });
        const response = await authService.getUserInfo();

        if (response.data) {
          commit("SET_USER", response.data);
        }
      } catch (error) {
        try {
          await dispatch("refreshToken");
        } catch (refreshError) {
          commit("CLEAR_AUTH");
        }
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },
  },
};
