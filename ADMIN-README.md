# Admin System - Quick Reference

## 🔐 Login Credentials

### Local
```
http://localhost:5176/admin/login
admin@admin.com / Admin123!
```

### Production
```
https://smartpromptiq.com/admin/login
admin@smartpromptiq.net / Admin123!
```

---

## 📋 NPM Commands

```bash
# LOCAL
npm run admin:create      # Create/update local admin
npm run admin:verify      # Verify admin exists
npm run admin:check       # Check database

# PRODUCTION
npm run admin:create:prod # Create/update production admin
npm run railway:admin     # Deploy admin to Railway

# DATABASE
npm run db:seed          # Seed database (includes admin)
```

---

## 📚 Documentation

- **[ADMIN-SETUP-COMPLETE.md](ADMIN-SETUP-COMPLETE.md)** - Complete summary
- **[ADMIN-PERMANENT-SETUP.md](ADMIN-PERMANENT-SETUP.md)** - Deployment guide
- **[ADMIN-LOGIN-FIX.md](ADMIN-LOGIN-FIX.md)** - Troubleshooting
- **[ADMIN-QUICK-START.md](ADMIN-QUICK-START.md)** - Quick start

---

## ✅ Status

- ✅ Local admin created
- ✅ Production scripts ready
- ✅ Database seed configured
- ✅ NPM scripts added
- ✅ Documentation complete

**Ready to use!** Try logging in now.
