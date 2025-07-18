# 🔐 Stripe Security Setup Guide

## 🔑 Key Types & Where They Go

### 1. **Frontend (.env.local)** - Safe to expose
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
VITE_STRIPE_PREMIUM_PRICE_ID=price_...
```

### 2. **Backend (Supabase Secrets)** - NEVER expose
```
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
# OR (preferred)
STRIPE_RESTRICTED_KEY=rk_test_... or rk_live_...
```

### 3. **Webhook Secret (Supabase Secrets)**
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🛡️ Recommended: Use Restricted Key

### Create Restricted Key in Stripe Dashboard:
1. Go to Stripe Dashboard → Developers → API Keys
2. Click "Create restricted key"
3. **Required Permissions:**
   - ✅ Checkout Sessions: `write`
   - ✅ Customer Portal: `write`
   - ✅ Customers: `write`
   - ✅ Subscriptions: `read` + `write`
   - ✅ Payment Intents: `read`
   - ✅ Invoices: `read`
   - ✅ Webhook Endpoints: `read`

## 📍 Where Each Key Goes:

### **Frontend (.env.local)**
- ✅ `pk_test_...` (Publishable Key)
- ✅ `price_...` (Price ID)
- ❌ NEVER put secret keys here

### **Supabase Secrets** (for N8N)
- ✅ `sk_test_...` or `rk_test_...` (Secret/Restricted Key)
- ✅ `whsec_...` (Webhook Secret)
- ✅ Any other sensitive data

### **N8N Workflow**
- Gets secret keys from Supabase
- Creates checkout sessions
- Handles webhook events
- Updates user data

## 🚀 Setup Steps:

1. **Get Publishable Key**: Add to `.env.local`
2. **Create Restricted Key**: Store in Supabase secrets
3. **Set up N8N**: Use restricted key for Stripe API calls
4. **Configure Webhook**: Use webhook secret to verify events
5. **Test**: Try checkout flow

## 🔒 Security Best Practices:

- ✅ **Publishable keys** in frontend
- ✅ **Secret keys** only in backend/Supabase
- ✅ **Restricted keys** over full secret keys
- ✅ **Webhook signature verification**
- ❌ **Never commit secret keys to git**
- ❌ **Never put secret keys in frontend code**