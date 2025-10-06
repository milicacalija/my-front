<template>
  <div class="product-wrapper">
    <!-- Slika proizvoda -->
    <div class="selected-proizvod" v-if="proizvod">
      <img 
        :src="`/images/${encodeURIComponent(proizvod.pro_iupac)}.jpg`" 
        :alt="proizvod.pro_iupac" 
        class="proizvod-slika"
      />
    </div>

    <!-- Tabela sa podacima, colsapn definisi ako imas kolone pa hoces da budu obuhvacene -->
    <div class="table-container">
      <div v-if="loading">
        <p>Učitavanje proizvoda...</p>
      </div>

      <table v-else-if="proizvod">
        <thead>
      <tr>
        
      <th> Opis proizvoda</th>  
        </tr>
    </thead>
        <tbody>
          <tr>
        <td>
          <p><strong>Naziv hemikalije:</strong> {{ proizvod.pro_iupac }}</p>
          <p><strong>Cena:</strong> {{ proizvod.pro_cena }} RSD </p>
          <p><strong>Količina:</strong> {{ proizvod.pro_kolicina }}</p>
<p><strong>Lager:</strong> 
  {{ proizvod.pro_lager > 0 ? proizvod.pro_lager : 'Nema na lageru' }}
</p>



      
        </td>
      </tr>
        </tbody>
      </table>

      <div v-else>
        <p>Proizvod nije pronađen.</p>
      </div>

      <!-- Dugme Dodaj u korpu -->
      <div class="button-container" v-if="proizvod">
<router-link
  :to="{ name: 'proizvodi' }"
  class="more-link"
>
  Pogledaj detalje / Poruči proizvod →
</router-link>
  </div>
    </div>
  </div>
</template>

<script>
import { productMixin } from '@/mixins/useProducts';

export default {
  name: 'ProizvodOpis',
  mixins: [productMixin],
props: { proizvodId: { type: [String, Number], required: true } 
},
  data() {
    return { loading: true };
  },
  computed: {
    proizvod() {
      if (!this.itemsMap || Object.keys(this.itemsMap).length === 0) return null;
      return this.itemsMap[String(this.proizvodId)] || null;
    },
    selectedImageProizvod() {
      return this.proizvod;
    }
  },
  async mounted() {
    await this.loadProducts();
    this.loading = false;
  },
  methods: {
    dodajUkorpu(proizvod) {
      console.log('Dodajem u korpu:', proizvod);
    }
  }
};

</script>
<style>
/*Proizvodi
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
.table-container {
  margin: 0;            /* uklanja automatsko centriranje */
  margin-right: 200px;   /* razmak između tabele i slike (ako treba dodatno prilagoditi) */
    margin-top: 20px;   /* razmak između tabele i slike (ako treba dodatno prilagoditi) */

  width: auto;          /* zauzima samo koliko joj treba */
  overflow-x: auto;     /* ostaje scroll ako je potrebno */
}
/* Media query za male ekrane */
@media (max-width: 768px) {
  .product-wrapper {
    flex-direction: column;  /* stavi proizvod i tabelu jedan ispod drugog */
    align-items: center;
  }

  .selected-proizvod {
    flex: 1 1 100%;
    max-width: 100%;
  }

  .table-container {
    margin-right: 0;
  }
}

</style>