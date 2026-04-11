import axios from 'axios';

const BASE_URL = process.env.REACT_APP_CLIENTES_API;

export const buscarClientePorCedula = async (cedula) => {
    const response = await axios.get(`${BASE_URL}/api/Usuarios`);
    const cliente = response.data.find(u => u.cedula === cedula);
    return cliente || null;
};

export const crearCliente = async (cliente) => {
    const response = await axios.post(`${BASE_URL}/api/Usuarios`, cliente);
    return response.data;
};