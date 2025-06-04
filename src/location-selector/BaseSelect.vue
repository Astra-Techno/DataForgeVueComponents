<template>
  <div>
    <label v-if="label" :class="labelClass || 'fallback-label'">
      {{ label }}<span v-if="required" class="fallback-required">*</span>
    </label>

    <div class="base-select-container" ref="containerRef">
      <!-- Custom Trigger -->
      <div
        class="base-select-trigger"
        :class="[triggerClass || 'fallback-select-trigger', { 'disabled': disabled || loading, 'active': showDropdown }]"
        @click="toggleDropdown"
      >
        <span v-html="selectedOptionTriggerLabel || placeholder"></span> <!-- Use v-html for trigger too -->
        <Spinner v-if="loading" class="fallback-spinner-inline" />
        <span class="dropdown-arrow">{{ showDropdown ? '▲' : '▼' }}</span>
      </div>

      <!-- Custom Dropdown List -->
      <div v-if="showDropdown" class="base-select-dropdown" :class="dropdownClass || 'fallback-select-dropdown'">
        <input
          v-if="searchable"
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          class="dropdown-search-input"
          @click.stop 
          ref="searchInputRef"
        />
        <ul class="dropdown-options-list">
          <li v-for="item in filteredOptions" :key="item.id" @click="selectItem(item)" :class="{ 'selected-option': item.id === model }">
            <span v-html="item.name"></span> <!-- Use v-html to render HTML content like flags -->
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, onUnmounted, nextTick } from 'vue';
import axios from '../axios';
import Spinner from './../components/spinner.vue';
import './../assets/fallback.css'; // Common styles for location selectors

const props = defineProps({
  // Common UI props
  modelValue: [String, Number],
  label: String,
  required: Boolean,
  triggerClass: String, // Renamed from selectClass
  dropdownClass: String, // New prop for dropdown list styling
  labelClass: String,
  disabled: Boolean,
  searchable: Boolean, // Prop to enable search

  // Configuration for data loading
  placeholder: {
    type: String,
    default: '-- Select an option --'
  },
  options: { // New prop to accept options directly
    type: Array,
    default: null // Default to null, indicating options are not provided externally
  },
  apiEndpoint: {
    type: String,
    // Not strictly required if `options` prop is provided
    // required: true 
  },
  apiQueryParamName: String, // e.g., 'region' for subregions, 'country' for states
  apiQueryParamValue: [String, Number], // The value for the query parameter
  loadOnMount: { // Control if it loads immediately or waits for a param
    type: Boolean,
    default: true
  },
  // For CountrySelect's special 'all=1' case or pre-formatted query
  apiQueryString: String
});

const emit = defineEmits(['update:modelValue', 'loaded']);

const model = ref(props.modelValue);
const loading = ref(false);
const searchQuery = ref('');
const showDropdown = ref(false);
const containerRef = ref(null); // Ref for the main container to handle outside clicks
const searchInputRef = ref(null); // Ref for the search input to focus it
const internalOptions = ref([]); // Internal state for options fetched by BaseSelect

// --- Computed Properties ---

const selectedOption = computed(() => {
  const selected = (props.options || internalOptions.value).find(option => option.id === model.value);
  return selected || null;
});

// Label for the trigger (can be plain text or HTML)
const selectedOptionTriggerLabel = computed(() => {
    // Use the 'name' property which contains the HTML for currency flags
    return selectedOption.value ? selectedOption.value.name : '';
});

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options || internalOptions.value; // Use props.options if available, otherwise internal
  }
  const optionsSource = props.options || internalOptions.value;
  const lowerSearchQuery = searchQuery.value.toLowerCase();
  return optionsSource.filter(option =>
    option.name.toLowerCase().includes(lowerSearchQuery)
  );
});

// --- Watchers ---

// Watch for external modelValue changes
watch(() => props.modelValue, (val) => {
  model.value = val;
});

// Watch for changes in the API query parameter value
watch(() => props.apiQueryParamValue, (newVal) => {
    // Only load if options are NOT provided externally
    if (!props.options) {
        loadOptions(newVal);
    }
}, { immediate: false }); // immediate: false to avoid double load if loadOnMount is also true with initial param

// --- Methods ---

const loadOptions = async (queryValueForParam) => {
  // If options are provided externally, skip internal loading
  if (props.options) return;
  searchQuery.value = ''; // Reset search on new data load
  // If it depends on a param and that param is not provided (and not loading all on mount)
  if (props.apiQueryParamName && !queryValueForParam && !props.loadOnMount && !props.apiQueryString) {
    model.value = ''; // Clear model if dependencies are not met
    internalOptions.value = [];
    return;
  }

  model.value = ''; // Reset selection when options change
  internalOptions.value = []; // Clear internal options
  loading.value = true;

  let fullEndpoint = props.apiEndpoint;
  if (props.apiQueryString) {
    fullEndpoint += `?${props.apiQueryString}`;
  } else if (props.apiQueryParamName && queryValueForParam !== undefined && queryValueForParam !== null && queryValueForParam !== '') {
     // Only add param if it has a meaningful value
    fullEndpoint += `?${props.apiQueryParamName}=${queryValueForParam}`;
  } else if (props.apiQueryParamName && (queryValueForParam === undefined || queryValueForParam === null || queryValueForParam === '') && !props.loadOnMount) {
     // If a param is expected but not provided, and not loading on mount, clear and return
     model.value = '';
     internalOptions.value = [];
     loading.value = false; // Ensure loading is false
     return;
  }

  try {
    const res = await axios.get(fullEndpoint);
    internalOptions.value = res.data; // Populate internal options - Assuming res.data is the array of options
    emit('loaded', res.data);

    // If modelValue was set initially, try to find and set the model after internal options load
    if (props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== '') {
        const initialOption = (props.options || internalOptions.value).find(opt => opt.id === props.modelValue);
        if (initialOption) {
            model.value = initialOption.id;
        } else {
             // If initial modelValue is not found in loaded options, clear it
             model.value = '';
        }
    }
    emit('update:modelValue', model.value); // Explicitly emit the final model value after loading and initial setting

  } catch (e) {
    console.error(`Failed to load options for ${props.label || 'select'} from ${fullEndpoint}:`, e);
    internalOptions.value = []; // Clear internal options on error
    emit('loaded', []);
  } finally {
    loading.value = false;
  }
};

const toggleDropdown = async () => {
  if (props.disabled || loading.value) return;
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value && props.searchable) {
    // Wait for the dropdown and search input to be rendered
    await nextTick();
    searchInputRef.value?.focus();
  }
};

const selectItem = (item) => {
  model.value = item.id;
  emit('update:modelValue', item.id); // Emit immediately on selection
  showDropdown.value = false;
  searchQuery.value = ''; // Reset search on selection
};

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    showDropdown.value = false;
    searchQuery.value = ''; // Reset search when closing
  }
};

// --- Lifecycle Hooks ---

onMounted(() => {
  // Initial load logic - only load internally if options are NOT provided externally
  if (!props.options) {
    if (props.loadOnMount || (props.apiQueryParamName && props.apiQueryParamValue !== undefined && props.apiQueryParamValue !== null && props.apiQueryParamValue !== '')) {
       loadOptions(props.apiQueryParamValue);
    } else if (props.modelValue) {
        // If modelValue is set but not loading on mount and no param,
        // we still need to load options to display the selected label correctly.
        // This handles cases where the component is initialized with a value
        // but its dependencies (like region/country) are not yet met.
        // We'll load all options in this case to find the modelValue.
        // A more sophisticated approach might load based on modelValue ID if the API supports it.
        // For now, loading all seems the safest fallback to display the label.
        // Note: This might still fail if the API requires a param to return the specific item.
        // Consider if your API supports fetching a single item by ID without its parent param.
       loadOptions(props.apiQueryParamValue); // This will likely trigger the 'no param' logic unless apiQueryString is set
    }
  }

  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Expose reload method if needed by parent components
defineExpose({
  reload: (newQueryValue) => loadOptions(newQueryValue !== undefined ? newQueryValue : props.apiQueryParamValue)
});

</script>

<style scoped>
/* Add or modify styles to match the CodePen */

.base-select-container {
  position: relative; /* Needed for absolute positioning of dropdown */
  display: inline-block; /* Or block, depending on desired layout */
  width: 100%; /* Adjust as needed */
}

.base-select-trigger {
  display: flex;
  align-items: center;
  padding: 8px 12px; /* Adjust padding */
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  user-select: none;
  min-height: 38px; /* Ensure minimum height */
  box-sizing: border-box; /* Include padding and border in element's total width and height */
}

.base-select-trigger.disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
  color: #666;
}

.base-select-trigger span:first-child { /* The selected value text */
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fallback-spinner-inline {
    width: 16px; /* Smaller spinner */
    height: 16px;
    margin-left: 8px;
    margin-right: 8px; /* Space before arrow */
}

.dropdown-arrow {
  font-size: 10px;
  margin-left: auto;
  transition: transform 0.2s ease;
}

.base-select-trigger.active .dropdown-arrow {
  transform: rotate(180deg); /* Rotate arrow when active */
}

.base-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px; /* Max height for the dropdown list */
  overflow: hidden; /* Hide scrollbar from the flex container itself */
  z-index: 10; /* Ensure it's above other content */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex; /* Use flexbox for search + list */
  flex-direction: column;
  box-sizing: border-box;
}

.dropdown-search-input {
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
  font-size: 14px;
  outline: none;
  flex-shrink: 0; /* Prevent shrinking */
}

.dropdown-options-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto; /* Make only the list scrollable */
  flex-grow: 1; /* Allow list to take available space */
}

.base-select-dropdown li {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
}

.base-select-dropdown li:hover {
  background-color: #f0f0f0;
}

.base-select-dropdown li.selected-option {
  background-color: #e0e0e0;
  font-weight: bold;
}

/* Styles for content within list items (like flags) */
.base-select-dropdown li .currency-flag-icon { /* Target img with the specific class */
    width: 20px; /* Adjust size as needed */
    height: 15px; /* Maintain aspect ratio for 1x1 flags */
    vertical-align: middle; /* Align with text */
    margin-right: 8px; /* Space between flag and text */
    border: 1px solid #eee; /* Optional border */
}

.base-select-dropdown li span.currency-option-text {
    vertical-align: middle; /* Align with flag */
}

/* Optional: Style for the trigger when dropdown is open */
.base-select-trigger.active {
  border-bottom-color: transparent; /* Hide bottom border when dropdown is open */
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

/* Ensure fallback-label and fallback-required are defined in fallback.css */
/* Ensure fallback-spinner is defined in fallback.css */

</style>