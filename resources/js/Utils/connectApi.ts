import axios from "axios";
const apios = axios.create({
  // baseURL: "http://localhost:8000/api/",
  baseURL: "https://sigmaos.com.br/api/",
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    "Content-Type": "application/json"
  },
});

const connectBackend = axios.create({
  // baseURL: "http://localhost:8000/app/",
  baseURL: "https://sigmaos.com.br/app/",
  headers: {
    "Content-Type": "application/json"
  }
});

export { apios, connectBackend};
