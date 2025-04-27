import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import AiAgent from "./components/AiAgent.vue";
import "./assets/main.css";

const app = createApp(App);

app.component("AiAgent", AiAgent);

app.use(router);
app.use(store);

app.mount("#app");
