<template>
  <div>
    <label v-if="label" :class="labelClass || 'fallback-label'">
      {{ label }}<span v-if="required" class="required">*</span>
    </label>

    <div class="base-select-container">
      <!-- Using a native select -->
      <select v-model="model" :required="required" :disabled="loading || options.length === 0" :class="selectClass || 'fallback-select'">
        <option value="">-- Select Timezone --</option>
        <option v-for="item in options" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>
      <!-- Spinner can be shown next to the select if needed, or remove if data is static -->
      <!-- <Spinner v-if="loading" class="fallback-spinner" /> -->
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import timezoneData from './timezoneData'; // Import the static JSON data
import './../assets/fallback.css';

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  required: Boolean,
  selectClass: String,
  labelClass: String,
  emitOffsetFormat: { // New prop to control emitted value format
    type: Boolean,
    default: false
  }
});

// Add a prop to receive the selected country code
const countryCode = defineModel('countryCode', { type: String, default: '' });

const emit = defineEmits(['update:modelValue']);
const model = ref(props.modelValue);

watch(model, (selectedTzid) => {
  if (!selectedTzid) {
    emit('update:modelValue', '');
    return;
  }
  if (props.emitOffsetFormat) {
    const offsetString = formatOffsetMinutes(getOffsetInMinutesForTZ(selectedTzid));
    emit('update:modelValue', offsetString);
  } else {
    emit('update:modelValue', selectedTzid);
  }
});

watch(() => props.modelValue, (newValFromParent) => {
  if (props.emitOffsetFormat) {
    if (!newValFromParent || typeof newValFromParent !== 'string') { // Expecting an offset string like "+05:30"
      model.value = '';
      return;
    }
    // Find the first tzid in options that matches this offset string
    const foundOption = options.value.find(opt => {
      const optOffsetString = formatOffsetMinutes(getOffsetInMinutesForTZ(opt.id));
      return optOffsetString === newValFromParent;
    });
    model.value = foundOption ? foundOption.id : ''; // Set internal model to tzid
  } else {
    model.value = newValFromParent; // Expecting a tzid
  }
});

/**
 * Calculates the current UTC offset in minutes for a given IANA timezone ID.
 * @param {string} tzString - The IANA timezone ID (e.g., "America/New_York").
 * @returns {number} The offset in minutes, or NaN if calculation fails.
 */
function getOffsetInMinutesForTZ(tzString) {
  try {
    const currentInstant = new Date();

    // Intl.DateTimeFormat can give us the local date/time parts for the currentInstant in the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', { // Using 'en-US' for predictable numeric parts
        timeZone: tzString,
        year: 'numeric',
        month: 'numeric', // Note: 1-indexed
        day: 'numeric',
        hour: 'numeric',   // Note: 0-23 if hour12 is false
        minute: 'numeric',
        second: 'numeric',
        hour12: false, // Crucial for non-ambiguous hours
    });
    const parts = formatter.formatToParts(currentInstant);
    
    const getPartValue = (partType) => {
        const part = parts.find(p => p.type === partType);
        return part ? parseInt(part.value, 10) : NaN;
    };

    const localYear = getPartValue('year');
    const localMonth = getPartValue('month') - 1; // Convert to 0-indexed for Date.UTC
    const localDay = getPartValue('day');
    const localHour = getPartValue('hour');
    const localMinute = getPartValue('minute');
    const localSecond = getPartValue('second');

    // If any part is NaN, parsing failed for some reason (e.g., invalid tzString if not caught by constructor)
    if ([localYear, localMonth, localDay, localHour, localMinute, localSecond].some(isNaN)) {
        console.warn(`Could not parse all date parts for timezone: ${tzString}`);
        return NaN;
    }

    // Create a UTC timestamp from these "local" components
    const timeAtLocalAsUTC = Date.UTC(localYear, localMonth, localDay, localHour, localMinute, localSecond);
    // The original instant's UTC timestamp
    const timeAtUTC = currentInstant.getTime();

    // The offset is (Local time represented on UTC scale) - (Actual UTC time)
    return (timeAtLocalAsUTC - timeAtUTC) / (1000 * 60);
  } catch (error) {
    // This catch block handles errors from Intl.DateTimeFormat constructor (e.g., invalid tzString)
    console.error(`Error calculating offset for timezone ${tzString}:`, error);
    return NaN;
  }
}

/**
 * Formats an offset in minutes to a "+HH:MM" or "-HH:MM" string.
 * @param {number} offsetMinutes - The offset in minutes.
 * @returns {string} The formatted offset string (e.g., "+05:30", "-04:00").
 */
function formatOffsetMinutes(offsetMinutes) {
  if (isNaN(offsetMinutes)) {
    // Fallback for when offset calculation fails
    return "??:??"; // Or simply an empty string or "N/A"
  }
  const roundedOffsetMinutes = Math.round(offsetMinutes); // Round to the nearest minute
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(roundedOffsetMinutes);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Use a computed property to generate the full list of all timezones.
const options = computed(() => {
  let timezonesToProcess = [];

  // Get all timezones from all countries
  // Flatten the arrays of timezones for each country
  for (const code in timezoneData) {
    if (timezoneData.hasOwnProperty(code)) {
      timezonesToProcess.push(...timezoneData[code]);
    }
  }

  // Remove duplicates based on tzid, as some timezones appear in multiple countries
  const uniqueTimezones = new Map();
  for (const tz of timezonesToProcess) {
      if (!uniqueTimezones.has(tz.tzid)) {
          uniqueTimezones.set(tz.tzid, tz);
      }
  }
  timezonesToProcess = Array.from(uniqueTimezones.values());

  // const now = new Date(); // Get current time once for offset calculation - moved inside map if needed per item

  // Map and format the timezones
  const formattedOptions = timezonesToProcess.map(tz => ({
    id: tz.tzid, // Use tzid as the value
    name: `(UTC${formatOffsetMinutes(getOffsetInMinutesForTZ(tz.tzid))}) ${tz.name} - ${tz.tzid}` // Always append tzid for uniqueness in the full list
  }));

  // Sort the options for better usability
  formattedOptions.sort((a, b) => a.name.localeCompare(b.name));

  return formattedOptions;
});

const loading = ref(false); // Keep ref for disabled binding, always false as data is static

onMounted(() => {
  // No API call needed on mount, options are computed based on countryCode prop
});

// Watch for countryCode changes to potentially clear the model
watch(countryCode, (newCode, oldCode) => {
    if (newCode && newCode !== oldCode) {
        const timezonesForCountry = timezoneData[newCode.toUpperCase()];
        if (timezonesForCountry && timezonesForCountry.length > 0) {
            // Find the first timezone for the new country and select it
            const firstTimezoneId = timezonesForCountry[0].tzid;
            model.value = firstTimezoneId;
            if (props.emitOffsetFormat) {
              const offsetString = formatOffsetMinutes(getOffsetInMinutesForTZ(firstTimezoneId));
              emit('update:modelValue', offsetString);
            } else {
              emit('update:modelValue', firstTimezoneId);
            }
        } else {
            // If the new country has no timezones listed, clear the selection
            model.value = '';
            emit('update:modelValue', ''); // Emit empty string for both formats
        }
    } else if (!newCode && oldCode) {
        // If country is unselected, clear the timezone selection
        model.value = '';
        emit('update:modelValue', '');
    }
});
</script>

<style scoped>
/* Add or modify styles as needed */
.base-select-container {
  /* Add container styles if needed, e.g., display: inline-block; width: 100%; */
}

.fallback-select {
  /* Basic styles for the native select */
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 150px; /* Adjust as needed */
  background: white;
  width: 100%; /* Make it take full width of its container */
  box-sizing: border-box;
}

.fallback-select:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}

/* Ensure fallback-label is defined in fallback.css */
.fallback-label {
  display: block;
  margin-bottom: 0.25rem;
}
.required {
  color: red;
}
</style>