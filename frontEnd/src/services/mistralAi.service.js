import api from "./api";

/**
 
 */
class MistralAiService {
  /**
   
   * @param {Array} messages - Historia wiadomości w formacie [{role: 'user|assistant|system', content: 'treść'}]
   * @returns {Promise} - Odpowiedź od asystenta
   */
  async sendMessage(messages) {
    try {
      const response = await api.post("/ai/chat", { messages });

      if (response.data.status === "success") {
        return response.data.data;
      }

      throw new Error(
        response.data.message || "Błąd komunikacji z asystentem AI"
      );
    } catch (error) {
      console.error("Error in MistralAiService.sendMessage:", error);
      throw error;
    }
  }

  /**
   
   * @param {string} query - Zapytanie o lek
   * @returns {Promise} - Dane o lekach
   */
  async searchDrugs(query) {
    try {
      const drugName = this.extractDrugName(query);

      const response = await api.get("/drugs", {
        params: {
          name: drugName || undefined,
          limit: 3,
        },
      });

      if (response.data.status === "success") {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error("Error in MistralAiService.searchDrugs:", error);
      return [];
    }
  }

  /**
   
   * @returns {Promise} - Dane o zamówieniach
   */
  async getUserOrders() {
    try {
      const response = await api.get("/orders");

      if (response.data.status === "success") {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error("Error in MistralAiService.getUserOrders:", error);
      return [];
    }
  }

  /**
   
   * @param {string} query - Zapytanie użytkownika
   * @returns {Object} - Informacja o narzędziu do użycia
   */
  analyzeQuery(query) {
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes("lek") ||
      lowerQuery.includes("leki") ||
      lowerQuery.includes("tabletki") ||
      lowerQuery.includes("cena") ||
      lowerQuery.includes("paracetamol") ||
      lowerQuery.includes("ibuprofen")
    ) {
      return { tool: "drugs", confidence: 0.8 };
    }

    if (
      lowerQuery.includes("zamówienie") ||
      lowerQuery.includes("zamówiłem") ||
      lowerQuery.includes("status") ||
      lowerQuery.includes("historia zamówień")
    ) {
      return { tool: "orders", confidence: 0.7 };
    }

    return { tool: null, confidence: 0 };
  }

  /**
 
   * @param {string} tool - Nazwa narzędzia do użycia
   * @param {string} query - Treść zapytania
   * @returns {Promise} - Wynik działania narzędzia
   */
  async useTool(tool, query) {
    switch (tool) {
      case "drugs":
        return {
          type: "drug",
          data: await this.searchDrugs(query),
        };

      case "orders":
        return {
          type: "order",
          data: await this.getUserOrders(),
        };

      default:
        return null;
    }
  }

  /**
   
   * @param {string} query - Zapytanie użytkownika
   * @returns {string} - Wyodrębniona nazwa leku
   */
  extractDrugName(query) {
    const patterns = [
      /lek(?:i|u|ów)?\s+(?:na\s+)?(.+?)(?:\?|\.|\s+jest|\s+są|$)/i,
      /(?:ile kosztuje|cena|cenę)\s+(.+?)(?:\?|\.|\s+jest|\s+są|$)/i,
      /(?:masz|macie|dostępn[ye])\s+(.+?)(?:\?|\.|\s+jest|\s+są|$)/i,
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return "";
  }
}

export default new MistralAiService();
