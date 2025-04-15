import api from "./api";

class OrderService {
  /**
   * Order a drug
   * @param {number} id - Drug ID
   * @param {number} amount - Amount to order
   * @returns {Promise} - API response
   */
  orderDrug(id, amount) {
    return api.post("/api/v1/orderDrug", { id, amount });
  }

  /**
   * Get user's order history
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @param {Array} filter - Filter options
   * @param {boolean} descending - Sort direction
   * @param {string} orderBy - Sort field
   * @returns {Promise} - API response
   */
  getOrderHistory(
    page = 0,
    limit = 15,
    filter = [],
    descending = true,
    orderBy = "purchase_date"
  ) {
    return api
      .post("/api/v1/orderHistory", {
        page,
        limit,
        filter,
        descending,
        orderBy,
      })
      .then((response) => {
        // Transform data to expected format
        if (response.data && response.data.status === "success") {
          const orders = response.data.data.map((order) => ({
            id: order.id,
            name: order.drug_name,
            companyName: order.companyName,
            amount: order.purchase_amount,
            date: order.purchase_date,
            userName: order.user_name,
            userSurname: order.user_surname,
            userEmail: order.user_email,
          }));

          return {
            data: {
              orders,
              totalPages: response.data.metadata.pageCount,
              currentPage: response.data.metadata.currentPage,
            },
          };
        }
        return response;
      });
  }

  /**
   * Get order reports (admin/pharmacist only)
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @param {Array} filter - Filter options
   * @param {boolean} descending - Sort direction
   * @param {string} orderBy - Sort field
   * @returns {Promise} - API response
   */
  getOrderReports(
    page = 0,
    limit = 15,
    filter = [],
    descending = true,
    orderBy = "purchase_date"
  ) {
    return api
      .post("/api/v1/orderReport", {
        page,
        limit,
        filter,
        descending,
        orderBy,
      })
      .then((response) => {
        // Transform data to expected format
        if (response.data && response.data.status === "success") {
          const orders = response.data.data.map((order) => ({
            id: order.id,
            name: order.drug_name,
            companyName: order.companyName,
            amount: order.purchase_amount,
            date: order.purchase_date,
            userName: order.user_name,
            userSurname: order.user_surname,
            userEmail: order.user_email,
          }));

          return {
            data: {
              orders,
              totalPages: response.data.metadata.pageCount,
              currentPage: response.data.metadata.currentPage,
            },
          };
        }
        return response;
      });
  }
}

export default new OrderService();
