using System;

namespace PaymentService.Models
{
    public class ClientWallet
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string ClientId { get; set; } = string.Empty;
        public decimal Balance { get; set; } = 0m;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
