import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerVenta } from '../services/comprasService';
import './PaginaFactura.css';

export default function PaginaFactura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venta, setVenta] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerVenta(id).then(data => {
      setVenta(data);
      setCargando(false);
    });
  }, [id]);

  if (cargando) return <div className="factura-loading">Cargando factura...</div>;
  if (!venta) return <div className="factura-loading">Factura no encontrada.</div>;

  const cliente = venta.cliente;

  return (
    <div className="factura-page">

      {/* Cabecera principal */}
      <header className="factura-topbar no-print">
        <div className="factura-topbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Ferretería Don Joaquín
        </div>
      </header>

      {/* Factura */}
      <div className="factura">

        {/* Encabezado empresa */}
        <div className="factura-header">
          <div className="empresa-info">
            <h1>FACTURA</h1>
            <h2>Ferretería Don Joaquín</h2>
            <p>Sistema de Ventas</p>
          </div>
          <div className="factura-meta">
            <div className="factura-meta-fila">
              <span className="meta-label">N° Comprobante</span>
              <span className="meta-valor">{venta.numeroDocumento}</span>
            </div>
            <div className="factura-meta-fila">
              <span className="meta-label">Fecha de Emisión</span>
              <span className="meta-valor">
                {new Date(venta.fechaVenta).toLocaleDateString('es-EC', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="factura-divider" />

        {/* Datos del cliente en filas */}
        <div className="factura-seccion">
          <h3>Datos del Cliente</h3>
          <div className="datos-tabla">
            <div className="datos-header">
              <span>N° Documento</span>
              <span>Nombre</span>
              <span>Apellido</span>
              <span>Teléfono</span>
              <span>Email</span>
              <span>Dirección</span>
            </div>
            <div className="datos-fila">
              <span>{cliente?.numeroDocumento ?? '—'}</span>
              <span>{cliente?.nombre ?? '—'}</span>
              <span>{cliente?.apellido ?? '—'}</span>
              <span>{cliente?.telefono ?? '—'}</span>
              <span>{cliente?.email ?? '—'}</span>
              <span>{cliente?.direccion ?? '—'}</span>
            </div>
          </div>
        </div>

        <div className="factura-divider" />

        {/* Tabla de productos estilo filas */}
        <div className="factura-seccion">
          <h3>Detalle de Productos</h3>
          <div className="productos-tabla-factura">
            <div className="productos-header-factura">
              <span>Producto</span>
              <span>Marca</span>
              <span>Descripción</span>
              <span>Precio Unit.</span>
              <span>Cantidad</span>
              <span>Subtotal</span>
            </div>
            {venta.detallesVenta.map(detalle => (
              <div key={detalle.id} className="productos-fila-factura">
                <span className="prod-nombre">{detalle.producto?.nombre}</span>
                <span className="prod-marca">{detalle.producto?.marca}</span>
                <span className="prod-desc">{detalle.producto?.descripcion || '—'}</span>
                <span className="prod-precio">${detalle.precioUnitario.toFixed(2)}</span>
                <span>{detalle.cantidad}</span>
                <span className="prod-precio">${detalle.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="factura-divider" />

        {/* Totales */}
        <div className="factura-totales">
          <div className="total-row">
            <span>Subtotal</span>
            <span>${venta.subtotal.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>IVA (15%)</span>
            <span>${venta.iva.toFixed(2)}</span>
          </div>
          <div className="total-row total-final">
            <span>TOTAL</span>
            <span>${venta.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Pie */}
        <div className="factura-footer">
          <p>Gracias por su compra</p>
          <p className="text-muted">Documento generado el {new Date().toLocaleString('es-EC')}</p>
        </div>

      </div>

      {/* Botones abajo */}
      <div className="factura-acciones no-print">
        <button className="btn-volver" onClick={() => navigate('/')}>
          Nueva venta
        </button>
        <button className="btn-imprimir" onClick={() => window.print()}>
          Imprimir / Guardar PDF
        </button>
      </div>

    </div>
  );
}