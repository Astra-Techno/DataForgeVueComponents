<template>
  <BaseSelect
    :model-value="modelValue || defaultValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :label="label"
    :required="required"
    :select-class="selectClass"
    :label-class="labelClass"
    :disabled="disabled || !region" 
    :searchable="searchable"
    placeholder="-- Select Sub-Region --"
    api-endpoint="/api/all/Location:subregions"
    api-query-param-name="region"
    :api-query-param-value="region"
    :load-on-mount="false" 
  />
</template>

<script setup>
import BaseSelect from './BaseSelect.vue';

const props = defineProps({
  region: [String],
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