# Admin Panel - Quick Start Guide

## ✅ ADMIN LOGIN IS NOW FIXED!

### Login Credentials
```
Email:    admin@admin.com
Password: Admin123!
URL:      http://localhost:5176/admin/login
```

*(Port may be 5173, 5174, 5175, or 5176 depending on which ports are available)*

---

## How to Login

1. **Open your browser** to: http://localhost:5176/admin/login
2. **Enter credentials**:
   - Email: `admin@admin.com`
   - Password: `Admin123!`
3. **Click "Access Admin Panel"**
4. **You should be redirected** to the admin dashboard at `/admin`

---

## What You Can Do in Admin Panel

### 📊 Dashboard
- View user statistics
- Monitor revenue
- System health metrics
- Recent activity

### 👥 Users
- View all registered users
- Edit user information
- Manage subscriptions
- Suspend/activate accounts

### 💳 Payments
- View all transactions
- Process refunds
- Manage subscriptions
- Payment history

### 🎯 Tokens
- Add/remove tokens from users
- View token transaction history
- Manage token balances

### 🔒 Security
- View login attempts
- Manage sessions
- Security alerts
- Activity monitoring

### 📧 Emails
- Send bulk emails
- Manage templates
- Email campaigns
- Track delivery

### 📈 Analytics
- Usage statistics
- Revenue analytics
- User growth charts
- System metrics

---

## Troubleshooting

### Can't login?

**Try this**:
```bash
# Re-create admin user
node create-admin-sqlite.cjs
```

### Wrong port?

Check your dev server output - look for:
```
Local: http://localhost:5176/
```

### Still not working?

Check the detailed guide: [ADMIN-LOGIN-FIX.md](ADMIN-LOGIN-FIX.md)

---

## Admin User Details

The admin account has been created with:
- **Full access** to all admin features
- **Enterprise plan** privileges
- **99,999 tokens** available
- **Unlimited generations**
- **Role**: ADMIN

---

## Important Notes

1. **Live Data**: The admin panel now shows REAL data from the database, not mock data
2. **Security**: All admin routes are protected - only ADMIN role can access
3. **Database**: Using SQLite database at `backend/prisma/dev.db`
4. **Password**: Securely hashed with bcrypt (10 rounds)

---

## Need Help?

- **Full documentation**: [ADMIN-LOGIN-FIX.md](ADMIN-LOGIN-FIX.md)
- **Email setup**: [EMAIL-QUICK-START.md](EMAIL-QUICK-START.md)
- **Database check**: Run `node check-db.cjs`

---

**Status**: ✅ Ready to use!
**Last updated**: 2025-01-24
