import axios from 'axios';

const apios = axios.create({
    baseURL: '/api/',
    withCredentials: true,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json',
    },
});

const connectBackend = axios.create({
    baseURL: '/app/',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export { apios, connectBackend };
