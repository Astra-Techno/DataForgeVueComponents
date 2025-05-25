// src/axios.js
import axios from "axios";
import config from "./location-selector/services.config.js";

const token = config.locationSelector.token;
const endpoint = config.locationSelector.endpoint;

const api = axios.create({
  baseURL: endpoint,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export default api;
