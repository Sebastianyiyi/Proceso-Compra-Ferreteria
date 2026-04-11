import axios from 'axios';

const BASE_URL = process.env.REACT_APP_CLIENTES_API;

export const buscarClientePorDocumento = async (numeroDocumento) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/Usuarios/documento/${numeroDocumento}`);
        return { encontrado: true, ...response.data };
    } catch (error) {
        if (error.response?.status === 404) {
            return { encontrado: false, tipoDocumento: error.response.data.tipoDocumento, numero: numeroDocumento };
        }
        throw error;
    }
};

export const crearCliente = async (cliente) => {
    const response = await axios.post(`${BASE_URL}/api/Usuarios`, cliente);
    return response.data;
};