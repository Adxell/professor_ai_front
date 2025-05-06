<template>
  <q-page class="row items-center justify-center">
    <q-card class="q-pa-md" style="width: 320px">
      <q-card-section>
        <div class="text-h6">Iniciar sesión</div>
      </q-card-section>

      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <q-input
          v-model="email"
          label="Email"
          type="email"
          :rules="[ val => !!val || 'El email es requerido', val => emailPattern.test(val) || 'Email no válido' ]"
          lazy-rules
        />

        <q-btn
          type="submit"
          label="Iniciar sesión"
          :disable="!isFormValid"
        />
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { LocalStorage, useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useRouter } from 'vue-router'

const $q = useQuasar()

const router = useRouter()
const email = ref('')

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isFormValid = computed(() => {
  return emailPattern.test(email.value)
})

const onSubmit = async () => {
  const {data} = await api.post('/user/login_user', {email: email.value})
  LocalStorage.setItem("token", data.data.token)
  LocalStorage.setItem("role", data.data.role)
  LocalStorage.setItem("email", data.data.email)
  router.push("/")
  $q.notify({ type: 'positive', message: `Entrando` })
}
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
