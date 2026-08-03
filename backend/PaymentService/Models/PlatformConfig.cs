namespace PaymentService.Models
{
    public class PlatformConfig
    {
        public int Id { get; set; }
        public decimal PlatformCommissionPercentage { get; set; } = 2.00m; // Default 2%
        public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    }
}
