<template>
  <nav class="text-white p-4 bg-mint">
    <div class="container mx-auto flex justify-between items-center">
      <router-link to="/" class="text-xl font-bold logo_txt font-primary"
        >API Apteka</router-link
      >

      <div class="flex space-x-4">
        <router-link to="/drugs" class="nav-item">Leki</router-link>

        <!-- Authenticated user links -->
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

        <!-- Non-authenticated user links -->
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
// czarny motyw test bartek

//

import { mapGetters, mapActions } from "vuex";

export default {
  name: "NavBar",
  computed: {
    ...mapGetters("auth", ["isAuthenticated", "userPermission"]),
    isAdmin() {
      // Get permission as a number from store getter
      const permission = this.userPermission;
      return permission >= 2; // Assuming 2 is pharmacist and 3 is admin
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
