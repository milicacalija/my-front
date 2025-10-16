import api from '@/api';
import moment from 'moment-timezone';
import Swal from 'sweetalert2';


export default {
  data() {
    return {
      currentUserId: null,
    currentNarId: null,
      cartItems: [],
      order: { items: [] },
      cartCount: 0,
      finalPrice: 0,
      isModalOpen: false,
      showCartPopup: false,
      selectedPaymentMethod: null,
      selectedProduct: null,
      bonus: {},
      bonusAktivan: false,
      itemsMap: {},
      productQuantity: 1
    };
  },

  mounted: async function() {
  await this.loadItemsMap();  // popuni itemsMap
  this.loadCart();            // učitaj stavke korpe
  this.loadOrder();           // učitaj order ako koristiš
},

  computed: {
resolvedCartItems() {
  if (!this.itemsMap || Object.keys(this.itemsMap).length === 0) {
    setTimeout(() => this.loadItemsMap?.(), 100);
    return [];
  }

  const grouped = {};

  this.cartItems.forEach(item => {
    // Pretvori ID u string da bi se poklopio sa itemsMap ključevima
    const productData = this.itemsMap[String(item.fk_stv_pro_id)];

    if (!productData) {
      console.warn(`⚠️ Proizvod sa ID ${item.fk_stv_pro_id} nije pronađen u itemsMap`);
    } else {
      console.log(`✅ Proizvod pronađen: ID=${item.fk_stv_pro_id}, naziv=${productData.pro_iupac}`);
    }

    if (!grouped[item.fk_stv_pro_id]) {
      grouped[item.fk_stv_pro_id] = {
        fk_stv_pro_id: item.fk_stv_pro_id,
        stv_kolicina: item.stv_kolicina,
        stv_cena: item.stv_cena,
        uk_stv_cena: item.uk_stv_cena,
        // Ovde koristimo proizvod iz itemsMap, ili fallback koji je isti tip
        product: productData || { pro_iupac: '' }
      };
    } else {
      grouped[item.fk_stv_pro_id].stv_kolicina += item.stv_kolicina;
      grouped[item.fk_stv_pro_id].uk_stv_cena += item.uk_stv_cena;
    }
  });

  return Object.values(grouped);
},



//Problem je što tvoja funkcija resolvedCartItems() trenutno ne vraća ništa. U JS, ako funkcija nema return, onda je rezultat undefined. Zato ti piše da nije definisano.Trenutno završavaš forEach i zatvaraš funkciju bez return Object.values(grouped);.

    cartTotal() {
      return this.cartItems.reduce((sum, item) => sum + (item.uk_stv_cena || 0), 0);
    }
  },

  watch: {
    cartItems: {
      handler(newCart) {
        this.syncCartToLocalStorage(newCart);
      },
      deep: true
    }
  },
  mounted() {
  this.initCart();
},

methods: {
 async initCart() {
  console.log('🔹 Pokrećem initCart()');

  // 1️⃣ učitaj mapu proizvoda
  await this.loadItemsMap();
  console.log('✅ itemsMap učitana:', this.itemsMap);

  // 2️⃣ učitaj korpu iz localStorage
  this.loadCart();
  console.log('⚡ Cart nakon loadCart():', this.cartItems);

  // 3️⃣ filtriraj nepostojeće proizvode
  const preFilterCount = this.cartItems.length;
  this.cartItems = this.cartItems.filter(item => this.itemsMap[String(item.fk_stv_pro_id)]);
  const postFilterCount = this.cartItems.length;
  this.syncCartToLocalStorage();
  console.log(`🧹 Filtrirano ${preFilterCount - postFilterCount} nepostojećih proizvoda iz korpe`);

  // 4️⃣ učitaj order
  this.loadOrder();
  console.log('📦 Order nakon loadOrder():', this.order);
},
  async loadItemsMap() {
    try {
      const products = await api.get('/proizvodi'); // ili tvoj endpoint
      this.itemsMap = {};
      products.data.data.forEach(p => {
        this.itemsMap[p.pro_id] = p;
      });
      console.log('✅ itemsMap učitana:', this.itemsMap);
    } catch (e) {
      console.error('❌ Greška pri učitavanju itemsMap:', e);
    }
  },

//3️⃣ Proveri c
  


  

    //fALLBACK ZA OVU FUNKCIJU LOOADiTEMSMAP, ➡️ Ovo pokušava do 3 puta da dobije podatke pre nego što stvarno odustane.privremeno cemo komenatraisati loadItems Map da bismo resili probelm u loadProducts funckjiji
    // ===== Loaders =====
    

    loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    this.cartItems = savedCart;
    this.cartCount = savedCart.reduce((sum, item) => sum + (item.stv_kolicina || 0), 0);
    
    console.log('⚡ Cart nakon loadCart():', this.cartItems); // <-- ovde
  } catch (e) {
    console.error('❌ Greška pri učitavanju korpe iz localStorage:', e);
    this.cartItems = [];
    this.cartCount = 0;
  }
},

    loadOrder() {
      try {
        const savedOrder = JSON.parse(localStorage.getItem('order')) || { items: [] };
        this.order = savedOrder;
      } catch (e) {
        console.error('❌ Greška pri učitavanju order iz localStorage:', e);
        this.order = { items: [] };
      }
    },

    // ===== Sync =====
    syncCartToLocalStorage(cart = this.cartItems) {
      localStorage.setItem('cart', JSON.stringify(cart));
      this.cartCount = cart.reduce((sum, i) => sum + (i.stv_kolicina || 0), 0);
    },

    syncOrderToLocalStorage(order = this.order) {
      localStorage.setItem('order', JSON.stringify(order));
    },

    // ===== Cart actions =====
   async dodajUkorpu(pro_iupac, quantity = 1) {
  const product = Object.values(this.itemsMap).find(
    p => p.pro_iupac === pro_iupac.pro_iupac || p.pro_iupac === pro_iupac
  );
  if (!product) return console.error('❌ Proizvod nije pronađen!');

  const existingItem = this.cartItems.find(ci => ci.fk_stv_pro_id === product.pro_id);
  
  if (existingItem) {
    existingItem.stv_kolicina += quantity;
    existingItem.uk_stv_cena = existingItem.stv_kolicina * existingItem.stv_cena;
  } else {
    // prvi put dodajemo proizvod u praznu korpu
    this.cartItems.push({
      fk_stv_pro_id: product.pro_id,
      stv_kolicina: quantity,
      stv_cena: product.pro_cena,
      uk_stv_cena: quantity * product.pro_cena
    });
  }

  this.syncCartToLocalStorage(); // ← Obezbeđuje da se pamti u localStorage
  console.log('⚡ Cart nakon dodavanja:', this.cartItems);
}
,


    removeFromCart(item) {
      this.cartItems = this.cartItems.filter(ci => ci.fk_stv_pro_id !== item.fk_stv_pro_id);
      this.syncCartToLocalStorage();
    },

    clearCart() {
      this.cartItems = [];
      this.cartCount = 0;
      this.syncCartToLocalStorage();
    },

    incrementQuantity(proId) {
      this.cartItems = this.cartItems.map(item => {
        if (item.fk_stv_pro_id === proId) {
          item.stv_kolicina++;
          item.uk_stv_cena = item.stv_kolicina * item.stv_cena;
        }
        return item;
      });
    },

    decrementQuantity(proId) {
      this.cartItems = this.cartItems.map(item => {
        if (item.fk_stv_pro_id === proId && item.stv_kolicina > 1) {
          item.stv_kolicina--;
          item.uk_stv_cena = item.stv_kolicina * item.stv_cena;
        }
        return item;
      });
    },

    removeItem(itemToRemove) {
      this.cartItems = this.cartItems.filter(item => item !== itemToRemove);
      this.syncCartToLocalStorage();
    },

    clearAllItems() {
      this.cartItems = [];
      this.syncCartToLocalStorage();
    },

    calculateTotalPrice() {
        // Saberi sve stavke
        const total = this.cartItems.reduce((sum, item) => sum + item.uk_stv_cena, 0);
    
        // Ako ukupna cena prelazi 10.000, primeni 20% popusta
        if (total > 10000) {
          return Math.round(total * 0.8); // cena sa popustom
        }
    
        return total; // cena bez popusta
      },

    toggleCartPopup() {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) this.showMobileCart();
      else this.showCartPopup = !this.showCartPopup;
    },

    showMobileCart() {
      let htmlContent = '';
      if (!this.cartItems.length) htmlContent = '<p>Korpa je prazna</p>';
      else {
        htmlContent = '<ul style="list-style: none; padding: 0;">';
        this.cartItems.forEach(item => {
          const product = this.itemsMap[item.fk_stv_pro_id] || {};
          const naziv = product?.pro_iupac || item?.pro_iupac || 'Nepoznata stavka';
          const quantity = item.stv_kolicina || 0;
          const price = (item.stv_cena || 0).toFixed(2);
          const imageUrl = naziv
            ? `/images/${encodeURIComponent(naziv.toLowerCase().trim())}.jpg`
            : '/images/korpica.png';
          htmlContent += `
            <li style="display: flex; align-items: center; margin-bottom: 10px;">
              <img src="${imageUrl}" 
                   alt="${naziv}" 
                   style="width: 40px; height: 40px; object-fit: cover; margin-right: 10px; border-radius: 4px;"
                   onerror="this.src='/images/korpica.png'">
              <span>${naziv} - ${quantity} x ${price} RSD</span>
            </li>
          `;
        });
        htmlContent += '</ul>';
        htmlContent += `<p><strong>Ukupna cena: ${this.cartTotal.toFixed(2)} RSD</strong></p>`;
      }

      Swal.fire({
        title: 'Vaša korpa',
        html: htmlContent + `
          <button id="swal-go-to-checkout"
                  style="margin-top: 15px; width: 150px; padding: 10px; border-radius: 5px; background-color: #641515; color: white; border: none; cursor: pointer;">
            Nastavak kupovine
          </button>
        `,
        showCloseButton: true,
        showConfirmButton: false,
        width: '90%',
        didOpen: () => {
          const btn = document.getElementById('swal-go-to-checkout');
          if (btn) btn.addEventListener('click', () => { this.goToCheckout(); Swal.close(); });
        }
      });
    },
 // GET: svi bonusi
  async ucitajBonuse() {
  try {
    const response = await api.get('/bonus');
    this.bonusi = response.data.data;

    // Provera i primena popusta za korpu
    const totalPrice = this.cartItems.reduce((sum, item) => sum + item.uk_stv_cena, 0);

    if (totalPrice > 10000 && !this.bonusAktivan) {
      this.bonusAktivan = true; // sprečava višestruke poruke
      Swal.fire({
        icon: 'success',
        title: 'Čestitamo!',
        text: 'Vaša narudžbina prelazi 10.000 RSD, primenjen je popust od 20% 🎉',
        timer: 3000,
        showConfirmButton: false
      });

      // 🔹 Primeni popust direktno na stavke korpe
      this.cartItems = this.cartItems.map(item => ({
        ...item,
        uk_stv_cena: item.uk_stv_cena * 0.8
      }));
    }

    // Opcionalno: i dalje možeš proveravati bonuse iz backend-a
    this.bonusi.forEach(bonus => {
      if (bonus.nar_cena > 10000) {
        console.log('Bonus iz baze:', bonus);
      }
    });

  } catch (err) {
    console.error('Greška pri učitavanju bonusa:', err);
  }
},
 goToCheckout() {
  const isLoggedIn = !!localStorage.getItem('usr_id');
  if (!isLoggedIn) {
    Swal.fire({
      icon: 'warning',
      text: 'Ne možete poručiti proizvod dok se ne registrujete ili ulogujete!',
      confirmButtonText: 'Ulogujte se'
    }).then(() => {
      this.$router.replace('/uloguj');
      this.syncCartToLocalStorage();
    });
    return;
  }

  // 🔹 Provera bonusa i primena popusta
  this.ucitajBonuse();

  // 🔹 Idi na nastavak kupovine
  this.$router.replace('/nastkupovine');
},




   async kreirajNarudzbenicu(nacinPlacanja) {
  if (!this.cartItems.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Korpa je prazna',
      text: 'Dodajte proizvode u korpu pre nego što nastavite sa porudžbinom.'
    });
    return;
  }

  // 🔹 Provera lagera
  const outOfStockItem = this.cartItems.find(item => {
    const product = Object.values(this.itemsMap).find(p => p.pro_id === item.fk_stv_pro_id);
    return product && item.stv_kolicina > product.pro_lager;
  });

  if (outOfStockItem) {
    const product = Object.values(this.itemsMap).find(p => p.pro_id === outOfStockItem.fk_stv_pro_id);
    Swal.fire({
      icon: 'warning',
      title: 'Nema dovoljno na lageru',
      text: `Ne možete poručiti proizvod "${product.pro_iupac}". Dostupno: ${product.pro_lager} komada.`,
    });
    return;
  }

  const totalPrice = this.cartItems.reduce((sum, item) => sum + item.uk_stv_cena, 0);
  const shipping = nacinPlacanja === 'Pouzećem' && totalPrice < 3000 ? 400 : 0;
  const finalPrice = totalPrice + shipping;

  Swal.fire({
    title: 'Obrada narudžbine',
    text: 'Molimo sačekajte dok se porudžbina obrađuje...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    // 🔹 Napravi podatke za narudžbenicu
const userId = this.currentUserId || Number(localStorage.getItem('usr_id'));
if (!userId || userId <= 0) {
  Swal.fire({
    icon: 'error',
    title: 'Greška',
    text: 'Korisnik nije logovan ili ID nije validan.'
  });
  return;
}
    const narudzbenicaData = {
      fk_nar_usr_id: userId,
      nar_datum: moment().tz('Europe/Belgrade').format('YYYY-MM-DD HH:mm:ss'),
      nar_cena: finalPrice,
      nac_plat: nacinPlacanja,
      email: localStorage.getItem('userEmail'),
      stavke: this.cartItems.map(item => ({
        fk_stv_pro_id: item.fk_stv_pro_id,
        stv_kolicina: item.stv_kolicina,
        stv_cena: item.stv_cena,
        uk_stv_cena: item.uk_stv_cena
      }))
    };

    // 🔹 Pošalji na backend
    const narResponse = await api.post('http://localhost:3016/narudzbenice', narudzbenicaData);

    // 🔹 Upisi ID-jeve u Vue state
    this.currentNarId = narResponse.data.nar_id;
    this.currentUserId = narResponse.data.usr_id || userId;

    Swal.close();

    Swal.fire({
      title: 'Porudžbina poslata!',
      text: nacinPlacanja === 'Pouzećem'
        ? 'Vaša porudžbina je uspešno poslata i biće isporučena u roku od 3-5 dana, proverite Vaš email.'
        : 'Vaša porudžbina je uspešno kreirana, nastavite plaćanje sa karticom.',
      icon: 'success',
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true
    }).then(() => {
      if (nacinPlacanja === 'Kartica') {
        this.$router.push({ name: 'PaymentForm' });
      } else {
        this.$router.push('/');
      }
    });

  } catch (err) {
    Swal.close();
    console.error('Greška pri porudžbini:', err);
    Swal.fire({
      icon: 'error',
      title: 'Greška',
      text: 'Došlo je do problema prilikom obrade porudžbine. Pokušajte ponovo.'
    });
  }
},


    getNarudzbenicaId() {
      return localStorage.getItem('nar_id') || null;
    } }
 }

