<template>
  <div class="cart-button-container">
    <button class="cart-button" @click="toggleCartPopup">
      Korpa <span v-if="cartCount">({{ cartCount }})</span>
    </button>

    <div class="cart-overlay" :class="{ show: showCartPopup }" @click="toggleCartPopup"></div>

    <div class="cart-popup" :class="{ show: showCartPopup }">
      <div v-if="resolvedCartItems.length > 0">
        <strong>Vaša korpa:</strong>
        <ul>
          <li
            v-for="(item, index) in resolvedCartItems"
            :key="(item.fk_stv_pro_id || index) + '-' + index"
            class="cart-item"
          >
            <div class="cart-item-info">
              {{ item.product.pro_iupac || 'Nepoznata stavka' }} - 
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
</template>

<script>
import cartMixin from '@/mixins/cartMixin.js';
import { getImageUrl } from '@/components/korpaimg.js';

export default {
  name: 'Korpa',
  mixins: [cartMixin],

  mounted: async function() {
    console.log('🔹 Mounted Korpa.vue');
    try {
      await this.loadItemsMap(); // učitaj proizvode
      console.log('🔹 itemsMap nakon učitavanja:', this.itemsMap);
    } catch (e) {
      console.error('❌ Greška u loadItemsMap:', e);
    }
    this.loadCart();
    console.log('🔹 cartItems nakon loadCart:', this.cartItems);
    this.loadOrder();
  },

  

  methods: {
    getImageUrl(item) {
      return getImageUrl(item);
    },
    handleImageError(event, pro_iupac) {
      console.warn('⚠️ Slika nije pronađena za:', pro_iupac);
      if (event && event.target) {
        event.target.src = '/images/korpica-circle.png'; 
      }
    },
    incrementQuantity(proId) {
      console.log('🔹 incrementQuantity:', proId);
      this.cartItems = this.cartItems.map(item => {
        if (item.fk_stv_pro_id === proId) {
          item.stv_kolicina++;
          item.uk_stv_cena = item.stv_kolicina * item.stv_cena;
        }
        return item;
      });
    },
    decrementQuantity(proId) {
      console.log('🔹 decrementQuantity:', proId);
      this.cartItems = this.cartItems.map(item => {
        if (item.fk_stv_pro_id === proId && item.stv_kolicina > 1) {
          item.stv_kolicina--;
          item.uk_stv_cena = item.stv_kolicina * item.stv_cena;
        }
        return item;
      });
    },
    removeItem(itemToRemove) {
      console.log('🔹 removeItem:', itemToRemove);
      this.cartItems = this.cartItems.filter(item => item !== itemToRemove);
      this.syncCartToLocalStorage();
    },
    clearAllItems() {
      console.log('🔹 clearAllItems');
      this.cartItems = [];
      this.syncCartToLocalStorage();
    },
    goToCheckout() {
      console.log('🔹 goToCheckout');
      this.$router.push('/nastkupovine');
    }
  }
};
</script>



<style scoped>
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
</style>
