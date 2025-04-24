import mistralAiService from "../../services/mistralAi.service";

// Initial state
const initialState = {
  isEnabled: true, // Whether the AI agent is enabled
  chatHistory: [], // Chat history
  unreadCount: 0, // Number of unread messages
  settings: {
    autoSuggest: true, // Whether to show auto-suggestions
    notificationsEnabled: true, // Whether to show notifications
    voiceEnabled: false, // Whether to enable voice interactions (future feature)
    modelType: "mistral-medium", // AI model to use
  },
  availableTools: [], // Tools available to the AI
  isLoading: false, // Loading state
  error: null, // Error state
};

// Define store module
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
    // Toggle AI agent on/off
    toggleAiAgent({ commit, state }) {
      commit("SET_ENABLED", !state.isEnabled);
    },

    // Add a message to chat history
    addMessage({ commit, state }, message) {
      commit("ADD_MESSAGE", {
        ...message,
        timestamp: new Date(),
      });

      // If message is from assistant and the user might not have seen it
      if (message.role === "assistant" && !state.isActive) {
        commit("INCREMENT_UNREAD");
      }
    },

    // Load chat history from localStorage
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

    // Save chat history to localStorage
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

    // Clear chat history
    clearChatHistory({ commit }) {
      commit("CLEAR_CHAT_HISTORY");
      localStorage.removeItem("aiChatHistory");
    },

    // Mark messages as read
    markAsRead({ commit }) {
      commit("RESET_UNREAD");
    },

    // Update AI agent settings
    updateSettings({ commit }, settings) {
      commit("UPDATE_SETTINGS", settings);
    },

    // Fetch available tools from backend
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

    // Send a message to the AI
    async sendMessage({ commit, state, dispatch }, message) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");

      try {
        // Add user message to history
        const userMessage = {
          role: "user",
          content: message,
        };

        dispatch("addMessage", userMessage);

        // Prepare message history for API
        const messageHistory = state.chatHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Send to Mistral AI
        const response = await mistralAiService.sendChatCompletion(
          messageHistory
        );

        // Add AI response to history
        dispatch("addMessage", {
          role: "assistant",
          content: response.content,
        });

        // Save updated history
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

    // Execute a tool
    async executeTool(
      { commit, state, dispatch },
      { toolName, parameters, messageContext }
    ) {
      commit("SET_LOADING", true);
      commit("CLEAR_ERROR");

      try {
        // Prepare message context if not provided
        const context =
          messageContext ||
          state.chatHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

        // Execute the tool
        const result = await mistralAiService.executeTool(
          toolName,
          parameters,
          context
        );

        // Add result to chat history
        if (result.interpretation) {
          dispatch("addMessage", {
            role: "assistant",
            content: result.interpretation.content,
            toolResult: {
              name: toolName,
              data: result.toolResult,
            },
          });

          // Save updated history
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
