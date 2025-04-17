<template>
  <footer class="footer">
    <div class="footer-content">
      <p>&copy; {{ currentYear }} AptekaApp. Wszelkie prawa zastrzeżone.</p>
      <ul class="footer-links">
        <li><router-link to="/About">O nas</router-link></li>
        <li><router-link to="/Kontakt">Kontakt</router-link></li>
      </ul>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.footer {
  background-color: var(--color-blue-600);
  color: white;
  padding: 1rem 0;
  font-size: 0.9rem;
  background-color: #18795b;
}

.footer-content {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 0.5rem;
  margin: 0, auto;
}

.footer-links {
  list-style: none;
  display: flex;
  gap: 1rem;
  padding: 0;
  margin: 0;
}

.footer-links a {
  color: white;
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}
</style>
