using Microsoft.EntityFrameworkCore;
using ClientesAPI.Models;

namespace ClientesAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.Property(u => u.NumeroDocumento).IsRequired().HasMaxLength(13);
                entity.HasIndex(u => u.NumeroDocumento)
                      .IsUnique()
                      .HasDatabaseName("IX_Usuarios_NumeroDocumento_Unique");
                entity.Property(u => u.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Apellido).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Direccion).HasMaxLength(200);
                entity.Property(u => u.Telefono).HasMaxLength(15);
                entity.Property(u => u.Email).HasMaxLength(150);
            });
        }
    }
}