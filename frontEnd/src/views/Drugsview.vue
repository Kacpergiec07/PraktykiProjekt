<template>
  <div>
    <!-- Główna treść aplikacji -->
    <div class="relative z-10">
      <div class="flex justify-between items-center mb-6 mt-10">
        <h1 class="text-2xl font-bold">Dostępne leki</h1>
        <div class="flex space-x-2">
          <button
            @click="openSearchModal"
            class="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Szukaj (Ctrl+F)
          </button>
          <button
            @click="refresh"
            class="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Odśwież
          </button>
        </div>
      </div>

      <div v-if="error" class="mb-6 p-4 bg-red-100 text-red-700 rounded">
        {{ error }}
      </div>

      <div
        v-if="successMessage"
        class="mb-6 p-4 bg-green-100 text-green-700 rounded"
      >
        {{ successMessage }}
      </div>

      <div
        v-if="isSearchActive"
        class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded"
      >
        <div class="flex justify-between items-center">
          <div>
            <p class="font-medium">
              Wyniki wyszukiwania dla: "{{ searchQuery }}"
            </p>
          </div>
          <button
            @click="clearSearch"
            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Wyczyść wyszukiwanie
          </button>
        </div>
      </div>

      <drugs-list
        :drugs="drugs"
        :loading="loading"
        :total-pages="totalPages"
        :current-page="currentPage"
        @refresh="refresh"
        @page-change="changePage"
        class="bg-opacity-65"
      />

      <div
        v-if="searchModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      >
        <div
          class="bg-white rounded-lg max-w-lg w-full shadow-xl transform transition-all duration-300"
        >
          <!-- Modal Header -->
          <div
            class="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-4 rounded-t-lg border-b border-blue-200"
          >
            <h3 class="text-xl font-bold text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 mr-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Szukaj leków
            </h3>
          </div>

          <!-- Modal Body -->
          <div class="p-6">
            <form @submit.prevent="performSearch">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Wyszukaj według</label
                >
                <div class="flex space-x-2 mb-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      v-model="searchType"
                      value="name"
                      class="form-radio text-blue-600"
                    />
                    <span class="ml-2">Nazwa leku</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      v-model="searchType"
                      value="companyName"
                      class="form-radio text-blue-600"
                    />
                    <span class="ml-2">Producent</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      v-model="searchType"
                      value="type"
                      class="form-radio text-blue-600"
                    />
                    <span class="ml-2">Typ leku</span>
                  </label>
                </div>

                <div class="mb-4">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="exactMatch"
                      class="form-checkbox text-blue-600"
                    />
                    <span class="ml-2">Dokładne dopasowanie</span>
                  </label>
                  <p class="text-xs text-gray-500 mt-1">
                    Zaznacz, aby szukać tylko dokładnych wartości
                  </p>
                </div>

                <div class="relative">
                  <input
                    type="text"
                    v-model="searchQuery"
                    ref="searchInput"
                    placeholder="Wpisz szukaną frazę..."
                    class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div
                    class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeSearchModal"
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  :disabled="!searchQuery.trim()"
                >
                  Szukaj
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from "vuex";
import DrugsList from "../components/DrugsList.vue";
import ThreeBackground from "../components/ThreeBackground.vue";

export default {
  name: "DrugsView",
  components: {
    DrugsList,
    ThreeBackground,
  },
  data() {
    return {
      successMessage: "",
      timer: null,
      searchModal: false,
      searchQuery: "",
      searchType: "name",
      exactMatch: true, // Domyślnie włączone dokładne dopasowanie
      isSearchActive: false,
    };
  },
  computed: {
    ...mapState({
      loading: (state) => state.loading,
      error: (state) => state.error,
    }),
    ...mapGetters("drugs", ["allDrugs", "totalPages", "currentPage"]),
    drugs() {
      return this.allDrugs;
    },
    searchResultsCount() {
      // Upewniamy się, że this.drugs to tablica i zwracamy jej długość
      return Array.isArray(this.drugs) ? this.drugs.length : 0;
    },
  },
  methods: {
    ...mapActions("drugs", ["fetchDrugs"]),
    ...mapActions(["clearError"]),

    async refresh() {
      try {
        await this.fetchDrugs(this.currentPage);
        this.showSuccessMessage("Lista leków została odświeżona");
      } catch (error) {
        console.error("Failed to refresh drugs list:", error);
      }
    },

    async changePage(page) {
      try {
        const pageIndex = page - 1;
        // Jeśli mamy aktywne wyszukiwanie, zachowaj te same parametry przy zmianie strony
        if (this.isSearchActive) {
          const query = this.searchQuery.trim();
          const exactMatch = this.exactMatch;
          const searchParams = {
            page: pageIndex,
            limit: 15,
          };

          if (this.searchType === "name") {
            searchParams.exactName = exactMatch ? query : null;
            searchParams.name = !exactMatch ? query : null;
          } else if (this.searchType === "companyName") {
            searchParams.exactCompanyName = exactMatch ? query : null;
            searchParams.companyName = !exactMatch ? query : null;
          } else if (this.searchType === "type") {
            searchParams.exactType = exactMatch ? query : null;
            searchParams.type = !exactMatch ? query : null;
          }

          await this.fetchDrugs(searchParams);
        } else {
          // Standardowa zmiana strony bez parametrów wyszukiwania
          await this.fetchDrugs(pageIndex);
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Failed to change page:", error);
      }
    },

    showSuccessMessage(message) {
      this.successMessage = message;

      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.successMessage = "";
      }, 3000);
    },

    handleKeyDown(event) {
      // Change from Ctrl+W to Ctrl+F to avoid browser conflicts
      if (event.ctrlKey && event.key === "f") {
        event.preventDefault(); // Prevent default browser behavior
        this.openSearchModal();
      }
    },
    openSearchModal() {
      this.searchModal = true;
      // Focus on the search input after the modal is shown
      this.$nextTick(() => {
        if (this.$refs.searchInput) {
          this.$refs.searchInput.focus();
        }
      });
    },

    closeSearchModal() {
      this.searchModal = false;
      this.searchQuery = "";
    },

    async performSearch() {
      if (!this.searchQuery.trim()) return;

      try {
        const query = this.searchQuery.trim();

        // Initialize search parameters
        const searchParams = {
          page: 0,
          limit: 15,
        };

        // Add exact match or partial match indicator
        const exactMatch = this.exactMatch;

        // Set the appropriate search parameter based on search type
        if (this.searchType === "name") {
          // Dokładne wyszukiwanie po nazwie leku
          searchParams.exactName = exactMatch ? query : null;
          searchParams.name = !exactMatch ? query : null;
        } else if (this.searchType === "companyName") {
          // Dokładne wyszukiwanie po producencie
          searchParams.exactCompanyName = exactMatch ? query : null;
          searchParams.companyName = !exactMatch ? query : null;
        } else if (this.searchType === "type") {
          // Dokładne wyszukiwanie po typie leku
          searchParams.exactType = exactMatch ? query : null;
          searchParams.type = !exactMatch ? query : null;
        }

        console.log(
          `Searching for ${this.searchType}: "${query}" (Exact match: ${exactMatch})`
        );
        console.log("Search params:", searchParams);

        // Wywołanie API z nowymi parametrami dokładnego dopasowania
        await this.fetchDrugs(searchParams);

        this.isSearchActive = true;
        this.searchModal = false;

        // Check if search returned any results
        if (!this.drugs || this.drugs.length === 0) {
          // If no results found, show a more descriptive message and apply red styling
          let errorMessage = "";
          const matchType = exactMatch
            ? "dokładnie pasującej do"
            : "zawierającej";

          if (this.searchType === "name") {
            errorMessage = `Nie znaleziono leku o nazwie ${matchType} "${query}"`;
          } else if (this.searchType === "companyName") {
            errorMessage = `Nie znaleziono leków od producenta ${matchType} "${query}"`;
          } else if (this.searchType === "type") {
            errorMessage = `Nie znaleziono leków typu ${matchType} "${query}"`;
          }

          // Show error message in red
          this.error = errorMessage;

          // Clear the error after 5 seconds
          setTimeout(() => {
            this.error = null;
          }, 5000);
        } else {
          // Add a small delay to make sure the component is updated
          setTimeout(() => {
            this.focusOnSearchResults();
          }, 300);

          // Show success message
          const matchType = exactMatch ? "dokładnie" : "częściowo";
          this.showSuccessMessage(`Wyszukano ${matchType} "${query}"`);
        }
      } catch (error) {
        console.error("Search failed:", error);
        this.error =
          "Błąd podczas wyszukiwania: " + (error.message || "Nieznany błąd");

        // Clear the error after 5 seconds
        setTimeout(() => {
          this.error = null;
        }, 5000);
      }
    },

    // Add a method to focus/zoom on the search results
    focusOnSearchResults() {
      // Pobierz wyszukiwaną frazę
      const searchQuery = this.searchQuery.trim();

      // Opóźnienie, aby dać czas na renderowanie DOM
      setTimeout(() => {
        // Pobierz wszystkie elementy kart leków
        const drugItems = document.querySelectorAll(".border.rounded-lg.p-4");

        // Przechowuj znalezione elementy pasujące do wyszukiwania
        let matchingItems = [];

        if (drugItems && drugItems.length > 0) {
          // Dla każdego elementu sprawdź, czy zawiera szukaną frazę w odpowiednim polu
          drugItems.forEach((item) => {
            let matchFound = false;

            // Pobierz tekst z odpowiedniego pola w zależności od typu wyszukiwania
            if (this.searchType === "name") {
              // Szukaj w nazwie leku (pierwszy element <h3>)
              const nameElement = item.querySelector("h3");
              if (nameElement) {
                const name = nameElement.textContent.trim();

                // Sprawdź czy nazwa pasuje do wyszukiwanej frazy
                if (this.exactMatch) {
                  // Dokładne dopasowanie (case-insensitive)
                  matchFound = name.toLowerCase() === searchQuery.toLowerCase();
                } else {
                  // Częściowe dopasowanie
                  matchFound = name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
                }
              }
            } else if (this.searchType === "companyName") {
              // Szukaj w producencie (paragraf zawierający "Producent:")
              const companyElements = Array.from(item.querySelectorAll("p"));
              const companyElement = companyElements.find((p) =>
                p.textContent.includes("Producent:")
              );

              if (companyElement) {
                const companyText = companyElement.textContent.trim();
                const company = companyText.replace("Producent:", "").trim();

                // Sprawdź czy producent pasuje do wyszukiwanej frazy
                if (this.exactMatch) {
                  // Dokładne dopasowanie (case-insensitive)
                  matchFound =
                    company.toLowerCase() === searchQuery.toLowerCase();
                } else {
                  // Częściowe dopasowanie
                  matchFound = company
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
                }
              }
            } else if (this.searchType === "type") {
              // Szukaj w typie leku (paragraf zawierający "Typ:")
              const typeElements = Array.from(item.querySelectorAll("p"));
              const typeElement = typeElements.find((p) =>
                p.textContent.includes("Typ:")
              );

              if (typeElement) {
                const typeText = typeElement.textContent.trim();
                const type = typeText.replace("Typ:", "").trim();

                // Sprawdź czy typ pasuje do wyszukiwanej frazy
                if (this.exactMatch) {
                  // Dokładne dopasowanie (case-insensitive)
                  matchFound = type.toLowerCase() === searchQuery.toLowerCase();
                } else {
                  // Częściowe dopasowanie
                  matchFound = type
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
                }
              }
            }

            // Jeśli znaleziono dopasowanie, dodaj element do listy
            if (matchFound) {
              matchingItems.push(item);
            }
          });

          // Jeśli znaleziono pasujące elementy, podświetl je i przewiń do pierwszego
          if (matchingItems.length > 0) {
            // Podświetl wszystkie pasujące elementy
            matchingItems.forEach((item) => {
              item.classList.add("search-highlight");

              // Usuń podświetlenie po animacji
              setTimeout(() => {
                item.classList.remove("search-highlight");
              }, 3000);
            });

            // Przewiń do pierwszego pasującego elementu
            matchingItems[0].scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            console.log(
              `Znaleziono i podświetlono ${matchingItems.length} pasujących elementów`
            );
          } else {
            console.log(
              "Nie znaleziono elementów pasujących do wyszukiwania w DOM"
            );
          }
        }
      }, 500); // Opóźnienie, aby upewnić się, że DOM został zaktualizowany
    },

    clearSearch() {
      this.isSearchActive = false;
      this.searchQuery = "";
      this.refresh();
    },
  },
  created() {
    this.fetchDrugs(0);
    window.addEventListener("keydown", this.handleKeyDown);
  },
  beforeUnmount() {
    if (this.timer) clearTimeout(this.timer);
    this.clearError();
    window.removeEventListener("keydown", this.handleKeyDown);
  },
};
</script>

<style>
@keyframes highlight-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.search-highlight {
  animation: highlight-pulse 2s ease-out;
  border-color: #3b82f6 !important;
  background-color: rgba(59, 130, 246, 0.1);
  transition: background-color 2s ease-out, border-color 2s ease-out;
}
</style>
