# Deployment Guide - Letters to Likhah

Complete guide for deploying the React + FastAPI stack to a VPS (Ubuntu/Debian).

## Prerequisites

- VPS with Ubuntu 20.04+ or Debian 11+
- Domain name pointed to your VPS IP
- SSH access to your VPS
- Sudo privileges

---

## 1. Initial VPS Setup

### Connect to your VPS
```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

### Update system packages
```bash
sudo apt update && sudo apt upgrade -y
```

### Install required software
```bash
# Install Node.js 18.x (for building React app)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11+
sudo apt install -y python3 python3-pip python3-venv

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Git (if not already installed)
sudo apt install -y git

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

---

## 2. Setup PostgreSQL Database

### Create database and user
```bash
sudo -u postgres psql
```

```sql
-- Inside PostgreSQL shell
CREATE DATABASE blog_db;
CREATE USER blog_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE blog_db TO blog_user;
\q
```

### Allow local connections (if needed)
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```
Add this line if not present:
```
local   all             blog_user                               md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## 3. Deploy the Application

### Create application directory
```bash
sudo mkdir -p /var/www/letterstolikhah
sudo chown $USER:$USER /var/www/letterstolikhah
cd /var/www/letterstolikhah
```

### Clone your repository
```bash
git clone https://github.com/yourusername/letters-to-likhah.git .
# or upload files via SFTP/SCP
```

---

## 4. Backend Setup (FastAPI)

### Create Python virtual environment
```bash
cd /var/www/letterstolikhah/backend
python3 -m venv venv
source venv/bin/activate
```

### Install Python dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Create environment file
```bash
nano .env
```

Add the following:
```env
DATABASE_URL=postgresql+asyncpg://blog_user:your_secure_password_here@localhost:5432/blog_db
SECRET_KEY=your_super_secret_key_change_this_to_random_string
ADMIN_PASSWORD=your_secure_admin_password
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=https://yourdomain.com
GEOIP_API_URL=http://ip-api.com/json
```

**Generate a secure SECRET_KEY**:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Run database migrations
```bash
source venv/bin/activate
alembic upgrade head
```

### Test backend locally
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Press Ctrl+C to stop
```

### Create systemd service for backend
```bash
sudo nano /etc/systemd/system/letterstolikhah-backend.service
```

```ini
[Unit]
Description=Letters to Likhah FastAPI Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/letterstolikhah/backend
Environment="PATH=/var/www/letterstolikhah/backend/venv/bin"
ExecStart=/var/www/letterstolikhah/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Set proper permissions
```bash
sudo chown -R www-data:www-data /var/www/letterstolikhah
sudo chmod -R 755 /var/www/letterstolikhah
```

### Start and enable backend service
```bash
sudo systemctl daemon-reload
sudo systemctl start letterstolikhah-backend
sudo systemctl enable letterstolikhah-backend
sudo systemctl status letterstolikhah-backend
```

---

## 5. Frontend Setup (React + Vite)

### Build the React app
```bash
cd /var/www/letterstolikhah/frontend\(react\)
npm install
```

### Create production environment file
```bash
nano .env.production
```

```env
VITE_API_URL=https://likhah.whisttle.cloud
```

### Build for production
```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

---

## 6. Nginx Configuration

### Create Nginx configuration
```bash
sudo nano /etc/nginx/sites-available/letters-to-likhah
vim /etc/nginx/sites-available/letters-to-likhah
```

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend (React app)
    root /var/www/letterstolikhah/frontend(react)/dist;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to FastAPI backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # FastAPI docs (optional - remove in production for security)
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /redoc {
        proxy_pass http://127.0.0.1:8000/redoc;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security: deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/letters-to-likhah /etc/nginx/sites-enabled/
```

### Test Nginx configuration
```bash
sudo nginx -t
```

### Disable default site (optional)
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

---

## 7. SSL Certificate (Let's Encrypt)

### Obtain SSL certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d letterstolikhah.com -d www.letterstolikhah.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### Auto-renewal test
```bash
sudo certbot renew --dry-run
```

Certbot will automatically renew certificates before expiration.

---

## 8. Firewall Configuration

### Setup UFW firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 9. Verify Deployment

### Check backend service
```bash
sudo systemctl status letterstolikhah-backend
sudo journalctl -u letterstolikhah-backend -f  # View logs
```

### Check Nginx
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Test your site
- Visit `https://yourdomain.com`
- Try logging into admin at `https://yourdomain.com/admin/login`
- Check API at `https://yourdomain.com/docs` (if enabled)

---

## 10. Deployment Updates

### Script for updating the app
Create an update script:

```bash
nano /var/www/letterstolikhah/update.sh
```

```bash
#!/bin/bash
set -e

echo "🔄 Updating Letters to Likhah..."

# Pull latest code
cd /var/www/letterstolikhah
git pull origin main

# Update backend
echo "📦 Updating backend..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl restart letterstolikhah-backend

# Update frontend
echo "🎨 Building frontend..."
cd ../frontend\(react\)
npm install
npm run build

echo "✅ Deployment complete!"
echo "🔍 Checking backend status..."
sudo systemctl status letterstolikhah-backend --no-pager
```

Make it executable:
```bash
chmod +x /var/www/letterstolikhah/update.sh
```

To update:
```bash
cd /var/www/letterstolikhah
./update.sh
```

---

## 11. Monitoring & Maintenance

### View backend logs
```bash
sudo journalctl -u letterstolikhah-backend -f
```

### View Nginx access logs
```bash
sudo tail -f /var/log/nginx/access.log
```

### View Nginx error logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Database backup script
```bash
nano /var/www/letterstolikhah/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/letterstolikhah"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

sudo -u postgres pg_dump blog_db > $BACKUP_DIR/blog_db_$DATE.sql
gzip $BACKUP_DIR/blog_db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "✅ Database backed up to $BACKUP_DIR/blog_db_$DATE.sql.gz"
```

```bash
chmod +x /var/www/letterstolikhah/backup-db.sh
```

Add to crontab for daily backups:
```bash
sudo crontab -e
```

Add:
```
0 2 * * * /var/www/letterstolikhah/backup-db.sh >> /var/log/db-backup.log 2>&1
```

---

## 12. Performance Optimization (Optional)

### Enable Nginx caching
```bash
sudo nano /etc/nginx/nginx.conf
```

Add inside `http` block:
```nginx
# Cache configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m use_temp_path=off;
```

### Increase worker connections
In `/etc/nginx/nginx.conf`:
```nginx
events {
    worker_connections 2048;
}
```

### PM2 for backend (alternative to systemd)
If you prefer PM2:
```bash
sudo npm install -g pm2
cd /var/www/letterstolikhah/backend
source venv/bin/activate

pm2 start "uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4" --name letterstolikhah-backend
pm2 save
pm2 startup
```

---

## Troubleshooting

### Backend won't start
```bash
sudo journalctl -u letterstolikhah-backend -n 50
# Check database connection in .env
# Verify PostgreSQL is running: sudo systemctl status postgresql
```

### 502 Bad Gateway
```bash
# Check if backend is running
sudo systemctl status letterstolikhah-backend
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Database connection errors
```bash
# Test connection
sudo -u postgres psql -d blog_db -U blog_user
# Verify DATABASE_URL in .env
# Check PostgreSQL logs: sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### Frontend shows blank page
```bash
# Rebuild frontend
cd /var/www/letterstolikhah/frontend\(react\)
npm run build
# Check browser console for errors
# Verify VITE_API_URL in .env.production
```

---

## Security Checklist

- [ ] Strong passwords for database and admin
- [ ] SSL certificate installed and auto-renewal working
- [ ] Firewall configured (UFW)
- [ ] Disable `/docs` and `/redoc` in production Nginx config
- [ ] Regular database backups
- [ ] Keep system packages updated
- [ ] Monitor logs for suspicious activity
- [ ] Use environment variables for secrets (never commit `.env`)
- [ ] Restrict PostgreSQL to local connections only
- [ ] Set up fail2ban for SSH protection

---

## Quick Reference

| Service | Command |
|---------|---------|
| Start Backend | `sudo systemctl start letterstolikhah-backend` |
| Stop Backend | `sudo systemctl stop letterstolikhah-backend` |
| Restart Backend | `sudo systemctl restart letterstolikhah-backend` |
| Backend Logs | `sudo journalctl -u letterstolikhah-backend -f` |
| Restart Nginx | `sudo systemctl restart nginx` |
| Nginx Logs | `sudo tail -f /var/log/nginx/error.log` |
| Database Shell | `sudo -u postgres psql -d blog_db` |
| Update App | `cd /var/www/letterstolikhah && ./update.sh` |
| SSL Renewal | `sudo certbot renew` |

---

**🎉 Your app should now be live at `https://yourdomain.com`!**
