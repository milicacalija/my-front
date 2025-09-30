<template>
  <div class="bonus-container">
    <h2>Lista bonusa</h2>

    <!-- Tabela sa bonusima -->
    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Narudzbenica ID</th>
          <th>Proizvod ID</th>
          <th>Stavka ID</th>
          <th>Popust</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bonus in bonusi" :key="bonus.bns_id">
          <td>{{ bonus.bns_id }}</td>
          <td>{{ bonus.fk_bns_nar_id }}</td>
          <td>{{ bonus.fk_bns_pro_id || '-' }}</td>
          <td>{{ bonus.fk_bns_stv_id || '-' }}</td>
          <td>{{ bonus.bns_popust }}</td>
        </tr>
      </tbody>
    </table>

    <h3>Dodaj novi bonus</h3>
    <form @submit.prevent="dodajBonus">
      <input v-model="noviBonus.fk_bns_nar_id" type="number" placeholder="Narudzbenica ID" required />
      <input v-model="noviBonus.fk_bns_pro_id" type="number" placeholder="Proizvod ID" />
      <input v-model="noviBonus.fk_bns_stv_id" type="number" placeholder="Stavka ID" />
      <input v-model="noviBonus.bns_popust" type="number" placeholder="Popust" required />
      <button type="submit">Dodaj bonus</button>
    </form>

    <p v-if="poruka">{{ poruka }}</p>
  </div>
</template>

<script>
import api from '@/api';
import Swal from 'sweetalert2';

export default {
  name: 'Bonus',
  data() {
    return {
      bonusi: [],
      noviBonus: {
        fk_bns_nar_id: '',
        fk_bns_pro_id: '',
        fk_bns_stv_id: '',
        bns_popust: ''
      },
      poruka: ''
    };
  },
  methods: {
    // GET: svi bonusi
   async ucitajBonuse() {
  try {
    const response = await api.get('/bonus');
    this.bonusi = response.data.data;

    // Provera da li neka narudzbenica ima vrednost > 10000
    this.bonusi.forEach(bonus => {
      if (bonus.nar_cena > 10000) {
        Swal.fire({
          icon: 'success',
          title: 'Čestitamo!',
          text: 'Osvojili ste Bonus 🎉',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  } catch (err) {
    console.error('Greška pri učitavanju bonusa:', err);
  }
}
    },

    // POST: dodavanje novog bonusa
   async dodajBonus() {
  try {
    const response = await api.post('/bonus', this.noviBonus);
    this.poruka = response.data.message;

    // Očisti formu
    this.noviBonus = { fk_bns_nar_id: '', fk_bns_pro_id: '', fk_bns_stv_id: '', bns_popust: '' };

    // Ponovo učitaj bonuse
    await this.ucitajBonuse();

    // Opcionalno: prikaz SweetAlert2 poruke ako popust postoji
    if (this.noviBonus.bns_popust > 0) {
      Swal.fire({
        icon: 'success',
        title: 'Čestitamo!',
        text: 'Osvojili ste Bonus 🎉',
        timer: 3000,
        showConfirmButton: false
      });
    }
  } catch (err) {
    console.error('Greška pri dodavanju bonusa:', err);
    this.poruka = 'Došlo je do greške pri dodavanju bonusa.';
  }
},
  mounted() {
    this.ucitajBonuse();
  }
};
</script>

<style scoped>
.bonus-container {
  max-width: 800px;
  margin: 20px auto;
  font-family: Arial, sans-serif;
}

table {
  width: 100%;
  margin-bottom: 20px;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: center;
}
</style>
