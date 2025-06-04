# 📦 Changelog

## [v0.2.0] - Feature Enhancements & New Components

### 🎉 Features

- ✨ Added `AddressInput` component for comprehensive address forms.
- ✨ Added `PhoneSelect` component with country code selection and formatting.
- ✨ Added `LanguageSelect` component for language selection, filterable by country.
- ✨ Added `CurrencySelect` component with country code suggestion and flag display.
- ✨ Enhanced `TimezoneSelect` to allow emitting UTC offset and filtering by country code.
- ✨ Added `searchable` prop to `RegionSelect`, `SubregionSelect`, `CountrySelect`, `StateSelect`, `CitySelect`, `LanguageSelect`, `CurrencySelect`.
- ✨ Added `default-value` prop to `RegionSelect`, `SubregionSelect`, `CountrySelect`, `StateSelect`, `CitySelect`, `LanguageSelect`.
- ✨ Improved `CountrySelect` to emit the full selected country object via `@selected` event.
- ✨ Updated `README.md` with new components, features, and demo site URL.
- ✨ Added contact information to `README.md`.
- ✨ Updated demo application (`vue-location-demo`) to showcase all new components and features.

### 🐛 Fixes

- Minor style adjustments and prop consistency across components.

## [v0.1.0] - Initial Release

### 🎉 Features

- ✅ Vue 3 Location Selector Component Set
  - RegionSelect
  - SubregionSelect
  - CountrySelect
  - StateSelect
  - CitySelect
- ✅ Full token-based API integration (with Laravel + DataForge)
- ✅ Built-in loading spinner
- ✅ Flexible `v-model` with string or ID support
- ✅ Label, required, and class styling props
- ✅ Shared `services.config.js` auto-generated on setup
- ✅ Fully documented in README

---

🔗 GitHub: https://github.com/Astra-Techno/DataForgeVueComponents
📦 NPM: `@data-forge-services/core`
✉️ Maintained by Astra Techno
