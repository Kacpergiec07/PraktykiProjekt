import api from "./api";

class OrderService {
  /**
   
   * @param {string} drugId - Drug ID
   * @param {number} quantity - Quantity to order
   * @returns {Promise} - API response
   */
  orderDrug(drugId, quantity) {
    const orderData = {
      items: [
        {
          drugId,
          quantity,
        },
      ],
    };

    return api.post("/orders", orderData);
  }

  /**
   
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @param {Array} filter - Array of filter objects
   * @param {boolean} descending - Sort direction
   * @param {string} orderBy - Field to sort by
   * @returns {Promise} - API response
   */
  getOrderHistory(
    page = 0,
    limit = 15,
    filter = [],
    descending = true,
    orderBy = "createdAt"
  ) {
    const params = {
      page,
      limit,
      sortBy: this.mapSortField(orderBy),
      sortOrder: descending ? "desc" : "asc",
    };

    if (filter && filter.length > 0) {
      filter.forEach((f) => {
        const key = Object.keys(f)[0];
        const value = f[key];

        if (key === "status") {
          params.status = value;
        }
      });
    }

    return api.get("/orders", { params }).then((response) => {
      if (response.data.status === "success") {
        const orders = response.data.data.map((order) => {
          const items = order.orderItems || [];

          return items.map((item) => ({
            id: `${order.id}_${item.id}`,
            orderId: order.id,
            name: item.drug ? item.drug.name : "Unknown",
            companyName: item.drug ? item.drug.companyName : "Unknown",
            amount: item.quantity,
            date: order.orderDate || order.createdAt,
            status: order.status,
            userName: order.user ? order.user.firstName : "",
            userSurname: order.user ? order.user.lastName : "",
            userEmail: order.user ? order.user.email : "",
          }));
        });

        const flattenedOrders = [].concat(...orders);

        return {
          data: {
            orders: flattenedOrders,
            totalPages: response.data.meta.totalPages,
            currentPage: response.data.meta.page,
          },
        };
      }
      return response;
    });
  }

  /**
   
   * @param {string} id - Order ID
   * @returns {Promise} - API response
   */
  getOrderById(id) {
    return api.get(`/orders/${id}`);
  }

  /**
   
   * @param {string} id - Order ID
   * @returns {Promise} - API response
   */
  cancelOrder(id) {
    return api.post(`/orders/${id}/cancel`);
  }

  /**
   
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @param {Array} filter - Array of filter objects
   * @param {boolean} descending - Sort direction
   * @param {string} orderBy - Field to sort by
   * @returns {Promise} - API response
   */
  getOrderReports(
    page = 0,
    limit = 15,
    filter = [],
    descending = true,
    orderBy = "createdAt"
  ) {
    const params = {
      page,
      limit,
      sortBy: this.mapSortField(orderBy),
      sortOrder: descending ? "desc" : "asc",
    };

    if (filter && filter.length > 0) {
      filter.forEach((f) => {
        const key = Object.keys(f)[0];
        const value = f[key];

        if (key === "status") {
          params.status = value;
        }
      });
    }

    return api.get("/admin/orders", { params }).then((response) => {
      if (response.data.status === "success") {
        const orders = response.data.data.map((order) => {
          const items = order.orderItems || [];

          return items.map((item) => ({
            id: `${order.id}_${item.id}`,
            orderId: order.id,
            name: item.drug ? item.drug.name : "Unknown",
            companyName: item.drug ? item.drug.companyName : "Unknown",
            amount: item.quantity,
            price: item.price,
            date: order.orderDate || order.createdAt,
            status: order.status,
            userName: order.user ? order.user.firstName : "",
            userSurname: order.user ? order.user.lastName : "",
            userEmail: order.user ? order.user.email : "",
          }));
        });

        const flattenedOrders = [].concat(...orders);

        return {
          data: {
            orders: flattenedOrders,
            totalPages: response.data.meta.totalPages,
            currentPage: response.data.meta.page,
          },
        };
      }
      return response;
    });
  }

  /**
   
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @returns {Promise} - API response
   */
  updateOrderStatus(id, status) {
    return api.patch(`/admin/orders/${id}/status`, { status });
  }

  /**
   
   * @param {string} fromDate - Start date (YYYY-MM-DD)
   * @param {string} toDate - End date (YYYY-MM-DD)
   * @returns {Promise} - API response with total revenue
   */
  getRevenueStats(fromDate, toDate) {
    const params = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    return api.get("/admin/orders/stats/revenue", { params });
  }

  /**
   
   * @param {string} field - Old field name
   * @returns {string} - New field name
   */
  mapSortField(field) {
    const fieldMap = {
      purchase_date: "orderDate",
      purchase_amount: "orderItems.quantity",
      drug_name: "orderItems.drug.name",
      companyName: "orderItems.drug.companyName",
    };

    return fieldMap[field] || field;
  }
}

export default new OrderService();
