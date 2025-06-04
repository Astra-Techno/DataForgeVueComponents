<template>
  <BaseSelect
    :model-value="modelValue || defaultValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :label="label"
    :required="required"
    :select-class="selectClass"
    :label-class="labelClass"
    placeholder="-- Select Region --"
    api-endpoint="/api/all/Location:regions"
    :load-on-mount="true"
    :searchable="searchable"
  />
</template>

<script setup>
import BaseSelect from './BaseSelect.vue';

defineProps({
  modelValue: [String, Number],
  label: String,
  required: Boolean,
  selectClass: String,
  labelClass: String,
  searchable: Boolean, // Add searchable prop
  defaultValue: [String, Number] // Add defaultValue prop
});
defineEmits(['update:modelValue']);
</script>