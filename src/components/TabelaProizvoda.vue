<template>
  <div class="tabela-proizvoda">
    <!-- Desktop tabela samo ako je širi ekran, Dodaj fallback sliku kad dođe do greške onaj deo sa error, ali to je kod img koda
 -->
    <table v-if="!isMobile" class="desktop-only">
      <thead>
        <tr>
          <th>ID</th>
          <th>Naziv hemikalije</th>
          <th>Slika</th>
          <th>Cena RSD</th>
          <th>Lager</th>
          <th>Količina</th>
          <th>Akcija</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in items" :key="product.pro_id">
          <td>{{ product.pro_id }}</td>
          <td>{{ product.pro_iupac }}</td>
<td>
  <img 
    :src="getImageUrl(product)" 
    class="proizvod-slika"
    @error="handleImageError($event, product.pro_iupac)"
  />
</td>
          <td>{{ product.pro_cena }}</td>
          <td>{{ product.pro_lager }}</td>
          <td><input type="number" v-model.number="quantities[product.pro_id]" min="1" class="quantity-input" /></td>
          <td>
            <button 
              class="add-korpa" 
              @click="$emit('add-to-cart', product, quantities[product.pro_id] || 1)"
            >
              Dodaj u korpu
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Mobilni prikaz -->
    <div v-else class="mobile-only">
      <div v-for="product in items" :key="product.pro_id" class="product-card">
        <img 
          :src="getImageUrl(product)" 
          :alt="product.pro_iupac || 'Proizvod'" 
          class="proizvod-slika"
          @error="handleImageError($event, product.pro_iupac)"
        />
        <div class="product-info">
          <h4>{{ product.pro_iupac }}</h4>
          <p>Cena: {{ product.pro_cena }} RSD</p>
          <input type="number" v-model.number="quantities[product.pro_id]" min="1" class="quantity-input" />
          <button 
            class="add-korpa" 
            @click="$emit('add-to-cart', product, quantities[product.pro_id] || 1)"
          >
            Dodaj u korpu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import cartMixin from '@/mixins/cartMixin';
import { getImageUrl } from '@/components/korpaimg.js';

export default {
  name: 'TabelaProizvoda',
  mixins: [cartMixin],
  props: { items: Array },
  data() {
    return {
      quantities: {},
      isMobile: false
    };
  },
  watch: {
    items: {
      immediate: true,
      deep: true,
      handler(newItems) {
        // inicijalizacija količina, bez logova
        this.quantities = {};
        newItems.forEach(p => {
          this.quantities[p.pro_id] = 1;
        });
      }
    }
  },
  methods: {
    // direktno koristi funkciju iz korpaimg.js, bez console.log
    getImageUrl(item) {
      return getImageUrl(item);
    },
    handleImageError(event) {
      if (event && event.target) event.target.src = '/images/korpica.png';
    },
    checkScreenWidth() {
      this.isMobile = window.innerWidth <= 768;
    }
  }
};
</script>



<style scoped>
.tabela-proizvoda table {
  max-width: 1500px;     /* maksimalna širina cele tabele */
  width: 100%;           /* zauzima punu širinu dostupnog prostora */
  border-collapse: collapse;
  table-layout: auto;    /* automatska širina kolona prema sadržaju */
  margin-left: 300px ;     /* centriranje tabele horizontalno */
  display: block;        /* da margin: auto funkcioniše */
}

.tabela-proizvoda th, 
.tabela-proizvoda td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  vertical-align: middle;
    word-break: break-word; /* lomljenje dugih reči */
}
/* Ograničavamo širinu kolone "Naziv hemikalije" itd ogranicimo sirinu kolona u zagradi upisemo koji broj kolone  */
.tabela-proizvoda th:nth-child(2),
.tabela-proizvoda td:nth-child(5),

.tabela-proizvoda td:nth-child(6),
.tabela-proizvoda td:nth-child(7)

 {
    
  max-width: 180px; /* možeš povećati ili smanjiti */
  width: 180px;     /* fiksna širina kolone */
}


.proizvod-slika {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}
.quantity-input {
  width: 50px;
}
.add-korpa {
  margin-top: 10px;
  margin-left: 40px;
  width: 100px;
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
/* Desktop i mobilni klasni prikaz */
.desktop-only { display: table-cell; }
.mobile-only { display: none; }

/* ==========================
   Mobilni prikaz (do 768px)
========================== */
@media (max-width: 768px) {
  .desktop-only { display: none; }
  .mobile-only { display: table-cell; width: 100%; padding: 10px 0; }

  .product-card {
    display: flex;
    gap: 15px;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 10px;
    background: #fff;
  }

  .product-card img.proizvod-slika {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }

  .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .product-info h4 { margin: 0; font-size: 14px; }
  .product-info p { margin: 0; font-size: 13px; }
  .product-info button { width: fit-content; padding: 4px 8px; font-size: 13px; }
  .product-info a { margin-top: 5px; font-size: 12px; color: #007bff; text-decoration: underline; }
  .table-container {
  overflow-x: auto;
  width: 100%;
}

table {
  width: max-content; /* omogućava horizontalni scroll */
  font-size: 12px;
  border-collapse: collapse;
}

th, td {
  padding: 4px 6px; /* manje polja da stane više */
  white-space: normal; /* dozvoljava lomljenje teksta u ćeliji */
  word-break: break-word; /* ako je reč predugačka, prelazi u novi red */
  max-width: 200px; /* opcionalno, da ograničiš širinu kolone */
}

}
</style>
