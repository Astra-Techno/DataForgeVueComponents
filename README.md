# 🌐 Data Forge Services — Component Library

This is the core component library for **Data Forge Services**, providing ready-to-use Vue 3 components like:

- 🌍 [Location Selector](./src/location-selector/README.md)
- ⏰ [Timezone Selector](./src/timezone-selector/README.md)
- 📦 More coming soon...

Each component is:

- Built with Vue 3 Composition API
- Async-loaded with a secure backend (Laravel + DataForge)
- Fully customizable via props, slots, and class injection

---

## 📦 Installation

```bash
npm install @data-forge-services/core
```

---

## 🔧 Usage

```js
import { createApp } from "vue";
import App from "./App.vue";
import DataForgeComponents from "@data-forge-services/core";

const app = createApp(App);
app.use(DataForgeComponents);
```

Or import individual components:

```js
import { RegionSelect, CitySelect } from "@data-forge-services/core";
```

## 🧩 Component Usage

```vue
<template>
  <div class="min-h-screen bg-white p-4 text-gray-800">
    // Full example.
    <RegionSelect label="Region" v-model="regionId" />
    <SubregionSelect
      label="Sub-Region"
      v-model="subRegionId"
      :region="regionId"
    />
    <CountrySelect
      label="Country"
      v-model="countryId"
      :subregion="subRegionId"
    />
    <StateSelect label="State" v-model="stateId" :country="countryId" />
    <CitySelect label="City" v-model="cityId" :state="stateId" />

    // Simple example to load states of a country.
    <StateSelect label="State" country="India" />

    // Simple example to load cities of a state.
    <CitySelect label="City" state="Tamil Nadu" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  RegionSelect,
  SubregionSelect,
  CountrySelect,
  StateSelect,
  CitySelect,
} from "@data-forge-services/core";

const regionId = ref("");
const subRegionId = ref("");
const countryId = ref("");
const stateId = ref("");
const cityId = ref("");
</script>
```

---

## 🔐 Token Setup (One-Time)

```bash
npm run setup
```

This generates `services.config.js` for each component with token + endpoint config.

---

## 📁 Components

### [📍 Location Selector](./src/location-selector/README.md)

- Region → Subregion → Country → State → City
- Uses token-authenticated API
- Custom label and style support

### [🕒 Timezone Selector](./src/timezone-selector/README.md)

- (Coming soon)

---

## 🧩 Contribution

Feel free to contribute new components or improvements via PR.

---

## 📄 License

MIT — Free for commercial and open source use.

---

Made with ❤️ by [Astra Techno](https://github.com/Astra-Techno)
