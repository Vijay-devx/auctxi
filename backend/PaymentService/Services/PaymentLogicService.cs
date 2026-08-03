using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Models;

namespace PaymentService.Services
{
    public class PaymentLogicService : IPaymentLogicService
    {
        private readonly PaymentDbContext _context;

        public PaymentLogicService(PaymentDbContext context)
        {
            _context = context;
        }

        public async Task<PaymentService.DTOs.WalletDto> GetWalletAsync(string clientId)
        {
            var wallet = await _context.ClientWallets.FirstOrDefaultAsync(w => w.ClientId == clientId);
            if (wallet == null)
            {
                wallet = new ClientWallet { ClientId = clientId };
                _context.ClientWallets.Add(wallet);
                await _context.SaveChangesAsync();
            }

            var txs = await _context.ClientWalletTransactions
                .Where(t => t.WalletId == wallet.Id)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new PaymentService.DTOs.WalletTransactionDto
                {
                    Id = t.Id,
                    Amount = t.Amount,
                    Type = t.Type.ToString(),
                    Description = t.Description,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();

            return new PaymentService.DTOs.WalletDto
            {
                Id = wallet.Id,
                ClientId = wallet.ClientId,
                Balance = wallet.Balance,
                UpdatedAt = wallet.UpdatedAt,
                Transactions = txs
            };
        }

        public async Task<PaymentService.DTOs.WalletDto> DepositToWalletAsync(string clientId, decimal amount)
        {
            var wallet = await _context.ClientWallets.FirstOrDefaultAsync(w => w.ClientId == clientId);
            if (wallet == null)
            {
                wallet = new ClientWallet { ClientId = clientId };
                _context.ClientWallets.Add(wallet);
            }

            wallet.Balance += amount;
            wallet.UpdatedAt = DateTime.UtcNow;

            _context.ClientWalletTransactions.Add(new ClientWalletTransaction
            {
                WalletId = wallet.Id,
                Amount = amount,
                Type = TransactionType.WALLET_DEPOSIT,
                Description = "Funds added via Payment Gateway"
            });

            await _context.SaveChangesAsync();
            return await GetWalletAsync(clientId);
        }

        public async Task<bool> PayAuctionFeesAsync(string clientId, string auctionId, decimal registrationFee, decimal initialPurse)
        {
            var wallet = await _context.ClientWallets.FirstOrDefaultAsync(w => w.ClientId == clientId);
            if (wallet == null)
            {
                wallet = new ClientWallet { ClientId = clientId };
                _context.ClientWallets.Add(wallet);
                // We don't save yet, we'll save at the end
            }

            decimal totalAmount = registrationFee + initialPurse;
            if (wallet.Balance < totalAmount)
            {
                throw new InvalidOperationException("Insufficient wallet balance.");
            }

            // Check if already paid
            var existingPurse = await _context.ClientPurses.FirstOrDefaultAsync(p => p.ClientId == clientId && p.AuctionId == auctionId);
            if (existingPurse != null && existingPurse.Status != PurseStatus.PENDING)
            {
                return true; // Already paid
            }

            wallet.Balance -= totalAmount;
            wallet.UpdatedAt = DateTime.UtcNow;

            if (registrationFee > 0)
            {
                _context.ClientWalletTransactions.Add(new ClientWalletTransaction
                {
                    WalletId = wallet.Id,
                    Amount = -registrationFee,
                    Type = TransactionType.WALLET_WITHDRAWAL,
                    Description = $"Registration Fee for Auction {auctionId}",
                    ReferenceId = auctionId
                });

                // Record in PaymentTransactions for Platform Revenue reporting
                _context.PaymentTransactions.Add(new PaymentTransaction
                {
                    UserId = clientId,
                    AuctionId = auctionId,
                    Amount = registrationFee,
                    Type = TransactionType.REGISTRATION_FEE,
                    Status = TransactionStatus.SUCCESS,
                    GatewayReferenceId = "wallet_" + Guid.NewGuid().ToString().Substring(0, 10)
                });
            }

            string txId = null;
            if (initialPurse > 0)
            {
                _context.ClientWalletTransactions.Add(new ClientWalletTransaction
                {
                    WalletId = wallet.Id,
                    Amount = -initialPurse,
                    Type = TransactionType.WALLET_WITHDRAWAL,
                    Description = $"Purse Deposit for Auction {auctionId}",
                    ReferenceId = auctionId
                });

                var tx = new PaymentTransaction
                {
                    UserId = clientId,
                    AuctionId = auctionId,
                    Amount = initialPurse,
                    Type = TransactionType.PURSE_DEPOSIT,
                    Status = TransactionStatus.SUCCESS,
                    GatewayReferenceId = "wallet_" + Guid.NewGuid().ToString().Substring(0, 10)
                };
                _context.PaymentTransactions.Add(tx);
                txId = tx.Id;
            }

            if (existingPurse == null)
            {
                _context.ClientPurses.Add(new ClientPurse
                {
                    ClientId = clientId,
                    AuctionId = auctionId,
                    TotalDeposit = initialPurse,
                    Status = PurseStatus.HELD,
                    TransactionId = txId
                });
            }
            else
            {
                existingPurse.Status = PurseStatus.HELD;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> HasPaidForAuctionAsync(string clientId, string auctionId)
        {
            var purse = await _context.ClientPurses.FirstOrDefaultAsync(p => p.ClientId == clientId && p.AuctionId == auctionId);
            return purse != null && (purse.Status == PurseStatus.HELD || purse.Status == PurseStatus.RELEASED);
        }

        public async Task<PaymentTransaction> InitiateRegistrationFeeAsync(string clientId, string auctionId, decimal amount)
        {
            var transaction = new PaymentTransaction
            {
                UserId = clientId,
                AuctionId = auctionId,
                Amount = amount,
                Type = TransactionType.REGISTRATION_FEE,
                Status = TransactionStatus.PENDING,
                GatewayReferenceId = "mock_gw_" + Guid.NewGuid().ToString().Substring(0, 10)
            };

            _context.PaymentTransactions.Add(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task<PaymentTransaction> InitiatePurseDepositAsync(string clientId, string auctionId, decimal amount)
        {
            var transaction = new PaymentTransaction
            {
                UserId = clientId,
                AuctionId = auctionId,
                Amount = amount,
                Type = TransactionType.PURSE_DEPOSIT,
                Status = TransactionStatus.PENDING,
                GatewayReferenceId = "mock_gw_" + Guid.NewGuid().ToString().Substring(0, 10)
            };

            _context.PaymentTransactions.Add(transaction);
            
            var purse = new ClientPurse
            {
                ClientId = clientId,
                AuctionId = auctionId,
                TotalDeposit = amount,
                Status = PurseStatus.PENDING,
                TransactionId = transaction.Id
            };
            
            _context.ClientPurses.Add(purse);
            await _context.SaveChangesAsync();
            
            return transaction;
        }

        public async Task<bool> ProcessWebhookAsync(string gatewayReferenceId, string status)
        {
            var transaction = await _context.PaymentTransactions
                .FirstOrDefaultAsync(t => t.GatewayReferenceId == gatewayReferenceId);

            if (transaction == null) return false;

            var newStatus = status.ToUpper() == "SUCCESS" ? TransactionStatus.SUCCESS : TransactionStatus.FAILED;
            transaction.Status = newStatus;
            transaction.UpdatedAt = DateTime.UtcNow;

            if (transaction.Type == TransactionType.PURSE_DEPOSIT && newStatus == TransactionStatus.SUCCESS)
            {
                var purse = await _context.ClientPurses
                    .FirstOrDefaultAsync(p => p.TransactionId == transaction.Id);
                
                if (purse != null)
                {
                    purse.Status = PurseStatus.HELD;
                }
            }

            await _context.SaveChangesAsync();
            
            // In a real system, publish PaymentCompletedEvent via RabbitMQ/Kafka here
            
            return true;
        }

        public async Task<Settlement> SettleAuctionAsync(string auctionId, string managerId, List<ClientSpendDto> clientSpends)
        {
            var config = await _context.PlatformConfigs.FirstOrDefaultAsync() 
                         ?? new PlatformConfig { PlatformCommissionPercentage = 2.0m };
            
            decimal totalWinningAmount = 0;

            foreach (var spend in clientSpends)
            {
                totalWinningAmount += spend.TotalSpent;
                
                var purse = await _context.ClientPurses
                    .FirstOrDefaultAsync(p => p.AuctionId == auctionId && p.ClientId == spend.ClientId && p.Status == PurseStatus.HELD);
                
                if (purse != null)
                {
                    purse.Status = PurseStatus.RELEASED;
                    decimal unusedAmount = purse.TotalDeposit - spend.TotalSpent;
                    
                    if (unusedAmount > 0)
                    {
                        var refundTx = new PaymentTransaction
                        {
                            UserId = spend.ClientId,
                            AuctionId = auctionId,
                            Amount = unusedAmount,
                            Type = TransactionType.PURSE_REFUND,
                            Status = TransactionStatus.SUCCESS,
                            GatewayReferenceId = "wallet_ref_" + Guid.NewGuid().ToString().Substring(0, 10)
                        };
                        _context.PaymentTransactions.Add(refundTx);

                        var wallet = await _context.ClientWallets.FirstOrDefaultAsync(w => w.ClientId == spend.ClientId);
                        if (wallet != null)
                        {
                            wallet.Balance += unusedAmount;
                            wallet.UpdatedAt = DateTime.UtcNow;

                            _context.ClientWalletTransactions.Add(new ClientWalletTransaction
                            {
                                WalletId = wallet.Id,
                                Amount = unusedAmount,
                                Type = TransactionType.WALLET_REFUND,
                                Description = $"Refund of unused purse for Auction {auctionId}",
                                ReferenceId = auctionId
                            });
                        }
                    }
                }
            }

            // Settlement for the manager (Auction Revenue)
            var commissionAmount = totalWinningAmount * (config.PlatformCommissionPercentage / 100);
            var netAmount = totalWinningAmount - commissionAmount;

            var settlement = new Settlement
            {
                ManagerId = managerId,
                AuctionId = auctionId,
                Type = SettlementType.AUCTION_REVENUE,
                GrossAmount = totalWinningAmount,
                PlatformCommissionAmount = commissionAmount,
                NetAmount = netAmount,
                Status = SettlementStatus.CALCULATED
            };

            _context.Settlements.Add(settlement);
            await _context.SaveChangesAsync();

            return settlement;
        }

        public async Task<bool> CancelAuctionAsync(string auctionId)
        {
            var successfulTransactions = await _context.PaymentTransactions
                .Where(t => t.AuctionId == auctionId && t.Status == TransactionStatus.SUCCESS 
                            && (t.Type == TransactionType.REGISTRATION_FEE || t.Type == TransactionType.PURSE_DEPOSIT))
                .ToListAsync();

            foreach (var tx in successfulTransactions)
            {
                var refundTx = new PaymentTransaction
                {
                    UserId = tx.UserId,
                    AuctionId = auctionId,
                    Amount = tx.Amount,
                    Type = TransactionType.PURSE_REFUND, // Overloaded for both types
                    Status = TransactionStatus.SUCCESS, // Mock instant success
                    GatewayReferenceId = "mock_ref_" + Guid.NewGuid().ToString().Substring(0, 10)
                };
                _context.PaymentTransactions.Add(refundTx);
                
                if (tx.Type == TransactionType.PURSE_DEPOSIT)
                {
                    var purse = await _context.ClientPurses.FirstOrDefaultAsync(p => p.TransactionId == tx.Id);
                    if (purse != null)
                    {
                        purse.Status = PurseStatus.REFUNDED;
                    }
                }
            }
            
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
