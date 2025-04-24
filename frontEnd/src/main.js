import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import AiAgent from "./components/AiAgent.vue"; // Import our AI agent component
import "./assets/main.css";

const app = createApp(App);

<<<<<<< HEAD
// Register the AI Agent component globally
app.component("AiAgent", AiAgent);

// Use the router and store
=======
>>>>>>> 0cf7bfdb860e86d0be3a215a54c9964458bed94f
app.use(router);
app.use(store);

app.mount("#app");
