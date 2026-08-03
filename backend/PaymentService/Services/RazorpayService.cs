using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Razorpay.Api;

namespace PaymentService.Services
{
    public class RazorpayService : IRazorpayService
    {
        private readonly string _keyId;
        private readonly string _keySecret;

        public RazorpayService(IConfiguration configuration)
        {
            _keyId = configuration["Razorpay:KeyId"] ?? throw new ArgumentNullException("Razorpay:KeyId");
            _keySecret = configuration["Razorpay:KeySecret"] ?? throw new ArgumentNullException("Razorpay:KeySecret");
        }

        public Task<string> CreateOrderAsync(decimal amount, string receiptId)
        {
            try
            {
                var client = new RazorpayClient(_keyId, _keySecret);

                Dictionary<string, object> options = new Dictionary<string, object>();
                // Amount must be in paise (multiply by 100)
                options.Add("amount", amount * 100); 
                options.Add("currency", "INR");
                options.Add("receipt", receiptId);
                options.Add("payment_capture", 1);

                Order order = client.Order.Create(options);
                return Task.FromResult(order["id"].ToString());
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create Razorpay order: {ex.Message}");
            }
        }

        public bool VerifyPaymentSignature(string paymentId, string orderId, string signature)
        {
            try
            {
                Dictionary<string, string> attributes = new Dictionary<string, string>();
                attributes.Add("razorpay_payment_id", paymentId);
                attributes.Add("razorpay_order_id", orderId);
                attributes.Add("razorpay_signature", signature);

                Utils.verifyPaymentSignature(attributes);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
