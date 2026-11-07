import axios from "axios";
const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api` });
export const getPatients = () => api.get("/patients/");
export const createPatient = data => api.post("/patients/", data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatient = id => api.delete(`/patients/${id}`);
