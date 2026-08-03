using System;

namespace PaymentService.Models
{
    public class ClientWalletTransaction
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string WalletId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public TransactionType Type { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? ReferenceId { get; set; } // e.g. PaymentTransaction ID or Auction ID
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Property
        public ClientWallet Wallet { get; set; } = null!;
    }
}
