import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import AiAgent from "./components/AiAgent.vue"; // Import our AI agent component
import "./assets/main.css";

// Create the Vue application
const app = createApp(App);

// Register the AI Agent component globally
app.component("AiAgent", AiAgent);

// Use the router and store
app.use(router);
app.use(store);

// Mount the application
app.mount("#app");
