using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComprasAPI.Data;
using ComprasAPI.DTOs;
using ComprasAPI.Models;

namespace ComprasAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VentasController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public VentasController(AppDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        // GET: api/Ventas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Venta>>> GetVentas()
        {
            return await _context.Ventas
                .Include(v => v.DetallesVenta)
                .ThenInclude(d => d.Producto)
                .ToListAsync();
        }

        // GET: api/Ventas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Venta>> GetVenta(int id)
        {
            var venta = await _context.Ventas
                .Include(v => v.DetallesVenta)
                .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venta == null)
                return NotFound();

            return venta;
        }

        // POST: api/Ventas
        [HttpPost]
        public async Task<ActionResult<Venta>> PostVenta(VentaRequest request)
        {
            // 1. Validar que el usuario existe en ClientesAPI
            var client = _httpClientFactory.CreateClient("ClientesAPI");
            var response = await client.GetAsync($"api/Usuarios/{request.UsuarioId}");

            if (!response.IsSuccessStatusCode)
                return BadRequest($"El usuario con ID {request.UsuarioId} no existe.");

            // 2. Validar que los productos existen y calcular totales
            var detalles = new List<DetalleVenta>();
            decimal subtotalTotal = 0;

            foreach (var item in request.Detalles)
            {
                var producto = await _context.Productos.FindAsync(item.ProductoId);
                if (producto == null)
                    return BadRequest($"El producto con ID {item.ProductoId} no existe.");

                if (producto.Stock < item.Cantidad)
                    return BadRequest($"Stock insuficiente para '{producto.Nombre}'. Disponible: {producto.Stock}");

                var subtotal = producto.Precio * item.Cantidad;
                subtotalTotal += subtotal;

                detalles.Add(new DetalleVenta
                {
                    ProductoId = item.ProductoId,
                    Cantidad = item.Cantidad,
                    PrecioUnitario = producto.Precio,
                    Subtotal = subtotal
                });

                // 3. Descontar stock
                producto.Stock -= item.Cantidad;
            }

            decimal iva = subtotalTotal * 0.15m; // IVA Ecuador 15%
            decimal total = subtotalTotal + iva;

            // 4. Crear la venta
            var venta = new Venta
            {
                UsuarioId = request.UsuarioId,
                FechaVenta = DateTime.UtcNow,
                NumeroDocumento = $"VTA-{DateTime.UtcNow:yyyyMMddHHmmss}",
                Subtotal = subtotalTotal,
                IVA = iva,
                Total = total,
                DetallesVenta = detalles
            };

            _context.Ventas.Add(venta);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVenta), new { id = venta.Id }, venta);
        }

        // DELETE: api/Ventas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVenta(int id)
        {
            var venta = await _context.Ventas.FindAsync(id);
            if (venta == null)
                return NotFound();

            _context.Ventas.Remove(venta);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}