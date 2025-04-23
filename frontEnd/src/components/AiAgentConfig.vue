<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4 flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 mr-2 text-mint"
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
      Konfiguracja Asystenta AI
    </h2>

    <div v-if="isLoading" class="flex justify-center p-4">
      <div
        class="animate-spin h-8 w-8 border-4 border-mint border-t-transparent rounded-full"
      ></div>
    </div>

    <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded mb-4">
      {{ error }}
    </div>

    <div v-else>
      <!-- Enable/Disable Agent -->
      <div class="mb-6 p-4 bg-gray-50 rounded border">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-medium text-lg">Status asystenta</h3>
            <p class="text-gray-600">
              Włącz lub wyłącz asystenta AI dla użytkowników
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="settings.isEnabled"
              class="sr-only peer"
              @change="updateSetting('isEnabled', settings.isEnabled)"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mint/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint"
            ></div>
          </label>
        </div>
      </div>

      <!-- AI Model Settings -->
      <div class="mb-6 p-4 bg-gray-50 rounded border">
        <h3 class="font-medium text-lg mb-3">Model AI</h3>

        <div class="mb-4">
          <label class="block mb-2">Wybierz model AI</label>
          <select
            v-model="settings.modelType"
            class="w-full p-2 border rounded focus:ring-mint focus:border-mint"
            @change="updateSetting('modelType', settings.modelType)"
          >
            <option value="mistral-small">
              Mistral Small (szybszy, podstawowe możliwości)
            </option>
            <option value="mistral-medium">
              Mistral Medium (zrównoważony)
            </option>
            <option value="mistral-large">
              Mistral Large (najlepsze możliwości, wolniejszy)
            </option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block mb-2">Kreatywność odpowiedzi</label>
          <input
            type="range"
            v-model.number="settings.temperature"
            min="0"
            max="1"
            step="0.1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mint"
            @change="updateSetting('temperature', settings.temperature)"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Precyzyjny</span>
            <span>Zrównoważony</span>
            <span>Kreatywny</span>
          </div>
        </div>
      </div>

      <!-- User Experience Settings -->
      <div class="mb-6 p-4 bg-gray-50 rounded border">
        <h3 class="font-medium text-lg mb-3">Ustawienia interfejsu</h3>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Automatyczne sugestie</p>
              <p class="text-sm text-gray-600">
                Pokazuj sugerowane pytania użytkownikom
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.autoSuggest"
                class="sr-only peer"
                @change="updateSetting('autoSuggest', settings.autoSuggest)"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mint/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint"
              ></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Powiadomienia</p>
              <p class="text-sm text-gray-600">
                Powiadomienia dla nieaktywnych użytkowników
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.notificationsEnabled"
                class="sr-only peer"
                @change="
                  updateSetting(
                    'notificationsEnabled',
                    settings.notificationsEnabled
                  )
                "
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mint/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint"
              ></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Obsługa głosowa (eksperymentalne)</p>
              <p class="text-sm text-gray-600">
                Pozwól użytkownikom rozmawiać głosowo z asystentem
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.voiceEnabled"
                class="sr-only peer"
                @change="updateSetting('voiceEnabled', settings.voiceEnabled)"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mint/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint"
              ></div>
            </label>
          </div>
        </div>
      </div>

      <!-- API Usage and Tools -->
      <div class="mb-6 p-4 bg-gray-50 rounded border">
        <h3 class="font-medium text-lg mb-3">Wykorzystanie API i narzędzia</h3>

        <div class="mb-4">
          <h4 class="font-medium mb-2">Dostępne narzędzia</h4>
          <div class="space-y-2">
            <div
              v-for="(tool, index) in availableTools"
              :key="index"
              class="flex items-center justify-between"
            >
              <div>
                <p class="font-medium">{{ tool.name }}</p>
                <p class="text-sm text-gray-600">{{ tool.description }}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="enabledTools[tool.name]"
                  class="sr-only peer"
                  @change="updateToolStatus(tool.name, enabledTools[tool.name])"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mint/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint"
                ></div>
              </label>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <h4 class="font-medium mb-2">Wykorzystanie API</h4>
          <div class="bg-white p-3 rounded border">
            <div class="flex justify-between mb-2">
              <span>Zużycie w tym miesiącu:</span>
              <span class="font-medium"
                >{{ apiUsage.current }} / {{ apiUsage.limit }} zapytań</span
              >
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-mint h-2.5 rounded-full"
                :style="`width: ${(apiUsage.current / apiUsage.limit) * 100}%`"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between">
        <button
          @click="resetToDefaults"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          Przywróć domyślne
        </button>

        <button
          @click="saveAllSettings"
          class="px-4 py-2 bg-mint text-white rounded hover:bg-lightmint transition-colors"
          :disabled="isSaving"
        >
          <span v-if="isSaving">Zapisywanie...</span>
          <span v-else>Zapisz wszystkie ustawienia</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore } from "vuex";
import notification from "../utils/notification";

export default {
  name: "AiAgentConfig",
  setup() {
    const store = useStore();
    const isLoading = ref(false);
    const error = ref(null);
    const isSaving = ref(false);

    // Settings from store with defaults
    const settings = reactive({
      isEnabled: true,
      modelType: "mistral-medium",
      temperature: 0.7,
      autoSuggest: true,
      notificationsEnabled: true,
      voiceEnabled: false,
    });

    // Available tools from API
    const availableTools = ref([]);
    const enabledTools = reactive({});

    // API usage statistics (mock)
    const apiUsage = reactive({
      current: 847,
      limit: 10000,
    });

    // Load settings from store or localStorage
    const loadSettings = async () => {
      isLoading.value = true;
      try {
        // Get settings from store
        const storeSettings = store.getters["ai/getSettings"];

        // Update local settings
        Object.assign(settings, {
          isEnabled: store.getters["ai/isEnabled"],
          ...storeSettings,
        });

        // Fetch available tools
        await store.dispatch("ai/fetchAvailableTools");
        availableTools.value = store.getters["ai/getAvailableTools"];

        // Initialize enabled tools
        availableTools.value.forEach((tool) => {
          enabledTools[tool.name] = tool.enabled !== false; // Default to enabled
        });
      } catch (err) {
        error.value = "Nie udało się załadować ustawień: " + err.message;
        console.error("Failed to load settings:", err);
      } finally {
        isLoading.value = false;
      }
    };

    // Update a single setting
    const updateSetting = (key, value) => {
      // Update local state
      settings[key] = value;

      // Save to store
      if (key === "isEnabled") {
        // Special case for the enable/disable toggle
        store.dispatch("ai/toggleAiAgent");
      } else {
        // Other settings
        store.dispatch("ai/updateSettings", { [key]: value });
      }

      // Show notification
      notification.info(`Ustawienie "${key}" zostało zaktualizowane`);
    };

    // Update tool status
    const updateToolStatus = (toolName, enabled) => {
      // Update local state
      enabledTools[toolName] = enabled;

      // In a real implementation, you would save this to the backend
      notification.info(
        `Narzędzie "${toolName}" zostało ${enabled ? "włączone" : "wyłączone"}`
      );
    };

    // Reset to default settings
    const resetToDefaults = () => {
      if (
        confirm(
          "Czy na pewno chcesz przywrócić wszystkie ustawienia do wartości domyślnych?"
        )
      ) {
        // Reset local settings
        Object.assign(settings, {
          isEnabled: true,
          modelType: "mistral-medium",
          temperature: 0.7,
          autoSuggest: true,
          notificationsEnabled: true,
          voiceEnabled: false,
        });

        // Reset tool enablement
        Object.keys(enabledTools).forEach((toolName) => {
          enabledTools[toolName] = true;
        });

        // Save to store
        store.dispatch("ai/updateSettings", {
          modelType: settings.modelType,
          temperature: settings.temperature,
          autoSuggest: settings.autoSuggest,
          notificationsEnabled: settings.notificationsEnabled,
          voiceEnabled: settings.voiceEnabled,
        });

        if (!settings.isEnabled) {
          store.dispatch("ai/toggleAiAgent");
        }

        notification.success(
          "Wszystkie ustawienia zostały przywrócone do wartości domyślnych"
        );
      }
    };

    // Save all settings at once
    const saveAllSettings = async () => {
      isSaving.value = true;

      try {
        // Update all settings in the store
        await store.dispatch("ai/updateSettings", {
          modelType: settings.modelType,
          temperature: settings.temperature,
          autoSuggest: settings.autoSuggest,
          notificationsEnabled: settings.notificationsEnabled,
          voiceEnabled: settings.voiceEnabled,
        });

        // Ensure isEnabled setting is correct
        const currentEnabled = store.getters["ai/isEnabled"];
        if (currentEnabled !== settings.isEnabled) {
          await store.dispatch("ai/toggleAiAgent");
        }

        // In a real implementation, you would also save tool enablement to the backend
        // For now, we'll just show a success message

        notification.success("Wszystkie ustawienia zostały zapisane pomyślnie");
      } catch (err) {
        error.value = "Nie udało się zapisać ustawień: " + err.message;
        notification.error("Wystąpił błąd podczas zapisywania ustawień");
        console.error("Failed to save settings:", err);
      } finally {
        isSaving.value = false;
      }
    };

    // Load settings on component mount
    onMounted(() => {
      loadSettings();
    });

    return {
      isLoading,
      error,
      isSaving,
      settings,
      availableTools,
      enabledTools,
      apiUsage,
      updateSetting,
      updateToolStatus,
      resetToDefaults,
      saveAllSettings,
    };
  },
};
</script>
