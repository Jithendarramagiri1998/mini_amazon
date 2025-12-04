import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "/api";

function getToken() {
  return localStorage.getItem("token");
}

export function client() {
  const inst = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" }
  });
  const token = getToken();
  if (token) inst.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  return inst;
}
