# Creating an Auction (Managers Only)

As a Manager, you are responsible for setting up and running sports auctions.

## Setup Process
1. **Details**: Provide a name and schedule a start date (scheduledStartTime). There is no description or sport type field required.
2. **Rules**: Select an Admin-approved Rule Template. This dictates the purse limits for the teams in your auction.
3. **Teams**: Add the teams that will participate in your auction. Each team needs an owner (a registered Client) and will be assigned the starting budget defined by the rules.
4. **Players**: Upload or manually add the pool of players available for bidding. Set their base prices.

## Live Auction
- Once scheduled, the auction will enter the `LIVE` state automatically when the start time is reached.
- Managers can pause or resume the auction.
- Bidding is handled via WebSockets for real-time latency.
