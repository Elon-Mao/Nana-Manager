import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{
    path: '/',
    redirect: '/students',
  }, {
    path: '/portal',
    name: 'Portal',
    component: () => import('@/views/PortalView.vue')
  }, {
    path: '/students/:id(.*)',
    name: 'Students',
    component: () => import('@/views/StudentsView.vue')
  }, {
    path: '/courses/:id(.*)',
    name: 'Courses',
    component: () => import('@/views/CoursesView.vue')
  }]
})

router.beforeEach((to) => {
  if (to.name !== 'Portal') {
    const userStore = useUserStore()
    if (!userStore.user) {
      return {
        name: 'Portal'
      }
    }
  }
})

export default router
