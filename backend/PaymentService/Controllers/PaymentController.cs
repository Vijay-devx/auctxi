using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Models;
using PaymentService.Services;

namespace PaymentService.Controllers
{
    [ApiController]
    [Route("api/v1/payments")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentLogicService _logicService;
        private readonly IRazorpayService _razorpayService;
        private readonly PaymentDbContext _context;

        public PaymentController(IPaymentLogicService logicService, IRazorpayService razorpayService, PaymentDbContext context)
        {
            _logicService = logicService;
            _razorpayService = razorpayService;
            _context = context;
        }

        public class PaymentRequestDto
        {
            public string ClientId { get; set; } = string.Empty;
            public string AuctionId { get; set; } = string.Empty;
            public decimal Amount { get; set; }
        }

        [HttpPost("registration")]
        public async Task<IActionResult> InitiateRegistration([FromBody] PaymentRequestDto request)
        {
            var tx = await _logicService.InitiateRegistrationFeeAsync(request.ClientId, request.AuctionId, request.Amount);
            return Ok(new { message = "Registration invoice created", transaction = tx });
        }

        [HttpPost("purse")]
        public async Task<IActionResult> InitiatePurseDeposit([FromBody] PaymentRequestDto request)
        {
            var tx = await _logicService.InitiatePurseDepositAsync(request.ClientId, request.AuctionId, request.Amount);
            return Ok(new { message = "Purse deposit invoice created", transaction = tx });
        }

        public class WebhookRequestDto
        {
            public string GatewayReferenceId { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook([FromBody] WebhookRequestDto request)
        {
            var success = await _logicService.ProcessWebhookAsync(request.GatewayReferenceId, request.Status);
            if (!success) return NotFound(new { message = "Transaction not found" });
            return Ok(new { message = "Webhook processed successfully" });
        }

        [HttpPost("internal/auction/{auctionId}/settle")]
        public async Task<IActionResult> SettleAuction(string auctionId, [FromQuery] string managerId, [FromBody] List<ClientSpendDto> clientSpends)
        {
            if (string.IsNullOrEmpty(managerId)) return BadRequest("ManagerId is required");
            
            var settlement = await _logicService.SettleAuctionAsync(auctionId, managerId, clientSpends);
            return Ok(new { message = "Settlement processed", settlement });
        }

        [HttpPost("internal/auction/{auctionId}/cancel")]
        public async Task<IActionResult> CancelAuction(string auctionId)
        {
            await _logicService.CancelAuctionAsync(auctionId);
            return Ok(new { message = "Auction cancellation processed successfully" });
        }

        [HttpGet("client/{clientId}/transactions")]
        public async Task<IActionResult> GetClientTransactions(string clientId)
        {
            var transactions = await _context.PaymentTransactions
                .Where(t => t.UserId == clientId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
            
            return Ok(transactions);
        }

        [HttpGet("manager/{managerId}/settlements")]
        public async Task<IActionResult> GetManagerSettlements(string managerId)
        {
            var settlements = await _context.Settlements
                .Where(s => s.ManagerId == managerId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
            
            return Ok(settlements);
        }

        [HttpGet("admin/transactions")]
        public async Task<IActionResult> GetAllTransactions()
        {
            var transactions = await _context.PaymentTransactions
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
            
            return Ok(transactions);
        }

        [HttpGet("admin/settlements")]
        public async Task<IActionResult> GetAllSettlements()
        {
            var settlements = await _context.Settlements
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
            
            return Ok(settlements);
        }

        // --- Wallet Endpoints ---

        [HttpGet("wallet/{clientId}")]
        public async Task<IActionResult> GetWallet(string clientId)
        {
            var wallet = await _logicService.GetWalletAsync(clientId);
            return Ok(wallet);
        }

        [HttpPost("wallet/{clientId}/deposit")]
        public async Task<IActionResult> DepositToWallet(string clientId, [FromBody] PaymentService.DTOs.WalletDepositRequest request)
        {
            if (request.Amount <= 0) return BadRequest("Amount must be greater than 0");
            
            var wallet = await _logicService.DepositToWalletAsync(clientId, request.Amount);
            return Ok(new { message = "Funds deposited successfully", wallet });
        }

        [HttpPost("wallet/{clientId}/pay-auction-fees/{auctionId}")]
        public async Task<IActionResult> PayAuctionFees(string clientId, string auctionId, [FromBody] PaymentService.DTOs.PayAuctionFeesRequest request)
        {
            try
            {
                var success = await _logicService.PayAuctionFeesAsync(clientId, auctionId, request.RegistrationFee, request.InitialPurse);
                if (success)
                {
                    return Ok(new { message = "Auction fees paid successfully" });
                }
                return BadRequest(new { message = "Failed to process payment." });
            }
            catch (System.InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("client/{clientId}/auction/{auctionId}/status")]
        public async Task<IActionResult> GetAuctionPaymentStatus(string clientId, string auctionId)
        {
            var hasPaid = await _logicService.HasPaidForAuctionAsync(clientId, auctionId);
            return Ok(new { hasPaid });
        }

        // --- Razorpay Endpoints ---

        public class RazorpayCreateOrderRequest
        {
            public decimal Amount { get; set; }
            public string ReceiptId { get; set; } = string.Empty;
        }

        [HttpPost("razorpay/create-order")]
        public async Task<IActionResult> CreateRazorpayOrder([FromBody] RazorpayCreateOrderRequest request)
        {
            if (request.Amount <= 0) return BadRequest("Amount must be greater than zero");
            try
            {
                var orderId = await _razorpayService.CreateOrderAsync(request.Amount, request.ReceiptId);
                return Ok(new { orderId });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        public class RazorpayVerifyRequest
        {
            public string ClientId { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public string RazorpayPaymentId { get; set; } = string.Empty;
            public string RazorpayOrderId { get; set; } = string.Empty;
            public string RazorpaySignature { get; set; } = string.Empty;
        }

        [HttpPost("razorpay/verify")]
        public async Task<IActionResult> VerifyRazorpayPayment([FromBody] RazorpayVerifyRequest request)
        {
            var isValid = _razorpayService.VerifyPaymentSignature(
                request.RazorpayPaymentId, 
                request.RazorpayOrderId, 
                request.RazorpaySignature);

            if (isValid)
            {
                // Deposit the funds since payment is verified
                var wallet = await _logicService.DepositToWalletAsync(request.ClientId, request.Amount);
                return Ok(new { message = "Payment verified successfully", wallet });
            }
            else
            {
                return BadRequest(new { message = "Invalid payment signature" });
            }
        }
    }
}
