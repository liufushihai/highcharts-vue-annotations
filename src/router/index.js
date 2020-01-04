import Vue from 'vue'
import Router from 'vue-router'
import AnnotationsChart from '@/components/AnnotationsChart'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'AnnotationsChart',
      component: AnnotationsChart
    }
  ]
})
