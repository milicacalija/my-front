//Vue reactive state, da bi se promena odmah odrazila u celom app-u, jer local storage ne vidi promenu
import Vue from 'vue';

export const globalReactive = Vue.observable({
  isLoggedIn: !!localStorage.getItem('token'),
  userLevel: Number(localStorage.getItem('userLevel')) || 1
});
