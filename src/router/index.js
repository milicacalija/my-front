import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
//Ako želiš da se odmah otvara http://localhost:8080/, samo izbaci redirect i ostavi path: '/':
import AdminView from '@/views/AdminView.vue'
import KompanijeView from'../views/KompanijeView.vue'
import ProizvodiView from '../views/ProizvodiView.vue'
import SpecifikacijeView from '../views/SpecifikacijeView.vue' 
import KontaktView from '../views/KontaktView.vue'
import KorpaView from '../views/KorpaView.vue'
import UlogujView from '../views/UlogujView.vue'
import NalogView from '../views/NalogView.vue'
import ProfilView from '../views/ProfilView.vue'
import NarudzbeniceView from '../views/NarudzbeniceView.vue' 
import NastkupovineView from '../views/NastkupovineView.vue' 
import PaymentFormView from '../views/PaymentFormView.vue'  
import PiktogramiView from '../views/PiktogramiView.vue'
import PrimenaView from '../views/PrimenaView.vue'
import ProizvodOpisView from '@/views/ProizvodOpisView.vue'
import BonusView from '@/views/BonusView.vue'
import PorukeView from '@/views/PorukeView.vue'
import Swal from 'sweetalert2'
import TabelaProizvodaView from '../views/TabelaProizvodaView.vue'





Vue.use(VueRouter)




const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
   {
    path: '/home',
  name: 'HomeAlt',
  component: HomeView
  },

{
  //Zastita, da ne moze bilo ko uci na admin stranicu, cak ni preko url, beforeEnter guard mora koristiti next({ path: ... }) da izbegne ciklični redirect.Redirekt sa profila mora prvo da proveri token i usr_level pre push.Ovo će sprečiti grešku Redirected when going from ... via a navigation guard.
  
  path: '/admin',
  name: 'admin',
  component: AdminView,
  beforeEnter: (to, from, next) => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Nije logovan → redirect na login
      return next({ path: '/uloguj' });
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      if (payload.usr_level !== 0) {
        // Nije admin → redirect na home
        return next({ path: '/home' });
      }

      

      next(); // sve ok
    } catch (err) {
      return next({ path: '/uloguj' }); // invalid token
    }
  }
},


  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/kompanije',
    name: 'kompanije',
    component: KompanijeView
  },
 
 
{
  /*Ovde stvaramo rutu koju zaelimo izmeniti*/
  path: '/proizvodi',
  name: 'proizvodi',
  component: ProizvodiView
  /*Sad treba impotrovati KompanijaView, to cemo u index.js, posle svih import*/
},
{
  /*Ovde stvaramo rutu koju zaelimo izmeniti*/
  path: '/tabelaproizvoda',
  name: 'tabelaproizvoda',
  component: TabelaProizvodaView
  /*Sad treba impotrovati KompanijaView, to cemo u index.js, posle svih import*/
},





//Da ne bi imali 200 novih stranica kad se otvara naziv proiuvoda mozemo da generisemo po id, tako svaki put otvara novu specifikaciju za proizvod*/

  {

    path: '/specifikacije',
      name: 'specifikacije',
      component: SpecifikacijeView
    
  },
  
  
{

  
  path: '/kontakt',
  name: 'kontakt',
  component: KontaktView
},
{
  path: '/korpa',
      name: 'Korpa',
      component: KorpaView,
      props: route => ({ cartItems: JSON.parse(route.query.cartItems) })
},

{
  path: '/uloguj',
  name: 'uloguj',
  component: UlogujView
},
{
  path: '/nalog',
  name: 'nalog',
  component: NalogView
},
{
  path: '/profil',
  name: 'profil',
  component: ProfilView
},

{
  path: '/Narudzbenice',
  name: 'Narudzbenice',
  component: NarudzbeniceView
},
{
  path: '/Nastkupovine',
  name: 'Nastkupovine',
  component: NastkupovineView
},
{
  path: '/PaymentForm',
  name: 'PaymentForm',
  component: PaymentFormView
},


{
  path: '/Piktogrami',
  name: 'Piktogrami',
  component: PiktogramiView
},
{
  path: '/Bonus',
  name: 'Bonus',
  component: BonusView
},
{
  path: '/poruke',
  name: 'poruke',
  component: PorukeView
},


{
  path: '/Primena',
  name: 'Primena',
  component: PrimenaView
},
{
  path: '/TabelaProizvoda',
  name: 'TabelaProizvoda',
  component: TabelaProizvodaView
},
{
  //views → stranice / rute,components → manje, višekratne komponente koje se koriste unutar stranica, te stvari ne smeju se kombinovati
  path: '/proizvod/:id',
      name: 'ProizvodOpis',
      component: ProizvodOpisView,   // koristi promenljivu iz import-a
      props: route => ({ proizvodId: route.params.id })
}




]

  const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
}

)
//to SweetAlert2 (Swal.fire) renderuje modal u istom tick-u kada router već pokušava da izvrši navigaciju, pa se Vue Router guard opet aktivira pre nego što se modal zatvori. To stvara beskonačnu petlju., Moramo odvojiti alert od navigacije tako da alert završi svoj .then() pre nego što Vue Router pokuša next(...).
//Samo admin ima pristup stranicama
const adminPages = ['/bonus','/poruke','/admin', '/kompanije', '/predlozi'];
/* 🔒 Global guard za admin stranice */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  // Ako ruta NIJE admin ruta → slobodno pusti
  const needsAdmin = adminPages.some(page => to.path.startsWith(page));
  if (!needsAdmin) {
    return next();
  }

  // Za admin rute → mora postojati token
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Pristup odbijen',
      text: 'Morate biti prijavljeni da pristupite ovoj stranici'
    }).then(() => {
      next({ path: '/uloguj' });
    });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(atob(token.split('.')[1]));
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Token nevažeći',
      text: 'Molimo prijavite se ponovo'
    }).then(() => {
      next({ path: '/uloguj' });
    });
    return;
  }

  // Ako nije admin → redirect
  if (payload.usr_level !== 0) {
    Swal.fire({
      icon: 'error',
      title: 'Pristup odbijen',
      text: 'Nemate dozvolu da pristupite ovoj stranici'
    }).then(() => {
      next({ path: '/home' });
    });
    return;
  }
  

  next(); // admin → dozvoli
});
//!needsAdmin → sve javne rute prolaze odmah, bez tokena ili alert-a.Token i usr_level se proveravaju samo za adminPages.Home stranica i login stranica su sada pristupačne svima.
export default router;