# SubSave - Subscription Management App

## Problem
- Subscriptions are a cash sink: you pay every month, nothing comes back.
- Traditionally prepaying for subscriptions is inconvenient - merchants rarely offer it, and it locks you in.
- Subscription tracker apps only monitor charges; they don’t reduce them.
- Cancelling means chasing down each merchant individually.
- Card overcharges or failed payments can disrupt services unexpectedly.

## What it does
- You prepay for your monthly subscriptions for a year, and Subsave puts that money into a DeFi yield vault.
- The vault generates yield, effectively making subscriptions cheaper over time.
- You get the flexibility of monthly cancelation, even while committing funds up front.
- This means you spend less than a yearly subscription without being locked in.
- All blockchain complexity is abstracted away - users just see a simple dashboard and lower costs.

## How we built it
- Frontend: Built with Expo + React Native Paper for a clean, mobile-first experience. The dashboard, vault detail, and notifications screens give users full visibility into balances and charges.
- Authentication: Auth0 handles secure login and user identity management.
- Database: MongoDB Atlas stores user profiles, subscription vaults, and payment history.
- Blockchain under the hood: Subsave is designed to connect to DeFi vaults through Squads Grid SDK, which handles programmable accounts, spending caps, and automated payments.
- AI: Google Gemini API is used to fetch subscription info for any service, recommend the best tier/plan, and optimize the prepay horizon.
- Abstraction layer: All blockchain interactions are wrapped in simple service calls, so users only see their savings grow while the complexity stays hidden.

## Challenges we ran into
- Bridging TradFi and DeFi: Designing a system that feels like a regular finance app while actually running on blockchain rails was tricky. We had to abstract away the crypto concepts without losing their benefits.
- Yield Simulation: In a hackathon setting, we simulated yield accrual to show savings over time, while keeping the path open for connecting to real protocols later.
- Cancelation Flexibility: Giving users the ability to prepay yet still cancel monthly meant carefully modeling vault withdrawals and policy logic.
- User Trust: Subscriptions touch sensitive financial data. Designing flows that feel transparent and secure was critical.

## Accomplishments that we're proud of
- Built a working mobile dashboard where users can add subscriptions, see balances, and track upcoming charges.
- Designed a vault system that bridges prepaid funds with yield-generating accounts.
- Created a flow where subscriptions are effectively cheaper without requiring merchants to change anything.
- Made blockchain infrastructure invisible to the user, keeping the UX simple and approachable.

## What we learned
- Users don’t care about the rails, they care about cheaper subscriptions and flexibility. Abstracting away DeFi concepts is the key to mainstream adoption.
- Even small amounts of yield can create meaningful savings when paired with recurring payments.
- Designing around trust and transparency is as important as the financial mechanics. Clear dashboards and notifications matter.
- Hackathon speed forces clarity, we had to focus on the core loop: deposit -> yield -> automatic payments -> cancel anytime.

## What's next for Subsave
- Real DeFi integration: Plug into actual yield-generating protocols and stablecoin vaults.
- Full Grid SDK support: Automated spending limits, programmable vaults, and virtual accounts.
- Group vaults: Let families, roommates, or teams pool money for shared subscriptions.
- AI insights: Smart nudges that recommend when to cancel unused subscriptions or prepay for better savings.
- Beyond subscriptions: Extend the model to utilities, insurance, and memberships - any recurring expense.
