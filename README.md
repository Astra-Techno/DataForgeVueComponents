# 🌐 Data Forge Services — Component Library

This is the core component library for **Data Forge Services**, providing ready-to-use Vue 3 components like:

- 🗺️ Region Selector
- 🌍 Subregion Selector
- 📍 Country Selector
- 📍 State Selector
- 🏙️ City Selector
- 🏠 Address Input
- 📞 Phone Selector
- ⏰ Timezone Selector
- 🗣️ Language Selector
- 💰 Currency Selector

Each component is:

- Built with Vue 3 Composition API
- Async-loaded with a secure backend (Laravel + [Data Forge](https://data-forge.tech))
- Fully customizable via props, slots, and class injection

---

## ✨ Live Demo

Explore the components in action: [https://components.data-forge.tech](https://components.data-forge.tech)

---

## 📦 Installation

```bash
npm install @data-forge-services/core
🔧 Usage
js
import { createApp } from "vue";
import App from "./App.vue";
// Note: The library doesn't export a default plugin to use with app.use()
// You should import components directly.

const app = createApp(App);
// app.use(DataForgeComponents); // This line would typically be removed
Or import individual components:

js
import { RegionSelect, CitySelect, AddressInput /*, etc. */ } from "@data-forge-services/core";
🧩 Component Usage
vue
<template>
  <div class="min-h-screen bg-white p-4 text-gray-800">
    // Full example.
    <RegionSelect label="Region" v-model="regionId" :searchable="true" />
    <SubregionSelect
      label="Sub-Region"
      v-model="subRegionId"
      :region="regionId"
      :searchable="true"
    />
    <CountrySelect
      label="Country"
      v-model="countryId"
      :subregion="subRegionId"
      :searchable="true"
      @selected="handleCountrySelected"
    />
    <StateSelect label="State" v-model="stateId" :country="countryId" :searchable="true" />
    <CitySelect label="City" v-model="cityId" :state="stateId" :searchable="true" />

    // Address Input example
    <AddressInput label="Complete Address" v-model="addressData" :location-selectors-searchable="true" />

    // Phone Selector example
    <PhoneSelect label="Phone Number" v-model="phoneNumber" default-country-code="US" />

    // Timezone Selector example (emitting ID)
    <TimezoneSelect label="Timezone (ID)" v-model="timezoneId" country-code="IN" />

    // Timezone Selector example (emitting Offset)
    <TimezoneSelect label="Timezone (Offset)" v-model="timezoneOffset" country-code="US" :emit-offset-format="true" />

    // Language Selector example
    <LanguageSelect label="Language" v-model="languageId" default-country="India" :searchable="true" />

    // Currency Selector example
    <CurrencySelect label="Currency" v-model="currencyId" country-code="CA" :searchable="true" />

  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import {
  RegionSelect,
  SubregionSelect,
  CountrySelect,
  StateSelect,
  CitySelect,
  AddressInput,
  PhoneSelect,
  TimezoneSelect,
  LanguageSelect,
  CurrencySelect
} from "@data-forge-services/core";

const regionId = ref("");
const subRegionId = ref("");
const countryId = ref("");
const stateId = ref("");
const cityId = ref("");

const addressData = reactive({ street1: '', street2: '', city: '', state: '', country: '', postalCode: '' });
const phoneNumber = ref('');
const timezoneId = ref('');
const timezoneOffset = ref('');
const languageId = ref('');
const currencyId = ref('');

const handleCountrySelected = (countryObject) => {
  console.log('Country selected in parent:', countryObject);
};
</script>
🔐 Token Setup (One-Time)
bash
npm run setup
This generates services.config.js for each component with token + endpoint config. (Note: Currently, it generates src/location-selector/services.config.js. The global src/axios.js uses this config.)

🧩 Components
Here is a list of the available components and their primary features:

📍 Location Selectors
🏠 Address Input
📞 Phone Selector
⏰ Timezone Selector
🗣️ Language Selector
💰 Currency Selector
📍 Location Selector
A suite of components for selecting geographical locations, often used in a chained manner (Region -> Subregion -> Country -> State -> City).

RegionSelect
SubregionSelect (requires region prop)
CountrySelect (can be filtered by region or subregion, or load all; emits selected event with country object)
StateSelect (requires country prop, renamed from defaultCountry)
CitySelect (requires state prop)
Features:

Uses token-authenticated API for data (via global axios instance).
Supports v-model for binding the selected ID.
label, required props.
Customizable appearance via class props (triggerClass, labelClass, dropdownClass etc. on BaseSelect).
searchable prop to enable filtering in the dropdown.
default-value prop to pre-select an option by ID.
🏠 Address Input
A composite component that combines text inputs for street address and the location selectors (Country, State, City) into a single form section.

Manages the state of a complete address object ({ street1, street2, city, state, country, postalCode }).
Supports v-model for binding the address object.
label, labelClass, fieldLabelClass, inputClass props for styling.
requiredFields prop to configure which fields are mandatory.
locationSelectorsSearchable prop to enable search in the integrated location dropdowns.
⏰ Timezone Selector
A component for selecting a timezone.

Uses static data (timezoneData.js).
Supports v-model for binding the selected value.
label, labelClass, required, selectClass props.
country-code prop (bindable via v-model:countryCode) to filter/suggest timezones for a specific country.
emit-offset-format prop to emit the UTC offset string (e.g., "+05:30") instead of the timezone ID.
📞 Phone Selector
An input component for entering phone numbers with integrated country code selection.

Uses libphonenumber-js for parsing, formatting, and validation.
Supports v-model for binding the formatted phone number string.
label, labelClass, required props.
default-country-code prop to suggest a country code based on an ISO 2-letter code.
Customizable country selection dropdown with flags and search.
🗣️ Language Selector
A component for selecting a language.

Uses token-authenticated API for data.
Supports v-model for binding the selected language ID.
label, labelClass, required, triggerClass props.
default-country prop to filter the list to languages spoken in a specific country (based on country name).
searchable prop to enable filtering in the dropdown.
defaultValue prop to pre-select an option.
💰 Currency Selector
A component for selecting a currency.

Uses token-authenticated API for data.
Supports v-model for binding the selected currency ID.
label, labelClass, required, triggerClass props.
country-code prop to suggest/default the currency based on a country's ISO 2-letter code.
Displays currency symbols and flags.
searchable prop to enable filtering in the dropdown.
🧩 Contribution
Feel free to contribute new components or improvements via PR.

---

## 📧 Contact

- Email: gjmat28@gmail.com
- LinkedIn: [Mathavan Jeyadev](https://www.linkedin.com/in/mathavan-jeyadev-b0920818/)

---

📄 License
MIT — Free for commercial and open source use.

Made with ❤️ by Astra Techno

```
