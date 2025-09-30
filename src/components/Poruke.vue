<template>
  <div class="admin-poruke">
    <h2>Pregled svih poruka</h2>

    <table v-if="poruke.length > 0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Pošiljalac</th>
          <th>Poruka</th>
          <th>Tip</th>
          <th>Status</th>
          <th>Akcija</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in poruke" :key="p.por_id">
          <td>{{ p.por_id }}</td>
          <td>
            <!-- Ako ima user_id prikazati, inače anonimni -->
            {{ p.fk_user_sender ? p.fk_user_sender : "Anonimni" }}
          </td>
          <td>{{ p.por_content }}</td>
          <td>{{ p.tip }}</td>
          <td>{{ p.status }}</td>
          <td>
            <select v-model="p.status" @change="promeniStatus(p)">
              <option value="nov">Nov</option>
              <option value="u obradi">U obradi</option>
              <option value="reseno">Rešeno</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>Nema poruka u sistemu.</p>
  </div>
</template>

<script>
import api from '@/api';
 
export default {
  name: "Poruke",
  data() {
    return {
      poruke: []
    };
  },
  methods: {
    async ucitajPoruke() {
      try {
        const res = await api.get("/poruke");
        this.poruke = res.data;
      } catch (err) {
        logger.error("Greška pri učitavanju poruka:", err);
      }
    },
    async promeniStatus(poruka) {
      try {
        await api.put(`/poruke/${poruka.por_id}`, {
          status: poruka.status
        });
        logger.log("Status uspešno ažuriran!");
      } catch (err) {
        logger.error("Greška pri promeni statusa:", err);
      }
    }
  },
  mounted() {
    this.ucitajPoruke();
  }
};
</script>
