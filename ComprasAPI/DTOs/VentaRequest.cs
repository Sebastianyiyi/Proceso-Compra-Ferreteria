namespace ComprasAPI.DTOs
{
    public class VentaRequest
    {
        public int UsuarioId { get; set; }
        public List<DetalleVentaRequest> Detalles { get; set; } = new();
    }

    public class DetalleVentaRequest
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
    }
}