using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClientesAPI.Data;
using ClientesAPI.Models;
using ClientesAPI.Helpers;

namespace ClientesAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Usuarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {
            return await _context.Usuarios.ToListAsync();
        }

        // GET: api/Usuarios/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound();
            return usuario;
        }

        // GET: api/Usuarios/documento/0912345678
        // Busca por cédula (10 dígitos) o RUC (13 dígitos) — detecta el tipo automáticamente
        [HttpGet("documento/{numero}")]
        public async Task<ActionResult<object>> GetUsuarioPorDocumento(string numero)
        {
            var (esValido, tipoDocumento) = ValidadorDocumentoEcuador.Validar(numero);

            if (!esValido)
                return BadRequest(new
                {
                    mensaje = numero.Length != 10 && numero.Length != 13
                        ? "El número debe tener 10 dígitos (cédula) o 13 dígitos (RUC)."
                        : $"El número ingresado no es un/a {(numero.Length == 10 ? "cédula" : "RUC")} ecuatoriano/a válido/a."
                });

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.NumeroDocumento == numero);

            if (usuario == null)
                return NotFound(new
                {
                    mensaje = $"{tipoDocumento} {numero} no está registrado/a.",
                    tipoDocumento,
                    numero
                });

            return Ok(new { usuario, tipoDocumento });
        }

        // POST: api/Usuarios
        [HttpPost]
        public async Task<ActionResult<Usuario>> PostUsuario(Usuario usuario)
        {
            var (esValido, tipoDocumento) = ValidadorDocumentoEcuador.Validar(usuario.NumeroDocumento);

            if (!esValido)
                return BadRequest(new
                {
                    mensaje = "El número de documento no es válido. Ingrese una cédula (10 dígitos) o RUC (13 dígitos) ecuatoriano válido."
                });

            bool documentoExiste = await _context.Usuarios
                .AnyAsync(u => u.NumeroDocumento == usuario.NumeroDocumento);

            if (documentoExiste)
                return Conflict(new
                {
                    mensaje = $"Ya existe un usuario registrado con el {tipoDocumento} {usuario.NumeroDocumento}."
                });

            usuario.FechaRegistro = DateTime.UtcNow;
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, usuario);
        }

        // PUT: api/Usuarios/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutUsuario(int id, Usuario usuario)
        {
            if (id != usuario.Id) return BadRequest();

            var (esValido, _) = ValidadorDocumentoEcuador.Validar(usuario.NumeroDocumento);
            if (!esValido)
                return BadRequest(new { mensaje = "El número de documento no es válido." });

            _context.Entry(usuario).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Usuarios/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound();
            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}