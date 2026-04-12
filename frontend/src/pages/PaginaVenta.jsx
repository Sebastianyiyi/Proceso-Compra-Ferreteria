import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarClientePorDocumento, crearCliente } from '../services/clientesService';
import { obtenerProductos, crearVenta } from '../services/comprasService';
import './PaginaVenta.css';

export default function PaginaVenta() {
  const navigate = useNavigate();

  const [cedula, setCedula] = useState('');
  const [cliente, setCliente] = useState(null);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    cedula: '', nombre: '', apellido: '',
    direccion: '', telefono: '', email: '',
    fechaRegistro: new Date().toISOString()
  });

  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerProductos().then(setProductos);
  }, []);

  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const iva = subtotal * 0.15;
  const total = subtotal + iva;

  // Busca en tiempo real mientras escribe
  useEffect(() => {
    if (cedula.trim().length < 3) {
      setCliente(null);
      setBusquedaRealizada(false);
      setMostrarFormCliente(false);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const encontrado = await buscarClientePorDocumento(cedula.trim());
        if (encontrado?.encontrado) {
          setCliente({ ...encontrado.usuario, encontrado: true});
          setBusquedaRealizada(true);
          setMostrarFormCliente(false);
        } else {
          setCliente(null);
          setBusquedaRealizada(true);
          setMostrarFormCliente(false);
        }
      } catch {
        setCliente(null);
        setBusquedaRealizada(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [cedula]);

  const guardarNuevoCliente = async () => {
    try {
      const creado = await crearCliente({ ...nuevoCliente, numeroDocumento: cedula });
      setCliente({ encontrado: true, ...creado });
      setMostrarFormCliente(false);
    } catch {
      setError('Error al crear el cliente.');
    }
  };

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (existe) return prev.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, cantidad) => {
    if (cantidad < 1) return eliminarDelCarrito(id);
    setCarrito(prev => prev.map(p => p.id === id ? { ...p, cantidad } : p));
  };

  const eliminarDelCarrito = (id) => setCarrito(prev => prev.filter(p => p.id !== id));

  const procesarVenta = async () => {
    if (!cliente || carrito.length === 0) return;
    setCargando(true);
    try {
      console.log("Cliente objeto:", cliente);
      console.log("UsuarioId a enviar:", cliente.id);
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
    p.marca.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    (p.descripcion || '').toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  return (
    <div className="venta-container">
      <header className="venta-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            Ferretería Don Joaquín
          </div>
        </div>
      </header>

      <div className="venta-body">
        {/* Columna izquierda */}
        <div className="columna-izquierda">

          {/* Buscador cliente */}
          <div className="card">
            <h2>Cliente</h2>
            <div className="cliente-search-wrap">
              <input
                type="text"
                placeholder="Buscar por cédula o RUC..."
                value={cedula}
                onChange={e => setCedula(e.target.value)}
              />
              {/* Resultado en tiempo real */}
              {busquedaRealizada && (
                <div className="cliente-dropdown">
                  {cliente ? (
                    <div className="cliente-resultado found" onClick={() => {}}>
                      <div className="cliente-avatar">
                        {cliente.nombre?.charAt(0)}{cliente.apellido?.charAt(0)}
                      </div>
                      <div>
                        <p className="cliente-nombre-res">{cliente.nombre} {cliente.apellido}</p>
                        <p className="cliente-detalle-res">{cliente.email} · {cliente.telefono}</p>
                      </div>
                      <span className="badge-check">✓</span>
                    </div>
                  ) : (
                    <div
                      className="cliente-resultado add"
                      onClick={() => setMostrarFormCliente(true)}
                    >
                      <div className="cliente-avatar add-avatar">+</div>
                      <div>
                        <p className="cliente-nombre-res">Agregar nuevo cliente</p>
                        <p className="cliente-detalle-res">Cédula: {cedula} — no encontrada en el sistema</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {mostrarFormCliente && (
              <div className="form-nuevo-cliente">
                <p className="form-title">Nuevo cliente</p>
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
                <div className="form-actions">
                  <button className="btn-ghost" onClick={() => setMostrarFormCliente(false)}>Cancelar</button>
                  <button className="btn-success" onClick={guardarNuevoCliente}>Guardar cliente</button>
                </div>
              </div>
            )}
          </div>

          {/* Tabla de productos */}
          <div className="card">
            <h2>Productos</h2>
            <input
              type="text"
              placeholder="Buscar por nombre, marca o descripción..."
              value={busquedaProducto}
              onChange={e => setBusquedaProducto(e.target.value)}
              className="search-input"
            />
            {!cliente && (
              <div className="aviso-sin-cliente">
                Selecciona un cliente antes de agregar productos
              </div>
            )}
            <div className="productos-tabla">
              <div className="tabla-header">
                <span>Producto</span>
                <span>Marca</span>
                <span>Descripción</span>
                <span>Precio</span>
                <span>Stock</span>
                <span></span>
              </div>
              {productosFiltrados.map(producto => (
                <div key={producto.id} className="tabla-fila">
                  <span className="prod-nombre">{producto.nombre}</span>
                  <span className="prod-marca">{producto.marca}</span>
                  <span className="prod-desc">{producto.descripcion || '—'}</span>
                  <span className="prod-precio">${producto.precio.toFixed(2)}</span>
                  <span className={`prod-stock ${producto.stock <= 5 ? 'stock-bajo' : ''}`}>
                    {producto.stock}
                  </span>
                  <button
                    className="btn-agregar-fila"
                    onClick={() => agregarAlCarrito(producto)}
                    disabled={producto.stock === 0 || !cliente}
                    title={!cliente ? 'Primero selecciona un cliente' : ''}
                  >
                    + Agregar
                  </button>
                </div>
              ))}
              {productosFiltrados.length === 0 && (
                <div className="tabla-vacia">No se encontraron productos</div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha — Resumen */}
        <div className="columna-derecha">
          <div className="card carrito-card">
            <h2>Resumen de Venta</h2>

            {/* Info del cliente en el resumen */}
            {cliente && (
              <div className="resumen-cliente">
                <div className="resumen-cliente-avatar">
                  {cliente.nombre?.charAt(0)}{cliente.apellido?.charAt(0)}
                </div>
                <div>
                  <p className="resumen-cliente-nombre">{cliente.nombre} {cliente.apellido}</p>
                  <p className="resumen-cliente-detalle">{cliente.email}</p>
                  <p className="resumen-cliente-detalle">{cliente.telefono}</p>
                </div>
              </div>
            )}

            <div className="resumen-divider" />

            {carrito.length === 0 ? (
              <div className="carrito-vacio">
                <span className="carrito-icon">🛒</span>
                <p>Agrega productos para comenzar</p>
              </div>
            ) : (
              <>
                {/* Encabezado tabla carrito */}
                <div className="carrito-tabla-header">
                  <span>Producto</span>
                  <span>Cantidad</span>
                  <span>Subtotal</span>
                  <span></span>
                </div>

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
                      </div>
                      <p className="item-subtotal">${(item.precio * item.cantidad).toFixed(2)}</p>
                      <button className="btn-eliminar" onClick={() => 
                        eliminarDelCarrito(item.id)}>Eliminar</button>
                    </div>
                  ))}
                </div>

                <div className="resumen-divider" />

                <div className="totales">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>IVA (15%)</span>
                    <span>${iva.toFixed(2)}</span>
                  </div>
                  <div className="total-row total-final">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
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