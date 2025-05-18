import RegionSelect from './RegionSelect.vue'
import SubregionSelect from './SubregionSelect.vue'
import CountrySelect from './CountrySelect.vue'
import StateSelect from './StateSelect.vue'
import CitySelect from './CitySelect.vue'
import axios from 'axios'
import config from './services.config.js'

const token = config.locationSelector.token
const endpoint = config.locationSelector.endpoint

axios.defaults.baseURL = endpoint
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

export {
  RegionSelect,
  SubregionSelect,
  CountrySelect,
  StateSelect,
  CitySelect
}
