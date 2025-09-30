<template>
<Bonus> </Bonus>


</template>

<script>
/*Da bi mogli da prikazemo komponentu kompanija iz stranice Kompanija.vue moramo da je importujemo*/
import Bonus from '@/components/Bonus.vue'
export default{
    name: 'BonusView',
    /*Da bi mogli da koristimo Kompanije kao component moramo da je definisemo kao komponentu u delu components*/
    components: {
        Bonus
    }
    /*Idemo do rute do file.index.js i pravimo novu rutu*/
}
</script>
