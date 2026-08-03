using Microsoft.EntityFrameworkCore;
using PaymentService.Models;

namespace PaymentService.Data
{
    public class PaymentDbContext : DbContext
    {
        public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options)
        {
        }

        public DbSet<PaymentTransaction> PaymentTransactions { get; set; }
        public DbSet<ClientPurse> ClientPurses { get; set; }
        public DbSet<Settlement> Settlements { get; set; }
        public DbSet<PlatformConfig> PlatformConfigs { get; set; }
        public DbSet<ClientWallet> ClientWallets { get; set; }
        public DbSet<ClientWalletTransaction> ClientWalletTransactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PaymentTransaction>().HasKey(p => p.Id);
            modelBuilder.Entity<ClientPurse>().HasKey(c => c.Id);
            modelBuilder.Entity<Settlement>().HasKey(s => s.Id);
            modelBuilder.Entity<PlatformConfig>().HasKey(p => p.Id);

            // Configure enum string conversion
            modelBuilder.Entity<PaymentTransaction>()
                .Property(e => e.Type)
                .HasConversion<string>();

            modelBuilder.Entity<PaymentTransaction>()
                .Property(e => e.Status)
                .HasConversion<string>();

            modelBuilder.Entity<ClientPurse>()
                .Property(e => e.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Settlement>()
                .Property(e => e.Type)
                .HasConversion<string>();

            modelBuilder.Entity<Settlement>()
                .Property(e => e.Status)
                .HasConversion<string>();

            // Configure Relationships
            modelBuilder.Entity<ClientPurse>()
                .HasOne(c => c.Transaction)
                .WithMany()
                .HasForeignKey(c => c.TransactionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
