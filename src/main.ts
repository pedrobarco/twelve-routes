import { createApp } from "vue";
import PrimeVue from "primevue/config";
import "./style.css";
import "primeicons/primeicons.css";
import App from "./App.vue";
import Lara from "./presets/lara";

const app = createApp(App);
app.use(PrimeVue, {
  unstyled: true,
  pt: Lara,
});
app.mount("#app");
