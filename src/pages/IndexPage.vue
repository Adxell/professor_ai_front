<template>
  <q-page padding>

<q-toolbar class="q-mb-md">
  <q-toolbar-title>Cursos disponibles</q-toolbar-title>

  <q-btn
    v-if="role != 'profesor'"
    @click="crearClase"
  >Crear Clase</q-btn>
  <q-btn
    v-if="role != 'profesor'"
    @click="crearExamen"
  >Crear Examen</q-btn>
</q-toolbar>

<q-list bordered separator>
  <q-item v-for="course in courses" :key="course.id">
    <q-item-section>
      <q-item-label class="text-h6">{{ course.course_name }}</q-item-label>
      <q-item-label caption>Profesor: {{ course.professor_id }}</q-item-label>
    </q-item-section>
    <q-item-section side top>
      <q-btn
        v-if="role == 'estudiante'"
        size="md"
        :label="is_enrolled === true ? 'Inscribir': 'Entrar'"
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

  <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Nuevo Curso</div>
        </q-card-section>

        <q-form class="q-gutter-md q-pa-md">
          <q-input
            v-model="courseName"
            label="Nombre del curso"
            :rules="[ val => !!val || 'El nombre es requerido' ]"
            lazy-rules
            autofocus
          />

          <div class="row justify-end q-gutter-sm">
            <q-btn flat label="Cancelar" @click="showDialog = false" />
            <q-btn
              @click="submitForm"
              label="Guardar"
              color="primary"
              :disable="!isFormValid"
            />
          </div>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Dialogo de Subida -->
    <q-dialog v-model="showDialogExamen" persistent>
      <q-card style="min-width: 400px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Subir Documento PDF</div>
        </q-card-section>

        <q-form class="q-gutter-md q-pa-md">
          <!-- Campo de texto opcional -->
          <q-input
            v-model="description"
            label="Descripción (opcional)"
            type="text"
            lazy-rules
          />

          <!-- Selector de archivo, solo PDF -->
          <q-file
            v-model="file"
            label="Selecciona un archivo PDF"
            accept=".pdf,application/pdf"
            :rules="[ val => val && val.type === 'application/pdf' || 'Solo PDF permitido' ]"
            lazy-rules
            filled
            bottom-slots
          >
            <template v-slot:after>
              <q-icon name="picture_as_pdf" class="cursor-pointer" />
            </template>
          </q-file>

          <div class="row justify-end q-gutter-sm">
            <q-btn flat label="Cancelar" @click="onCancel" />
            <q-btn
              @click="GenerarExamen"
              label="Enviar"
              color="primary"
              :disable="!isFormValidExamen"
              :loading="loadingGenerator"
            />
          </div>
        </q-form>
      </q-card>
    </q-dialog>
</q-page>
</template>

<script setup>

import { ref, onMounted, computed } from 'vue'
import { api } from "boot/axios";
import { LocalStorage, useQuasar } from 'quasar'
import { useRouter } from 'vue-router';

const $q = useQuasar()
const showDialog = ref(false)
const courseName = ref('')

const isFormValid = computed(() => courseName.value.trim().length > 0)

const courses = ref([])
const loadingList = ref(false)
const loadingId = ref(null)
const loadingGenerator = ref(null)
const role = LocalStorage.getItem("role")

const is_enrolled = ref(true)
const fetchCourses = async () => {
  loadingList.value = true
  try {
    const resp = await api.get('/course/get_all_courses')
    courses.value = resp.data.data
  }
  catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error cargando cursos.' })
  }
  finally {
    loadingList.value = false
  }
}


const submitForm = async () =>  {
  try {
    await api.post('course/create_class_room', { name: courseName.value })
    $q.notify({ type: 'positive', message: 'Curso creado correctamente' })
    courseName.value = ''
    showDialog.value = false
  }
  catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al crear el curso' })
  }
}

const joinCourse = async (courseId) => {
  loadingId.value = courseId
  try {
    await api.post(`course/enrolle_class`, {id: courseId})
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

const crearClase = async () => {
  showDialog.value = true
}

const showDialogExamen = ref(false)

const crearExamen = ()=>{
  showDialogExamen.value = true
}
const description = ref('')
const file = ref(null)
const isFormValidExamen = computed(() => {
  return description.value !== null
})
const router = useRouter()
const GenerarExamen = async () => {
  loadingGenerator.value = true
  try {
    const formData = new FormData()
    if (file.value){
      formData.append("file", file.value)
    }
    formData.append('text_data', description.value)
    const token = LocalStorage.getItem("token")
    const res = await fetch('http://localhost:8000/api/v1/agent/create_examen', {
                          method: 'POST',
                          body: formData,
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        })
    const data = await res.json()
    router.push({ path:'/ver-examen', query: { id: data.data } })
    $q.notify({ type: 'positive', message: 'Te has inscrito al curso.' })
    showDialogExamen.value = true;
  }
  catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al ingresar al curso.' })
  }
  finally {
    loadingGenerator.value = null
  }
}
</script>
