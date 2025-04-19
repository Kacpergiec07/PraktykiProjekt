import store from "../store";

/**
 * Navigation guard for routes that require authentication
 * @param {Object} to - Target route
 * @param {Object} from - Current route
 * @param {Function} next - Function to resolve the hook
 */
export const requireAuth = async (to, from, next) => {
  // Check if user is authenticated
  if (!store.getters["auth/isAuthenticated"]) {
    // Redirect to login with return URL
    return next({
      name: "login",
      query: { redirect: to.fullPath },
    });
  }

  // If we have a token but no user data, try to fetch the user
  if (!store.getters["auth/getCurrentUser"]) {
    try {
      await store.dispatch("auth/checkAuth");
    } catch (err) {
      console.error("Auth check failed:", err);
      // If auth check fails, redirect to login
      return next({
        name: "login",
        query: { redirect: to.fullPath },
      });
    }
  }

  // User is authenticated, proceed
  next();
};

/**
 * Navigation guard for routes that require specific roles
 * @param {Array} roles - Array of required roles (ADMIN, PHARMACIST, EMPLOYEE, CUSTOMER)
 * @returns {Function} Navigation guard function
 */
export const requireRole = (roles) => {
  return async (to, from, next) => {
    // First check if user is authenticated
    if (!store.getters["auth/isAuthenticated"]) {
      return next({
        name: "login",
        query: { redirect: to.fullPath },
      });
    }

    // If we have a token but no user data, try to fetch the user
    if (!store.getters["auth/getCurrentUser"]) {
      try {
        await store.dispatch("auth/checkAuth");
      } catch (err) {
        console.error("Auth check failed:", err);
        return next({
          name: "login",
          query: { redirect: to.fullPath },
        });
      }
    }

    // Get current user and check role
    const user = store.getters["auth/getCurrentUser"];

    // Check if user's role is in the required roles
    if (user && roles.includes(user.role)) {
      next(); // Role is allowed, proceed
    } else {
      // Map permission level to role for backward compatibility
      const permission = store.getters["auth/userPermission"];

      if (
        (permission >= 3 && roles.includes("ADMIN")) ||
        (permission >= 2 && roles.includes("PHARMACIST")) ||
        (permission >= 1 && roles.includes("EMPLOYEE"))
      ) {
        next(); // Permission level is sufficient, proceed
      } else {
        // Not authorized, redirect to home
        next({ name: "home" });
      }
    }
  };
};
