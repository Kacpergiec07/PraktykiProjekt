import drugService from "../../services/drug.service";

export default {
  namespaced: true,
  state: {
    drugs: [],
    currentDrug: null,
    totalPages: 0,
    currentPage: 0,
  },
  getters: {
    allDrugs: (state) => state.drugs,
    currentDrug: (state) => state.currentDrug,
    totalPages: (state) => state.totalPages,
    currentPage: (state) => state.currentPage,
  },
  mutations: {
    SET_DRUGS(state, drugs) {
      state.drugs = drugs;
    },
    SET_CURRENT_DRUG(state, drug) {
      state.currentDrug = drug;
    },
    SET_PAGINATION(state, { totalPages, currentPage }) {
      state.totalPages = totalPages;
      state.currentPage = currentPage;
    },
    UPDATE_DRUG(state, updatedDrug) {
      const index = state.drugs.findIndex(
        (drug) => drug.idDrug === updatedDrug.idDrug
      );
      if (index !== -1) {
        state.drugs.splice(index, 1, updatedDrug);
      }
      if (
        state.currentDrug &&
        state.currentDrug.idDrug === updatedDrug.idDrug
      ) {
        state.currentDrug = updatedDrug;
      }
    },
    REMOVE_DRUG(state, drugId) {
      state.drugs = state.drugs.filter((drug) => drug.idDrug !== drugId);
      if (state.currentDrug && state.currentDrug.idDrug === drugId) {
        state.currentDrug = null;
      }
    },
  },
  actions: {
    async addDrug({ commit, dispatch, state }, drugData) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await drugService.addDrug(drugData);
        if (response.data && response.data.status === "success") {
          // If there's an array of drugs, add the new drug
          if (state.drugs.length > 0) {
            commit("UPDATE_DRUG", response.data.data);
          }
        }
        return response.data;
      } catch (error) {
        dispatch(
          "setError",
          error.response?.data?.message || "Failed to add drug",
          { root: true }
        );
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },

    async fetchDrugs({ commit, dispatch }, page = 0) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await drugService.getDrugs(page);
        commit("SET_DRUGS", response.data.drugs);
        commit("SET_PAGINATION", {
          totalPages: response.data.totalPages,
          currentPage: page,
        });
        return response.data;
      } catch (error) {
        dispatch(
          "setError",
          error.response?.data?.message || "Failed to fetch drugs",
          { root: true }
        );
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },

    async fetchDrugById({ commit, dispatch }, id) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await drugService.getDrugById(id);
        commit("SET_CURRENT_DRUG", response.data);
        return response.data;
      } catch (error) {
        dispatch(
          "setError",
          error.response?.data?.message || "Failed to fetch drug details",
          { root: true }
        );
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },

    async updateDrug({ commit, dispatch, state }, { id, field, value }) {
      try {
        dispatch("setLoading", true, { root: true });
        const response = await drugService.updateDrug(id, field, value);

        // Create an updated drug object to update the state
        // This is a workaround since the API might not return the updated drug
        if (response.data && response.data.status === "success") {
          const currentDrug = state.currentDrug
            ? { ...state.currentDrug }
            : null;
          if (currentDrug && currentDrug.idDrug === id) {
            currentDrug[field] = value;
            commit("UPDATE_DRUG", currentDrug);
          }

          // Also update in the drugs list if it exists there
          const drugInList = state.drugs.find((d) => d.idDrug === id);
          if (drugInList) {
            const updatedDrug = { ...drugInList, [field]: value };
            commit("UPDATE_DRUG", updatedDrug);
          }
        }

        return response.data;
      } catch (error) {
        dispatch(
          "setError",
          error.response?.data?.message || "Failed to update drug",
          { root: true }
        );
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },

    async removeDrug({ commit, dispatch }, id) {
      try {
        dispatch("setLoading", true, { root: true });
        await drugService.removeDrug(id);
        commit("REMOVE_DRUG", id);
        return { success: true };
      } catch (error) {
        dispatch(
          "setError",
          error.response?.data?.message || "Failed to remove drug",
          { root: true }
        );
        throw error;
      } finally {
        dispatch("setLoading", false, { root: true });
      }
    },
  },
};
