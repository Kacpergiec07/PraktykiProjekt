<template>
  <nav class="text-white p-4 bg-mint">
    <div class="container mx-auto flex justify-between items-center">
      <router-link to="/" class="text-xl font-bold logo_txt font-primary"
        >API Apteka</router-link
      >

      <div class="flex space-x-4">
        <router-link to="/cart" class="relative hover:text-blue-200 nav-item">
          
          <img src="../assets/cart.png" alt="cart" class="w-6 h-6" />
          <span
            v-if="totalItems > 0"
            class="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] min-w-[1.25rem] h-5 px-1 rounded-full text-center leading-5 font-semibold transition-all animate-pop"
          >
          {{ totalItems }}
          </span>
          
          
        </router-link>
        <router-link to="/drugs" class="nav-item">Leki</router-link>

        <template v-if="isAuthenticated">
          <router-link to="/history" class="nav-item-admin"
            >Historia zamówień</router-link
          >
          <router-link v-if="isAdmin" to="/admin" class="nav-item-admin"
            >Panel administracyjny</router-link
          >
          <router-link to="/profile" class="nav-item-admin">Profil</router-link>
          <button
            @click="handleLogout"
            class="hover:text-red-500 hover:cursor-pointer"
          >
            Wyloguj
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
