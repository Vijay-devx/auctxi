using System.Collections.Generic;
using System.Threading.Tasks;

namespace PaymentService.Services
{
    public interface IRazorpayService
    {
        Task<string> CreateOrderAsync(decimal amount, string receiptId);
        bool VerifyPaymentSignature(string paymentId, string orderId, string signature);
    }
}
