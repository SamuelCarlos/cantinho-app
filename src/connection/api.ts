import axios from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: process.env.API_URL || "",
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("@Cantinho:token");

  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

export default api;
