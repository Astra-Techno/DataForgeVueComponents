<template>
  <div>
    <BaseSelect
      v-model="model"
      :options="uniqueCurrencyOptions"
      v-bind="$props"
      :loading="loading"
      :searchable="searchable"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import axios from '../axios';
import Spinner from './../components/spinner.vue';
import BaseSelect from '../location-selector/BaseSelect.vue'; // Import BaseSelect
import './../assets/fallback.css'; // Assuming common fallback styles

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  required: Boolean, // Keep required prop for validation/styling
  triggerClass: String, // Use triggerClass for BaseSelect
  labelClass: String,
  countryCode: String, // To set currency based on selected country
  region: String,      // Optional: For future API filtering or complex logic
  subregion: String,    // Optional: For future API filtering or complex logic
  searchable: { // Add searchable prop
    type: Boolean,
    default: true // Set default to true
  }
});

const emit = defineEmits(['update:modelValue']);
const model = ref(props.modelValue);
const allCurrenciesFromApi = ref([]); // Stores the raw list from API
const loading = ref(false);

watch(model, (val) => emit('update:modelValue', val));
watch(() => props.modelValue, (val) => {
  model.value = val;
});


/**
 * Gets the URL for a country flag SVG.
 * @param {string} countryCode - The two-letter ISO country code (e.g., "US", "CA").
 * @returns {string} The flag SVG URL or an empty string if code is invalid.
 */
function getFlagUrl(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  return `https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/1x1/${countryCode.toLowerCase()}.svg`; // Alternative CDN
}

// Computed property to get unique currencies for the dropdown
// Formats options for BaseSelect, including flag image tag in the name
const uniqueCurrencyOptions = computed(() => {
  const preferredCountryFlags = {
    "USD": "US",
    "EUR": "EU", // Special code for European Union flag
    "GBP": "GB",
    "JPY": "JP",
    "CAD": "CA",
    "AUD": "AU",
    "CHF": "CH",
    "INR": "IN",
    // Add more common currencies and their preferred flag country codes as needed
  };

  const uniqueCurrenciesData = {}; // Stores { currencyId: { data: {...apiItem}, flagCode: "XX" } }

  allCurrenciesFromApi.value.forEach(apiItem => {
    const currencyId = apiItem.id;
    const apiItemCountryCode = apiItem.country_code;

    if (!uniqueCurrenciesData[currencyId]) {
      // First time encountering this currency ID.
      // Set initial data and determine a preliminary flagCode.
      let initialFlagCode = preferredCountryFlags[currencyId] || apiItemCountryCode;
      uniqueCurrenciesData[currencyId] = { data: apiItem, flagCode: initialFlagCode };
    } else {
      // Currency ID already seen. Let's see if this apiItem provides a better flag or data source.
      let currentBestFlagCode = uniqueCurrenciesData[currencyId].flagCode;
      let currentBestDataSource = uniqueCurrenciesData[currencyId].data;

      const globalPreferredFlag = preferredCountryFlags[currencyId];

      if (globalPreferredFlag) {
        currentBestFlagCode = globalPreferredFlag;
        // If this apiItem is from the globally preferred country, its data is preferred.
        if (apiItemCountryCode === globalPreferredFlag) {
          currentBestDataSource = apiItem;
        }
      } else if (apiItemCountryCode && currencyId && apiItemCountryCode.toUpperCase() === currencyId.toUpperCase()) {
        // No global preference, but this apiItem is from the "namesake" country.
        // If the existing flag isn't already from the namesake country, this is better.
        if (uniqueCurrenciesData[currencyId].flagCode.toUpperCase() !== currencyId.toUpperCase()) {
          currentBestFlagCode = apiItemCountryCode;
          currentBestDataSource = apiItem;
        }
      }
      uniqueCurrenciesData[currencyId] = { data: currentBestDataSource, flagCode: currentBestFlagCode };
    }
  });

  return Object.values(uniqueCurrenciesData)
    .sort((a, b) => (a.data.name || a.data.id).localeCompare(b.data.name || b.data.id))
    .map(entry => ({
      id: entry.data.id,
      name: `<img src="${getFlagUrl(entry.flagCode)}" class="currency-flag-icon" width="20" height="15"> <span class="currency-option-text">${entry.data.name} (${entry.data.currency_symbol})</span>`,
      // originalData: entry.data // Optionally keep original data if needed by other parts
    }));
});

const loadOptions = async () => {
  loading.value = true;
  try {
    const res = await axios.get('/api/all/Location:countries?select=currency&all=1'); // Example endpoint
    allCurrenciesFromApi.value = res.data; // Store the raw list
    // After loading, if a countryCode is already provided, try to set the currency
    if (props.countryCode) {
      setCurrencyByCountry(props.countryCode);
    }
  } catch (e) {
    console.error('Currency load failed:', e);
    allCurrenciesFromApi.value = [];
  } finally {
    loading.value = false;
  }
};

const setCurrencyByCountry = (targetCountryCode) => {
  if (!targetCountryCode || allCurrenciesFromApi.value.length === 0) {
    // model.value = ''; // Optionally clear if no country or no currencies loaded
    return;
  }
  const foundCurrency = allCurrenciesFromApi.value.find(
    c => c.country_code && c.country_code.toUpperCase() === targetCountryCode.toUpperCase()
  );

  if (foundCurrency) {
    model.value = foundCurrency.id; // Set model to the currency code (e.g., "USD")
  } else {
    // model.value = ''; // Optionally clear if no currency found for the country
  }
};

watch(() => props.countryCode, (newCountryCode) => {
  setCurrencyByCountry(newCountryCode);
});

onMounted(() => {
  loadOptions();
});
</script>

<style scoped>
/* Add styles for the flag icon within the dropdown options */
.currency-flag-icon {
  width: 20px; /* Adjust size as needed */
  height: 15px; /* Maintain aspect ratio for 1x1 flags */
  vertical-align: middle; /* Align with text */
  margin-right: 8px; /* Space between flag and text */
  border: 1px solid #eee; /* Optional border */
}

/* Style for the text part of the option to align with the flag */
.currency-option-text {
    display: inline-block; /* Allows margin/padding and vertical alignment */
    vertical-align: middle; /* Align with flag */
}
</style>