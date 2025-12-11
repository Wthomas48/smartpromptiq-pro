# Railway Environment Variables for Stripe

Copy these environment variables to your Railway service settings.

## Stripe API Keys

```
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

## Stripe Price IDs (Current Test Mode)

These are your current TEST mode price IDs. Replace with LIVE mode IDs for production.

### Subscription Plans

| Plan | Monthly Price ID | Yearly Price ID |
|------|------------------|-----------------|
| Academy Only | `price_1SUCmKKtG2uGDhSNGAFa0mHD` | `price_1SUCjTKtG2uGDhSNRWFbe07R` |
| Pro | `price_1SU8gOKtG2uGDhSN8mVgkD1E` | `price_1SU8luKtG2uGDhSNZPP8UFR3` |
| Team Pro | `price_1SU8tRKtG2uGDhSNWiMGSxlN` | `price_1SU8qRKtG2uGDhSNi8k6uB9z` |
| Enterprise | `price_1SU8vXKtG2uGDhSN2e92rn5J` | `price_1SU8yGKtG2uGDhSN28rCp3Ta` |

### Environment Variables Format

```bash
# Academy Only Subscription
STRIPE_PRICE_ACADEMY_MONTHLY=price_1SUCmKKtG2uGDhSNGAFa0mHD
STRIPE_PRICE_ACADEMY_YEARLY=price_1SUCjTKtG2uGDhSNRWFbe07R

# Pro Plan (Full Platform)
STRIPE_PRICE_PRO_MONTHLY=price_1SU8gOKtG2uGDhSN8mVgkD1E
STRIPE_PRICE_PRO_YEARLY=price_1SU8luKtG2uGDhSNZPP8UFR3

# Team Pro Plan
STRIPE_PRICE_TEAM_PRO_MONTHLY=price_1SU8tRKtG2uGDhSNWiMGSxlN
STRIPE_PRICE_TEAM_PRO_YEARLY=price_1SU8qRKtG2uGDhSNi8k6uB9z

# Enterprise Plan
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_1SU8vXKtG2uGDhSN2e92rn5J
STRIPE_PRICE_ENTERPRISE_YEARLY=price_1SU8yGKtG2uGDhSN28rCp3Ta

# Business Plan (Optional/Legacy)
STRIPE_PRICE_BUSINESS_MONTHLY=price_business_monthly_REPLACE_ME
STRIPE_PRICE_BUSINESS_YEARLY=price_business_yearly_REPLACE_ME

# Token Packages (Create in Stripe Dashboard)
STRIPE_PRICE_TOKENS_25=price_tokens_25_REPLACE_ME
STRIPE_PRICE_TOKENS_100=price_tokens_100_REPLACE_ME
STRIPE_PRICE_TOKENS_500=price_tokens_500_REPLACE_ME
STRIPE_PRICE_TOKENS_1000=price_tokens_1000_REPLACE_ME
```

## Pricing Structure Summary

| Plan | Monthly | Yearly | Monthly Equiv | Savings |
|------|---------|--------|---------------|---------|
| Free | $0 | $0 | $0 | - |
| Academy Only | $29/mo | $240/yr | $20/mo | $108/yr |
| Pro | $49/mo | $408/yr | $34/mo | $180/yr |
| Team Pro | $99/mo | $828/yr | $69/mo | $360/yr |
| Enterprise | $299/mo | $2,999/yr | $250/mo | $589/yr |

## Token Packages

| Package | Tokens | Price | Per Token | Savings |
|---------|--------|-------|-----------|---------|
| Small | 25 | $4.99 | $0.20 | - |
| Medium | 100 | $17.99 | $0.18 | 10% |
| Large | 500 | $79.99 | $0.16 | 20% |
| Bulk | 1,000 | $149.99 | $0.15 | 25% |

## Steps to Setup Live Payments

1. **Switch to Live Mode in Stripe Dashboard**
   - Go to https://dashboard.stripe.com
   - Toggle from "Test" to "Live" mode

2. **Create Products and Prices**
   - Create each subscription product (Academy, Pro, Team Pro, Enterprise)
   - Add monthly and yearly prices for each
   - Note down all Price IDs (start with `price_`)

3. **Update Railway Variables**
   - Go to Railway Dashboard > Your Project > Variables
   - Add all `STRIPE_PRICE_*` environment variables
   - Add your live `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`

4. **Setup Webhook**
   - In Stripe Dashboard: Developers > Webhooks
   - Add endpoint: `https://YOUR_RAILWAY_URL/api/billing/webhook`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `payment_intent.succeeded`
   - Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

5. **Test Payment Flow**
   - Use Stripe test cards first
   - Then enable live mode and test with real card

## Webhook Events to Handle

The billing routes handle these Stripe webhook events:
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Plan changes
- `customer.subscription.deleted` - Cancellations
- `payment_intent.succeeded` - Token purchases

## Important Notes

- Price IDs are environment-specific (test vs live)
- Never commit live API keys to git
- Webhook secrets are unique per endpoint
- Test thoroughly before going live
