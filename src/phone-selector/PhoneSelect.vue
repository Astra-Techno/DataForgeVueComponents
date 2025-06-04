<template>
  <!-- Using existing class names, can be refactored if needed -->
  <div class="form-group">
    <label v-if="label" :class="labelClass">
      {{ label }} <span v-if="required" class="required">*</span>
    </label>

    <div class="phone-input-container" ref="phoneInputContainerRef">
      <!-- Trigger for the custom country select -->
      <div
        class="custom-country-select-trigger"
        :class="{ 'active': showCountryDropdown }"
        @click="toggleCountryDropdown"
      >
        <img v-if="selectedCountryDisplay.flagUrl" :src="selectedCountryDisplay.flagUrl" :alt="selectedCountryDisplay.code" class="country-flag-icon selected" />
        <span>{{ selectedCountryDisplay.text }}</span>
        <span class="dropdown-arrow">{{ showCountryDropdown ? '▲' : '▼' }}</span>
      </div>

      <!-- Phone number input -->
      <input
        :value="phoneNumber"
        @input="handlePhoneInput"
        :required="required"
        :disabled="!internalDialCode"
        type="tel"
        placeholder="Phone number"
        class="phone-input"
      />

      <!-- Custom dropdown list -->
      <div v-if="showCountryDropdown" class="custom-country-dropdown">
        <input type="text" v-model="searchQueryInDropdown" placeholder="Search country..." class="dropdown-search-input" @click.stop />
        <ul class="dropdown-options-list">
          <li v-for="country in filteredCountryOptions" :key="country.code" @click="selectCountry(country)" :class="{ 'selected-option': country.code === internalCountryCode }">
            <img :src="country.flagUrl" :alt="country.code" class="country-flag-icon-option" />
            <span class="country-name-dropdown">{{ country.name }}</span>
            <span class="country-dial-code-dropdown">({{ country.dial_code }})</span>
          </li>
        </ul>
      </div>
    </div>

    <p v-if="errorMessage" class="error-msg">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import {
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
  AsYouType
} from 'libphonenumber-js/max'; // max for all metadata

// Function to get flag URL
function getFlagUrl(countryCode, size = 24) {
  if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) {
    return null; // Return null if countryCode is invalid
  }
  return `https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/1x1/${countryCode.toLowerCase()}.svg`; // Alternative CDN
}

// Generate a list of countries with their codes and flags
const countryOptions = getCountries().map(countryCode => {
  let displayName;
  try {
    displayName = new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode);
  } catch (e) {
    console.warn(`PhoneSelect: Error getting display name for country code ${countryCode}: ${e.message}`);
    // displayName will be undefined, and we'll fallback to countryCode below
  }
  return {
    code: countryCode,
    name: displayName || countryCode, // Fallback to countryCode if displayName is undefined
    dial_code: `+${getCountryCallingCode(countryCode)}`, // Assuming this is robust for codes from getCountries()
    flagUrl: getFlagUrl(countryCode, 20)
  };
}).sort((a, b) => (a.name || '').localeCompare(b.name || '')); // Robust sort


const preferredCountriesForDialCode = {
  "+1": "US", // Prioritize US for +1 dial code
  // Add other preferences if needed, e.g., "+44": "GB"
};

const props = defineProps({
  modelValue: String,
  label: String,
  required: Boolean,
  labelClass: {
    type: String,
    default: 'label'
  },
  defaultCountryCode: { // New prop for default country code (e.g., 'US', 'CA')
    type: String, // Now accepts full country name (e.g., 'United States', 'India')
    default: ''
  },
})
const emit = defineEmits(['update:modelValue'])

const internalDialCode = ref(''); // Stores the dial code, e.g., "+1"
const internalCountryCode = ref(''); // Stores the ISO country code for the flag, e.g., "US"
const phoneNumber = ref('') // Stores the national number part
const errorMessage = ref('')
const asYouType = new AsYouType(); // For formatting as user types

const showCountryDropdown = ref(false);
const phoneInputContainerRef = ref(null); // Ref for the main container to handle outside clicks
const searchQueryInDropdown = ref('');

const toggleCountryDropdown = () => {
  showCountryDropdown.value = !showCountryDropdown.value;
};

const selectCountry = (country) => {
  internalDialCode.value = country.dial_code;
  internalCountryCode.value = country.code; // Explicitly set the country code for the flag
  // Re-parse the existing number with the new country context
  showCountryDropdown.value = false;
  searchQueryInDropdown.value = ''; // Reset search on selection
};

const handleClickOutside = (event) => {
  if (phoneInputContainerRef.value && !phoneInputContainerRef.value.contains(event.target)) {
    showCountryDropdown.value = false;
  }
};

const selectedCountryDisplay = computed(() => {
  let countryToDisplay = null;

  if (internalCountryCode.value) {
    // Primary: Use the explicitly set or parsed country code
    countryToDisplay = countryOptions.find(c => c.code === internalCountryCode.value);
    // Ensure its dial code matches the current internalDialCode if internalDialCode is also set
    if (countryToDisplay && internalDialCode.value && countryToDisplay.dial_code !== internalDialCode.value) {
      countryToDisplay = null; // Mismatch, so re-evaluate
    }
  }

  if (!countryToDisplay && internalDialCode.value) {
    // Fallback: If no specific country code, or if it mismatched, use dial code
    const preferredIsoCode = preferredCountriesForDialCode[internalDialCode.value];
    if (preferredIsoCode) {
      countryToDisplay = countryOptions.find(c => c.code === preferredIsoCode && c.dial_code === internalDialCode.value);
    }
    if (!countryToDisplay) { // If no valid preferred, or no preference, find first match for dial code
      countryToDisplay = countryOptions.find(c => c.dial_code === internalDialCode.value);
    }
  }

  return countryToDisplay
    ? { text: countryToDisplay.dial_code, flagUrl: countryToDisplay.flagUrl, code: countryToDisplay.code }
    : { text: internalDialCode.value || 'Code', flagUrl: internalCountryCode.value ? getFlagUrl(internalCountryCode.value) : null, code: internalCountryCode.value }; // Default placeholder
});

const filteredCountryOptions = computed(() => {
  if (!searchQueryInDropdown.value) {
    return countryOptions;
  }
  const lowerSearch = searchQueryInDropdown.value.toLowerCase();
  return countryOptions.filter(country =>
    (country.name || '').toLowerCase().includes(lowerSearch) || // Robust name check
    (country.dial_code || '').toLowerCase().includes(lowerSearch) // Robust dial_code check
  );
});


const parseInitialModelValue = (value) => {
  if (!value) {
    // If no modelValue, try to set default country from prop
    // Clear internal state first to ensure defaultCountry logic applies cleanly
    internalDialCode.value = '';
    internalCountryCode.value = '';
    phoneNumber.value = ''; // Also clear phone number
    if (props.defaultCountryCode) {
      const countryByProp = countryOptions.find(c => c.code.toUpperCase() === props.defaultCountryCode.toUpperCase());
      if (countryByProp) {
        internalDialCode.value = countryByProp.dial_code;
        internalCountryCode.value = countryByProp.code;
      }
    }
    return;
  }

  // Reset internal state before parsing
  internalDialCode.value = '';
  internalCountryCode.value = '';
  phoneNumber.value = '';

  const parsed = parsePhoneNumberFromString(value);
  if (parsed && parsed.isValid()) {
    internalDialCode.value = `+${parsed.countryCallingCode}`;
    phoneNumber.value = parsed.nationalNumber;
    internalCountryCode.value = parsed.country; // Use the specific country from parsing
  } else {
    // Try to find a matching dial code prefix if not a full valid number
    let successfullyParsedPartial = false;

    // Attempt to use AsYouType for a hint, especially for partial numbers
    const formatter = new AsYouType();
    formatter.input(value); // Input the original value
    const hintedCountry = formatter.getCountry();

    if (hintedCountry) {
        const countryObj = countryOptions.find(c => c.code === hintedCountry);
        if (countryObj) {
            internalDialCode.value = countryObj.dial_code; // e.g., "+1"
            internalCountryCode.value = countryObj.code;   // e.g., "AS" or "US"
            
            // Extract national number part based on the full original value and the determined dial code
            let nationalInput = value;
            if (value.startsWith(countryObj.dial_code)) {
                nationalInput = value.substring(countryObj.dial_code.length);
            }
            // Use a new AsYouType instance with the determined country for formatting the national part
            const nationalFormatter = new AsYouType(hintedCountry);
            phoneNumber.value = nationalFormatter.input(nationalInput.replace(/\D/g, ''));
            successfullyParsedPartial = true;
        }
    }

    if (!successfullyParsedPartial) {
        // If AsYouType didn't provide a country, or as a further fallback
        // Check if the value is *exactly* a dial code for which we have a preference
        if (preferredCountriesForDialCode[value]) {
            internalDialCode.value = value;
            internalCountryCode.value = preferredCountriesForDialCode[value];
            phoneNumber.value = ''; // No national number part
        } else {
            // Last resort: assign the whole value to phone number, user might need to select code
            // or defaultCountry prop might apply.
            phoneNumber.value = value; // Keep the original value here before formatting
            if (props.defaultCountryCode && !internalDialCode.value) { // Apply default if no dial code yet
                const countryByProp = countryOptions.find(c => c.code.toUpperCase() === props.defaultCountryCode.toUpperCase());
                if (countryByProp) {
                  internalDialCode.value = countryByProp.dial_code;
                  internalCountryCode.value = countryByProp.code;
                }
            } else if (!internalDialCode.value) { // If no dial code from any source
                 internalCountryCode.value = ''; // Ensure country code is also clear
            }
        }
    }
  }
  // Always format phone number part after changes
  asYouType.reset();
  phoneNumber.value = asYouType.input(phoneNumber.value.replace(/\D/g, ''));
};

const validateAndEmit = () => {
  errorMessage.value = '';
  if (!internalDialCode.value && phoneNumber.value) {
    errorMessage.value = 'Please select a country code.';
    emit('update:modelValue', phoneNumber.value); // Emit raw number if no code
    return;
  }
  if (!phoneNumber.value && internalDialCode.value) {
     emit('update:modelValue', internalDialCode.value); // Emit just code if no number
     return;
  }
  if (!internalDialCode.value && !phoneNumber.value) {
    emit('update:modelValue', '');
    return;
  }

  const fullNumber = `${internalDialCode.value}${phoneNumber.value.replace(/\D/g, '')}`;
  const parsed = parsePhoneNumberFromString(fullNumber);

  if (parsed && parsed.isValid()) {
    emit('update:modelValue', parsed.formatInternational()); // Emit E.164 or international format
  } else if (phoneNumber.value) { // Only show error if there's a number input
    errorMessage.value = 'Invalid phone number for the selected country.';
    emit('update:modelValue', fullNumber); // Emit the potentially invalid number
  }
};

const handlePhoneInput = (event) => { // Renamed from formatPhone in the template
  asYouType.reset();
  phoneNumber.value = asYouType.input(event.target.value);
  validateAndEmit();
};

watch(internalDialCode, (newDialCode, oldDialCode) => {
  if (newDialCode === oldDialCode) return;

  let newInternalCountryCodeToSet = '';
  const currentCountryObjectForFlag = countryOptions.find(c => c.code === internalCountryCode.value);

  // If current internalCountryCode is valid for the newDialCode, keep it.
  if (currentCountryObjectForFlag && currentCountryObjectForFlag.dial_code === newDialCode) {
    newInternalCountryCodeToSet = internalCountryCode.value;
  } else {
    // Otherwise, find a new country code for the newDialCode.
    // Prioritize preferred country for the new dial code.
    const preferredCountryCode = preferredCountriesForDialCode[newDialCode];
    if (preferredCountryCode) {
      const preferredCountryObj = countryOptions.find(c => c.code === preferredCountryCode && c.dial_code === newDialCode);
      if (preferredCountryObj) {
        newInternalCountryCodeToSet = preferredCountryObj.code;
      }
    }

    // If no preferred country was found or applicable, find the first matching country.
    if (!newInternalCountryCodeToSet) {
      // Find the first country in the sorted list that matches the new dial code
      const firstMatch = countryOptions.find(c => c.dial_code === newDialCode);
      newInternalCountryCodeToSet = firstMatch ? firstMatch.code : '';
    }
  }
  internalCountryCode.value = newInternalCountryCodeToSet;

  asYouType.reset();
  phoneNumber.value = asYouType.input(phoneNumber.value.replace(/\D/g, ''));
  validateAndEmit();
});

// Need to store the old value of defaultCountry prop to handle clearing
// const oldValueOfDefaultCountryProp = ref(props.defaultCountryCode); // This ref is no longer needed
watch(() => props.defaultCountryCode, (newDefaultCountryProp, oldDefaultCountryProp) => { // Vue provides oldValue directly
    // oldValueOfDefaultCountryProp.value = oldValue; // No longer needed

  if (!newDefaultCountryProp) {
      // If defaultCountry becomes empty, and the current state matches the old default, clear it.
      if (oldDefaultCountryProp) { // Check if oldDefaultCountryProp had a value
        const oldDefaultCountryObj = countryOptions.find(c => c.code.toUpperCase() === oldDefaultCountryProp.toUpperCase());
        if (oldDefaultCountryObj && internalDialCode.value === oldDefaultCountryObj.dial_code && internalCountryCode.value === oldDefaultCountryObj.code) {
            internalDialCode.value = '';
            internalCountryCode.value = '';
            phoneNumber.value = ''; // Clear number too
            validateAndEmit();
        }
      }
      return;
  }
  const countryFromNewDefault = countryOptions.find(c => c.code.toUpperCase() === newDefaultCountryProp.toUpperCase());
  if (!countryFromNewDefault) return;

  const newDialCodeFromDefault = countryFromNewDefault.dial_code;

  // If the current internalDialCode and internalCountryCode already match the new default, no change needed.
  if (internalDialCode.value === newDialCodeFromDefault && internalCountryCode.value === countryFromNewDefault.code) {
    return;
  }

  // Check if modelValue already dictates a *different* country.
  const parsedModel = props.modelValue ? parsePhoneNumberFromString(props.modelValue) : null;

  if (parsedModel && parsedModel.country) { // Check specific country from model
    if (parsedModel.country !== countryFromNewDefault.code) {
      return;
    }
  }

  // Update internal codes if:
  // 1. modelValue is empty, OR
  // 2. modelValue is a local number (no country code), OR
  // 3. modelValue's country code matches the new default (and internal codes need updating).
  internalDialCode.value = newDialCodeFromDefault;
  internalCountryCode.value = countryFromNewDefault.code;
  asYouType.reset(); // Reset formatter due to potential country change
  phoneNumber.value = asYouType.input(phoneNumber.value.replace(/\D/g, '')); // Reformat existing number
  validateAndEmit();
}, { immediate: true }); // immediate: true to capture initial value


onMounted(() => {
  parseInitialModelValue(props.modelValue);
  document.addEventListener('click', handleClickOutside); // Use capture phase
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside); // Remove listener
});

watch(() => props.modelValue, (newValue) => {
  const currentFullNumber = internalDialCode.value + phoneNumber.value.replace(/\D/g, '');
  const parsedCurrentFullNumber = parsePhoneNumberFromString(currentFullNumber);
  const currentEmittedValue = parsedCurrentFullNumber?.isValid() ? parsedCurrentFullNumber.formatInternational() : currentFullNumber;

  // Only re-parse if the external modelValue changes to something *different*
  // from what the component currently represents internally.
  // This prevents infinite loops if the parent updates modelValue based on the component's emit.
  if (newValue !== currentEmittedValue && newValue !== currentFullNumber) {
    parseInitialModelValue(newValue);
  }
});

</script>

<style scoped>
/* Fallback styles */
.form-group {
  margin-bottom: 1rem;
}

.label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 14px;
  color: #333;
}

.required {
  color: red;
}

.phone-input-container {
  display: flex;
  gap: 0; /* Remove gap, border will separate */
  align-items: center;
  border: 1px solid #ccc;
  position: relative;
  border-radius: 4px;
  /* overflow: hidden; */ /* Removed: This was likely clipping the absolute positioned dropdown */
}


.phone-input {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 0;
  outline: none; /* Remove default focus outline if border is on container */
}
.phone-input:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}

.error-msg {
  color: red;
  font-size: 12px;
  margin-top: 4px;
}

.country-flag-icon-option {
  width: 20px;
  height: 15px;
  vertical-align: middle;
  margin-right: 8px; /* Increased margin */
  border: 1px solid #eee;
}

.country-flag-icon.selected {
  width: 20px;
  height: 15px;
  vertical-align: middle;
  margin-right: 5px;
   border: 1px solid #eee;
}

.custom-country-select-trigger {
  display: flex;
  align-items: center;
  padding: 8px 10px; /* Adjusted padding */
  border: none;
  border-right: 1px solid #ccc;
  background: #f8f9fa; /* Light background for trigger */
  cursor: pointer;
  user-select: none;
  min-height: 38px; /* Match typical input height */
  box-sizing: border-box;
}

.custom-country-select-trigger > span:not(.dropdown-arrow) {
  flex-grow: 1;
  font-size: 14px;
  margin-left: 4px; /* Space after flag */
}

.dropdown-arrow {
  font-size: 10px;
  margin-left: auto;
  padding-left: 5px;
  color: #555; /* Arrow color */
}

.custom-country-dropdown {
  position: absolute;
  top: calc(100% + 1px); /* Position below the container */
  left: -1px; /* Align with container border */
  right: -1px; /* Align with container border */
  background: white;
  border: 1px solid #ccc;
  /* border-top: none; */ /* Keep top border for separation if top is calc(100% + 1px) */
  border-radius: 0 0 4px 4px;
  max-height: 250px;
  z-index: 1000; /* Ensure high z-index */
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.dropdown-search-input {
  width: 100%; /* Full width of dropdown */
  padding: 10px; /* Increased padding */
  border: none;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
  font-size: 14px;
  outline: none;
  flex-shrink: 0;
}

.dropdown-options-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex-grow: 1;
}

.custom-country-dropdown li {
  padding: 10px 12px; /* Increased padding */
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.country-name-dropdown {
  flex-grow: 1;
  margin-right: 8px; /* Increased margin */
}

.country-dial-code-dropdown {
  color: #555;
  font-size: 0.9em; /* Slightly smaller dial code */
}

.custom-country-dropdown li:hover {
  background-color: #f0f0f0;
}
.custom-country-dropdown li.selected-option {
  background-color: #e0e0e0;
  font-weight: bold;
}

/* Optional: Style for the trigger when dropdown is open */
/* .custom-country-select-trigger.active { */
  /* border-bottom-color: transparent; */ /* May not be needed if border is on container */
/* } */
</style>
