import api from "./api";

class DrugService {
  /**
  
   * @param {number} page - Page number (starts from 0)
   * @param {number} limit - Results per page
   * @param {string} name - Filter by name
   * @param {string} companyName - Filter by company name
   * @param {string} type - Filter by type
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @param {string} sortBy - Field to sort by
   * @param {string} sortOrder - Sort direction (asc or desc)
   * @returns {Promise} - API response
   */
  getDrugs(
    page = 0,
    limit = 15,
    name,
    companyName,
    type,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc"
  ) {
    const params = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    if (name) params.name = name;
    if (companyName) params.companyName = companyName;
    if (type) params.type = type;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;

    return api.get("/drugs", { params }).then((response) => {
      if (response.data.status === "success") {
        const drugs = response.data.data.map((drug) => ({
          idDrug: drug.id,
          name: drug.name,
          dose: drug.dose,
          price: drug.price,
          type: drug.type,
          companyName: drug.companyName,
          amount: drug.amount,
          createdAt: drug.createdAt,
          updatedAt: drug.updatedAt,
        }));

        return {
          data: {
            drugs,
            totalPages: response.data.meta.totalPages,
            currentPage: response.data.meta.page,
          },
        };
      }
      return response;
    });
  }

  /**
   
   * @param {string} id - Drug ID
   * @returns {Promise} - API response
   */
  getDrugById(id) {
    return api.get(`/drugs/${id}`).then((response) => {
      if (response.data.status === "success") {
        const drug = response.data.data;
        return {
          data: {
            idDrug: drug.id,
            name: drug.name,
            dose: drug.dose,
            price: drug.price,
            type: drug.type,
            companyName: drug.companyName,
            amount: drug.amount,
            createdAt: drug.createdAt,
            updatedAt: drug.updatedAt,
          },
        };
      }
      return response;
    });
  }

  /**
   
   * @param {Object} drugData - Drug data
   * @returns {Promise} - API response
   */
  addDrug(drugData) {
    return api.post("/drugs", drugData);
  }

  /**
   
   * @param {string} id - Drug ID
   * @param {string} field - Field to update
   * @param {any} value - New value
   * @returns {Promise} - API response
   */
  updateDrug(id, field, value) {
    const updateData = {};
    updateData[field] = value;

    return api.patch(`/drugs/${id}`, updateData);
  }

  /**
   
   * @param {string} id - Drug ID
   * @returns {Promise} - API response
   */
  removeDrug(id) {
    return api.delete(`/drugs/${id}`);
  }
}

export default new DrugService();
