<template>
  <div ref="container" class="w-full h-full"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';

export default {
  name: 'ThreeBackground',
  setup() {
    const container = ref(null);
    const mousePosition = ref({ x: 0, y: 0 });
    
    let scene, camera, renderer;
    let pills = [];
    let animationFrameId = null;

    // Funkcja tworząca kształt tabletki
    const createPillShape = (position, color, pillType) => {
      let group = new THREE.Group();
      group.position.set(position.x, position.y, position.z);
      
      let mesh;
      
      switch(pillType) {
        case 'round':
          const roundGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32);
          const roundMaterial = new THREE.MeshStandardMaterial({ 
            color: color, 
            roughness: 0.3, 
            metalness: 0.1 
          });
          mesh = new THREE.Mesh(roundGeometry, roundMaterial);
          group.add(mesh);
          break;
          
        case 'capsule':
          const capsuleGeometry = new THREE.CapsuleGeometry(0.25, 0.6, 16, 16);
          const capsuleMaterial = new THREE.MeshStandardMaterial({ 
            color: color, 
            roughness: 0.2, 
            metalness: 0.1 
          });
          mesh = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
          group.add(mesh);
          
          // Linia podziału na kapsułce
          const torusGeometry = new THREE.TorusGeometry(0.25, 0.01, 16, 32);
          const torusMaterial = new THREE.MeshStandardMaterial({ color: 'white' });
          const torus = new THREE.Mesh(torusGeometry, torusMaterial);
          torus.rotation.x = Math.PI / 2;
          group.add(torus);
          break;
          
        case 'oval':
          const ovalGeometry = new THREE.SphereGeometry(0.4, 32, 32);
          const ovalMaterial = new THREE.MeshStandardMaterial({ 
            color: color, 
            roughness: 0.3, 
            metalness: 0.1 
          });
          mesh = new THREE.Mesh(ovalGeometry, ovalMaterial);
          mesh.scale.set(1, 1, 0.4);
          group.add(mesh);
          break;
          
        case 'diamond':
          const diamondGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 4);
          const diamondMaterial = new THREE.MeshStandardMaterial({ 
            color: color, 
            roughness: 0.3, 
            metalness: 0.1 
          });
          mesh = new THREE.Mesh(diamondGeometry, diamondMaterial);
          mesh.rotation.set(Math.PI / 2, 0, Math.PI / 4);
          group.add(mesh);
          break;
      }
      
      // Dodanie informacji o tabletce do obiektu
      const pill = {
        group,
        initialPosition: new THREE.Vector3().copy(position),
        floatSpeed: 1 + Math.random() * 0.5,
        floatIntensity: 0.2 + Math.random() * 0.1,
        time: Math.random() * 100
      };
      
      scene.add(group);
      pills.push(pill);
    };

    const handleMouseMove = (event) => {
      // Normalizacja współrzędnych myszy do zakresu -1 do 1
      mousePosition.value = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      };
    };

    const handleResize = () => {
      if (!camera || !renderer || !container.value) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Aktualizacja wszystkich tabletek
      pills.forEach(pill => {
        // Animacja unoszenia się
        pill.time += 0.01;
        pill.group.position.y = pill.initialPosition.y + 
          Math.sin(pill.time * pill.floatSpeed) * pill.floatIntensity;
        
        // Obracanie w kierunku kursora
        if (mousePosition.value) {
          // Tworzenie pozycji docelowej na podstawie współrzędnych myszy
          const target = new THREE.Vector3(
            mousePosition.value.x * 5, 
            mousePosition.value.y * 5, 
            0
          );
          
          // Tworzenie wektora kierunku od obiektu do kursora
          const direction = new THREE.Vector3();
          direction.subVectors(target, pill.group.position).normalize();
          
          // Obliczanie pozycji do patrzenia
          const lookAtPosition = new THREE.Vector3().addVectors(pill.group.position, direction);
          
          // Płynne obracanie obiektu w kierunku kursora
          const currentRotation = new THREE.Quaternion().copy(pill.group.quaternion);
          const targetRotation = new THREE.Quaternion();
          pill.group.lookAt(lookAtPosition);
          targetRotation.copy(pill.group.quaternion);
          pill.group.quaternion.copy(currentRotation);
          pill.group.quaternion.slerp(targetRotation, 0.05);
        }
      });
      
      // Renderowanie sceny
      renderer.render(scene, camera);
    };

    const initThree = () => {
      if (!container.value) return;
      
      // Tworzenie sceny
      scene = new THREE.Scene();
      scene.background = new THREE.Color('#f1f1f1');
      
      // Tworzenie kamery
      camera = new THREE.PerspectiveCamera(
        60, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
      );
      camera.position.z = 4;
      
      // Tworzenie renderera
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.value.appendChild(renderer.domElement);
      
      // Dodawanie świateł
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);
      
      // Dodawanie tabletek
      const pillsData = [
      ...Array.from({ length: 100 }, () => {
    const randomX = Math.random() * 10 - 5;
    const randomY = Math.random() * 4 - 2;
    const randomZ = Math.random() * -2 + -0.5;
    const colors = ["#ff6b6b", "#4ecdc4", "#ffbe0b", "#8a2be2", "#3a86ff", "#fb5607", "#06d6a0", "#ff9f1c", "#2ec4b6", "#e71d36", "#ff70a6", "#70d6ff", "#ffd670", "#e9ff70", "#a1ff70", "#70ffa3", "#bc70ff", "#ff70e9", "#ff7070", "#ffffff", "#cccccc"];
    const types = ["round", "capsule", "oval", "diamond"];
    return {
      position: new THREE.Vector3(randomX, randomY, randomZ),
      color: colors[Math.floor(Math.random() * colors.length)],
      pillType: types[Math.floor(Math.random() * types.length)],
    };
  }),
      ];
      
      pillsData.forEach(data => {
        createPillShape(data.position, data.color, data.pillType);
      });
      
      // Uruchomienie pętli animacji
      animate();
    };

    onMounted(() => {
      initThree();
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('resize', handleResize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Czyszczenie zasobów Three.js
      if (renderer && container.value) {
        container.value.removeChild(renderer.domElement);
      }
      
      pills.forEach(pill => {
        if (pill.group) {
          pill.group.traverse((child) => {
            if (child.isMesh) {
              child.geometry.dispose();
              child.material.dispose();
            }
          });
          scene.remove(pill.group);
        }
      });
      
      pills = [];
      scene = null;
      camera = null;
      renderer = null;
    });

    return {
      container
    };
  }
}
</script>

<style scoped>
.w-full {
  width: 100%;
}
.h-full {
  height: 100%;
}
</style>