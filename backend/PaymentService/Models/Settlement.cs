using System;

namespace PaymentService.Models
{
    public class Settlement
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string ManagerId { get; set; } = string.Empty;
        public string AuctionId { get; set; } = string.Empty;
        public SettlementType Type { get; set; }
        public decimal GrossAmount { get; set; }
        public decimal PlatformCommissionAmount { get; set; }
        public decimal NetAmount { get; set; }
        public SettlementStatus Status { get; set; } = SettlementStatus.PENDING;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SettledAt { get; set; }
    }
}
