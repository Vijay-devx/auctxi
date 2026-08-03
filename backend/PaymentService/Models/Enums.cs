namespace PaymentService.Models
{
    public enum TransactionType
    {
        REGISTRATION_FEE,
        PURSE_DEPOSIT,
        PURSE_REFUND,
        WALLET_DEPOSIT,
        WALLET_WITHDRAWAL,
        WALLET_REFUND
    }

    public enum TransactionStatus
    {
        PENDING,
        SUCCESS,
        FAILED,
        REFUNDED,
        REFUND_FAILED
    }

    public enum PurseStatus
    {
        PENDING,
        HELD,
        RELEASED,
        REFUNDED
    }

    public enum SettlementType
    {
        REGISTRATION_REVENUE,
        AUCTION_REVENUE
    }

    public enum SettlementStatus
    {
        PENDING,
        CALCULATED,
        PAID_OUT,
        FAILED
    }
}
