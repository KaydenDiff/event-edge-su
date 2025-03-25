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
const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/tournaments', component: Tournaments },
  {
    path: '/tournaments/:id',
    name: 'TournamentDetails',
    component: TournamentDetails,
    props: true
  },
  {
    path: '/match-result/:matchId',
    name: 'MatchResult',
    component: MatchResult,
    props: true,  // Позволяет передавать параметры как props
  },
  {
    path: '/edit-tournament/:id',
    name: 'EditTournament',
    component: EditTournament,
    props: true,
  },
  { path: '/my-tournaments', component: MyTournaments },
  { path: '/my-matches', component: MyMatches },
  { path: '/profile', component: Profile },
  { path: '/profile/:id',    name: 'profile-player', component: ProfilePlayer,    props: true },
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: EditProfilePage
  },
  { path: '/notifications', component: Notifications },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel
  },
  {
    path: '/organize-tournament',
    name: 'organize-tournament',
    component: OrganizerDashboard
  },
  {
    path: '/admin/tournaments',
    name: 'AdminTournaments',
    component: AdminTournaments
  },
  { path: '/login',  name: 'login',component: Login },
  { path: '/register', component: Register },
  { path: '/registertournament',
    name: 'registertournament',
     component: RegisterTournament },
  {
    path: '/tournament-bracket',
    name: 'TournamentBracket',
    component: TournamentBracket
  },
  {
    path: '/tournament-bracket-admin',
    name: 'TournamentBasketAdmin',
    component: TournamentBasketAdmin
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;  // Это важно! Экспортируем роутер по умолчанию.