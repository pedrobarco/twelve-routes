<script setup lang="ts">
import Panel from "primevue/panel";

import type { ORSOptimizationResponse } from "./services/ors";

import Settings from "./components/Settings.vue";
import DirectionsStepper from "./components/DirectionsStepper.vue";
import RoutePlanner from "./components/RoutePlanner.vue";
import { ref } from "vue";

const apiKey = ref<string>("");
const optimization = ref<ORSOptimizationResponse>();
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex flex-col space-y-4">
      <!-- Settings -->
      <Settings v-model="apiKey" />

      <!-- Route Planner -->
      <RoutePlanner :apiKey="apiKey" v-model="optimization" />

      <!-- Map Panel -->
      <Panel v-if="optimization" header="Map">
        <!-- Map component goes here -->
      </Panel>

      <!-- Directions Panel -->
      <DirectionsStepper v-if="optimization" :optimization="optimization" />
    </div>
  </div>
</template>
