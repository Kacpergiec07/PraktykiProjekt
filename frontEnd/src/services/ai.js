import mistralAiService from "../../services/mistralAi.service";

const initialState = {
  isEnabled: true,
  chatHistory: [],
  unreadCount: 0,
  settings: {
    autoSuggest: true,
    notificationsEnabled: true,
    voiceEnabled: false,
    modelType: "mistral-medium",
  },
  availableTools: [],
  isLoading: false,
  error: null,
};

export default {
  namespaced: true,
  state: { ...initialState },

  getters: {
    isEnabled: (state) => state.isEnabled,
    getChatHistory: (state) => state.chatHistory,
    getUnreadCount: (state) => state.unreadCount,
    getSettings: (state) => state.settings,
    getAvailableTools: (state) => state.availableTools,
    isLoading: (state) => state.isLoading,
    getError: (state) => state.error,
  },

  mutations: {
    SET_ENABLED(state, enabled) {
      state.isEnabled = enabled;
    },
    ADD_MESSAGE(state, message) {
      state.chatHistory.push(message);
    },
    SET_CHAT_HISTORY(state, history) {
      state.chatHistory = history;
    },
    CLEAR_CHAT_HISTORY(state) {
      state.chatHistory = [];
    },
    INCREMENT_UNREAD(state) {
      state.unreadCount += 1;
    },
    RESET_UNREAD(state) {
      state.unreadCount = 0;
    },
    UPDATE_SETTINGS(state, settings) {
      state.settings = { ...state.settings, ...settings };
    },
    SET_AVAILABLE_TOOLS(state, tools) {
      state.availableTools = tools;
    },
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
  },

  actions: {
    toggleAiAgent({ commit, state }) {
      commit("SET_ENABLED", !state.isEnabled);
    },

    addMessage({ commit, state }, message) {
      commit("ADD_MESSAGE", {
        ...message,
        timestamp: new Date(),
      });

      if (message.role === "assistant" && !state.isActive) {
        commit("INCREMENT_UNREAD");
      }
    },

    loadChatHistory({ commit }) {
      try {
        const savedHistory = localStorage.getItem("aiChatHistory");
        if (savedHistory) {
          commit("SET_CHAT_HISTORY", JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    },

    saveChatHistory({ state }) {
      try {
        localStorage.setItem(
          "aiChatHistory",
          JSON.stringify(state.chatHistory)
        );
      } catch (error) {
        console.error("Failed to save chat history:", error);
      }
    },

    clearChatHistory({ commit }) {
      commit("CLEAR_CHAT_HISTORY");
      localStorage.removeItem("aiChatHistory");
    },

    markAsRead({ commit }) {
      commit("RESET_UNREAD");
    },

    updateSettings({ commit }, settings) {
      commit("UPDATE_SETTINGS", settings);
    },

    async fetchAvailableTools({ commit }) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");

      try {
        const tools = await mistralAiService.getAvailableTools();
        commit("SET_AVAILABLE_TOOLS", tools);
      } catch (error) {
        commit("SET_ERROR", error.message || "Failed to fetch available tools");
        console.error("Error fetching tools:", error);
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async sendMessage({ commit, state, dispatch }, message) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");

      try {
        const userMessage = {
          role: "user",
          content: message,
        };

        dispatch("addMessage", userMessage);

        const messageHistory = state.chatHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await mistralAiService.sendChatCompletion(
          messageHistory
        );

        dispatch("addMessage", {
          role: "assistant",
          content: response.content,
        });

        dispatch("saveChatHistory");

        return response;
      } catch (error) {
        commit("SET_ERROR", error.message || "Failed to send message");
        console.error("Error sending message:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async executeTool(
      { commit, state, dispatch },
      { toolName, parameters, messageContext }
    ) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");

      try {
        const context =
          messageContext ||
          state.chatHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

        const result = await mistralAiService.executeTool(
          toolName,
          parameters,
          context
        );

        if (result.interpretation) {
          dispatch("addMessage", {
            role: "assistant",
            content: result.interpretation.content,
            toolResult: {
              name: toolName,
              data: result.toolResult,
            },
          });

          dispatch("saveChatHistory");
        }

        return result;
      } catch (error) {
        commit(
          "SET_ERROR",
          error.message || `Failed to execute tool: ${toolName}`
        );
        console.error("Error executing tool:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
};
