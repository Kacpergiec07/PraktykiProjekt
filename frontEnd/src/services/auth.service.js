import api from "./api";

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's first name
   * @param {string} userData.surname - User's last name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise} - API response
   */
  register(userData) {
    return api.post("/api/v1/register", userData).then((response) => {
      if (response.data.status === "success") {
        localStorage.setItem("token", response.data.data);
        return this.getUserInfo().then((userResponse) => {
          return {
            data: {
              token: response.data.data,
              user: userResponse.data,
            },
          };
        });
      }
      return response;
    });
  }

  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise} - API response
   */
  login(credentials) {
    return api.post("/api/v1/login", credentials).then((response) => {
      if (response.data.status === "success") {
        localStorage.setItem("token", response.data.token);
        return this.getUserInfo().then((userResponse) => {
          return {
            data: {
              token: response.data.token,
              user: userResponse.data,
            },
          };
        });
      }
      return response;
    });
  }

  /**
   * Get current user information
   * @returns {Promise} - API response
   */
  getUserInfo() {
    return api.get("/api/v1/me").then((response) => {
      if (response.data && response.data.status === "success") {
        // Ensure permission is a number
        if (response.data.data && response.data.data.permission !== undefined) {
          response.data.data.permission = Number(response.data.data.permission);
        }
        return {
          data: response.data.data,
        };
      }
      return response;
    });
  }
}

export default new AuthService();
