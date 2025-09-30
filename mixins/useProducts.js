import api from '@/api'

export const productMixin = {
  data() {
    return {
      items: [],
      itemsMap: {},   // mapirano po pro_id za brzi pristup
      cartItems: []
    };
  },
  methods: {
    async loadProducts() {
  try {
    const response = await api.get('/proizvodi');
    
    // backend vraća objekat { data: [...] } ili samo [...]
    this.items = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
        ? response.data
        : [];

    // kreiranje mape po pro_id
    this.itemsMap = {};
    this.items.forEach(item => {
      if (item && item.pro_id != null) {
        this.itemsMap[item.pro_id] = item;
      }
    });

    console.log("✅ ItemsMap kreirana:", this.itemsMap);

  } catch (error) {
    console.error("❌ Greška pri učitavanju proizvoda:", error);
    this.items = [];
    this.itemsMap = {};
  }
}
  }}