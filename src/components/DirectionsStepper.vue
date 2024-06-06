<script setup lang="ts">
import { ref, computed } from "vue";

import Panel from "primevue/panel";
import Button from "primevue/button";
import Stepper from "primevue/stepper";
import StepperPanel from "primevue/stepperpanel";

import type { ORSOptimizationResponse } from "../services/ors";

const activeStep = ref(0);
const props = defineProps<{ optimization: ORSOptimizationResponse }>();

const optimizationSteps = computed(() => {
  if (props.optimization == null) {
    return [];
  }
  return props.optimization.routes[0].steps.filter((s) => s.type === "job");
});

function getGoogleMapsLink(coordinates: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/place/${coordinates.lat},${coordinates.lng}`;
}

function getRouteStepIcon(
  active: boolean,
  index: number,
  activeStep: number,
): string {
  if (active) {
    return "pi pi-truck";
  }

  if (index < activeStep) {
    return "pi pi-check-circle";
  }

  return "pi pi-clock";
}
</script>

<template>
  <!-- Directions Panel -->
  <Panel header="Directions">
    <!-- List of directions goes here -->
    <Stepper orientation="vertical" v-model:active-step="activeStep">
      <StepperPanel v-for="step in optimizationSteps" :key="step.id">
        <template #header="{ index, active, clickCallback }">
          <Button
            :icon="getRouteStepIcon(active, index, activeStep)"
            :outlined="index >= activeStep"
            rounded
            aria-label="Step"
            @click="clickCallback"
          />
          <span class="font-medium ml-2">#{{ step.job }}</span>
        </template>
        <template #content="{ index, nextCallback }">
          <div class="flex gap-2 items-center">
            <a
              :href="
                getGoogleMapsLink({
                  lng: step.location[0],
                  lat: step.location[1],
                })
              "
              target="_blank"
              rel="noopener noreferrer"
              class="text-xl text-surface-400 hover:text-primary-500"
            >
              <i class="pi pi-map-marker" />
            </a>
            <div class="flex flex-col">
              <span class="text-surface-700"> {{ step.description }} </span>
              <span class="text-surface-500">
                {{ Math.floor(step.arrival / 60) }}m
              </span>
            </div>
          </div>
          <div class="flex py-4 gap-2">
            <Button
              v-show="index != optimizationSteps.length - 1"
              label="Next"
              @click="nextCallback"
            />
          </div>
        </template>
      </StepperPanel>
    </Stepper>
  </Panel>
</template>
