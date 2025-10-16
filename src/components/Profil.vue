<template>
  <!--U Vue 2, komponente moraju biti importovane i registrovane samo tamo gde se direktno koriste u template-u.-->
  <div class="profil-page">
    <div class="profil-card">
<h1>{{ profileTitle }}</h1>
      <p><strong>Ime i prezime:</strong> {{ usrName }}</p>
<p><strong>Email:</strong> {{ usrEmail }}</p>
<p>
      <strong>Lozinka:</strong>
      <input 
        :type="showPassword ? 'text' : 'password'" 
        :value="usrLozinka" 
        readonly
        class="password-input"
      />
      <span class="toggle-eye" @click="togglePassword">
        <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8z"/>
          <path d="M8 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
          <path d="M13.359 11.238l1.36 1.36a.5.5 0 0 1-.708.707l-1.36-1.36A7.484 7.484 0 0 1 8 13.5C3 13.5 0 8 0 8c.568-.887 1.332-1.741 2.263-2.513l1.36 1.36A2.5 2.5 0 0 0 8 10.5a2.5 2.5 0 0 0 2.36-1.262z"/>
          <path d="M3.646 3.646a.5.5 0 1 1 .708-.708l9 9a.5.5 0 0 1-.708.708l-9-9z"/>
        </svg>
      </span>
    </p>
<p><strong>Telefon:</strong> {{ usrPhone }}</p>
<p><strong>PIB:</strong> {{ usrPib }}</p>
<p><strong>Kompanija:</strong> {{ firmaNaziv }}</p>
<p><strong>Adresa:</strong> {{ usrAdresa }}</p>


<!-- link ka proizvodima -->
<router-link to="/proizvodi" class="profil-link">
  Pogledaj proizvode
</router-link>


      <button class="logout-btn" @click="logout">Odjavi se</button>
        <!-- Dugme / link ka proizvodima -->

        </div>

      
    

      <!-- Admin panel za admina, Napomena: Moraš koristiti v-if="isAdmin", a ne v-else.

v-else radi samo ako je prethodni v-if ili v-else-if u istom DOM nivou. -->
   

  

 </div>
</template>

<script>
import Proizvodi from '@/components/Proizvodi.vue';
//Ah, sada je potpuno jasno zašto dobijaš “previše rekurzije” (Maximum call stack exceeded) 👀U <template> još uvek koristiš <Admin /> unutar Profil.vue.Admin.vue je tvoja stranica koja verovatno opet importuje Profil.vue.Dakle, Vue pokušava da renderuje Profil → unutra <Admin> → opet Profil → <Admin>… i tako u krug, zato je rekurzija beskonačna.
  
//Problem je što pokušavaš da importuješ Admin.vue unutar Profil.vue i koristiš <Admin />, ali u stvari:Admin.vue je glavna stranica (verovatno ruta /admin), a ne komponenta.Vue ne dozvoljava da direktno renderuješ rutu kao komponentu unutar druge komponente, osim ako napraviš posebnu podkomponentu (npr. AdminPanel.vue).Dakle, kad stavljaš <Admin /> unutar Profil.vue, Vue ga ne prepoznaje → zato ti izlazi greška Unknown custom element.

    //Tvoj computed čita vrednosti direktno iz localStorage, što ne radi kako očekuješ, jer Vue ne zna da se vrednosti localStorage promenile – computed se neće automatski osvežiti. Zato, iako localStorage sadrži sve podatke, template ih ne vidi.Rešenje: koristi data properties + postavi ih pri logovanju
   
//Posto kontroliseno prikaz stranice za korisnike i admina moramo na neki nacin to i uraditi kroz prop, isAdmin je boolean (true ako je admin, false ako je običan korisnik).
   ///Zasto ne moze kad se korisnik uloguje i udje u profil da se vrati nazad Problem:Kad se korisnik uloguje i odeš na /profil, u Vue template-u si stavila <Proizvodi /> direktno unutar Profil.vue.Takođe koristiš podatke iz localStorage za prikaz i computed za isAdmin.Ali Vue ne “vidi” promene u localStorage automatski. To znači da template može “zamrznuti” stanje i tvoj router možda ne reaguje kao što očekuješ.Pored toga, ako negde importuješ Admin.vue direktno u Profil.vue (što nisi pokazala ovde, ali je spomenuto u komentarima), nastaje potencijalna rekurzija i “zamrzavanje” aplikacije.
  export default {
   components: { Proizvodi,},
  data() {
    return {
      usrName: '',
    usrEmail: '',
    usrLozinka: '',
    usrPhone: '',
    usrPib: '',
    firmaNaziv: '',
    usrAdresa: '',
    showPassword: false,
        userLevel: 1 // default običan korisnik
        
  }},



  created() {
  this.usrName = localStorage.getItem('userName') || '';
  this.usrEmail = localStorage.getItem('userEmail') || '';
    this.usrLozinka = localStorage.getItem('userLozinka') || '';

  this.usrPhone = localStorage.getItem('userPhone') || '';
  this.usrPib = localStorage.getItem('usr_pib') || '';
  this.firmaNaziv = localStorage.getItem('usr_kompanija') || '';
  this.usrAdresa = localStorage.getItem('usr_adresa') || '';
      this.userLevel = Number(localStorage.getItem('userLevel'));
},
  computed: {
isAdmin() {
    return this.userLevel === 0; // admin je level 0
  },
  profileTitle() {
    return this.isAdmin ? 'Podaci o adminu' : 'Podaci o korisniku';
  }
  },


  //data() property-ji su reaktivni, pa Vue template odmah vidi promene.created() hook se izvršava kada se komponenta učita i popunjava data iz localStorage.localStorage je samo za čuvanje podataka između sesija, Vue ne prati promene automatski – zato moramo kopirati u data.
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    logout() {
      localStorage.clear();
      this.$router.push('/home');
    },
    goToAdmin() {
  if (this.isAdmin) {  
    this.$router.push('/admin');
 
  }
}
  }
};
</script>

<style scoped>

.modal-wrapper { position: relative; }
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.4); z-index: 999;
}

.admin-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
  z-index: 1000;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  z-index: 999;
}
.profil-page {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}

.profil-card {
  background-color: #fff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  text-align: left;
  width: 400px;
}

.profil-card h1 {
  text-align: center;
  margin-bottom: 20px;
}

.profil-card p {
  margin: 8px 0;
}
.toggle-eye {
  display: inline-flex;
  align-items: center;
  margin-left: 10px;
  cursor: pointer;
  color: #666; /* svetlo siva, manje kontrastna od crne */
  transition: color 0.2s;
}

.toggle-eye:hover {
  color: #007bff; /* plava kad se hoveruje */
}

.logout-btn {
  margin-top: 20px;
  padding: 10px 20px;
  border-radius: 20px;
  background-color: #641515;
  color: white;
  font-weight: bold;
  border: none;
  cursor: pointer;
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 200px;
text-align: center;
}
.profil-products-container {
  margin-top: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  width: 100%;
  overflow-x: auto; /* horizontalni scroll ako je preširoko */

}
.profil-link {
  color: #641515;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
  display: inline-block;
  margin-top: 10px;
}

.profil-link:hover {
  color: #0d0d43;
}  





/* Mobilni prikaz */
/* Responsive za 336px ekran */
@media (max-width: 700px) {
  .profil-page {
    flex-direction: column; /* vertikalno */
    align-items: center;
  }

  .profil-card {
    order: 1; /* kartica ostaje na vrhu */
    width: 100%;
    max-width: 280px;
    padding: 15px;
    margin-top: 15px;
  }

  .profil-products-container {
    order: 2; /* proizvodi idu ispod */
    width: 100%;
    padding: 10px;
    margin-top: 10px;
  }

  .profil-card p {
    font-size: 13px;
  }

  .password-input {
    font-size: 13px;
  }

  .logout-btn {
    font-size: 14px;
    width: 100%;
  }
  

}

</style>
