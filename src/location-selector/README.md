# 📍 Location Selector Component

The Location Selector is a fully dynamic Vue 3 component set that allows users to select locations hierarchically:

**Region → Subregion → Country → State → City**

---

## 📦 Installation

This component is part of the main package:

```bash
npm install @data-forge-services/core
```

---

## 🧩 Component Usage

```vue
<template>
  <RegionSelect v-model="region" label="Region" />
  <SubregionSelect :region="region" v-model="subregion" label="Subregion" />
  <CountrySelect
    :region="region"
    :subregion="subregion"
    v-model="country"
    label="Country"
  />
  <StateSelect :country="country" v-model="state" label="State" />
  <CitySelect :state="state" v-model="city" label="City" />
</template>

<script setup>
import { ref } from "vue";
const region = ref("");
const subregion = ref("");
const country = ref("");
const state = ref("");
const city = ref("");
</script>
```

> ✅ `CountrySelect` will auto-load:
>
> - Countries filtered by `region` or `subregion` if provided
> - **All countries** when both props are omitted

---

## 🔐 Token Setup

Run this once after install to generate a token + endpoint config:

```bash
npm run setup
```

Creates:

```js
// src/services.config.js
export default {
  locationSelector: {
    token: "your-generated-token",
    endpoint: "https://api.data-forge.tech",
  },
};
```

---

## 🎨 Props

| Prop          | Type      | Description                                    |
| ------------- | --------- | ---------------------------------------------- | ------------------------------- |
| `v-model`     | `String   | Number`                                        | The selected value (name or ID) |
| `label`       | `String`  | Optional label shown above select              |
| `required`    | `Boolean` | Adds `required` attr to `<select>`             |
| `selectClass` | `String`  | Custom class for `<select>`                    |
| `labelClass`  | `String`  | Custom class for `<label>`                     |
| `region`      | `String`  | Optional region filter (e.g., "Asia")          |
| `subregion`   | `String`  | Optional subregion filter (e.g., "South Asia") |

---

## 🌀 Loading State

Each component shows a loading spinner while fetching data.

---

## 🌐 API Endpoints

Each component calls token-secured endpoints like:

```
/api/all/Location:regions
/api/all/Location:subregions?region=Asia
/api/all/Location:countries?subregion=Southern Asia
/api/all/Location:states?country=India
/api/all/Location:cities?state=Tamil Nadu
```

---

## 📁 Files

```
src/location-selector/
├── index.js
├── RegionSelect.vue
├── SubregionSelect.vue
├── CountrySelect.vue
├── StateSelect.vue
├── CitySelect.vue
```

---

## ✅ Coming Soon

- Searchable select box
- Auto-detect user country via IP
- Optional fallback text input for city

---

## 📄 License

MIT — Free to use, modify, and distribute.
