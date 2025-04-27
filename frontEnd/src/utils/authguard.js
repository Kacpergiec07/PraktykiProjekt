import store from "../store";

/**
 
 * @param {Object} to - Target route
 * @param {Object} from - Current route
 * @param {Function} next - Function to resolve the hook
 */
export const requireAuth = async (to, from, next) => {
  if (!store.getters["auth/isAuthenticated"]) {
    return next({
      name: "login",
      query: { redirect: to.fullPath },
    });
  }

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

  next();
};

/**
 
 * @param {Array} roles - Array of required roles (ADMIN, PHARMACIST, EMPLOYEE, CUSTOMER)
 * @returns {Function} Navigation guard function
 */
export const requireRole = (roles) => {
  return async (to, from, next) => {
    if (!store.getters["auth/isAuthenticated"]) {
      return next({
        name: "login",
        query: { redirect: to.fullPath },
      });
    }

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

    const user = store.getters["auth/getCurrentUser"];

    if (user && roles.includes(user.role)) {
      next();
    } else {
      const permission = store.getters["auth/userPermission"];

      if (
        (permission >= 3 && roles.includes("ADMIN")) ||
        (permission >= 2 && roles.includes("PHARMACIST")) ||
        (permission >= 1 && roles.includes("EMPLOYEE"))
      ) {
        next();
      } else {
        next({ name: "home" });
      }
    }
  };
};
