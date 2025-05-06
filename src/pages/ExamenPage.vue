<template>
  <q-page padding>
    <h5 class="q-my-md">Cuestionario Interactivo</h5>

    <q-card
      v-for="(pregunta) in preguntas"
      :key="pregunta.numero"
      class="q-mb-lg shadow-1 rounded-borders"
    >
      <q-card-section>
        <div class="text-h6 q-mb-md">
          Pregunta {{ pregunta.numero }}:
        </div>
        <div class="text-body1 q-mb-md">
          {{ pregunta.pregunta_texto }}
        </div>

        <q-option-group
          :options="formatOptions(pregunta.opciones)"
          type="radio"
          v-model="respuestasSeleccionadas[pregunta.numero]"
          color="primary"
        />

        </q-card-section>
    </q-card>

    <div class="q-mt-xl text-center">
      <q-btn
        label="Verificar Respuestas"
        color="primary"
        @click="verificarRespuestas"
        :disable="!todasRespondidas"
        size="lg"
      />
      <q-tooltip v-if="!todasRespondidas">
        Debes responder todas las preguntas primero.
      </q-tooltip>
    </div>

     <q-dialog v-model="mostrarResultadosDialog">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Resultados</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <p>Has respondido correctamente {{ puntaje }} de {{ preguntas.length }} preguntas.</p>
          <ul>
            <li v-for="pregunta in preguntas" :key="'res-'+pregunta.numero">
              Pregunta {{ pregunta.numero }}: Tu respuesta '{{ respuestasSeleccionadas[pregunta.numero] || 'Ninguna' }}' -
              <span :class="esCorrecta(pregunta) ? 'text-positive text-bold' : 'text-negative text-bold'">
                {{ esCorrecta(pregunta) ? 'Correcta' : 'Incorrecta' }}
              </span>
              (Correcta: {{ pregunta.respuesta_correcta_letra }})
            </li>
          </ul>
          <div>
            <h5>Feedback</h5>
            <span>
              {{ feedback }}
            </span>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar' // Para notificaciones o diálogos si se desea

import { useRoute } from 'vue-router'
import { api } from 'src/boot/axios'

const $q = useQuasar() // Instancia de Quasar para utilidades

const router  = useRoute()

const preguntas = ref([])

const respuestasSeleccionadas = ref({}) // Inicialmente vacío

const formatOptions = (opciones) => {
  return opciones.map(op => ({
    label: `${op.opcion_letra}) ${op.opcion_texto}`, // Mostrar letra y texto
    value: op.opcion_letra // El valor que se guardará en v-model será la letra
  }))
}

const getData = async (id) => {
  try {
    const {data} = await api.get(`agent/obtener_examen/${id}`)
    preguntas.value = data.data
  } catch (error) {
    console.log(error)
  }
}

onMounted(async ()=> {
  await getData(router.query['id'])
})
const todasRespondidas = computed(() => {
  return preguntas.value.length === Object.keys(respuestasSeleccionadas.value).length &&
         Object.values(respuestasSeleccionadas.value).every(respuesta => respuesta !== null && respuesta !== undefined);
});


const mostrarResultadosDialog = ref(false);
const puntaje = ref(0);

const esCorrecta = (pregunta) => {
  return respuestasSeleccionadas.value[pregunta.numero] === pregunta.respuesta_correcta_letra;
}

const feedback = ref("")

const verificarRespuestas = async () => {
  if (!todasRespondidas.value) {
    $q.notify({
      color: 'warning',
      textColor: 'white',
      icon: 'warning',
      message: 'Por favor, responde todas las preguntas.'
    })
    return;
  }

  // Calcular puntaje
  puntaje.value = 0;
  preguntas.value.forEach(pregunta => {
    if (esCorrecta(pregunta)) {
      puntaje.value++;
    }
  });

  // Mostrar resultados en un diálogo
  mostrarResultadosDialog.value = true;
  const lista = Object.values(respuestasSeleccionadas.value)
  const { data } = await api.post('agent/feedback', {preguntas: preguntas.value,
    respuestas_estudiante: lista})

  feedback.value = data.data
  // Opcional: Puedes hacer algo más aquí, como enviar los resultados a un backend
  console.log("Respuestas seleccionadas:", respuestasSeleccionadas.value);
  console.log("Puntaje:", puntaje.value, "/", preguntas.value.length);
}

</script>

<style scoped>
/* Puedes añadir estilos personalizados aquí si lo necesitas */
.q-card {
  border-left: 5px solid var(--q-primary); /* Añade un borde de color primario */
}

.text-positive {
  color: #21BA45 !important; /* Verde Quasar */
}

.text-negative {
  color: #C10015 !important; /* Rojo Quasar */
}
</style>
