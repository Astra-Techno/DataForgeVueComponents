<template>
  <BaseSelect
    :model-value="modelValue || defaultValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :label="label"
    :required="required"
    :select-class="selectClass"
    :label-class="labelClass"
    :disabled="disabled || !country" 
    :searchable="searchable"
    placeholder="-- Select State --"
    api-endpoint="/api/all/Location:states" 
    api-query-param-name="country"
    :api-query-param-value="country"
    :load-on-mount="false" 
  />
</template>

<script setup>
import BaseSelect from './BaseSelect.vue';

const props = defineProps({
  country: [String], // Renamed from 'country'
  modelValue: [String, Number],
  label: String,
  required: Boolean,
  selectClass: String,
  labelClass: String,
  disabled: Boolean,
  searchable: Boolean,
  defaultValue: [String, Number] // Add defaultValue prop
});
defineEmits(['update:modelValue']);
</script>