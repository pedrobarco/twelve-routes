<script setup lang="ts">
import Panel from "primevue/panel";
import Password from "primevue/password";

const apiKey = defineModel<string>();
</script>

<template>
  <Panel header="Settings">
    <Password placeholder="ORS API Key" v-model="apiKey" :feedback="false" />
  </Panel>
</template>
