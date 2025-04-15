import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/main.css";

// Create the Vue application
const app = createApp(App);

// Use the router and store
app.use(router);
app.use(store);

// Mount the application
app.mount("#app");
