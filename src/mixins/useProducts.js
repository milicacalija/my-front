// mixin useProducts.
import api from '@/api';
 
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
    const response = await api.get
('/proizvodi');
    // backend vraća objekat { data: [...] }
    this.items = response.data.data;  

    // kreiranje mape po pro_id
    this.itemsMap = {};
    this.items.forEach(item => {
      this.itemsMap[item.pro_id] = item;
    });

    logger.log("ItemsMap kreirana:", this.itemsMap);
  } catch (error) {
    logger.error("Greška pri učitavanju proizvoda:", error);
  }
}

}}