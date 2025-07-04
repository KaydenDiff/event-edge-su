import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import Tournaments from '../views/Tournaments.vue';
import TournamentDetails from '../views/TournamentDetails.vue';
import MyTournaments from '../views/MyTournaments.vue';
import MyMatches from '../views/MyMatches.vue';
import Profile from '../views/Profile.vue';
import Notifications from '../views/Notifications.vue';
import AdminPanel from '../views/AdminPanel.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import AdminTournaments from '../views/AdminTournaments.vue';
import TournamentBracket from '../views/TournamentBracket.vue';
import RegisterTournament from '@/views/RegisterTournament.vue';
import EditTournament from '../views/EditTournament.vue'; 
import EditProfilePage from '@/views/EditProfilePage.vue';
import OrganizerDashboard from '@/views/OrganizerDashboard.vue';
import ProfilePlayer from '@/views/ProfilePlayer.vue';
import TournamentBasketAdmin from '@/components/TournamentBasketAdmin.vue';
import MatchResult from '@/components/MatchResult.vue';
import EditMatch from '@/components/EditMatch.vue';
import HelpView from '@/views/Help.vue';
import AccessDenied from '@/views/AccessDenied.vue';
import NotFound from '@/views/NotFound.vue';
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/help', name: 'help', component: HelpView },
  { path: '/tournaments', component: Tournaments },
  {
    path: '/tournaments/:id',
    name: 'TournamentDetails',
    component: TournamentDetails,
    props: true
  },
  {
    path: '/edit-match/:id',
    name: 'EditMatch',
    component: EditMatch,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/match-result/:matchId',
    name: 'MatchResult',
    component: MatchResult,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-tournament/:id',
    name: 'EditTournament',
    component: EditTournament,
    props: true,
    meta: { requiresAuth: true }
  },
  { 
    path: '/my-tournaments', 
    component: MyTournaments,
    meta: { requiresAuth: true }
  },
  { 
    path: '/my-matches', 
    component: MyMatches,
    meta: { requiresAuth: true }
  },
  { 
    path: '/profile', 
    component: Profile,
    meta: { requiresAuth: true }
  },
  { 
    path: '/profile/:id',    
    name: 'profile-player', 
    component: ProfilePlayer,    
    props: true 
  },
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: EditProfilePage,
    meta: { requiresAuth: true }
  },
  { 
    path: '/notifications', 
    component: Notifications,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/organize-tournament',
    name: 'organize-tournament',
    component: OrganizerDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/tournaments',
    name: 'AdminTournaments',
    component: AdminTournaments,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/login',  
    name: 'login',
    component: Login,
    meta: { requiresGuest: true }
  },
  { 
    path: '/register',
    name: 'register', 
    component: Register, 
    props: true,
    meta: { requiresGuest: true }
  },
  { 
    path: '/register-tournament/:tournamentId/:tournamentName',
    name: 'RegisterTournament',
    component: RegisterTournament, 
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/tournament-bracket',
    name: 'TournamentBracket',
    component: TournamentBracket
  },
  {
    path: '/tournament-bracket-admin',
    name: 'TournamentBasketAdmin',
    component: TournamentBasketAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/access-denied',
    name: 'access-denied',
    component: AccessDenied
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Глобальный защитник маршрутов
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Проверяем, требуется ли аутентификация
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
   
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }
  
  // Проверяем, требуется ли роль администратора
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    console.log(authStore)
    next({ name: 'access-denied' });
    return;
  }
  
  // Проверяем, требуется ли быть гостем (для страниц логина и регистрации)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'home' });
    return;
  }
  
  next();
});

export default router; 