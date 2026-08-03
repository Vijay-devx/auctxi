using System.Collections.Generic;
using System.Threading.Tasks;
using PaymentService.Models;

namespace PaymentService.Services
{
    public class ClientSpendDto
    {
        public string ClientId { get; set; } = string.Empty;
        public decimal TotalSpent { get; set; }
    }

    public interface IPaymentLogicService
    {
        Task<PaymentService.DTOs.WalletDto> GetWalletAsync(string clientId);
        Task<PaymentService.DTOs.WalletDto> DepositToWalletAsync(string clientId, decimal amount);
        Task<bool> PayAuctionFeesAsync(string clientId, string auctionId, decimal registrationFee, decimal initialPurse);
        Task<bool> HasPaidForAuctionAsync(string clientId, string auctionId);

        Task<PaymentTransaction> InitiateRegistrationFeeAsync(string clientId, string auctionId, decimal amount);
        Task<PaymentTransaction> InitiatePurseDepositAsync(string clientId, string auctionId, decimal amount);
        Task<bool> ProcessWebhookAsync(string gatewayReferenceId, string status);
        Task<Settlement> SettleAuctionAsync(string auctionId, string managerId, List<ClientSpendDto> clientSpends);
        Task<bool> CancelAuctionAsync(string auctionId);
    }
}
