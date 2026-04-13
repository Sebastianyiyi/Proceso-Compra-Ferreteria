import axios from 'axios';

const BASE_URL = process.env.REACT_APP_COMPRAS_API;

export const obtenerProductos = async () => {
    const response = await axios.get(`${BASE_URL}/api/Productos`);
    return response.data;
};

export const crearVenta = async (venta) => {
    const response = await axios.post(`${BASE_URL}/api/Ventas`, venta);
    return response.data;
};

export const obtenerVenta = async (id) => {
    const response = await axios.get(`${BASE_URL}/api/Ventas/${id}`);
    return response.data;
};