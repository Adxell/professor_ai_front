<template>
  <q-page padding>

<q-toolbar class="q-mb-md">
  <q-toolbar-title>Cursos disponibles</q-toolbar-title>
</q-toolbar>

<q-list bordered separator>
  <q-item v-for="course in courses" :key="course.id">
    <q-item-section>
      <q-item-label class="text-h6">{{ course.course_name }}</q-item-label>
      <q-item-label caption>Profesor: {{ course.professor_id }}</q-item-label>
    </q-item-section>
    <q-item-section side top>
      <q-btn
        size="md"
        label="Ingresar"
        :loading="loadingId === course.id"
        @click="joinCourse(course.id)"
      />
    </q-item-section>
  </q-item>

  <q-item v-if="courses.length === 0 && !loadingList">
    <q-item-section class="text-center">
      No hay cursos disponibles.
    </q-item-section>
  </q-item>
</q-list>

</q-page>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { api } from "boot/axios";
import { useQuasar } from 'quasar'

const $q = useQuasar()

const courses = ref([])
const loadingList = ref(false)
const loadingId = ref(null)

const fetchCourses = async () => {
  loadingList.value = true
  try {
    const resp = await api.get('/course/get_all_courses')
    courses.value = resp.data
  }
  catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error cargando cursos.' })
  }
  finally {
    loadingList.value = false
  }
}

const joinCourse = async (courseId) => {
  loadingId.value = courseId
  try {
    await api.post(`/api/courses/${courseId}/enroll`)  // ➔ ajusta endpoint
    $q.notify({ type: 'positive', message: 'Te has inscrito al curso.' })
  }
  catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al ingresar al curso.' })
  }
  finally {
    loadingId.value = null
  }
}

onMounted(fetchCourses)

</script>
