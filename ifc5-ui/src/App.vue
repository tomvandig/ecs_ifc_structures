<script setup lang="ts">
import Editor from './components/editor.vue'
import Floorplan from './components/floorplan.vue'
import { ARC_LEDGER, MEP_LEDGER } from './ledgers';
</script>

<template>
  <div class="container">
    <div class="left_column">
      <div class="block">
        <Editor msg="arc" boxColor="green" :ledger="ARC_LEDGER" :entityID="0" />
      </div>
      <div class="block">
        <Editor msg="mep" boxColor="cyan" :ledger="MEP_LEDGER" :entityID="1"/>
      </div>
    </div>
    <div class="right_column">
      <div class="block">
        <Floorplan/>
      </div>
      <div class="block">
      </div>
    </div>
  </div>
</template>

<style scoped>

.container {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  height: 100%;
}

.left_column {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 50%;
}

.right_column {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 50%;
}

.block
{
  flex-grow: 1;
  height: 50%;
  border: 1px lightgray solid;
}

</style>
