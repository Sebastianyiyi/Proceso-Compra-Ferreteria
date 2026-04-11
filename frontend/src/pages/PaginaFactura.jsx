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

  return (
    <div className="factura-page">

      {/* Botones de acción — se ocultan al imprimir */}
      <div className="factura-acciones no-print">
        <button className="btn-volver" onClick={() => navigate('/')}>
          ← Nueva venta
        </button>
        <button className="btn-imprimir" onClick={() => window.print()}>
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Factura */}
      <div className="factura">

        {/* Encabezado */}
        <div className="factura-header">
          <div className="empresa-info">
            <h1>🔧 Ferretería</h1>
            <p>Sistema de Ventas</p>
          </div>
          <div className="factura-meta">
            <h2>FACTURA</h2>
            <p className="numero-doc">{venta.numeroDocumento}</p>
            <p className="fecha">
              {new Date(venta.fechaVenta).toLocaleDateString('es-EC', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="factura-divider" />

        {/* Datos del cliente */}
        <div className="factura-cliente">
          <h3>Datos del Cliente</h3>
          <div className="cliente-datos">
            <div>
              <span className="label">ID Cliente</span>
              <span>{venta.usuarioId}</span>
            </div>
          </div>
        </div>

        <div className="factura-divider" />

        {/* Tabla de productos */}
        <table className="factura-tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio Unit.</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {venta.detallesVenta.map(detalle => (
              <tr key={detalle.id}>
                <td>
                  <p className="producto-nombre">{detalle.producto?.nombre}</p>
                  <p className="producto-marca">{detalle.producto?.marca}</p>
                </td>
                <td>${detalle.precioUnitario.toFixed(2)}</td>
                <td>{detalle.cantidad}</td>
                <td>${detalle.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

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

        {/* Pie de factura */}
        <div className="factura-footer">
          <p>Gracias por su compra</p>
          <p className="text-muted">Documento generado el {new Date().toLocaleString('es-EC')}</p>
        </div>

      </div>
    </div>
  );
}