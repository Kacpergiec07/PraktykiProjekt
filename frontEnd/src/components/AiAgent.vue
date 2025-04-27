<template>
  <button
    @click="toggleChat"
    class="fixed bottom-4 right-4 bg-mint text-white p-4 rounded-full shadow-lg hover:bg-lightmint transition-colors z-50"
    aria-label="Chat z asystentem"
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
        v-if="unreadCount > 0"
        class="absolute top-0 right-0 -mr-1 -mt-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
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
    class="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
    @click.self="closeChat"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full max-w-md h-[550px] flex flex-col transition-all duration-300"
      :class="{
        'opacity-0 scale-95': !isOpen,
        'opacity-100 scale-100': isOpen,
      }"
    >
      <div
        class="bg-mint text-white px-4 py-3 rounded-t-lg flex justify-between items-center"
      >
        <h2 class="font-semibold text-lg flex items-center">
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
        </h2>
        <div class="flex items-center space-x-2">
          <button
            v-if="messages.length > 1"
            @click="clearHistory"
            class="text-white hover:text-gray-200"
            title="Wyczyść historię"
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

          <button @click="closeChat" class="text-white hover:text-gray-200">
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
            'max-w-[85%] rounded-lg p-3',
            message.role === 'user'
              ? 'bg-blue-100 ml-auto'
              : message.role === 'system'
              ? 'bg-yellow-100'
              : 'bg-white border border-gray-200 shadow-sm',
          ]"
        >
          <div v-html="formatMessage(message.content)"></div>

          <div
            v-if="message.toolResult"
            class="mt-2 p-2 bg-gray-100 rounded text-sm"
          >
            <div
              v-if="
                message.toolResult.type === 'drug' &&
                message.toolResult.data.length > 0
              "
            >
              <p class="font-medium">{{ message.toolResult.data[0].name }}</p>
              <p>Cena: {{ formatPrice(message.toolResult.data[0].price) }}</p>
            </div>
            <div
              v-else-if="
                message.toolResult.type === 'order' &&
                message.toolResult.data.length > 0
              "
            >
              <p class="font-medium">
                Zamówienie nr {{ shortId(message.toolResult.data[0].id) }}
              </p>
              <p>
                Status: {{ translateStatus(message.toolResult.data[0].status) }}
              </p>
            </div>
          </div>

          <div class="text-xs text-gray-500 mt-1 text-right">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>

        <div
          v-if="isLoading"
          class="flex items-center space-x-2 p-3 bg-white rounded-lg max-w-[85%]"
        >
          <div class="flex space-x-1">
            <div
              class="w-2 h-2 bg-mint rounded-full animate-bounce"
              style="animation-delay: 0ms"
            ></div>
            <div
              class="w-2 h-2 bg-mint rounded-full animate-bounce"
              style="animation-delay: 150ms"
            ></div>
            <div
              class="w-2 h-2 bg-mint rounded-full animate-bounce"
              style="animation-delay: 300ms"
            ></div>
          </div>
          <div class="text-sm text-gray-500">Asystent pisze...</div>
        </div>
      </div>

      <div
        v-if="suggestions.length > 0 && !isLoading"
        class="px-4 py-2 border-t border-gray-100 flex space-x-2 overflow-x-auto"
      >
        <button
          v-for="(suggestion, index) in suggestions"
          :key="index"
          @click="applySuggestion(suggestion)"
          class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm whitespace-nowrap hover:bg-blue-100"
        >
          {{ suggestion }}
        </button>
      </div>

      <div class="border-t p-4">
        <form @submit.prevent="sendMessage" class="flex">
          <input
            type="text"
            v-model="newMessage"
            placeholder="Wpisz wiadomość..."
            class="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent"
            :disabled="isLoading"
            @focus="unreadCount = 0"
          />
          <button
            type="submit"
            class="bg-mint text-white rounded-r-lg px-4 py-2 hover:bg-lightmint transition-colors"
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
import DOMPurify from "dompurify";
import { marked } from "marked";
import mistralAiService from "../services/mistralAi.service";

export default {
  name: "AiAgent",
  setup() {
    const store = useStore();
    const isOpen = ref(false);
    const messages = ref([]);
    const newMessage = ref("");
    const isLoading = ref(false);
    const messagesContainer = ref(null);
    const unreadCount = ref(0);
    const suggestions = ref([]);

    const defaultSuggestions = [
      "Jak mogę złożyć zamówienie?",
      "Jakie leki są dostępne?",
      "Jak działa dostawa?",
      "Jaka jest cena Paracetamolu?",
    ];

    const openChat = () => {
      isOpen.value = true;
      unreadCount.value = 0;

      if (messages.value.length === 0) {
        messages.value.push({
          role: "assistant",
          content: "Witaj! Jestem asystentem Apteki. Jak mogę Ci pomóc?",
          timestamp: new Date(),
        });

        suggestions.value = defaultSuggestions;
      }

      nextTick(() => {
        scrollToBottom();
      });
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

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      }
    };

    const clearHistory = () => {
      if (confirm("Czy na pewno chcesz usunąć całą historię czatu?")) {
        messages.value = [];

        messages.value.push({
          role: "assistant",
          content: "Witaj! Jestem asystentem Apteki. Jak mogę Ci pomóc?",
          timestamp: new Date(),
        });

        suggestions.value = defaultSuggestions;

        localStorage.setItem("aiChatMessages", JSON.stringify(messages.value));
      }
    };

    const formatMessage = (content) => {
      if (!content) return "";

      const html = marked.parse(content);

      return DOMPurify.sanitize(html);
    };

    const formatTime = (timestamp) => {
      if (!timestamp) return "";

      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat("pl-PL", {
        style: "currency",
        currency: "PLN",
      }).format(price);
    };

    const shortId = (id) => {
      if (!id) return "";
      return id.substring(0, 8) + "...";
    };

    const translateStatus = (status) => {
      const statusMap = {
        PENDING: "Oczekujące",
        COMPLETED: "Zrealizowane",
        CANCELLED: "Anulowane",
      };
      return statusMap[status] || status;
    };

    const applySuggestion = (suggestion) => {
      newMessage.value = suggestion;
    };

    const updateSuggestions = () => {
      if (messages.value.length <= 1) {
        suggestions.value = defaultSuggestions;
        return;
      }

      const lastMessage = messages.value[messages.value.length - 1];

      if (lastMessage.role === "assistant") {
        if (lastMessage.content.toLowerCase().includes("lek")) {
          suggestions.value = [
            "Jaka jest cena?",
            "Czy jest dostępny?",
            "Jakie są podobne leki?",
            "Jaka jest dawka?",
          ];
        } else if (lastMessage.content.toLowerCase().includes("zamówienie")) {
          suggestions.value = [
            "Jaki jest status?",
            "Kiedy dotrze?",
            "Chcę anulować",
            "Zobacz szczegóły",
          ];
        } else {
          suggestions.value = [
            "Pokaż dostępne leki",
            "Jak zamówić lek?",
            "Potrzebuję pomocy",
            "Dziękuję",
          ];
        }
      }
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;

      const userMessage = {
        role: "user",
        content: newMessage.value,
        timestamp: new Date(),
      };

      messages.value.push(userMessage);
      const messageText = newMessage.value;
      newMessage.value = "";
      isLoading.value = true;

      await nextTick();
      scrollToBottom();

      try {
        const conversationHistory = messages.value.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const queryAnalysis = mistralAiService.analyzeQuery(messageText);

        const aiResponse = await mistralAiService.sendMessage(
          conversationHistory
        );

        let toolResult = null;
        if (queryAnalysis.tool && queryAnalysis.confidence > 0.6) {
          toolResult = await mistralAiService.useTool(
            queryAnalysis.tool,
            messageText
          );
        }

        messages.value.push({
          role: "assistant",
          content: aiResponse.content,
          toolResult: toolResult,
          timestamp: new Date(),
        });

        updateSuggestions();
      } catch (error) {
        console.error("Error sending message:", error);

        messages.value.push({
          role: "system",
          content:
            "Przepraszam, wystąpił błąd podczas komunikacji. Spróbuj ponownie później.",
          timestamp: new Date(),
        });
      } finally {
        isLoading.value = false;

        localStorage.setItem("aiChatMessages", JSON.stringify(messages.value));

        await nextTick();
        scrollToBottom();
      }
    };

    onMounted(() => {
      try {
        const savedMessages = localStorage.getItem("aiChatMessages");
        if (savedMessages) {
          messages.value = JSON.parse(savedMessages);
        }

        if (messages.value.length === 0) {
          messages.value.push({
            role: "assistant",
            content: "Witaj! Jestem asystentem Apteki. Jak mogę Ci pomóc?",
            timestamp: new Date(),
          });
        }

        updateSuggestions();

        setTimeout(() => {
          if (!isOpen.value) {
            unreadCount.value = 1;
          }
        }, 10000);
      } catch (error) {
        console.error("Error loading chat messages:", error);
      }
    });

    onBeforeUnmount(() => {
      localStorage.setItem("aiChatMessages", JSON.stringify(messages.value));
    });

    watch(messages, () => {
      nextTick(() => {
        scrollToBottom();
      });
    });

    return {
      isOpen,
      messages,
      newMessage,
      isLoading,
      unreadCount,
      suggestions,
      messagesContainer,
      openChat,
      closeChat,
      toggleChat,
      sendMessage,
      formatMessage,
      formatTime,
      formatPrice,
      shortId,
      translateStatus,
      clearHistory,
      applySuggestion,
      scrollToBottom,
    };
  },
};
</script>

<style scoped>
:deep(.prose) {
  max-width: 100%;
}

:deep(.prose h1) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

:deep(.prose h2) {
  font-size: 1.15rem;
  font-weight: 600;
  margin-top: 0.8rem;
  margin-bottom: 0.4rem;
}

:deep(.prose p) {
  margin-bottom: 0.5rem;
}

:deep(.prose ul),
:deep(.prose ol) {
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}

:deep(.prose li) {
  margin-bottom: 0.25rem;
}

:deep(.prose a) {
  color: #4f46e5;
  text-decoration: underline;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
