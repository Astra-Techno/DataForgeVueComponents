<template>
  <div class="address-input-form">
    <div v-if="label" :class="labelClass || 'fallback-label'">
      {{ label }}
    </div>

    <!-- Street Address Line 1 -->
    <div class="form-group">
      <label :for="street1Id" :class="fieldLabelClass">
        Street Address
        <span v-if="requiredFields.street1" class="fallback-required">*</span>
      </label>
      <input
        :id="street1Id"
        type="text"
        v-model="address.street1"
        :required="requiredFields.street1"
        :class="inputClass"
        placeholder="Street and number, P.O. box, c/o"
      />
    </div>

    <!-- Street Address Line 2 (Optional) -->
    <div class="form-group">
      <label :for="street2Id" :class="fieldLabelClass">
        Address Line 2 <span class="optional-text">(Optional)</span>
      </label>
      <input
        :id="street2Id"
        type="text"
        v-model="address.street2"
        :class="inputClass"
        placeholder="Apartment, suite, unit, building, floor, etc."
      />
    </div>

    <!-- Country Selector -->
    <div class="form-group">
      <CountrySelect
        v-model="address.country"
        label="Country"
        :required="requiredFields.country"
        :select-class="inputClass"
        :trigger-class="inputClass" 
        :label-class="fieldLabelClass"
        @update:modelValue="onCountryChange"
        :searchable="locationSelectorsSearchable"
      />
    </div>

    <!-- State/Province Selector -->
    <div class="form-group">
      <StateSelect
        v-model="address.state"
        label="State/Province"
        :country="address.country"
        :required="requiredFields.state"
        :trigger-class="inputClass" 
        :label-class="fieldLabelClass"
        :disabled="!address.country"
        @update:modelValue="onStateChange"
        :searchable="locationSelectorsSearchable"
      />
    </div>

    <!-- City Selector -->
    <div class="form-group">
      <CitySelect
        v-model="address.city"
        label="City"
        :state="address.state"
        :required="requiredFields.city"
        :trigger-class="inputClass" 
        :label-class="fieldLabelClass"
        :disabled="!address.state"
        :searchable="locationSelectorsSearchable"
      />
    </div>

    <!-- Postal Code -->
    <div class="form-group">
      <label :for="postalCodeId" :class="fieldLabelClass">
        Postal/ZIP Code
        <span v-if="requiredFields.postalCode" class="fallback-required">*</span>
      </label>
      <input
        :id="postalCodeId"
        type="text"
        v-model="address.postalCode"
        :required="requiredFields.postalCode"
        :class="inputClass"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue';
import { CountrySelect, StateSelect, CitySelect } from '../location-selector'; // Assuming these are correctly exported
import './../assets/fallback.css';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      street1: '',
      street2: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    })
  },
  label: String,
  labelClass: String,
  fieldLabelClass: {
    type: String,
    default: 'fallback-label-sm' // A smaller label for individual fields
  },
  inputClass: {
    type: String,
    default: 'fallback-input' // A common input class
  },
  requiredFields: {
    type: Object,
    default: () => ({
      street1: true,
      city: true,
      state: true,
      country: true,
      postalCode: true
    }),
  },
  locationSelectorsSearchable: { // New prop to control searchability
    type: Boolean,
    default: false 
  }
});

const emit = defineEmits(['update:modelValue']);

const address = reactive({ ...props.modelValue });

const street1Id = computed(() => `street1-${Math.random().toString(36).slice(2, 7)}`);
const street2Id = computed(() => `street2-${Math.random().toString(36).slice(2, 7)}`);
const postalCodeId = computed(() => `postalCode-${Math.random().toString(36).slice(2, 7)}`);

watch(address, (newAddress) => {
  console.log('AddressInput: Internal address state changed:', JSON.parse(JSON.stringify(newAddress)));
  emit('update:modelValue', { ...newAddress });
}, { deep: true });

watch(() => props.modelValue, (newVal) => {
  // Optional: Log when props change from parent
  // console.log('AddressInput: props.modelValue received from parent:', JSON.parse(JSON.stringify(newVal)));
  Object.assign(address, newVal);
}, { deep: true });

const onCountryChange = () => {
  address.state = '';
  address.city = '';
};

const onStateChange = () => {
  address.city = '';
};

</script>

<style scoped>
.form-group {
  margin-bottom: 1rem; /* Consistent spacing */
}
.optional-text {
  font-size: 0.8em;
  color: #666;
  font-weight: normal;
}
/* Define fallback-label-sm and fallback-input in your fallback.css or a shared style file */
.fallback-label-sm {
  display: block;
  font-weight: 500;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #4A5568;
}
.fallback-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #CBD5E0;
  border-radius: 0.25rem;
  box-sizing: border-box;
  box-sizing: border-box;
  background-color: #fff; /* Match BaseSelect trigger background */
  min-height: 38px; /* Match BaseSelect trigger min-height */
  font-size: 1rem; /* Ensure font size is consistent */
  line-height: 1.5; /* Ensure line height is consistent */
  color: #333; /* Default text color */
}
.fallback-input:focus {
  border-color: #007bff; /* Example focus style */
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); /* Example focus style */
}
.fallback-input {
  border-color: #ccc; /* Align border color with BaseSelect trigger */
}
</style>