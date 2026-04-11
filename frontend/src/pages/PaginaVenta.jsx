import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarClientePorCedula, crearCliente } from '../services/clientesService';
import { obtenerProductos, crearVenta } from '../services/comprasService';
import './PaginaVenta.css';

export default function PaginaVenta() {
  const navigate = useNavigate();

  // Cliente
  const [cedula, setCedula] = useState('');
  const [cliente, setCliente] = useState(null);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    cedula: '', nombre: '', apellido: '',
    direccion: '', telefono: '', email: '',
    fechaRegistro: new Date().toISOString()
  });

  // Productos
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerProductos().then(setProductos);
  }, []);

  // Totales
  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const iva = subtotal * 0.15;
  const total = subtotal + iva;

  const buscarCliente = async () => {
    setError('');
    if (!cedula.trim()) return;
    const encontrado = await buscarClientePorCedula(cedula);
    if (encontrado) {
      setCliente(encontrado);
      setClienteEncontrado(true);
      setMostrarFormCliente(false);
    } else {
      setCliente(null);
      setClienteEncontrado(false);
      setMostrarFormCliente(true);
      setNuevoCliente(prev => ({ ...prev, cedula }));
    }
  };

  const guardarNuevoCliente = async () => {
    try {
      const creado = await crearCliente(nuevoCliente);
      setCliente(creado);
      setClienteEncontrado(true);
      setMostrarFormCliente(false);
    } catch {
      setError('Error al crear el cliente.');
    }
  };

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (existe) {
        return prev.map(p => p.id === producto.id
          ? { ...p, cantidad: p.cantidad + 1 } : p);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, cantidad) => {
    if (cantidad < 1) return eliminarDelCarrito(id);
    setCarrito(prev => prev.map(p => p.id === id ? { ...p, cantidad } : p));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(p => p.id !== id));
  };

  const procesarVenta = async () => {
    if (!cliente || carrito.length === 0) return;
    setCargando(true);
    try {
      const ventaData = {
        usuarioId: cliente.id,
        detalles: carrito.map(p => ({ productoId: p.id, cantidad: p.cantidad }))
      };
      const venta = await crearVenta(ventaData);
      navigate(`/factura/${venta.id}`);
    } catch {
      setError('Error al procesar la venta.');
      setCargando(false);
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    p.marca.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  return (
    <div className="venta-container">
      {/* Header */}
      <header className="venta-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            🔧 Ferretería Don Joaquín
          </div>
        </div>
      </header>

      <div className="venta-body">
        {/* Columna izquierda */}
        <div className="columna-izquierda">

          {/* Buscador de cliente */}
          <div className="card">
            <h2>Cliente</h2>
            <div className="search-row">
              <input
                type="text"
                placeholder="Cédula o RUC del cliente"
                value={cedula}
                onChange={e => setCedula(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buscarCliente()}
              />
              <button className="btn-primary" onClick={buscarCliente}>Buscar</button>
            </div>

            {clienteEncontrado && cliente && (
              <div className="cliente-info">
                <span className="badge-success">✓ Cliente encontrado</span>
                <p><strong>{cliente.nombre} {cliente.apellido}</strong></p>
                <p className="text-muted">{cliente.email} · {cliente.telefono}</p>
              </div>
            )}

            {mostrarFormCliente && (
              <div className="form-nuevo-cliente">
                <p className="text-warning">⚠️ Cliente no encontrado. Completa los datos:</p>
                <div className="form-grid">
                  {['nombre', 'apellido', 'email', 'telefono', 'direccion'].map(campo => (
                    <input
                      key={campo}
                      type="text"
                      placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                      value={nuevoCliente[campo]}
                      onChange={e => setNuevoCliente(prev => ({ ...prev, [campo]: e.target.value }))}
                    />
                  ))}
                </div>
                <button className="btn-success" onClick={guardarNuevoCliente}>
                  Guardar cliente
                </button>
              </div>
            )}
          </div>

          {/* Catálogo de productos */}
          <div className="card">
            <h2>Productos</h2>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busquedaProducto}
              onChange={e => setBusquedaProducto(e.target.value)}
              className="search-input"
            />
            <div className="productos-grid">
              {productosFiltrados.map(producto => (
                <div key={producto.id} className="producto-card">
                  <div className="producto-info">
                    <p className="producto-nombre">{producto.nombre}</p>
                    <p className="producto-marca">{producto.marca}</p>
                    <p className="producto-precio">${producto.precio.toFixed(2)}</p>
                    <p className="producto-stock">Stock: {producto.stock}</p>
                  </div>
                  <button
                    className="btn-agregar"
                    onClick={() => agregarAlCarrito(producto)}
                    disabled={producto.stock === 0}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha — Carrito */}
        <div className="columna-derecha">
          <div className="card carrito-card">
            <h2>Resumen de venta</h2>

            {carrito.length === 0 ? (
              <div className="carrito-vacio">
                <p>🛒</p>
                <p>Agrega productos para comenzar</p>
              </div>
            ) : (
              <>
                <div className="carrito-items">
                  {carrito.map(item => (
                    <div key={item.id} className="carrito-item">
                      <div className="item-info">
                        <p className="item-nombre">{item.nombre}</p>
                        <p className="item-precio">${item.precio.toFixed(2)} c/u</p>
                      </div>
                      <div className="item-controles">
                        <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}>−</button>
                        <span>{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}>+</button>
                        <button className="btn-eliminar" onClick={() => eliminarDelCarrito(item.id)}>🗑</button>
                      </div>
                      <p className="item-subtotal">${(item.precio * item.cantidad).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="totales">
                  <div className="total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="total-row"><span>IVA (15%)</span><span>${iva.toFixed(2)}</span></div>
                  <div className="total-row total-final"><span>Total</span><span>${total.toFixed(2)}</span></div>
                </div>
              </>
            )}

            {error && <p className="text-error">{error}</p>}

            <button
              className="btn-procesar"
              onClick={procesarVenta}
              disabled={!cliente || carrito.length === 0 || cargando}
            >
              {cargando ? 'Procesando...' : 'Generar Factura'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}