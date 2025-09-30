import api from '@/api';
import moment from 'moment-timezone';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      cartItems: JSON.parse(localStorage.getItem('cart')) || [],
      cartCount: 0,
      itemsMap: JSON.parse(localStorage.getItem('itemsMap')) || {},
      productsLoaded: false,
      productQuantity: 1,
      showCart: false,
      showCartPopup: false,
      selectedImageProizvod: null,
      items: []
    };
  },

  computed: {
    resolvedCartItems() {
      if (!this.productsLoaded || !this.itemsMap || Object.keys(this.itemsMap).length === 0) {
        return [];
      }

      return (this.cartItems || []).map(ci => {
        const product = this.itemsMap[String(ci.fk_stv_pro_id)];
        return product ? { ...ci, product } : null;
      }).filter(Boolean);
    }
  },

  mounted() {
  // 1️⃣ Dodaj event listener
  window.addEventListener('go-to-checkout', this.goToCheckout);

  // 2️⃣ Učitaj proizvode i korpu
  (async () => {
    try {
      if (!this.itemsMap || Object.keys(this.itemsMap).length === 0) {
        await this.loadProducts();
      }
      this.loadCart();

      // 3️⃣ Pokreni pretragu ako ima proizvoda
      if (Array.isArray(this.items) && this.items.length) {
        this.searchData?.();
      }

      // 4️⃣ Sakrij popup korpe
      this.showCartPopup = false;

    } catch (error) {
      console.error('❌ Greška u mounted():', error);
    }
  })();
},

beforeUnmount() {
  window.removeEventListener('go-to-checkout', this.goToCheckout);
},


  methods: {
    // ------------------- Products -------------------
    async loadProducts() {
  try {
    const response = await axios.get("/api/proizvodi");

    // osiguraj da uvek postoji niz
    this.items = Array.isArray(response.data.data) ? response.data.data : [];

    this.itemsMap = this.items.reduce((map, item) => {
      map[item.pro_id] = item;
      return map;
    }, {});

  } catch (error) {
    console.error("❌ Greška pri učitavanju proizvoda:", error);
    this.items = [];
    this.itemsMap = {};
  }
},

    refreshProductData() {
      return this.loadProducts();
    },

    getSelectedProduct() {
      return this.items.find(item => item.pro_iupac === this.selectedImageProizvod);
    },

    // ------------------- Cart Actions -------------------
    loadCart() {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      this.cartItems = cart;
      this.cartCount = cart.reduce((sum, item) => sum + (item.stv_kolicina || 0), 0);
    },

    async dodajUkorpu(pro_iupac, quantity) {
      const product = this.items.find(item => item.pro_iupac === pro_iupac.pro_iupac);
      if (!product) return;

      let cart = [...this.cartItems];
      const existingItem = cart.find(item => item.fk_stv_pro_id === product.pro_id);

      if (existingItem) {
        existingItem.stv_kolicina += quantity;
        existingItem.uk_stv_cena = existingItem.stv_kolicina * existingItem.stv_cena;
      } else {
        cart.push({
          fk_stv_pro_id: product.pro_id,
          stv_kolicina: quantity,
          stv_cena: product.pro_cena,
          uk_stv_cena: quantity * product.pro_cena
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      this.cartItems = cart;
      this.cartCount = cart.reduce((sum, item) => sum + item.stv_kolicina, 0);
    },

    removeFromCart(item) {
      this.cartItems = this.cartItems.filter(ci => ci.fk_stv_pro_id !== item.fk_stv_pro_id);
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
      this.cartCount = this.cartItems.reduce((sum, i) => sum + i.stv_kolicina, 0);
    },

    handleRemoveItem(item) {
      this.removeFromCart(item);
    },

    clearCart() {
      this.cartItems = [];
      this.cartCount = 0;
      localStorage.setItem('cart', JSON.stringify([]));
    },

    increaseQuantity() {
      this.productQuantity += 1;
    },

    decreaseQuantity() {
      if (this.productQuantity > 1) this.productQuantity -= 1;
    },

    toggleCart() {
      this.showCart = !this.showCart;
      if (this.showCart) this.loadCart();
    },

    toggleCartPopup() {
      if (window.innerWidth <= 768) {
        this.showCartPopup = !this.showCartPopup;
      }
    },

    ukupnaKolicina(item) {
      const product = this.items.find(p => p.pro_id === item.fk_stv_pro_id);
      if (!product || !product.pro_jedinicamere) return '';

      const match = product.pro_jedinicamere.match(/^([\d,.]+)\s*(\w+)$/);
      if (!match) return `${item.stv_kolicina} ${product.pro_jedinicamere}`;

      const broj = parseFloat(match[1].replace(',', '.'));
      const jedinica = match[2];

      return `${item.stv_kolicina * broj} ${jedinica}`;
    },

    calculateTotalPrice() {
      return (this.cartItems || []).reduce((total, item) => total + (item.stv_cena * item.stv_kolicina), 0);
    },

    // ------------------- Checkout & Orders -------------------
    goToCheckout() {
      const isLoggedIn = !!localStorage.getItem('usr_id');

      if (!isLoggedIn) {
        Swal.fire({
          icon: 'warning',
          text: 'Ne možete poručiti proizvod dok se ne registrujete ili ulogujete!',
          confirmButtonText: 'Ulogujte se'
        }).then(() => {
          this.$router.replace('/uloguj');
          localStorage.setItem('cart', JSON.stringify(this.cartItems));
        });
        return;
      }

      if (this.$route.path !== '/nastkupovine') {
        this.$router.replace('/nastkupovine');
      }
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

      const total = this.calculateTotalPrice();
      const shipping = nacinPlacanja === 'Pouzećem' && total < 3000 ? 400 : 0;

      Swal.fire({
        title: 'Obrada narudžbine',
        text: 'Molimo sačekajte...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      try {
        const narudzbenicaData = {
          fk_nar_usr_id: Number(localStorage.getItem('usr_id')),
          nar_datum: moment().tz('Europe/Belgrade').format('YYYY-MM-DD HH:mm:ss'),
          nar_cena: total + shipping,
          nac_plat: nacinPlacanja,
          email: localStorage.getItem('userEmail'),
          stavke: this.cartItems.map(item => ({
            fk_stv_pro_id: item.fk_stv_pro_id,
            stv_kolicina: item.stv_kolicina,
            stv_cena: item.stv_cena,
            uk_stv_cena: item.uk_stv_cena
          }))
        };

        const response = await api.post('/narudzbenice', narudzbenicaData);
        localStorage.setItem('nar_id', response.data.nar_id);

        Swal.close();
        Swal.fire({
          title: 'Porudžbina poslata!',
          text: nacinPlacanja === 'Pouzećem'
            ? 'Vaša porudžbina će stići u roku od 3-5 dana.'
            : 'Nastavite plaćanje karticom.',
          icon: 'success',
          showConfirmButton: false,
          timer: 4000,
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
        Swal.fire({
          icon: 'error',
          title: 'Greška',
          text: 'Došlo je do problema prilikom obrade porudžbine. Pokušajte ponovo.'
        });
      }
    },

    getNarudzbenicaId() {
      return localStorage.getItem('nar_id');
    }
  }
};
