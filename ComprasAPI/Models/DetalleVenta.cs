using System.ComponentModel.DataAnnotations.Schema;

namespace ComprasAPI.Models
{
    public class DetalleVenta
    {
        public int Id { get; set; }
        public int VentaId { get; set; }
        public Venta Venta { get; set; } = null!;
        public int ProductoId { get; set; }
        public Producto Producto { get; set; } = null!;
        [Column(TypeName = "decimal(18,2)")]
        public decimal PrecioUnitario { get; set; }
        public int Cantidad { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }
    }
}