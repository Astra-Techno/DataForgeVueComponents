<template>
  <BaseSelect
    :model-value="modelValue || defaultValue"
    @update:modelValue="handleModelUpdate"
    @loaded="handleOptionsLoaded"
    :label="label"
    :required="required"
    :select-class="selectClass"
    :label-class="labelClass"
    :disabled="disabled"
    :searchable="searchable"
    placeholder="-- Select Country --"
    api-endpoint="/api/all/Location:countries"
    :api-query-param-name="apiQueryParamName"
    :api-query-param-value="apiQueryParamValue"
    :api-query-string="apiQueryString"
    :load-on-mount="loadOnMountCalculated"
    ref="baseSelectRef"
  />
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import BaseSelect from './BaseSelect.vue';

// Add 'selected' event to emits
const emit = defineEmits(['update:modelValue', 'selected'])

const props = defineProps({
  subregion: [String],
  region: [String],
  modelValue: [String, Number],
  label: String,
  required: Boolean,
  selectClass: String,
  labelClass: String,
  disabled: Boolean,
  searchable: Boolean,
  defaultValue: [String, Number] // Add defaultValue prop
})

const baseSelectRef = ref(null); // To access options from BaseSelect if needed
const loadedOptions = ref([]);

const handleModelUpdate = (val) => {
  emit('update:modelValue', val);
  emitSelectedCountry(val);
};

const handleOptionsLoaded = (options) => {
  loadedOptions.value = options;
  // If there's an initial modelValue, emit the selected object after options are loaded
  if (props.modelValue && options.length > 0) {
    emitSelectedCountry(props.modelValue);
  }
};

// Helper to emit the selected country object
const emitSelectedCountry = (selectedId) => {
  // Use loadedOptions which are kept in sync by @loaded event from BaseSelect
  const selected = loadedOptions.value.find(item => item.id === selectedId);
  if (selected) {
    emit('selected', selected);
  } else {
    emit('selected', null); // Emit null if nothing is selected or found
  }
};
// Watch for external changes to modelValue to potentially re-emit 'selected'
watch(() => props.modelValue, (newVal) => {
    if (loadedOptions.value.length > 0) { // Ensure options are available
        emitSelectedCountry(newVal);
    }
});

const apiQueryParamName = computed(() => {
  if (props.subregion) return 'subregion';
  if (props.region) return 'region';
  return undefined; // No specific param if loading all or using apiQueryString
});

const apiQueryParamValue = computed(() => props.subregion || props.region);

const apiQueryString = computed(() => {
  if (!props.region && !props.subregion) return 'all=1';
  return undefined;
});

const loadOnMountCalculated = computed(() => !props.region && !props.subregion); // Load all countries on mount if no filter

</script>