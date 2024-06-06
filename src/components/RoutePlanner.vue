<script setup lang="ts">
import { ref, computed, defineProps, defineModel, onMounted } from "vue";

import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Checkbox from "primevue/checkbox";
import FileUpload, { FileUploadUploaderEvent } from "primevue/fileupload";
import Button from "primevue/button";

import { optimizeRoute } from "../services/ors";
import type { ORSOptimizationResponse } from "../services/ors";

interface DeliveryLocation {
  id: number;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  open: {
    from: string;
    to: string;
  };
  include: boolean;
}

const DEPOT_LOCATION_ID = 0;
const OPTIMIZATION_KEY = "optimization";

const props = defineProps<{ apiKey: string }>();
const deliveryLocations = ref<DeliveryLocation[]>([]);
const optimization = defineModel<ORSOptimizationResponse>();

const depotLocation = computed(() => {
  return deliveryLocations.value.find(isDepot);
});

const availableDeliveryLocations = computed(() => {
  return deliveryLocations.value.filter((l) => !isDepot(l));
});

const includedDeliveryLocations = computed(() => {
  return availableDeliveryLocations.value.filter((l) => l.include);
});

const isRoutePlanningAvailable = computed(() => {
  return (
    props.apiKey.length > 0 &&
    depotLocation.value !== undefined &&
    includedDeliveryLocations.value.length > 0
  );
});

onMounted(() => {
  const item = localStorage.getItem(OPTIMIZATION_KEY);
  if (item != null) {
    optimization.value = JSON.parse(item);
  }
});

function isDepot(location: { id: number }): boolean {
  return location.id === DEPOT_LOCATION_ID;
}

async function onFileUpload(event: FileUploadUploaderEvent): Promise<void> {
  const csv = Array.isArray(event.files) ? event.files[0] : event.files;
  const data = await csv.text();
  const locations: DeliveryLocation[] = data
    .split("\n")
    .slice(1)
    .map((line) => {
      const [id, name, lat, lng, openFrom, openTo] = line.split(",");
      return {
        id: parseInt(id),
        name,
        coordinates: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
        open: {
          from: openFrom,
          to: openTo,
        },
        include: false,
      };
    })
    .filter((l) => !isNaN(l.id) && l.name.length > 0);
  deliveryLocations.value = locations;
}

async function findRoute(): Promise<void> {
  if (!isRoutePlanningAvailable.value) {
    return;
  }

  const depot = depotLocation.value!;

  try {
    const resp = await optimizeRoute(props.apiKey, {
      vehicles: [
        {
          id: depot.id,
          profile: "driving-hgv",
          start: [depot.coordinates.lng, depot.coordinates.lat],
          end: [depot.coordinates.lng, depot.coordinates.lat],
        },
      ],
      jobs: includedDeliveryLocations.value.map((l) => ({
        id: l.id,
        description: l.name,
        location: [l.coordinates.lng, l.coordinates.lat],
      })),
    });
    optimization.value = resp;
    localStorage.setItem(OPTIMIZATION_KEY, JSON.stringify(resp));
  } catch (error) {
    console.error(error);
  }
}

function getGoogleMapsLink(coordinates: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/place/${coordinates.lat},${coordinates.lng}`;
}
</script>

<template>
  <Panel header="Route Planner">
    <DataTable
      paginator
      :rows="10"
      :value="availableDeliveryLocations"
      tableStyle="min-width: 50rem"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-lg font-bold">Delivery Locations</span>
          <FileUpload
            mode="basic"
            accept=".csv"
            choose-label="Import CSV"
            auto
            custom-upload
            @uploader="onFileUpload"
            :maxFileSize="1000000"
          />
        </div>
      </template>
      <Column header="ID" field="id" />
      <Column header="Name" field="name">
        <template #body="slotProps">
          <div class="flex gap-2">
            <a
              :href="
                getGoogleMapsLink({
                  lat: slotProps.data.coordinates.lat,
                  lng: slotProps.data.coordinates.lng,
                })
              "
              target="_blank"
              rel="noopener noreferrer"
              class="text-surface-400 hover:text-primary-500"
            >
              <i class="pi pi-map-marker" />
            </a>
            <span>
              {{ slotProps.data.name }}
            </span>
          </div>
        </template>
      </Column>
      <Column header="Delivery Window" field="open">
        <template #body="slotProps">
          {{ slotProps.data.open.from }} - {{ slotProps.data.open.to }}
        </template>
      </Column>
      <Column header="Include" field="include">
        <template #body="slotProps">
          <Checkbox v-model="slotProps.data.include" :binary="true" />
        </template>
      </Column>
    </DataTable>

    <div class="flex flex-wrap items-center justify-between gap-2">
      <div v-if="depotLocation" class="flex p-4 gap-3 items-center">
        <a
          :href="`https://www.google.com/maps/place/${depotLocation.coordinates.lat},${depotLocation.coordinates.lng}`"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xl font-bold text-primary-500 hover:text-primary-600 mb-2"
        >
          <i class="pi pi-truck" />
        </a>
        <div class="flex flex-col">
          <span class="text-lg font-medium"> Depot </span>
          <span class="text-surface-500">{{ depotLocation.name }} </span>
        </div>
      </div>
      <Button
        :disabled="!isRoutePlanningAvailable"
        label="Find Route"
        @click="findRoute"
      />
    </div>
  </Panel>
</template>
