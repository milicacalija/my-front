<template>
    <div>
        <TabelaProizvoda> </TabelaProizvoda>
     

    </div>
  
  </template>
  <script>
  /*Da bi mogli da prikazemo komponentu kompanija iz stranice Kompanija.vue moramo da je importujemo*/
import TabelaProizvoda from '../components/TabelaProizvoda.vue';
  export default{
      name: 'TabelaProizvodaView',
      /*Da bi mogli da koristimo Kompanije kao component moramo da je definisemo kao komponentu u delu components*/
      components: {
          TabelaProizvoda
      }
      /*Idemo do rute do file.index.js i pravimo novu rutu*/
  }
  </script>
