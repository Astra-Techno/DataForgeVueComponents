<template>
  <div>
    <label v-if="label" :class="labelClass || 'block mb-1 font-medium text-sm text-gray-700'">
      {{ label }}<span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="flex items-center gap-2">
      <select v-model="model" :required="required" :disabled="loading" :class="selectClass || 'w-full border rounded px-3 py-2'">
        <option value="">-- Select Region --</option>
        <option v-for="item in options" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>

      <Spinner v-if="loading" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from '../axios'
import Spinner from './../components/spinner.vue'

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  required: Boolean,
  selectClass: String,
  labelClass: String
})

const emit = defineEmits(['update:modelValue'])
const model = ref(props.modelValue)
watch(model, val => emit('update:modelValue', val))

const options = ref([])
const loading = ref(false)

const loadOptions = async () => {
  model.value = ''
  options.value = []

  loading.value = true
  try {
    const res = await axios.get(`/api/all/Location:regions`)
    options.value = res.data
  } catch (e) {
    console.error('Region load failed:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOptions()
})
</script>