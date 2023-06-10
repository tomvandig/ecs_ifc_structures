<script setup lang="ts">
import * as THREE from "three";
import { ref, onMounted } from 'vue'
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { CommitProposal, Component, Ledger } from "@/ifc5";

const props = defineProps({
  msg: String,
  boxColor: String,
  ledger: Ledger,
  entityID: Number
})

let name = props.msg;

onMounted(() => {
  //@ts-ignore
  let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  if (!props.msg) return;

  let canvas = document.getElementById(props.msg);

  if (canvas)
  {
      let camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 10000);
      camera.position.z = 500;
      camera.position.y = 500;
      let scene = new THREE.Scene();
      camera.lookAt(scene.position);
      const gridHelper = new THREE.GridHelper(500, 5);
      scene.add(gridHelper);

      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio( window.devicePixelRatio );
      canvas.appendChild(renderer.domElement);
      
				const geometry = new THREE.BoxGeometry(100, 100, 100 );
				const material = new THREE.MeshPhongMaterial( { color: props.boxColor });
				const mesh = new THREE.Mesh( geometry, material );


        if (props.msg === "arc")
        {
          mesh.position.set(200, 0, 0);
        }
        else
        {
          mesh.position.set(-200, 0, 0);
        }

				scene.add( mesh );

				const light = new THREE.DirectionalLight( 0xffffff, 2 );
				light.position.set( 1, 1, 1 );
				scene.add( light );
      
      let control = new TransformControls( camera, renderer.domElement );
      control.addEventListener( 'mouseUp', ()=>{
        let pos = mesh.position;  
        
        let proposal = new CommitProposal();
        proposal.message = `Moved object ${props.msg}`;
        proposal.paths = [
            {
                path: props.msg!,
                added: [],
                updated: [
                    new Component(props.entityID!, "position", {
                      x: pos.x,
                      y: pos.y
                    })],
                removed: []
            }
        ]
        props.ledger!.CommitProposal(proposal);
      } );
      control.showY = false;
				control.attach( mesh );
				scene.add( control );

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

.canvasdiv {
  height: 100%;
}

</style>
