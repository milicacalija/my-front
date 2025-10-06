// mixin useProducts.
import api from '@/api';
 //Umesto da proizvodId bude u methods, on treba da bude u watch, jer očigledno želiš da reaguješ kad se prop promeni.Znači, ispravi productMixin.js ovako:
export const productMixin = {
  data() {
    return {
      items: [],
      itemsMap: {}, // mapirano po pro_id za brzi pristup
      cartItems: []
    };
  },
  methods: {
    async loadProducts() {
      try {
        const response = await api.get('/proizvodi');
        this.items = response.data.data;

        // kreiranje mape po pro_id
        this.itemsMap = {};
        this.items.forEach(item => {
          this.itemsMap[item.pro_id] = item;
        });

        console.log("ItemsMap kreirana:", this.itemsMap);
      } catch (error) {
        console.error("Greška pri učitavanju proizvoda:", error);
      }
    },

    async loadProizvodById(id) {
      try {
        const response = await api.get(`/proizvodi/${id}`);
        return response.data;
      } catch (err) {
        console.error("Greška pri učitavanju proizvoda ID", id, err);
      }
    }
  },

  // ✅ Ovo premeštamo iz methods u watch:
  watch: {
    proizvodId: {
      immediate: true,
      handler(id) {
        if (id) {
          this.loadProizvodById(id);
        }
      }
    }
  }
};