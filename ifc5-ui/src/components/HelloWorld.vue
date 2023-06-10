<script setup lang="ts">
import * as THREE from "three";
import { ref, onMounted } from 'vue'

const props = defineProps({
  msg: String
})

let name = props.msg;

onMounted(() => {
  //@ts-ignore
  let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  if (!props.msg) return;

  let canvas = document.getElementById(props.msg);

  if (canvas)
  {
      let camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 10000);
      camera.position.z = 250;
      camera.position.y = 250;
      let scene = new THREE.Scene();
      camera.lookAt(scene.position);
      const gridHelper = new THREE.GridHelper(1000, 5);
      scene.add(gridHelper);

      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      canvas.appendChild(renderer.domElement);

      function animate()
      {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
      }

      animate();
  }
})

</script>

<template>
  <div class="canvasdiv" :id="name"></div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

.canvasdiv {
  height: 100%;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
