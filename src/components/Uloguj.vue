
<template>


  <div>
    <div class="kontakt-forma">

      
      <form @submit.prevent="tryLogin">
        <label for="email">E-mail</label>
        <input class="input" style="display: block;" type="text" name="email" v-model="email" autocomplete="email">

        <label for="password">Password</label>
        <input class="input" style="display: block;" type="password" name="password" v-model="password" autocomplete="password">
        

        <div class="login-actions">
  <button type="submit" class="button-input">Uloguj se</button>
  <p class="register-text">
    Nemate nalog? 
    <router-link to="/nalog" class="register-link">Registrujte se</router-link>
  </p>
</div>

      </form>
      
<p v-if="rezultat !== null && rezultat !== 'Niste se ulogovali' && rezultat !== 'Pogrešan email ili lozinka'">
   {{ rezultat }}
</p>

<p v-if="rezultat === 'Pogrešan email ili lozinka'">
  {{ rezultat }}
</p>



      </div>
    </div>

</template>
<script>
import api from '@/api';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      email: "",
      password: "",
      token: localStorage.getItem('token') || null,
    usrName: localStorage.getItem('userName') || '',
    usrEmail: localStorage.getItem('userEmail') || '',
    usrLevel: Number(localStorage.getItem('userLevel')) || 1,
    rezultat: null  // <-- dodaj ovo ako template koristi rezultat
    };
  },
  computed: {
    isLoggedIn() {
    return !!localStorage.getItem('token');    }
  },
  created() {
    // Ako postoji token, preusmeri korisnika direktno na profil
    if (this.token) {
      this.$router.push('/profil');
    }
  },
  methods: {
    async tryLogin() {
      console.log('Metoda tryLogin je pozvana.');
      console.log('Email:', this.email);

      try {
        const response = await api.post('/login', {
          email: this.email,
          password: this.password
        });

        console.log('Odgovor od servera:', response);
        const userData = response.data.data;
        const token = response.data.token;

        if (userData?.usr_id && token) {
          // Sačuvaj podatke u localStorage
          localStorage.setItem('token', token);
localStorage.setItem('usr_id', String(userData.usr_id));
          localStorage.setItem('userName', userData.usr_name || '');
          localStorage.setItem('userEmail', userData.usr_email || '');
          localStorage.setItem('userLozinka', userData.usr_password || '');
          localStorage.setItem('userPhone', userData.usr_phone || '');
          localStorage.setItem('usr_pib', userData.kmp_pib || '');
          localStorage.setItem('usr_kompanija', userData.kmp_naziv || '');
          localStorage.setItem('usr_adresa', userData.kmp_adresa || '');
          localStorage.setItem('userLevel', userData.usr_level ?? 1);

          this.token = token; // postavi reactive token

          // Potvrda prijave i preusmeravanje
          Swal.fire({
            icon: 'success',
            title: 'Uspešna prijava',
            text: `Dobrodošli, ${userData.usr_name}!`,
            confirmButtonText: 'Nastavi'
          }).then(() => {
            this.$router.push('/profil');
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Greška',
            text: 'Prijava nije uspela, podaci nisu validni.'
          });
        }
      } catch (error) {
        console.error('Greška pri prijavi:', error);
        Swal.fire({
          icon: 'error',
          title: 'Greška pri prijavi',
          text: error.response?.data?.message || 'Došlo je do greške prilikom prijave.'
        });
      }
    },

    logout() {
      // Briše token i sve podatke iz localStorage
      localStorage.clear();
      this.token = null;
      Swal.fire({ icon: 'success', title: 'Uspešna odjava' });
      this.$router.push('/uloguj'); // vrati na login
    }
  }
};
</script>


<style scoped >



body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #f0f0f0;
  width: 100%;
  height: 100%;
  font-family: Arial, sans-serif;
}

/* Forma za kontakt/login */
.kontakt-forma {
  display: flex;
  flex-direction: column;
  align-items: center; /* centrira sve elemente horizontalno */
  gap: 15px; /* razmak između labela i inputa */
  margin: 50px auto; /* centriranje forme na stranici */
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 350px;
}

/* Labeli */
.kontakt-forma label {
  width: 100%;
  text-align: center; /* centriran tekst labela */
  font-weight: bold;
  font-size: 14px;
}

/* Input polja */
.input {
  width: 250px;
  max-width: 300px;
  height: 50px;
  border: 1.5px solid rgb(100, 21, 21);
  border-radius: 5px;
  text-align: center; /* centriran tekst unutar inputa */
  font-size: 14px;
  padding: 0 10px;
}

/* Dugme */
.button-input {
  margin-top: 15px;
  background-color: #641515;
color: #fff;
align-items: center;
  font-weight: normal;
  font-size: 16px;
  border-radius: 15px;
  width: 100%;
  max-width: 300px;
  height: 30px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-input:hover {
  background-color: #050580;
}

    </style>
