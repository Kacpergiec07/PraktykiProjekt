import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/Homeview.vue";
import LoginView from "../views/Loginview.vue";
import RegisterView from "../views/Registerview.vue";
import ProfileView from "../views/Profileview.vue";
import DrugsView from "../views/Drugsview.vue";
import DrugDetailView from "../views/Drugdetailview.vue";
import OrderHistoryView from "../views/Orderhistoryview.vue";
import AdminView from "../views/AdminView.vue";
import About from "../components/About.vue";
import Kontakt from "../components/Kontakt.vue";
import { requireAuth, requireRole } from "../utils/authguard";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
    beforeEnter: requireAuth,
  },
  {
    path: "/drugs",
    name: "drugs",
    component: DrugsView,
  },
  {
    path: "/drugs/:id",
    name: "drug-detail",
    component: DrugDetailView,
    props: true,
  },
  {
    path: "/history",
    name: "order-history",
    component: OrderHistoryView,
    beforeEnter: requireAuth,
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminView,
    beforeEnter: requireRole(["ADMIN", "PHARMACIST"]),
  },
  {
    path: "/about",
    name: "about",
    component: About,
  },
  {
    path: "/kontakt",
    name: "kontakt",
    component: Kontakt,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
