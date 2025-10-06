<template>
  
  <div class="proizvodi-page">
      <!-- Prikaz komponente Korpa -->
    


   <!-- Dugme Korpa -->
  <div class="cart-button-container">
    <button class="cart-button" @click="toggleCartPopup">
      Korpa <span v-if="cartCount">({{ cartCount }})</span>
    </button>

    <!-- Overlay -->
    <div class="cart-overlay" :class="{ show: showCartPopup }" @click="toggleCartPopup"></div>

    <!-- Tooltip / popup korpe -->
    <div class="cart-popup" :class="{ show: showCartPopup }">
      <div v-if="resolvedCartItems.length > 0">
        <strong>Vaša korpa:</strong>
        <ul>
          <li 
            v-for="(item, index) in resolvedCartItems"
            :key="(item.stv_id || item.fk_stv_pro_id) + '-' + index"
            class="cart-item"
          >
          
            <div class="cart-item-info">
              {{ item.product?.pro_iupac || 'Nepoznata stavka' }} - 
              {{ item.stv_kolicina }} kom - {{ item.uk_stv_cena.toFixed(2) }} RSD
            </div>
          </li>
        </ul>

        <div class="cart-total">
          <strong>Ukupna cena: {{ calculateTotalPrice() }} RSD</strong>
        </div>

        <button class="add-korpa" @click="goToCheckout">Nastavak kupovine</button>
      </div>

      <div v-else>
        Korpa je prazna
      </div>
    </div>
  </div>

    <h1>Hemikalije</h1>

    <!-- Input za pretragu -->
    <input 
      type="text" 
      v-model="searchQuery"
      placeholder="Ukucaj naziv proizvoda po IUPAC i saznaj detalje"
      @input="searchData"
      class="input"
    />
    <p v-if="noResults" class="no-results">Nema proizvoda u pretrazi</p>

    <!-- Prikaži tabelu svih proizvoda SAMO ako nije aktivna pretraga -->
    <TabelaProizvoda 
  v-if="!searchQuery" 
  :items="items" 
  @select-product="selectProizvod"
  @add-to-cart="dodajUkorpu"
/>

    <!-- Detalji selektovanog proizvoda -->
    <div 
      v-if="selectedImageProizvod" 
      class="product-wrapper"
      style="display: flex; gap: 20px;"
    >
      <!-- Levo: Slika + količina + dugme -->
      <div class="selected-proizvod" style="flex: 1;">
        
        <img 
          :src="getImageUrl(selectedImageProizvod)" 
          :alt="selectedImageProizvod.pro_iupac"
          class="proizvod-slika"
          @error="handleImageError($event, selectedImageProizvod.pro_iupac)"
        />

        <!-- Količina -->
        <div class="quantity-container">
          <button @click="decreaseQuantity">-</button>
          <input 
            type="number" 
            v-model.number="productQuantity" 
            min="1" 
            class="quantity-input"
          />
          <button @click="increaseQuantity">+</button>
        </div>

        <!-- Dugme Dodaj u korpu -->
        <div class="button-container">
          <button 
            class="add-korpa" 
            @click="dodajUkorpu(selectedImageProizvod, productQuantity)"
          >
            Dodaj u korpu
          </button>
        </div>
      </div>

      <!-- Desno: Tabela sa detaljima proizvoda -->
      <div class="table-container" style="flex: 1;">
        <table>
          <tbody>
            <tr>
              <td>
                <p><strong>Naziv hemikalije po IUPAC:</strong> {{ selectedImageProizvod.pro_iupac }}</p>
                <p><strong>Cena:</strong> {{ selectedImageProizvod.pro_cena }} RSD</p>
                <p><strong>Količina:</strong> {{ selectedImageProizvod.pro_kolicina }}</p>
                <p><strong>Jedinica mere:</strong> {{ selectedImageProizvod.pro_jedinicamere }}</p>
                <p><strong>Rok:</strong> {{ selectedImageProizvod.pro_rok }}</p>
                <p><strong>Lager:</strong> {{ selectedImageProizvod.pro_lager }}</p>
                <p><strong>Izgled:</strong> {{ selectedImageProizvod.spe_izgled || 'N/A' }}</p>
                <p><strong>Klasifikacija hemikalije:</strong> {{ selectedImageProizvod.spe_klashemikal || 'N/A' }}</p>
                <p><strong>Prva pomoć:</strong> {{ selectedImageProizvod.spe_prvapomoc || 'N/A' }}</p>
                <p><strong>Rukovanje i skladištenje:</strong> {{ selectedImageProizvod.spe_ruksklad || 'N/A' }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
  </div>
</template>

<script>
import Korpa from '@/components/Korpa.vue';
import TabelaProizvoda from '@/components/TabelaProizvoda.vue';
import cartMixin from '@/mixins/cartMixin';
import api from '@/api';
import { getImageUrl } from '@/components/korpaimg.js';

export default {
  name: 'Proizvodi',
  mixins: [cartMixin],
  components: { Korpa, TabelaProizvoda },
  data() {
    return {
      items: [],
      itemsMap: {},
      selectedImageProizvod: null,
      productQuantity: 1,
      searchQuery: '',
      noResults: false,
    };
  },
  async created() {
    await this.loadProducts();
  },
  methods: {
    async loadProducts() {
      try {
        const response = await api.get('/proizvodi');
        this.items = response.data.data || [];

        // mapa proizvoda po ID-u
        this.itemsMap = this.items.reduce((map, p) => {
          map[String(p.pro_id)] = p;
          return map;
        }, {});
      } catch (err) {
        console.error('❌ Greška pri učitavanju proizvoda:', err);
      }
    },

    selectProizvod(product) {
      this.selectedImageProizvod = product;
      this.productQuantity = 1; // reset na 1 kada se izabere novi proizvod
    },

    decreaseQuantity() {
      if (this.productQuantity > 1) this.productQuantity--;
    },
    increaseQuantity() {
      this.productQuantity++;
    },

    async searchData() {
      if (!this.searchQuery) {
        this.selectedImageProizvod = null;
        this.noResults = false;
        return;
      }
      const query = this.searchQuery.toLowerCase().trim();
      const exact = this.items.find(p => p.pro_iupac.toLowerCase() === query);
      const partial = this.items.find(p => p.pro_iupac.toLowerCase().includes(query));
      this.selectedImageProizvod = exact || partial || null;
      this.noResults = !this.selectedImageProizvod;
    },

    getImageUrl(item) {
      return getImageUrl(item);
    },

    handleImageError(event, pro_iupac) {
      console.warn(`Slika nije pronađena za: ${pro_iupac}`);
      if (event?.target) event.target.src = '/images/korpica.png';
    }
  }
};
</script>



<style scoped >
   
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

h3 {
  text-align: center;
}

img {
  display: block;
  margin: 0 auto;
}

/* ========================
Proizvodi
======================== */
.product-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-top: 20px;
}

.selected-proizvod {
  flex: 0 0 250px;
  text-align: center;
}

.proizvod-slika {
  width: 300px;
  height: 300px;
  margin-top: 20px;

}

.input {
  width: 350px;
  margin-bottom: 20px;
  height: 30px;
  border-radius: 20px;
}
.tooltip-container {
  position: relative;
  cursor: pointer;
  text-decoration: underline dotted;
}



.tooltip-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: rgba(100,21,21,0.95);
  color: #fff;
  padding: 10px;
  border-radius: 6px;
  min-width: 200px;
  max-width: 90%;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.tooltip-container:hover .tooltip-content {
  display: block;
}

/* ========================
   Ikona korpe i brojač
======================== */
.cart-button-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
}

.cart-button {
  background: #641515;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.cart-button:hover {
  background: #2a1564;
}

.cart-overlay {
  display: none;
}

.cart-overlay.show {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.3);
  z-index: 1990;
}

.cart-popup {
  display: none;
  position: absolute;
  top: 40px;
  right: 0;
  width: 300px;
  background: white;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  z-index: 2000;
}

.cart-popup.show {
  display: block;
}

.cart-item {
  margin-bottom: 10px;
}

.cart-item-info {
  font-size: 14px;
}

.cart-total {
  margin-top: 10px;
  font-weight: bold;
}

.add-korpa {
  margin-top: 10px;
  width: 100%;
  background: #641515;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
}

.add-korpa:hover {
  background: #2a1564;
}
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.cart-button {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #641515;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  z-index: 2000;
}

/* Korpa header */
.cart-popup-header {
  background: #641515;
  color: white;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-popup-header button {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

/* Lista stavki */
.cart-popup-body {
  flex: 1;
  padding: 10px 15px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.cart-item-info {
  font-size: 14px;
  flex: 1;
}

/* Footer */
.cart-popup-footer {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  text-align: center;
}

.cart-popup-footer button {
  width: 100%;
  background: #641515;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.cart-popup-footer button:hover {
  background: #4b0f0f;
}

/* ========================
   Dugmad
======================== */
.add-korpa, .logout-btn, .cart-popup button {
  width: 150px;
  padding: 12px 10px; /* malo više paddinga */
    margin-top: 15px;   /* odmak od sadržaja iznad */
  border-radius: 5px;
  background-color: #641515;
  color: white;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  border: none;
  transition: background-color 0.3s, transform 0.2s;
}

.add-korpa:hover {
  background-color: #2a1564;
}

.add-korpa:active {
  transform: scale(0.98);
}

.logout-btn {
  display: block;
  margin: 20px auto;
}
/* Korpa je sakrivena po defaultu */
.cart-popup {
  display: none;
}

/* Kada je showCartPopup = true → prikazuje se kao side drawer */
.cart-popup.show {
  display: flex;
}



/* ========================
Responsive stilovi za mobilne
======================== */
@media (max-width: 768px) {

  .input {
  width: 300px;
  margin-bottom: 20px;
  height: 30px;
  border-radius: 20px;
}
  /* Table container omogućava horizontalni scroll */
  .table-container {
    overflow-x: auto;
    width: 100%;
  }

  table {
    width: 100%; /* zauzima širinu kontejnera */
    min-width: 600px; /* minimalna širina tabele da se ne zgužva */
    font-size: 12px;
    border-collapse: collapse;
  }

  th, td {
    padding: 4px 6px;
    white-space: normal; /* dozvoljava prelamanje teksta */
    word-break: break-word; /* reči prelaze u novi red ako su predugačke */
    max-width: 180px; /* opcionalno ograničenje širine kolona */
  }

  /* Stilovi za slike u tabeli */
  .proizvod-slika {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
  }

  /* Dugmad unutar tabele */
  .add-korpa {
    width: 100px;
    padding: 6px 8px;
    margin-right: 10px;
    font-size: 12px;
  }

  /* Desktop-only elementi se sakrivaju */
  .desktop-only {
    display: none;
  }

  /* Mobilni prikaz proizvoda */
  .mobile-only {
    display: block;
    width: 100%;
    padding: 10px 0;
  }

  .product-card {
    display: flex;
    gap: 10px;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 8px;
    margin-bottom: 10px;
    background: #fff;
  }

  .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .product-info h4, .product-info p {
    margin: 0;
    font-size: 13px;
  }

  .product-info button {
    width: fit-content;
    padding: 4px 8px;
    font-size: 12px;
  }

  .product-info a {
    margin-top: 5px;
    font-size: 12px;
    color: #007bff;
    text-decoration: underline;
  }
  .cart-button {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #641515;
  color: white;
  border: none;
  padding: 10px 15px;
  margin-right: 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  z-index: 2000;
}

}



</style>
