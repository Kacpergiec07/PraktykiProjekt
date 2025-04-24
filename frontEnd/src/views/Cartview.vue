<template>
    <div class="container mx-auto px-4 py-8">
      <Cart />
    </div>
  </template>
  
  <script>
  import Cart from "../components/Cart.vue";
  
  export default {
    name: "CartView",
    components: {
      Cart,
    },
  };
  </script>