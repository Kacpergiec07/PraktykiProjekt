import api from "./api";

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise} - API response
   */
  register(userData) {
    // Map to new API field names
    const requestData = {
      email: userData.email,
      password: userData.password,
      firstName: userData.name || userData.firstName,
      lastName: userData.surname || userData.lastName,
    };

    return api.post("/auth/register", requestData).then((response) => {
      if (response.data.status === "success") {
        // Store the tokens
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        return {
          data: {
            token: accessToken,
            refreshToken: refreshToken,
            user: {
              ...user,
              // Map role to permission level for compatibility
              permission: this.mapRoleToPermission(user.role),
            },
          },
        };
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
    return api.post("/auth/login", credentials).then((response) => {
      if (response.data.status === "success") {
        // Store the tokens
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        return {
          data: {
            token: accessToken,
            refreshToken: refreshToken,
            user: {
              ...user,
              // Map role to permission level for compatibility
              permission: this.mapRoleToPermission(user.role),
            },
          },
        };
      }
      return response;
    });
  }

  /**
   * Refresh the access token
   * @returns {Promise} - API response
   */
  refreshToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return Promise.reject("No refresh token available");
    }

    return api
      .post("/auth/refresh-token", { refreshToken })
      .then((response) => {
        if (response.data.status === "success") {
          const { accessToken } = response.data.data;
          localStorage.setItem("token", accessToken);
          return { data: { token: accessToken } };
        }
        return response;
      });
  }

  /**
   * Logout a user
   * @returns {Promise} - API response
   */
  logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      return api.post("/auth/logout", { refreshToken }).then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        return { success: true };
      });
    }

    // If no refresh token, just clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    return Promise.resolve({ success: true });
  }

  /**
   * Get current user information
   * @returns {Promise} - API response
   */
  getUserInfo() {
    return api.get("/auth/me").then((response) => {
      if (response.data.status === "success") {
        const userData = response.data.data;
        return {
          data: {
            ...userData,
            // Keep these field names for compatibility
            name: userData.firstName,
            surname: userData.lastName,
            // Map role to permission level for compatibility
            permission: this.mapRoleToPermission(userData.role),
          },
        };
      }
      return response;
    });
  }

  /**
   * Maps role strings to numeric permission levels for backward compatibility
   * @param {string} role - User role from the new API
   * @returns {number} - Permission level for the frontend
   */
  mapRoleToPermission(role) {
    switch (role) {
      case "ADMIN":
        return 3;
      case "PHARMACIST":
        return 2;
      case "EMPLOYEE":
        return 1;
      case "CUSTOMER":
      default:
        return 0;
    }
  }
}

export default new AuthService();
