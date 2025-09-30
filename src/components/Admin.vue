<template>
  <div class="admin-report">
       
    <h1>Admin panel</h1>

    <!-- Pretraga korisnika -->
    <div class="search-container">
      <input v-model="searchUser" placeholder="Pretraži korisnike po imenu ili emailu" />
    </div>

    <!-- Statistika korisnika i narudžbenica -->
    <div class="stats-container">
      <div class="stat-card">
        <strong>Ukupno korisnika:</strong> {{ users.length }}
      </div>
      <div class="stat-card">
        <strong>Ukupno narudžbenica:</strong> {{ totalNarudzbenica }}
      </div>
      <div class="stat-card">
        <strong>Ukupna vrednost narudžbenica:</strong> {{ ukupnaVrednost }} RSD
      </div>
    </div>

    <!-- Tabela korisnika -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Ime</th>
            <th>Email</th>
            <th>Nivo</th>
            <th>Narudžbenice</th>
            <th>Datumi/Način plaćanja</th>
            <th>Ukupna cena</th>
            <th>Akcija</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.usr_id">
            <td>{{ user.usr_name }}</td>
            <td>{{ user.usr_email }}</td>
<td>
  {{ user.usr_level != null && !isNaN(Number(user.usr_level)) ? Number(user.usr_level) : '-' }}
</td>
      
      
      <td>
              <div v-if="user.narudzbenice?.length" class="tooltip-wrapper">
                 
                <span>{{ user.narudzbenice.length }}</span>
                <div class="tooltip-content">
                  <strong>Narudžbenice:</strong>
                  <div class="tooltip-grid">
                    <div v-for="nar in user.narudzbenice" :key="nar.nar_id" class="narudzbenica-row">
                      <div class="nar-id"><strong>ID:</strong> {{ nar.nar_id }}</div>
                      <div class="stavke">
                        <ul>
                          <li v-for="stavka in nar.stavke" :key="stavka.fk_stv_pro_id">
                            {{ stavka.pro_iupac }} — Količina: {{ stavka.stv_kolicina }}, Cena: {{ stavka.uk_stv_cena }} RSD
                          </li>
                        </ul>
                      </div>
                       <div class="actions">
            <span class="icon-btn" @click="editOrder(nar)" title="Izmeni">✏️</span>
            <span class="icon-btn" @click="deleteOrder(nar.nar_id)" title="Obriši">🗑️</span>
          </div>
                    </div>
                  </div>
                </div>
              </div>
              <span v-else>Nema narudzbenica</span>
            </td>

            <!-- Tooltip sa datumima narudžbenica -->
                 <td>
            <div v-if="user.narudzbenice?.length" class="tooltip-wrapper">
    <!-- Prva narudžbenica -->
    <span>
      {{ user.narudzbenice[0].nac_plat || '-' }} — {{ formatDate(user.narudzbenice[0].nar_datum) }}
    </span>

    <!-- Tooltip sa svim narudžbenicama -->
    <div class="tooltip-content">
      <strong>Način plaćanja i datumi:</strong>
      <ul>
        <li v-for="nar in user.narudzbenice" :key="nar.nar_id">
          Narudžbenica #{{ nar.nar_id }}: {{ nar.nac_plat || '-' }} — {{ formatDate(nar.nar_datum) }}
        </li>
      </ul>
    </div>
  </div>
  <span v-else>-</span>

</td> 
            <!-- Ukupna cena -->
            <td>
              <span v-if="user.narudzbenice?.length">{{ ukupnaCena(user) }}</span>
              <span v-else>-</span>
            </td>

          
    


            <!-- Dugme za brisanje -->
            <td>
  <!-- Ikona olovke za izmenu -->
  <span class="icon-btn" @click="editProduct(product)" title="Izmeni">
    ✏️
  </span>

  <!-- Ikona gumice za brisanje -->
  <span class="icon-btn" @click="deleteProduct(product.pro_id)" title="Obriši">
    🗑️
  </span>
</td>
          </tr>
        </tbody>
      </table>

      <!-- Poruka ako nema korisnika u pretrazi -->
      <div v-if="searchUser && filteredUsers.length === 0" class="no-result">
        Nema korisnika koji odgovara pretrazi.
      </div>
    </div>
 <Bonus />  <!-- ovde pozivaš komponentu -->
    <!-- Pregled poslednja 2 proizvoda -->
    <section class="admin-section">
      <h2>Poslednja dva proizvoda unesena u bazu podataka</h2>
      <input type="text" v-model="searchProducts" placeholder="Pretraži proizvode po IUPAC nazivu" />
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Naziv</th>
              <th>Cena</th>
              <th>Količina</th>
              <th>Akcija</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts.slice(-2)" :key="product.pro_id">
              <td>{{ product.pro_iupac }}</td>
              <td>{{ product.pro_cena }}</td>
              <td>{{ product.pro_kolicina }}</td>
             <td>
  <!-- Ikona olovke za izmenu -->
  <span class="icon-btn" @click="editProduct(product)" title="Izmeni">
    ✏️
  </span>

  <!-- Ikona gumice za brisanje -->
  <span class="icon-btn" @click="deleteProduct(product.pro_id)" title="Obriši">
    🗑️
  </span>
</td>

            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Dodavanje novog proizvoda -->
    <section class="admin-section">
      <h2>Dodaj novi proizvod</h2>
      <div class="form-grid">
        <input type="text" v-model="newProduct.pro_iupac" placeholder="Naziv proizvoda" />
        <input type="number" v-model.number="newProduct.pro_cena" placeholder="Cena" />
        <input type="number" v-model.number="newProduct.pro_kolicina" placeholder="Količina" />
        <input type="text" v-model="newProduct.pro_jedinicamere" placeholder="Jedinica mere" />
        <input type="number" v-model.number="newProduct.pro_rok" placeholder="Rok trajanja" />
        <input type="number" v-model.number="newProduct.pro_lager" placeholder="Lager" />
        <input type="text" v-model="newProduct.tip_hemikalije" placeholder="Tip hemikalije" />
         <input type="text" v-model="newProduct.tpr_naziv"
         placeholder="Primena" />
      </div>
      <button class="logout-btn" @click="addProduct">Dodaj proizvod</button>
    </section>
     <Kompanije />  <!-- ovde pozivaš komponentu -->

     <Poruke />  <!-- ovde pozivaš komponentu -->


    <button class="logout-btn" @click="logout">Odjavi se</button>
  </div>
</template>


<script>
import api from '@/api';
import '@/components/table.css';
import Swal from 'sweetalert2';
import Bonus from './Bonus.vue';
import Kompanije from './Kompanije.vue';
import Poruke from './Poruke.vue';



export default {
  name: "Admin",
    components: {
      Bonus, Poruke, Kompanije
    
  },
  data() {
    return {
      users: [],
      searchUser: '',
      products: [],
      searchProducts: '',
      newProduct: { pro_iupac:'', pro_cena:null, pro_kolicina:null, pro_jedinicamere:'', pro_rok:null, pro_lager:null, tip_hemikalije:'' }
    };
  },
  computed: {
   filteredUsers() {
      if (!this.searchUser) return this.users;
      return this.users.filter(u =>
        u.usr_name.toLowerCase().includes(this.searchUser.toLowerCase()) ||
        u.usr_email.toLowerCase().includes(this.searchUser.toLowerCase())
      );
    },
    totalNarudzbenica() {
      return this.users.reduce((acc, u) => acc + (u.narudzbenice?.length || 0), 0);
    },
    ukupnaVrednost() {
    // Sabira nar_cena svih narudžbenica svih korisnika
    return this.users.reduce((acc, user) => {
      return acc + (user.narudzbenice?.reduce((sum, nar) => {
        return sum + parseFloat(nar.nar_cena || 0);
      }, 0) || 0);
    }, 0);
  },
    filteredProducts() {
      if (!this.searchProducts) return this.products;
      return this.products.filter(p => p.pro_iupac.toLowerCase().includes(this.searchProducts.toLowerCase()));
    }
  },
  methods: {
    editUser(user) {
  this.editingUser = { ...user }; // kopija da se ne menja odmah original
  Swal.fire({
    title: 'Izmeni korisnika',
    html: `
      <input id="usr_name" class="swal2-input" placeholder="Ime" value="${user.usr_name}">
      <input id="usr_email" class="swal2-input" placeholder="Email" value="${user.usr_email}">
      <input id="usr_level" type="number" class="swal2-input" placeholder="Nivo" value="${user.usr_level}">
    `,
    showCancelButton: true,
    confirmButtonText: 'Sačuvaj',
    preConfirm: () => {
      return {
        usr_name: document.getElementById('usr_name').value,
        usr_email: document.getElementById('usr_email').value,
        usr_level: parseInt(document.getElementById('usr_level').value),
      };
    }
  }).then((result) => {
    if (result.isConfirmed) this.updateUser(user.usr_id, result.value);
  });
},

async updateUser(id, updatedData) {
  try {
    await api.put(`/admin/users/${id}`, updatedData);
    const index = this.users.findIndex(u => u.usr_id === id);
    if (index !== -1) this.users[index] = { ...this.users[index], ...updatedData };
    Swal.fire({ icon: 'success', title: 'Korisnik izmenjen', showConfirmButton: false, timer: 1500 });
  } catch (err) {
    logger.error(err);
    Swal.fire({ icon: 'error', title: 'Greška pri izmeni korisnika' });
  }
},
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    },
   mesecRecima(datum, format = 'mesec') {
    if (!datum) return '';
    const d = new Date(datum);

    if (format === 'dd.mm') {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}.${month}`;
    }

    // Podrazumevani format: mesec rečima
    const meseci = [
      'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
      'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
    ];
    return meseci[d.getMonth()];
  },
    ukupnaCena(user) {
  return user.narudzbenice?.reduce((sum, n) => sum + parseFloat(n.nar_cena), 0) || 0;
},
 nacPlat(user) {
  if (!user.narudzbenice || !user.narudzbenice.length) {
    logger.log('Prva narudžbenica korisnika:', user.narudzbenice[0]);
    logger.log('Korisnik nema narudžbenica:', user.usr_name);
    return '-';
  }

  logger.log('Narudžbenice korisnika:', user.usr_name, user.narudzbenice);

  const placanja = user.narudzbenice
    .map((n, index) => {
      logger.log(`narudzbenica #${index + 1}`, n.nac_plat);
      return n.nac_plat;
    })
    .filter(p => p && p.trim() !== '');

  logger.log('Filtrirani nac_plat:', placanja);

  return placanja.length ? placanja.join(', ') : '-';
},
    async addProduct() {
  try {
    const response = await api.post('/proizvodi', this.newProduct);
    this.products.push(response.data); // dodajemo proizvod u lokalni array
    // Reset forme
    this.newProduct = { pro_iupac:'', pro_cena:null, pro_kolicina:null, pro_jedinicamere:'', pro_rok:null, pro_lager:null, tip_hemikalije:'' };
    Swal.fire({ icon: 'success', title: 'Proizvod dodat', showConfirmButton: false, timer: 1500 });
  } catch (err) {
    logger.error(err);
    Swal.fire({ icon: 'error', title: 'Greška pri dodavanju proizvoda' });
  }
},
async deleteProduct(id) {
  try {
    await api.delete
(`/proizvodi${id}`);
    this.products = this.products.filter(p => p.pro_id !== id);
    Swal.fire({ icon: 'success', title: 'Proizvod obrisan', showConfirmButton: false, timer: 1500 });
  } catch (err) {
    logger.error(err);
    Swal.fire({ icon: 'error', title: 'Greška pri brisanju proizvoda' });
  }
},

async deleteUser(id) {
  try {
    await api.delete(`/admin/users/${id}`);
    this.users = this.users.filter(u => u.usr_id !== id);
    Swal.fire({ icon: 'success', title: 'Korisnik obrisan', showConfirmButton: false, timer: 1500 });
  } catch (err) {
    logger.error(err);
    Swal.fire({ icon: 'error', title: 'Greška pri brisanju korisnika' });
  }
},
async deleteOrder(narId) {
  try {
    // Šaljemo DELETE sa query parametrom
    await api.delete(`/narudzbenice?id=${narId}`);

    // Ažuriramo lokalni users array
    this.users = this.users.map(user => {
      if (user.narudzbenice?.length) {
        return {
          ...user,
          narudzbenice: user.narudzbenice.filter(n => n.nar_id !== narId)
        };
      }
      return user;
    });

    Swal.fire({
      icon: 'success',
      title: 'Narudžbenica obrisana',
      showConfirmButton: false,
      timer: 1500
    });
  } catch (err) {
    logger.error('Greška pri brisanju narudžbenice:', err);
    Swal.fire({
      icon: 'error',
      title: 'Greška pri brisanju narudžbenice'
    });
  }
},

  async fetchData() {
  try {
    
    // ----- // 1️⃣ Dohvat svih korisnika
    const usersRes = await api.get('/admin/users'); 
    const allUsers = usersRes.data;
    // 1️⃣ Dohvat narudžbenica i korisnika
    // -------------------------------
    const res = await api.get('/narudzbenice');
    const data = res.data;
// Grupisanje po korisniku
    const usersMap = {};
    allUsers.forEach(u => {
      usersMap[u.usr_id] = { ...u, narudzbenice: [] };
    });


       data.forEach(nar => {
      const uId = nar.user.usr_id;
      if (usersMap[uId]) {
        usersMap[uId].narudzbenice.push({
          nar_id: nar.nar_id,
          nar_datum: nar.nar_datum,
          nar_cena: nar.nar_cena,
          nac_plat: nar.nac_plat,
          stavke: nar.stavke
        });
      }
    });

    this.users = Object.values(usersMap);
    logger.log('Korisnici sa narudzbenicama:', this.users);

    logger.log('Korisnici sa narudzbenicama:', this.users);

    // -------------------------------
    // 2️⃣ Dohvat proizvoda (poslednja 2)
    // -------------------------------
    const productsRes = await api.get('/proizvodi');
    this.products = productsRes.data.data;

    logger.log('Poslednja 2 proizvoda:', this.products.slice(-2));
  } catch (err) {
    logger.error(err);
  }
},

    logout() {
      localStorage.clear();
      this.$router.push("/"); // ili "/" ako nemaš login rutu
    },
  },
  mounted() {
    this.fetchData();
  }
};
</script>
<style scoped>

.admin-report {
  display: flex;
  flex-direction: column;
  align-items: center; /* centriranje svih sekcija horizontalno */
  padding: 20px;
}

.admin-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center; /* centriranje sadržaja sekcije */
}

.table-container {
  position: relative; /* već postoji, zadržavamo zbog tooltip-a */
  overflow: visible;  /* dozvoli tooltip da se vidi iznad thead */
  width: 90%;         /* centrira se unutar sekcije */
  margin: 20px auto;  /* centriranje horizontalno */
}



table {
  width: 100%;
  max-width: 1200px;
  border-collapse: collapse;
  table-layout: fixed;
}

th, td {
  border: 1px solid #762e2e;
  padding: 8px;
  text-align: center;
  word-wrap: break-word;
  height: 40px; /* fiksna visina */
  position: relative; /* za tooltip */
}

th {
  background-color: #641515;
  color: white;
  font-weight: bold;
}

td {
  background-color: #fff;
  color: #000;
  text-align: left;
  /*Zbog overflow hidden nije radio hover
  overflow: hidden;*/
}

/* Tooltip koji se pojavljuje na hover */
.tooltip-container .tooltip-content {
  display: none; /* sakriveno dok se ne hoveruje */
  position: absolute;
  top: 100%;
  left: 0;
  width: 400px;
  padding: 10px;
  background: #fff;
  border: 1px solid #762e2e;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 10;
}

.tooltip-container:hover .tooltip-content {
  display: block;
}

/* Grid unutar tooltip-a */
.tooltip-grid {
  display: grid;
  gap: 5px;
}

.narudzbenica-row {
  display: flex;
  justify-content: space-between;
}

/* Hover efekat za red */
tbody tr:hover {
  background-color: #ccc0c0;
}
.table-container {
  position: relative;   /* roditelj tooltip-a */
  overflow: visible;    /* dozvoli tooltip da se vidi iznad tabele */
}

.tooltip-wrapper {
  position: relative;   /* da child tooltip bude absolute u okviru table-container */
  display: inline-block;
}

.tooltip-wrapper .tooltip-content {
  display: none;
  position: absolute;   /* u odnosu na table-container */
  top: 50%;             /* centrirano po visini ćelije */
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background: #fff;
  border: 1px solid #762e2e;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 9999;        /* sigurno iznad thead i svega */
}

.tooltip-wrapper:hover .tooltip-content {
  display: block;
}
.logout-btn {
  margin-top: 20px;
  padding: 10px 20px;
  border-radius: 20px;
  background-color: #641515;
  color: white;
  font-weight: bold;
  border: none;
  cursor: pointer;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.icon-btn {
  cursor: pointer;
  display: inline-block;
  margin: 0 5px;
  font-size: 18px; /* veličina ikone */
  transition: transform 0.2s;
}

.icon-btn:hover {
  transform: scale(1.2); /* mali hover efekat */
  color: #641515;
}


</style>
