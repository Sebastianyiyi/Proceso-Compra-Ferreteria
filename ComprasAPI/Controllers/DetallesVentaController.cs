using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ComprasAPI.Data;
using ComprasAPI.Models;

namespace ComprasAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DetallesVentaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DetallesVentaController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/DetallesVenta
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DetalleVenta>>> GetDetallesVenta()
        {
            return await _context.DetallesVenta
                .Include(d => d.Producto)
                .Include(d => d.Venta)
                .ToListAsync();
        }

        // GET: api/DetallesVenta/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DetalleVenta>> GetDetalleVenta(int id)
        {
            var detalle = await _context.DetallesVenta
                .Include(d => d.Producto)
                .Include(d => d.Venta)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (detalle == null)
                return NotFound();

            return detalle;
        }

        // GET: api/DetallesVenta/venta/5
        [HttpGet("venta/{ventaId}")]
        public async Task<ActionResult<IEnumerable<DetalleVenta>>> GetDetallesPorVenta(int ventaId)
        {
            return await _context.DetallesVenta
                .Include(d => d.Producto)
                .Where(d => d.VentaId == ventaId)
                .ToListAsync();
        }
    }
}