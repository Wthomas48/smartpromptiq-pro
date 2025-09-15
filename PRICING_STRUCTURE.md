# SmartPromptIQ - New Stripe Pricing Structure

## 🚀 Token-Based Pricing System

### **Free Tier**
- **Price**: $0/month
- **Tokens**: 10 per month
- **Features**:
  - Basic prompt generation
  - 3 categories access
  - Community templates
  - Basic analytics
- **Target**: Trial users, students

### **Starter Plan**
- **Price**: $9.99/month or $99/year (2 months free)
- **Tokens**: 100 per month
- **Features**:
  - All Free features
  - 10+ prompt categories
  - Basic customization
  - Email support
  - Export prompts
- **Target**: Individual users, freelancers

### **Professional Plan** ⭐ *Most Popular*
- **Price**: $24.99/month or $249/year (2 months free)
- **Tokens**: 500 per month
- **Features**:
  - All Starter features
  - Advanced AI models (GPT-4, Claude)
  - Team collaboration (up to 5 members)
  - Custom templates
  - Priority support
  - Advanced analytics
  - API access
- **Target**: Small teams, agencies

### **Business Plan**
- **Price**: $49.99/month or $499/year (2 months free)
- **Tokens**: 1,500 per month
- **Features**:
  - All Professional features
  - Team collaboration (up to 20 members)
  - White-label options
  - Custom integrations
  - Dedicated account manager
  - Advanced security
  - Custom onboarding
- **Target**: Medium businesses, agencies

### **Enterprise Plan**
- **Price**: $99.99/month or $999/year (2 months free)
- **Tokens**: 5,000 per month
- **Features**:
  - All Business features
  - Unlimited team members
  - On-premise deployment option
  - Custom AI model training
  - 24/7 phone support
  - Custom SLA
  - Advanced compliance
- **Target**: Large enterprises

## 💰 Token Packages (One-time purchases)

### **Token Boost Packages**
- **Small Boost**: 50 tokens - $4.99
- **Medium Boost**: 150 tokens - $12.99 (13% savings)
- **Large Boost**: 350 tokens - $24.99 (29% savings)
- **Mega Boost**: 1000 tokens - $59.99 (40% savings)

*Note: Purchased tokens expire after 90 days*

## 🎯 Token Usage Model

### **Simple Prompts** (1 token)
- Basic templates
- Simple category prompts
- Quick generations

### **Standard Prompts** (2 tokens)
- Custom questionnaire responses
- Enhanced prompts
- Multiple variations

### **Complex Prompts** (3 tokens)
- Advanced AI models (GPT-4)
- Long-form content
- Multiple iterations

### **Premium Features** (5 tokens)
- Custom AI model requests
- Advanced analytics reports
- Priority processing

## 🔄 Subscription Benefits

### **Monthly Rollover**
- Professional+: Up to 100 tokens rollover
- Business+: Up to 300 tokens rollover
- Enterprise: Up to 500 tokens rollover

### **Annual Discount**
- All plans: 2 months free (16.7% discount)
- Early bird special: Additional 20% off first year

## 📊 Stripe Product Configuration

### **Subscription Products**
```
starter_monthly: price_starter_monthly ($9.99)
starter_yearly: price_starter_yearly ($99.00)
professional_monthly: price_pro_monthly ($24.99)
professional_yearly: price_pro_yearly ($249.00)
business_monthly: price_business_monthly ($49.99)
business_yearly: price_business_yearly ($499.00)
enterprise_monthly: price_enterprise_monthly ($99.99)
enterprise_yearly: price_enterprise_yearly ($999.00)
```

### **One-time Products**
```
token_boost_small: price_token_small ($4.99)
token_boost_medium: price_token_medium ($12.99)
token_boost_large: price_token_large ($24.99)
token_boost_mega: price_token_mega ($59.99)
```

## 🎨 Features to Implement

### **Frontend Components**
1. Modern pricing page with toggle (monthly/yearly)
2. Token usage dashboard
3. Billing management page
4. Subscription upgrade/downgrade flow
5. Token purchase modal

### **Backend Features**
1. Stripe webhook handlers
2. Token management system
3. Usage tracking and limits
4. Billing history
5. Invoice generation

### **Database Updates**
- User subscription tracking
- Token transaction logs
- Usage analytics
- Billing history

## 🛠 Implementation Priority

1. **Phase 1**: Basic subscription tiers (Free → Professional)
2. **Phase 2**: Token purchase system
3. **Phase 3**: Advanced features (team collaboration, analytics)
4. **Phase 4**: Enterprise features and white-label

## 💡 Marketing Strategy

### **Free Trial**
- 7-day Professional trial (200 tokens)
- Convert to paid after trial

### **Pricing Psychology**
- Professional plan highlighted as "Most Popular"
- Clear value progression
- Annual discount incentive

### **Competitive Positioning**
- 30% cheaper than major competitors
- Token-based for fair usage
- No hidden fees or limits