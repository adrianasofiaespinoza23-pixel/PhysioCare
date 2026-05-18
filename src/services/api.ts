const API_URL = "http://127.0.0.1:5000";

export const getPatients = async () => {
  const res = await fetch(`${API_URL}/patients`);
  const data = await res.json();
  return data.patients;
};

