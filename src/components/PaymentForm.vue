<template>
  <div>
    <!-- Korpa -->
    <div class="cart-container">
      <h2 class="cart-title">Vaša porudžbina</h2>
      <ul class="cart-list">
        <li 
          v-for="(item, index) in safeCartItems" 
          :key="item.fk_stv_pro_id + '-' + index" 
          class="cart-item"
        >
          {{ getProductIUPAC(item.fk_stv_pro_id) }}  
          &nbsp;|&nbsp; <strong>Količina:</strong> {{ item.stv_kolicina }}  
          &nbsp;|&nbsp; <strong>Cena:</strong> {{ item.uk_stv_cena }} RSD
        </li>
      </ul>
      <div>
        <strong>Ukupna cena sa bonusom {{ calculateTotalPrice() }} RSD.</strong>
      </div>
      <p v-if="cartItems.length === 0" class="empty-cart">Vaša korpa je prazna.</p>


      <!-- Dugme za plaćanje -->
      <button 
        @click="openCardModal" 
        :disabled="cartItems.length === 0"
        class="pay-btn"
      >
        Plaćanje karticom
      </button>
<!-- Forma za plaćanje karticom -->
<div v-if="successMessage" class="success-message">
  {{ successMessage }} 
</div>

<!-- Modal -->
<div v-if="showCardForm" class="modal-overlay">
  <div class="modal-content">
    <h3>Unesite podatke kartice</h3>
    <div id="card-element"></div>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
<div class="modal-buttons">
      <button @click="submitPayment" :disabled="processing" class="logout-btn">
        {{ processing ? "Obrada..." : "Potvrdi plaćanje" }}
      </button>
      <button @click="closeCardModal" class="logout-btn">Otkaži</button>
    </div>
  </div>
</div>
</div>
</div>
</template>
<script>
import api from '@/api';
 
import { loadStripe } from '@stripe/stripe-js';
import cartMixin from '@/mixins/cartMixin.js';
import moment from 'moment-timezone';
import Swal from 'sweetalert2';

export default {
  mixins: [cartMixin],
  data() {
    return {
          currentUser: null,
    currentNar: null,
    //Ti sada u PaymentForm opet učitavaš itemsMap i cartItems iz localStorage.to nije potrebno — sve to već postoji u roditelju (NastKupovine.vue) i iz njega treba da proslediš resolvedCartItems i eventualno itemsMap ako ti treba za prikaz imena proizvoda.
      showCardForm: false,
      processing: false,
      errorMessage: '',
      stripe: null,
      elements: null,
      cardElement: null,
      card: null,
          successMessage: '' // nova poruka uspeha
    };
  },

  //Zasto je bila korpa prazna po kliktanju plati karticom onst savedCart = localStorage.getItem('cartItems');if (savedCart) this.cartItems = JSON.parse(savedCart);Ali glavni izvor istine treba da bude roditelj (komponenta gde korisnik dodaje u korpu).Rešenje: Prosledi resolvedCartItems iz roditelja preko props i koristi ih u PaymentForm, a ne lokalno čuvaj kopiju. Ovo eliminiše duplikate i praznu korpu:


  
  
  order: {
    type: Object,
    required: false,
    default: () => ({})
  },
  computed: {
    safeCartItems() {
    return this.cartItems || [];
  },
    
  },
  async mounted() {
    // Učitaj Stripe
    this.stripe = await loadStripe(process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY);
console.log('Stripe key:', process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY);
    
    // Učitaj ulogovanog korisnika
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    this.currentUser = JSON.parse(savedUser);
    console.log('Učitani currentUser:', this.currentUser);
  } else {
    console.log('currentUser nije definisan u localStorage');
  }

  // Učitaj trenutnu narudžbinu
  const savedNar = localStorage.getItem('currentNar');
  if (savedNar) {
    this.currentNar = JSON.parse(savedNar);
    console.log('Učitani currentNar:', this.currentNar);
  } else {
    console.log('currentNar nije definisan u localStorage');
  }

},
  beforeDestroy() {
    if (this.cardElement) {
      this.cardElement.destroy();
    }
  },
  methods: {
    getProductIUPAC(pro_id) {
      const product = this.itemsMap[String(pro_id)];
      return product ? product.pro_iupac : "Nepoznata hemikalija";
    },
   openCardModal() {
  if (!this.safeCartItems.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Korpa je prazna',
      text: 'Dodajte proizvode pre nego što nastavite.'
    });
    return;
  }

  this.showCardForm = true;

  this.$nextTick(() => {
    if (!this.cardElement) {
      this.elements = this.stripe.elements();
      this.cardElement = this.elements.create('card');
      this.cardElement.mount('#card-element');
      this.card = this.cardElement;
    }
  });
},

    closeCardModal() {
      this.showCardForm = false;
    },

async submitPayment() {
  if (!this.stripe || !this.card) {
    this.errorMessage = 'Stripe nije inicijalizovan.';
    return;
  }

  this.processing = true;
  this.errorMessage = '';
  this.successMessage = '';

  try {
    // 🔹 Uzimamo userId iz Vue state ili localStorage
    const userId = this.currentUserId || Number(localStorage.getItem('usr_id'));
    if (!userId || userId <= 0) {
      console.error('❌ User ID nije dostupan!');
      Swal.fire({
        icon: 'error',
        title: 'Greška',
        text: 'Korisnik nije logovan ili ID nije validan.'
      });
      this.processing = false;
      return;
    }

    // 🔹 Kreiranje narudžbenice ako već nije kreirana
    if (!this.currentNarId) {
      const narudzbenicaData = {
        fk_nar_usr_id: userId,
        nar_datum: moment().tz('Europe/Belgrade').format('YYYY-MM-DD HH:mm:ss'),
        nar_cena: this.cartItems.reduce((sum, item) => sum + item.uk_stv_cena, 0),
        nac_plat: 'Kartica',
        email: localStorage.getItem('userEmail'),
        stavke: this.cartItems.map(item => ({
          fk_stv_pro_id: item.fk_stv_pro_id,
          stv_kolicina: item.stv_kolicina,
          stv_cena: item.stv_cena,
          uk_stv_cena: item.uk_stv_cena
        }))
      };

      const narResponse = await api.post('http://localhost:3016/narudzbenice', narudzbenicaData);
      this.currentNarId = narResponse.data.nar_id;
      this.currentUserId = narResponse.data.usr_id || userId;

      console.log('💡 Debug submitPayment: currentUserId =', this.currentUserId);
      console.log('💡 Debug submitPayment: currentNarId =', this.currentNarId);
    }

    // 🔹 Kreiranje paymentData
    const paymentData = {
      fk_pa_usr_id: this.currentUserId || userId,
      fk_pa_nar_id: this.currentNarId,
      amount: this.cartItems.reduce((sum, item) => sum + item.uk_stv_cena, 0),
      currency: 'rsd',
      email: localStorage.getItem('userEmail'),
      created_at: moment().tz('Europe/Belgrade').format('YYYY-MM-DD HH:mm:ss'),
      cartItems: this.cartItems
    };

    console.log('💡 paymentData:', paymentData);

    // 🔹 Stripe PaymentIntent preko backend-a
    const response = await api.post('http://localhost:3016/save-payment', paymentData);
    console.log('💾 Payment response:', response.data);

    const clientSecret = response.data.clientSecret;

    // 🔹 Potvrđivanje plaćanja na Stripe-u
    const result = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: this.card }
    });

    if (result.error) {
      this.errorMessage = result.error.message;
      this.processing = false;
      return;
    }

    const paymentIntent = result.paymentIntent;
    // nakon uspešnog result.paymentIntent
console.log('📦 Full paymentIntent (from client):', paymentIntent);


// payment_method direktno na paymentIntent (može biti id, npr. pm_...)
console.log('🆔 paymentIntent.payment_method:', paymentIntent.payment_method);



// pokušaj učitavanja brand-a klasično
const brandClient = paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.brand;
console.log('💳 brand (client extract):', brandClient);

// fallback: ako nema charges (npr. konfig. automatic_payment_methods), pozovi backend da retrieve-uje PaymentIntent i vrati brand
if (!brandClient) {
  try {
    console.log('🔎 Brand nije u paymentIntent na klijentu — pokušavam da dohvatim sa backend-a...');
    const pmResp = await api.get(`/payment-method/${paymentIntent.id}`);
    console.log('🔁 Backend /payment-method response:', pmResp.data);
    const brandBackend = pmResp.data.cardBrand;
    console.log('💳 brand (backend):', brandBackend);
  } catch (e) {
    console.error('❌ Neuspeo poziv /payment-method:', e);
  }
}


    if (paymentIntent && paymentIntent.status === 'succeeded') {
      this.processing = false;
      this.showCardForm = false;

      // 🔹 Tip kartice
      const pmResp = await api.get(`/payment-method/${paymentIntent.id}`);
const brand = pmResp.data.cardBrand || 'card';
console.log('💳 brand:', brand);

      // 🔹 Sačuvamo Stripe podatke u backend
      await api.post('http://localhost:3016/save-payment', {
        ...paymentData,
        status: paymentIntent.status,
        stripe_payment_intent_id: paymentIntent.id,
        payment_method: brand
      });

      Swal.fire({
        icon: 'success',
        title: 'Plaćanje uspešno završeno!',
        text: 'Vaša porudžbina je obrađena i biće isporučena u roku od 3-5 dana.',
        showConfirmButton: true
      }).then(() => this.$router.push('/'));

      this.$emit('payment-success', result);
    }

  } catch (err) {
    this.errorMessage = 'Došlo je do greške prilikom obrade plaćanja.';
    console.error('Greška prilikom plaćanja:', err);
    this.processing = false;
  }
}}}




//Bila sam pozivala funkciju za devfinisanje cardNumber iako jos nije definisan cardNumber dakle to ne moze tako i zato je bila greska cardNumer nije definisan

// <-- OVDJE se završava submitPayment

//Kada postaviš showCardForm = false, celo <div class="modal-overlay"> nestaje, a sa njim i div za successMessage.Zato nikada ne vidiš poruku.
</script>


<style scoped>

.pay-btn {
  padding: 5px 30px;
  border-radius: 20px;
  background-color: #641515;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 18px;
  font-weight: normal;
  min-width: 250px;
  text-align: center;
  display: block;
  margin: 0 auto;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* poluprovidna pozadina */
  display: flex;
  justify-content: center; /* horizontalno centriranje */
  align-items: center;     /* vertikalno centriranje */
  z-index: 1000;
}

/* Sadržaj modala */
.modal-content {
  background-color: #fff;
  padding: 25px 30px;
  border-radius: 12px;
  width: 400px; /* manja širina */
  max-width: 90%; /* prilagođava se ekranu */
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  text-align: center;
}

/* Stil dugmadi unutar modala */
.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
    font-weight: normal;

}

.modal-buttons button {
  flex: 1;           /* oba dugmeta zauzimaju isti prostor */
  max-width: 200px;  /* opcionalno, da ne budu preširoka */
  text-align: center;
}
.payment-container {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

#card-element {
  border: 1px solid #ccc;
  padding: 12px 15px;
  border-radius: 6px;
  box-shadow: inset 0 1px 5px rgba(0,0,0,0.07);
  font-size: 1rem;
  background: #fafafa;
}
.error-message {
  color: #d93025;
  font-weight: 600;
  margin-top: 5px;
  text-align: center;
}



.payment-form {
  text-align: center;
}



.cart-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-radius: 8px;
  background: #fff;
}

.cart-title {
  font-weight: bold;
  font-size: 1.8em;
  margin-bottom: 15px;
  color: #333;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.cart-list {
  list-style-type: none;
  padding: 0;
}
.cart-item {
  padding: 12px 15px;
  margin-bottom: 10px;
  border-radius: 6px;
  background: #f9f9f9;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
  font-size: 1.1em;
  color: #444;
}

.empty-cart {
  text-align: center;
  color: #999;
  font-style: italic;
}
.payment-wrapper {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 500px;
  margin: 0 auto;
}

.card-options {
  margin-bottom: 20px;
  text-align: center;
}

.card-logo {
  width: 80px;
  height: auto;
}

.stripe-input {
  border: 1px solid #ccc;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.error-message {
  color: red;
  margin-bottom: 10px;
}
.success-message {
  background-color: #d4edda;   /* svetlo zelena pozadina */
  color: #155724;              /* tamno zelena slova */
  padding: 12px 20px;          /* unutrašnji razmak */
  margin: 10px auto;           /* centriranje horizontalno + razmak odozgo */
  border-radius: 6px;          /* blago zaobljeni uglovi */
  border: 2px solid #28a745;  /* zeleni okvir */
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2); /* blaga senka */
  width: 250px;                /* fiksna širina */
  text-align: center;          /* tekst u sredini */
}



.cancel-button {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  margin-right: 10px;
    background: #ccc;

}



</style>
