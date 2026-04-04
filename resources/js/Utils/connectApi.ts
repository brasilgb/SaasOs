import axios from 'axios';
const apios = axios.create({
    baseURL: `${import.meta.env.VITE_APP_URL}/api/`,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json',
    },
});

const connectBackend = axios.create({
    baseURL: `${import.meta.env.VITE_APP_URL}/app/`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export { apios, connectBackend };
