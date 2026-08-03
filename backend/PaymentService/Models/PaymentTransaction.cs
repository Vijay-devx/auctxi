using System;

namespace PaymentService.Models
{
    public class PaymentTransaction
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; } = string.Empty;
        public string AuctionId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public TransactionType Type { get; set; }
        public string? GatewayReferenceId { get; set; }
        public TransactionStatus Status { get; set; } = TransactionStatus.PENDING;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
