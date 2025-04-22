<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <section class="max-w-6xl mx-auto px-6 py-12">
      <h1 class="text-4xl font-bold text-center mb-8 animate-fade-in">O nas</h1>

      <div class="grid md:grid-cols-2 gap-12 items-center">
        <!-- Obrazek -->
        <div>
          <img
            :src="zespolImg"
            alt="Zespół"
            class="max-w-md rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in"
          />
        </div>

        <!-- Tekst -->
        <div class="space-y-4 animate-fade-in-up delay-100">
          <h2 class="text-2xl font-semibold">Kim jesteśmy?</h2>
          <p class="text-lg leading-relaxed">
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

      <!-- Karty -->
      <div class="mt-16 grid md:grid-cols-3 gap-8 text-center">
        <div
          class="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition animate-fade-in-up delay-150"
        >
          <h3 class="text-xl font-bold mb-2">Zaufanie</h3>
          <p class="text-gray-600">
            Setki zadowolonych pacjentów każdego dnia.
          </p>
        </div>

        <div
          class="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition animate-fade-in-up delay-300"
        >
          <h3 class="text-xl font-bold mb-2">Wiedza</h3>
          <p class="text-gray-600">
            Zespół wykwalifikowanych farmaceutów i doradców.
          </p>
        </div>

        <div
          class="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition animate-fade-in-up delay-500"
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
import zespolImg from "./assets/zespol_onas.jpg";
</script>

<style scoped>
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
  opacity: 0;
}
</style>
