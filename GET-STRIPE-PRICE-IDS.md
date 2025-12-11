# How to Get Stripe Price IDs

You've provided the **Product IDs** (starting with `prod_`), but we need the **Price IDs** (starting with `price_`).

## Your Products:
- Enterprise Monthly: `prod_THo9fczZrnjDY1`
- Enterprise Yearly: `prod_THoB8LpZC8n4IR`
- Professional Monthly: `prod_THo5r6sik7tni0`
- Professional Yearly: `prod_THo7QwjamsWxbz`
- Starter Monthly: `prod_THo2fEsnH2fQFA`
- Starter Yearly: `prod_THo3E6SH0NDNzU`

## How to Find Price IDs:

### Method 1: Via Stripe Dashboard UI

1. Go to: https://dashboard.stripe.com/test/products
2. Click on **"Starter Monthly"**
3. On the product detail page, scroll down to the **"Pricing"** section
4. You'll see a table with pricing information
5. In that table, look for a column called **"API ID"** or **"Price ID"**
6. Copy the ID that starts with `price_` (e.g., `price_1QKrTdJNxVjDuJxhRtAMo2K7`)
7. Repeat for all 6 products

### Method 2: Use Stripe CLI (if installed)

```bash
# List all prices for Starter Monthly product
stripe prices list --product prod_THo2fEsnH2fQFA

# List all prices for Starter Yearly product
stripe prices list --product prod_THo3E6SH0NDNzU

# List all prices for Professional Monthly product
stripe prices list --product prod_THo5r6sik7tni0

# List all prices for Professional Yearly product
stripe prices list --product prod_THo7QwjamsWxbz

# List all prices for Enterprise Monthly product
stripe prices list --product prod_THo9fczZrnjDY1

# List all prices for Enterprise Yearly product
stripe prices list --product prod_THoB8LpZC8n4IR
```

### Method 3: Via Stripe API (I can do this with your API key)

If you give me permission, I can use your Stripe test API key to fetch the Price IDs automatically.

## What to Share:

Please provide the 6 Price IDs in this format:

```
Starter Monthly: price_XXXXX
Starter Yearly: price_XXXXX
Professional Monthly: price_XXXXX
Professional Yearly: price_XXXXX
Enterprise Monthly: price_XXXXX
Enterprise Yearly: price_XXXXX
```

## Why We Need Price IDs:

- **Product IDs** (`prod_...`) identify the product itself
- **Price IDs** (`price_...`) identify the specific pricing for that product
- When creating a Stripe Checkout Session, we use the **Price ID**, not the Product ID
- Each product can have multiple prices (e.g., different billing intervals, currencies)

Once I have the Price IDs, I'll update the code and you'll be able to test the full credit card payment flow!
