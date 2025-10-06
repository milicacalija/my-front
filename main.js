import Vue from 'vue'
import App from './App.vue'
import router from './router'
//Aha, sada je jasnije. Problem je u tome što samo provera tokena na inicijalizaciji aplikacije neće održati korisnika “ulogovanim” dinamički, posebno kad se rute menjaju ili kad se refreshuje stranica. Evo šta se dešava i kako to možeš popraviti:1️⃣ Problem trenutnog koda

// Reaktivni globalni store
export const store = Vue.observable({
  isLoggedIn: !!localStorage.getItem('token')
});

export const mutations = {
  login(token) {
    localStorage.setItem('token', token);
    store.isLoggedIn = true;
  },
  logout() {
    localStorage.removeItem('token');
    store.isLoggedIn = false;
  }
};

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');

