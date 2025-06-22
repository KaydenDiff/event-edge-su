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
import Teams from '@/views/Teams.vue';
import { useAuthStore } from '@/stores/auth'
import NotificationsPage from '@/views/Notifications.vue'
import NewsFeeds from '@/views/NewsFeeds.vue';
import TeamsRequestTournament from '@/views/TeamsRequestTournament.vue';
import NewsDetails from '@/views/NewsDetails.vue';
import TeamDetails from '@/views/TeamDetails.vue'
import CreateTeamPage from '@/views/CreateTeamPage.vue';
const routes = [
  { path: '/', name: 'home', component: HomeView,  meta: { title: 'Главная' } },
  { path: '/help', name: 'help', component: HelpView,meta: { title: 'Помощь' }  },
  { path: '/tournaments', component: Tournaments,meta: { title: 'Список турниров' }  },
  { path: '/teams', name: 'teams', component: Teams,meta: { title: 'Список команд' } },
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
    path: '/team/:id', 
    name: 'TeamDetails',
    component: TeamDetails
  },
 {
  path: '/create-team/:userId',
  name: 'CreateTeamPage',
  component: CreateTeamPage,
  props: true,
  meta: { requiresAuth: true, title: 'Создание команды' }
},
  {
    path: '/tournament/:id/requests',
    name: 'TeamsRequestTournament',
    component: TeamsRequestTournament,
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
    meta: { requiresAuth: true },
    meta: { title: 'Мой профиль' }
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
    meta: { requiresAuth: true },
    meta: { title: 'Редактирование профиля' }
  },
  { 
    path: '/notifications', 
    component: NotificationsPage,
    meta: { requiresAuth: true },
    meta: { title: 'Список уведомлений' }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true },
    meta: { title: 'Функционал администратора' }
  },
  {
    path: '/organize-tournament',
    name: 'organize-tournament',
    component: OrganizerDashboard,
    meta: { requiresAuth: true }
  },
  
  {
    path: '/news-feeds',
    name: 'NewsFeeds',
    component: NewsFeeds,
    meta: { title: 'Список новостей' }
  },
  {
    path: '/news/:slug',
    name: 'NewsDetails',
    component: NewsDetails,
    props: true
  },

  { 
    path: '/login',  
    name: 'login',
    component: Login,
    meta: { requiresGuest: true },
    meta: { title: 'Авторизация' }
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
    component: AccessDenied,
    meta: { title: 'Доступ запрещен' }

  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: { title: 'Страница не найдена' }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Глобальный защитник маршрутов
router.beforeEach((to, from, next) => {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = userData.token;
  const isAdmin = userData.role === 'Администратор';
  document.title = to.meta.title || 'Event-Edge';
  // Проверка для страниц, требующих авторизации
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  // Проверка для страниц, требующих прав администратора
  if (to.meta.requiresAdmin && !isAdmin) {
    next({ name: 'access-denied' });
    return;
  }

  // Проверка для страниц, доступных только гостям (например, логин)
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'home' });
    return;
  }

  next();
});

export default router; 