import api from "./api";

class DrugService {
  /**
   * Get all drugs with pagination
   * @param {number} page - Page number
   * @returns {Promise} - API response
   */
  getDrugs(page = 0) {
    return api
      .post("/api/v1/listDrugs", {
        page: page,
        limit: 15,
        orderBy: "idDrug",
        descending: false,
      })
      .then((response) => {
        if (response.data && response.data.status === "success") {
          return {
            data: {
              drugs: response.data.data,
              totalPages: response.data.metadata.pageCount,
              currentPage: response.data.metadata.currentPage,
            },
          };
        }
        return response;
      });
  }

  /**
   * Get a drug by ID
   * @param {number} id - Drug ID
   * @returns {Promise} - API response
   */
  getDrugById(id) {
    return api.get(`/api/v1/getDrug?drugId=${id}`).then((response) => {
      if (response.data && response.data.status === "success") {
        return {
          data: response.data.data,
        };
      }
      return response;
    });
  }

  /**
   * Update a drug
   * @param {number} id - Drug ID
   * @param {string} field - Field to update
   * @param {any} value - New value
   * @returns {Promise} - API response
   */
  updateDrug(id, field, value) {
    const updateData = {
      drugId: id,
    };
    updateData[field] = value;

    return api.patch("/api/v1/updateDrug", updateData);
  }

  /**
   * Remove a drug
   * @param {number} id - Drug ID
   * @returns {Promise} - API response
   */
  removeDrug(id) {
    return api.post("/api/v1/removeDrug", { drugId: id });
  }

  /**
   * Add a new drug
   * @param {Object} drugData - Drug data
   * @returns {Promise} - API response
   */
  addDrug(drugData) {
    return api.post("/api/v1/addDrug", drugData);
  }
}

export default new DrugService();
