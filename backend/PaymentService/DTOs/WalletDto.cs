using System;
using System.Collections.Generic;

namespace PaymentService.DTOs
{
    public class WalletDto
    {
        public string Id { get; set; } = string.Empty;
        public string ClientId { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<WalletTransactionDto> Transactions { get; set; } = new();
    }

    public class WalletTransactionDto
    {
        public string Id { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
