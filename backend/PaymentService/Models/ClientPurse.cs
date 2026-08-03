using System;

namespace PaymentService.Models
{
    public class ClientPurse
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string ClientId { get; set; } = string.Empty;
        public string AuctionId { get; set; } = string.Empty;
        public decimal TotalDeposit { get; set; }
        public PurseStatus Status { get; set; } = PurseStatus.PENDING;
        public string? TransactionId { get; set; } // FK to PaymentTransaction
        public PaymentTransaction? Transaction { get; set; }
    }
}
