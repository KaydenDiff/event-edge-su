import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    pastTeams: [],
    tournaments: [],
    currentTournament: null,
    loading: false,
    error: null
  }),
  actions: {
    async fetchUserProfile() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/api/my-profile');
        this.user = response.data.user;
        this.pastTeams = response.data.past_teams;
        this.tournaments = response.data.tournaments;
        this.currentTournament = response.data.current_tournament;
      } catch (error) {
        this.error = error;
        this.clearAuth();
        throw error;
      } finally {
        this.loading = false;
      }
    },
    clearAuth() {
      this.user = null;
      this.pastTeams = [];
      this.tournaments = [];
      this.currentTournament = null;
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    userName: (state) => state.user?.name || '',
    userEmail: (state) => state.user?.email || '',
    userTeam: (state) => state.user?.team?.name || 'Без команды'
  }
})
