<template>
  <div>
    <BaseSelect
      :model-value="modelValue || defaultValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      :options="computedLanguages"
      :label="label"
      :required="required"
      :trigger-class="triggerClass"
      :label-class="labelClass"
      :searchable="searchable"
      :loading="loading"
      :disabled="disabled || loading"
      placeholder="-- Select Language --"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import axios from '../axios';
// Spinner is not directly used in LanguageSelect template anymore as BaseSelect handles its own loading spinner
// import Spinner from './../components/spinner.vue';
import BaseSelect from '../location-selector/BaseSelect.vue'; // Import BaseSelect
import './../assets/fallback.css'; // Assuming common fallback styles

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  required: Boolean, // Keep required prop for validation/styling
  triggerClass: String, // Use triggerClass for BaseSelect
  labelClass: String,
  defaultCountry: String, // To filter languages by country code (e.g., "US", "GB") - Renamed from countryCode
  searchable: {
    type: Boolean,
    default: true, // Enable search by default
  },
  defaultValue: [String, Number], // To set a default selected value
  disabled: Boolean,
});

const emit = defineEmits(['update:modelValue']);

const allLanguagesFromApi = ref([]); // Stores the raw list from API
const loading = ref(false);

// Computed property to filter and format languages for BaseSelect
const computedLanguages = computed(() => {
  if (loading.value && allLanguagesFromApi.value.length === 0) {
    // Return empty or a placeholder if loading initial data and no data yet
    return [];
  }

  let filtered = allLanguagesFromApi.value;

  // Map to the { id, name } format expected by BaseSelect
  // Sort alphabetically by name
  return filtered
    .map(lang => ({
      id: lang.id, // e.g., "af-ZA"
      name: lang.name // e.g., "Afrikaans"
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

// Watch for countryCode changes to potentially clear the modelValue
// Watch for country prop changes to potentially clear the modelValue
watch(() => props.defaultCountry, (newCountry, oldCountry) => {
  if (newCountry !== oldCountry) {
    emit('update:modelValue', '');
    loadOptions(); // Fetches new API-filtered list
  }
});

const loadOptions = async () => {
  loading.value = true;
  try {
    // Assuming this endpoint returns the list in the format:
    // [{ id: "lang-COUNTRY", name: "Language Name", country: "Country Name" }, ...]
    const query = props.defaultCountry ? `?country=${encodeURIComponent(props.defaultCountry)}` : '';
    const res = await axios.get('/api/all/Location:languages' + query);
    allLanguagesFromApi.value = res.data; // Store the raw list
  } catch (e) {
    console.error('Language load failed:', e);
    allLanguagesFromApi.value = []; // Clear data on error
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Load all languages initially. Filtering happens client-side via computedLanguages.
  loadOptions();
});

// No specific styles needed here as BaseSelect handles the structure and common styles.
// Any custom styles for the trigger or dropdown can be passed via triggerClass/dropdownClass props.
</script>

<style scoped>
/* Add any LanguageSelect specific styles here if needed,
   but most styling is handled by BaseSelect and fallback.css */
</style>
