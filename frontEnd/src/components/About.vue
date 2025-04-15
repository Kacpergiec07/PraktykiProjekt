<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <section class="max-w-6xl mx-auto px-6 py-12">
      <h1 class="text-4xl font-bold text-center mb-8">O nas</h1>

      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img src="C:\Users\brode\OneDrive\Pulpit\PraktykiProjekt\frontEnd\src\assets\zespol_onas.jpg" alt="Zespół apteki" class="rounded-2xl shadow-lg" />
        </div>

        <div>
          <h2 class="text-2xl font-semibold mb-4">Kim jesteśmy?</h2>
          <p class="text-lg mb-4 leading-relaxed">
            Jesteśmy zespołem pasjonatów farmacji i nowoczesnych technologii,
            którzy wierzą, że dostęp do leków i informacji zdrowotnych powinien
            być szybki, łatwy i bezpieczny.
          </p>
          <p class="text-lg leading-relaxed">
            Nasza apteka online powstała z myślą o pacjentach – oferujemy nie
            tylko leki i suplementy, ale również fachowe doradztwo oraz
            intuicyjny system zamówień.
          </p>
        </div>
      </div>

      <div class="mt-16 grid md:grid-cols-3 gap-8 text-center">
        <div
          class="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
        >
          <h3 class="text-xl font-bold mb-2">Zaufanie</h3>
          <p class="text-gray-600">
            Setki zadowolonych pacjentów każdego dnia.
          </p>
        </div>

        <div
          class="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
        >
          <h3 class="text-xl font-bold mb-2">Wiedza</h3>
          <p class="text-gray-600">
            Zespół wykwalifikowanych farmaceutów i doradców.
          </p>
        </div>

        <div
          class="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
        >
          <h3 class="text-xl font-bold mb-2">Technologia</h3>
          <p class="text-gray-600">
            Nowoczesna platforma online z szyfrowaniem danych.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Nie potrzebujemy JS do statycznego widoku, ale możesz tu dodać meta dane lub dane z API
</script>

<style scoped>
/* Możesz dodać dodatkowe efekty animacji, jeśli chcesz */
</style>
