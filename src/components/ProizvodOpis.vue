<template>
  <div class="product-wrapper">
    <div class="product-card" v-if="proizvod">
      <!-- Slika proizvoda -->
      <div class="product-image">
        <img 
          :src="`/images/${encodeURIComponent(proizvod.pro_iupac)}.jpg`" 
          :alt="proizvod.pro_iupac" 
        />
      </div>

      <!-- Opis proizvoda -->
      <div class="product-details">
        <h2>{{ proizvod.pro_iupac }}</h2>
        <p><strong>Cena:</strong> {{ proizvod.pro_cena }} RSD</p>
        <p><strong>Količina:</strong> {{ proizvod.pro_kolicina }}   {{ proizvod.pro_jedinicamere }}</p>
       <p><strong>Lager: </strong>{{ proizvod.pro_lager}} </p>
   
       
        <!-- Dugme za detalje / porudžbinu -->
        <router-link :to="{ name: 'proizvodi' }" class="btn-details">
          Pogledaj detalje / Poruči proizvod →
        </router-link>
      </div>
    </div>

    <div v-else-if="loading">
      <p>Učitavanje proizvoda...</p>
    </div>

    <div v-else>
      <p>Proizvod nije pronađen.</p>
    </div>
  </div>
</template>


<script>
import { productMixin } from '@/mixins/useProducts';

export default {
  name: 'ProizvodOpis',
  mixins: [productMixin],
  props: { proizvodId: [String, Number] },
  data() {
    return { loading: true };
  },
  computed: {
    proizvod() {
      if (!this.itemsMap || Object.keys(this.itemsMap).length === 0) return null;
      return this.itemsMap[String(this.proizvodId)] || null;
    }
  },
  async mounted() {
    await this.loadProducts();
    this.loading = false;
  },
  methods: {
    dodajUkorpu(proizvod) {
      console.log("Dodajem u korpu:", proizvod);
      // logika za cartItems iz mixina
    }
  }
};
</script>
<style scoped>
.product-wrapper {
  margin: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.product-card {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background-color: #fff;
}

.product-image img {
  width: 200px;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.product-details h2 {
  margin-top: 0;
  color: #333;
}

.product-details p {
  margin: 5px 0;
}

.btn-details {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 15px;
  background-color: #641515;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.2s;
}

.btn-details:hover {
  background-color: #370808;
}

/* Responsive */
@media (max-width: 768px) {
  .product-card {
    flex-direction: column; /* slika iznad detalja */
    align-items: center;    /* centriranje */
    gap: 15px;
  }

 .product-image {
    width: 100px;   /* smanjen kontejner */
    margin: 0 auto;        /* centriranje celog kontejnera */
  }

  .product-image img {
    width: 100%;           /* slika se prilagođava kontejneru */
    height: auto;
  }

  .product-details {
    text-align: center; /* lepše na mobilnom */
  }

  .btn-details {
    width: 100%;      /* dugme zauzima celu širinu */
    max-width: 170px;
    text-align: center;
  }
}
</style>

