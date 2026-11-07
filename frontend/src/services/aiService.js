
import axios from "axios";

const API = "http://127.0.0.1:8000";

export const generateAIremarks = (patientId) => {
  return axios.post(
    `${API}/api/patients/${patientId}/remarks`
  );
};
