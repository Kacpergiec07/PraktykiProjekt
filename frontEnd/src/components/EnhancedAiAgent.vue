<template>
  <button
    @click="toggleChat"
    class="fixed bottom-4 right-4 bg-mint text-white rounded-full p-4 shadow-lg hover:bg-lightmint transition-colors z-50 flex items-center justify-center"
  >
    <span v-if="!isOpen">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
      <span
        class="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
        v-if="unreadCount > 0"
      >
        {{ unreadCount }}
      </span>
    </span>
    <span v-else>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </span>
  </button>

  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeChat"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden"
    >
      <div
        class="bg-mint text-white px-4 py-3 rounded-t-lg flex justify-between items-center"
      >
        <h3 class="font-semibold text-lg flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Asystent Apteki
        </h3>
        <div class="flex items-center space-x-2">
          <button
            v-if="messages.length > 0"
            @click="clearChat"
            class="text-white hover:text-gray-200 transition-colors"
            title="Wyczyść rozmowę"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
          <button
            @click="closeChat"
            class="text-white hover:text-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="[
            'p-3 rounded-lg max-w-[85%]',
            message.role === 'user'
              ? 'bg-blue-100 ml-auto'
              : message.role === 'system'
              ? 'bg-yellow-100'
              : 'bg-white border border-gray-200 shadow-sm',
          ]"
        >
          <div
            class="prose prose-sm"
            v-html="formatMessage(message.content)"
          ></div>

          <div
            v-if="message.toolResult"
            class="mt-2 p-2 bg-gray-100 rounded text-xs"
          >
            <div v-if="message.toolResult.type === 'drug'">
              <p class="font-semibold">{{ message.toolResult.data.name }}</p>
              <p>
                {{ message.toolResult.data.companyName }} |
                {{ message.toolResult.data.price.toFixed(2) }} zł
              </p>
            </div>
            <div v-else-if="message.toolResult.type === 'order'">
              <p class="font-semibold">
                Zamówienie #{{ message.toolResult.data.id.substring(0, 8) }}
              </p>
              <p>
                Status: {{ translateStatus(message.toolResult.data.status) }}
              </p>
            </div>
          </div>

          <div class="text-xs text-gray-500 mt-1 text-right">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>

        <div
          v-if="isLoading"
          class="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div class="flex space-x-1">
            <div
              class="h-2 w-2 bg-mint rounded-full animate-bounce"
              style="animation-delay: 0ms"
            ></div>
            <div
              class="h-2 w-2 bg-mint rounded-full animate-bounce"
              style="animation-delay: 150ms"
            ></div>
            <div
              class="h-2 w-2 bg-mint rounded-full animate-bounce"
              style="animation-delay: 300ms"
            ></div>
          </div>
          <div class="text-sm text-gray-500">Asystent pisze...</div>
        </div>

        <div
          v-if="error"
          class="bg-red-100 text-red-700 p-3 rounded-lg border border-red-200"
        >
          <p class="font-medium">Wystąpił błąd:</p>
          <p>{{ error }}</p>
          <button
            @click="error = null"
            class="mt-2 px-2 py-1 bg-red-200 text-red-800 rounded text-xs"
          >
            Zamknij
          </button>
        </div>
      </div>

      <div
        v-if="suggestions.length > 0 && !isLoading"
        class="px-4 py-2 border-t border-gray-200 flex overflow-x-auto space-x-2"
      >
        <button
          v-for="(suggestion, index) in suggestions"
          :key="index"
          @click="applySuggestion(suggestion)"
          class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm whitespace-nowrap hover:bg-blue-100 transition-colors"
        >
          {{ suggestion }}
        </button>
      </div>

      <div class="border-t p-4 bg-white">
        <form @submit.prevent="sendMessage" class="flex items-center">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Zapytaj o leki, zamówienia, itp..."
            class="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-mint"
            :disabled="isLoading"
            @focus="handleInputFocus"
          />
          <button
            type="submit"
            class="bg-mint text-white px-4 py-2 rounded-r-lg hover:bg-lightmint transition-colors"
            :disabled="isLoading || !newMessage.trim()"
          >
            <svg
              v-if="!isLoading"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
              />
            </svg>
            <svg
              v-else
              class="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import api from "../services/api";
import mistralAiService from "../services/mistralAi.service";
import DOMPurify from "dompurify";
import { marked } from "marked";

export default {
  name: "EnhancedAiAgent",
  setup() {
    const store = useStore();
    const isOpen = ref(false);
    const messages = ref([]);
    const newMessage = ref("");
    const isLoading = ref(false);
    const error = ref(null);
    const suggestions = ref([]);
    const messagesContainer = ref(null);
    const unreadCount = ref(0);
    const userHasInteracted = ref(false);
    const inactivityTimer = ref(null);

    const defaultSuggestions = [
      "Jakie leki są dostępne?",
      "Jak złożyć zamówienie?",
      "Sprawdź status mojego zamówienia",
      "Jaki lek jest dobry na ból głowy?",
      "Jaka jest cena Paracetamolu?",
    ];

    const refreshSuggestions = () => {
      if (messages.value.length > 1) {
        suggestions.value = getContextualSuggestions();
      } else {
        suggestions.value = defaultSuggestions;
      }
    };

    const getContextualSuggestions = () => {
      const history = messages.value;

      if (
        history.some(
          (msg) =>
            msg.content.toLowerCase().includes("lek") ||
            msg.content.toLowerCase().includes("leki")
        )
      ) {
        return [
          "Pokaż szczegóły leku",
          "Jak zamówić ten lek?",
          "Czy są tańsze odpowiedniki?",
          "Jakie są skutki uboczne?",
        ];
      }

      if (
        history.some(
          (msg) =>
            msg.content.toLowerCase().includes("zamówienie") ||
            msg.content.toLowerCase().includes("zamówić")
        )
      ) {
        return [
          "Sprawdź status zamówienia",
          "Kiedy otrzymam moje zamówienie?",
          "Chcę anulować zamówienie",
          "Historia moich zamówień",
        ];
      }

      return [
        "Powiedz mi więcej o waszej aptece",
        "Jak mogę skontaktować się z farmaceutą?",
        "Masz jeszcze jakieś pytania?",
        "Dziękuję za pomoc",
      ];
    };

    const applySuggestion = (suggestion) => {
      newMessage.value = suggestion;

      setTimeout(() => {
        document.querySelector('input[type="text"]').focus();
      }, 100);
    };

    const formatMessage = (content) => {
      if (!content) return "";

      const html = marked(content);
      return DOMPurify.sanitize(html);
    };

    const formatTime = (timestamp) => {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return date.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const translateStatus = (status) => {
      const statusMap = {
        PENDING: "Oczekujące",
        COMPLETED: "Zrealizowane",
        CANCELLED: "Anulowane",
      };
      return statusMap[status] || status;
    };

    const openChat = () => {
      isOpen.value = true;
      unreadCount.value = 0;

      if (messages.value.length === 0) {
        messages.value.push({
          role: "assistant",
          content:
            "Witaj! Jestem asystentem API Apteki. W czym mogę Ci dzisiaj pomóc?",
          timestamp: new Date(),
        });

        refreshSuggestions();
      }

      setTimeout(() => {
        const inputField = document.querySelector('input[type="text"]');
        if (inputField) inputField.focus();
      }, 300);
    };

    const closeChat = () => {
      isOpen.value = false;
    };

    const toggleChat = () => {
      if (isOpen.value) {
        closeChat();
      } else {
        openChat();
      }
    };

    const clearChat = () => {
      if (confirm("Czy na pewno chcesz wyczyścić historię czatu?")) {
        messages.value = [];

        messages.value.push({
          role: "assistant",
          content:
            "Witaj! Jestem asystentem API Apteki. W czym mogę Ci dzisiaj pomóc?",
          timestamp: new Date(),
        });

        refreshSuggestions();
      }
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;

      userHasInteracted.value = true;

      if (inactivityTimer.value) {
        clearTimeout(inactivityTimer.value);
      }

      const userMessage = {
        role: "user",
        content: newMessage.value,
        timestamp: new Date(),
      };

      messages.value.push(userMessage);

      const userInput = newMessage.value;
      newMessage.value = "";
      isLoading.value = true;
      error.value = null;

      await scrollToBottom();

      try {
        const token = localStorage.getItem("token");
        const isAuthenticated = !!token;

        if (
          !isAuthenticated &&
          userInput.toLowerCase().includes("zamówienie")
        ) {
          messages.value.push({
            role: "assistant",
            content:
              "Aby móc korzystać z funkcji związanych z zamówieniami, musisz być zalogowany. Czy chcesz przejść do strony logowania?",
            timestamp: new Date(),
          });

          suggestions.value = [
            "Tak, przejdź do logowania",
            "Nie, zostań tutaj",
          ];
          isLoading.value = false;
          await scrollToBottom();
          return;
        }

        const response = await mistralAiService.sendChatCompletion(
          messages.value.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }))
        );

        const shouldUseTool = detectToolNeed(userInput, response.content);

        if (shouldUseTool) {
          const toolResponse = await executeRelevantTool(
            userInput,
            response.content
          );

          messages.value.push({
            role: "assistant",
            content: toolResponse.interpretation.content,
            toolResult: {
              type: toolResponse.toolType,
              data: toolResponse.toolResult,
            },
            timestamp: new Date(),
          });
        } else {
          messages.value.push({
            role: "assistant",
            content: response.content,
            timestamp: new Date(),
          });
        }

        refreshSuggestions();

        inactivityTimer.value = setTimeout(() => {
          if (isOpen.value && userHasInteracted.value) {
            messages.value.push({
              role: "assistant",
              content: "Czy mogę jeszcze jakoś pomóc?",
              timestamp: new Date(),
            });
            unreadCount.value += 1;
          }
        }, 3 * 60 * 1000);
      } catch (err) {
        console.error("Error sending message to AI:", err);
        error.value =
          "Wystąpił błąd podczas komunikacji z asystentem. Spróbuj ponownie.";
      } finally {
        isLoading.value = false;
        await scrollToBottom();
      }
    };

    const detectToolNeed = (userInput, aiResponse) => {
      const userLower = userInput.toLowerCase();
      const aiLower = aiResponse.toLowerCase();

      if (
        (userLower.includes("lek") ||
          userLower.includes("leki") ||
          userLower.includes("medykament")) &&
        !userLower.includes("zamówienie") &&
        !userLower.includes("historia")
      ) {
        return true;
      }

      if (
        userLower.includes("zamówienie") ||
        userLower.includes("zamówić") ||
        userLower.includes("historia zamówień")
      ) {
        return true;
      }

      if (
        aiLower.includes("nie mam informacji") ||
        aiLower.includes("nie posiadam danych") ||
        aiLower.includes("nie mam dostępu do bazy danych")
      ) {
        return true;
      }

      return false;
    };

    const executeRelevantTool = async (userInput, aiResponse) => {
      const userLower = userInput.toLowerCase();

      try {
        const token = localStorage.getItem("token");

        if (
          userLower.includes("lek") ||
          userLower.includes("leki") ||
          userLower.includes("medykament")
        ) {
          const drugNameMatch = userInput.match(
            /lek(?:i|u|ów)?\s+(?:na\s+)?(.+?)(?:\?|\.|\s+jest|\s+są|$)/i
          );
          const drugName = drugNameMatch ? drugNameMatch[1].trim() : "";

          const response = await api.get("/drugs", {
            params: {
              name: drugName || undefined,
              limit: 5,
            },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (
            response.data.status === "success" &&
            response.data.data.length > 0
          ) {
            const firstDrug = response.data.data[0];

            const interpretation = await mistralAiService.sendChatCompletion([
              {
                role: "system",
                content: `You are a helpful pharmacy assistant. A user asked about: "${userInput}". Interpret the following drug information and provide a helpful response in Polish: ${JSON.stringify(
                  firstDrug
                )}`,
              },
              { role: "user", content: userInput },
            ]);

            return {
              toolType: "drug",
              toolResult: firstDrug,
              interpretation,
            };
          }
        }

        if (
          userLower.includes("zamówienie") ||
          userLower.includes("zamówić") ||
          userLower.includes("historia")
        ) {
          if (!token) {
            return {
              toolType: "auth",
              toolResult: { needsAuth: true },
              interpretation: {
                content:
                  "Aby zobaczyć informacje o zamówieniach, musisz być zalogowany. Czy chcesz przejść do strony logowania?",
              },
            };
          }

          const response = await api.get("/orders", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (
            response.data.status === "success" &&
            response.data.data.length > 0
          ) {
            const orders = response.data.data;

            const interpretation = await mistralAiService.sendChatCompletion([
              {
                role: "system",
                content: `You are a helpful pharmacy assistant. A user asked about: "${userInput}". Interpret the following order information and provide a helpful response in Polish: ${JSON.stringify(
                  orders.slice(0, 3)
                )}`,
              },
              { role: "user", content: userInput },
            ]);

            return {
              toolType: "order",
              toolResult: orders[0],
              interpretation,
            };
          } else {
            return {
              toolType: "order",
              toolResult: { empty: true },
              interpretation: {
                content:
                  "Nie znalazłem żadnych zamówień w Twojej historii. Czy chciałbyś złożyć nowe zamówienie?",
              },
            };
          }
        }

        return {
          toolType: "none",
          toolResult: null,
          interpretation: { content: aiResponse },
        };
      } catch (error) {
        console.error("Error executing tool:", error);
        return {
          toolType: "error",
          toolResult: { error: error.message },
          interpretation: {
            content:
              "Przepraszam, wystąpił problem z dostępem do danych. Proszę spróbować ponownie za chwilę.",
          },
        };
      }
    };

    const handleInputFocus = () => {
      unreadCount.value = 0;
    };

    const scrollToBottom = async () => {
      await nextTick();
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      }
    };

    watch(messages, async () => {
      await scrollToBottom();
    });

    watch(isOpen, (newVal) => {
      if (newVal === true) {
        unreadCount.value = 0;
      }
    });

    onBeforeUnmount(() => {
      localStorage.setItem("aiChatMessages", JSON.stringify(messages.value));
      if (inactivityTimer.value) {
        clearTimeout(inactivityTimer.value);
      }
    });

    onMounted(() => {
      const savedMessages = localStorage.getItem("aiChatMessages");
      if (savedMessages) {
        try {
          messages.value = JSON.parse(savedMessages);
        } catch (e) {
          console.error("Failed to parse saved messages", e);
        }
      }

      refreshSuggestions();

      setTimeout(() => {
        if (!isOpen.value && messages.value.length === 0) {
          unreadCount.value = 1;
        }
      }, 10000);
    });

    return {
      isOpen,
      messages,
      newMessage,
      isLoading,
      error,
      suggestions,
      unreadCount,
      messagesContainer,
      openChat,
      closeChat,
      toggleChat,
      sendMessage,
      formatMessage,
      formatTime,
      translateStatus,
      applySuggestion,
      clearChat,
      handleInputFocus,
      scrollToBottom,
    };
  },
};
</script>

<style scoped>
.prose h1 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.prose h2 {
  font-size: 1.15rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.prose p {
  margin-bottom: 0.5rem;
}

.prose ul,
.prose ol {
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}

.prose li {
  margin-bottom: 0.25rem;
}

.prose a {
  color: #3b82f6;
  text-decoration: underline;
}

.prose::-webkit-scrollbar {
  width: 6px;
}

.prose::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.prose::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.prose::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
