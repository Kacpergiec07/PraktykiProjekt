<template>
  <nav class="text-white p-4 bg-mint">
    <div class="container mx-auto flex justify-between items-center">
      <router-link to="/" class="text-xl font-bold logo_txt font-primary"
        >API Apteka</router-link
      >

      <div class="flex space-x-4">
        
        <router-link to="/drugs" class="nav-item">Leki</router-link>

        <template v-if="isAuthenticated">
          <router-link to="/history" class="nav-item-admin"
            >Historia zamówień</router-link
          >
          <router-link v-if="isAdmin" to="/admin" class="nav-item-admin"
            >Panel administracyjny</router-link
          >
          <router-link to="/profile" class="photo">
            <img src="../assets/profile.png" alt="profile"/>
          </router-link>

          <router-link to="/cart" class="relative hover:text-blue-200">
            <img src="../assets/cart.png" alt="cart" class="w-6 h-6 photo" />
            <span
              v-if="totalItems > 0"
              class="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] min-w-[1.25rem] h-5 px-1 rounded-full text-center leading-5 font-semibold transition-all animate-pop"
            >
              {{ totalItems }}
            </span>
          </router-link>
            
            <button
              @click="handleLogout"
              class="hover:text-red-500 hover:cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e3e3e3"
                class="logout-icon"
              >
              <path
                d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"
              />
              </svg>
            </button>
        </template>

        <template v-else>
          <router-link to="/login" class="hover:text-blue-200 nav-item"
            >Logowanie</router-link
          >
          <router-link to="/register" class="hover:text-blue-200 nav-item"
            >Rejestracja</router-link
          >
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "NavBar",
  computed: {
    ...mapGetters("auth", ["isAuthenticated", "userPermission"]),
    ...mapGetters("cart", ["totalItems"]),
    isAdmin() {
      const permission = this.userPermission;
      return permission >= 2;
    },
  },
  methods: {
    ...mapActions("auth", ["logout"]),
    handleLogout() {
      this.logout();
      this.$router.push("/login");
    },
  },
};
</script>
