<template>
  <BaseSelect
    :model-value="modelValue || defaultValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :label="label"
    :required="required"
    :select-class="selectClass"
    :label-class="labelClass"
    :disabled="disabled || !state" 
    :searchable="searchable"
    placeholder="-- Select City --"
    api-endpoint="/api/all/Location:cities"
    api-query-param-name="state"
    :api-query-param-value="state"
    :load-on-mount="false" 
  />
</template>

<script setup>
import BaseSelect from './BaseSelect.vue';

const props = defineProps({
  state: [String],
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