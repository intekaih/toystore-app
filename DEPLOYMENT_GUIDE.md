# ToyStore Deployment Guide

Hướng dẫn deploy dự án ToyStore lên VPS Ubuntu với Docker và Nginx.

## Thông tin VPS
- **IP**: 3.25.211.233
- **Domain**: toystore.intekaih.id.vn
- **OS**: Ubuntu (latest)

## Yêu cầu hệ thống
- Ubuntu 20.04 LTS hoặc mới hơn
- RAM: Tối thiểu 2GB (khuyến nghị 4GB)
- Disk: Tối thiểu 20GB
- CPU: 2 cores

## Bước 1: Cấu hình DNS

Truy cập vào quản lý DNS của domain và thêm bản ghi:

```
Type: A
Name: toystore (hoặc @)
Value: 3.25.211.233
TTL: Auto
```

## Bước 2: Kết nối VPS

```bash
ssh ubuntu@3.25.211.233
# hoặc nếu dùng user khác
ssh your_username@3.25.211.233
```

## Bước 3: Cài đặt môi trường

Copy file setup script lên VPS và chạy:

```bash
# Tạo thư mục tạm
mkdir -p ~/setup
cd ~/setup

# Download setup script (hoặc copy thủ công)
# Sau đó chạy:
chmod +x setup-vps.sh
./setup-vps.sh
```

**Sau khi chạy xong, logout và login lại để apply docker group:**

```bash
exit
ssh ubuntu@3.25.211.233
```

## Bước 4: Clone repository

```bash
# Clone dự án
cd /var/www/toystore
git clone https://github.com/intekaih/toystore-app.git .

# Hoặc nếu đã có folder
cd /var/www
sudo rm -rf toystore
sudo mkdir toystore
sudo chown -R $USER:$USER toystore
cd toystore
git clone https://github.com/intekaih/toystore-app.git .
```

## Bước 5: Cấu hình environment variables

```bash
cd /var/www/toystore

# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa file .env
nano .env
```

**Cấu hình quan trọng trong .env:**

```env
# Database Configuration
DB_HOST=sqlserver
DB_USER=sa
DB_PASSWORD=MạtKhẩuMạnh@123  # ĐỔI MẬT KHẨU NÀY!
DB_NAME=toystore
DB_PORT=1433

# JWT Configuration
JWT_SECRET=your_random_jwt_secret_key_change_this  # ĐỔI KEY NÀY!

# Server Configuration
PORT=5000
NODE_ENV=production
```

## Bước 6: Cấu hình Nginx Reverse Proxy

```bash
# Copy nginx config
sudo cp deploy/nginx-site.conf /etc/nginx/sites-available/toystore

# Enable site
sudo ln -s /etc/nginx/sites-available/toystore /etc/nginx/sites-enabled/

# Remove default site (nếu cần)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## Bước 7: Build và chạy Docker containers

```bash
cd /var/www/toystore

# Build và start containers
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Kiểm tra status
docker-compose ps
```

## Bước 8: Import database

```bash
# Copy file SQL vào container
docker cp db/toystore.sql toystore_sqlserver:/tmp/

# Chạy SQL script
docker exec -it toystore_sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Password123' \
  -Q "CREATE DATABASE toystore"

docker exec -it toystore_sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Password123' \
  -d toystore -i /tmp/toystore.sql
```

## Bước 9: Cài đặt SSL Certificate (HTTPS)

```bash
# Cài đặt SSL certificate với Let's Encrypt
sudo certbot --nginx -d toystore.intekaih.id.vn

# Chọn option để redirect HTTP -> HTTPS
```

## Bước 10: Kiểm tra và test

Truy cập: http://toystore.intekaih.id.vn hoặc https://toystore.intekaih.id.vn

```bash
# Kiểm tra logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs sqlserver

# Kiểm tra resource usage
docker stats
```

## Cập nhật code (Re-deploy)

Khi có thay đổi code:

```bash
cd /var/www/toystore

# Option 1: Dùng deploy script
chmod +x deploy/deploy.sh
./deploy/deploy.sh

# Option 2: Manual
git pull origin main
docker-compose down
docker-compose up -d --build
```

## Các lệnh Docker hữu ích

```bash
# Xem logs
docker-compose logs -f [service_name]

# Restart service
docker-compose restart [service_name]

# Stop tất cả
docker-compose down

# Start tất cả
docker-compose up -d

# Rebuild
docker-compose up -d --build

# Xóa volumes (CẢNH BÁO: mất data)
docker-compose down -v

# Vào container shell
docker exec -it toystore_backend sh
docker exec -it toystore_frontend sh
docker exec -it toystore_sqlserver bash

# Xem resource usage
docker stats
```

## Monitoring và Maintenance

### Backup Database

```bash
# Backup
docker exec toystore_sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Password123' \
  -Q "BACKUP DATABASE toystore TO DISK = N'/var/opt/mssql/backup/toystore_backup.bak'"

# Copy backup ra host
docker cp toystore_sqlserver:/var/opt/mssql/backup/toystore_backup.bak ~/backup/
```

### Xem logs Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/toystore_access.log

# Error logs
sudo tail -f /var/log/nginx/toystore_error.log
```

### Auto-restart containers

Docker containers đã được cấu hình `restart: unless-stopped`, tự động restart khi server reboot.

## Troubleshooting

### 1. Container không start được

```bash
docker-compose logs [service_name]
```

### 2. Database connection failed

- Kiểm tra DB_PASSWORD trong .env
- Kiểm tra SQL Server container đã chạy chưa: `docker-compose ps`
- Xem logs: `docker-compose logs sqlserver`

### 3. Frontend không kết nối được Backend

- Kiểm tra API URL trong frontend code
- Kiểm tra Nginx config
- Test backend trực tiếp: `curl http://localhost:5000/api/health`

### 4. Nginx 502 Bad Gateway

- Kiểm tra backend container: `docker-compose ps`
- Kiểm tra nginx config: `sudo nginx -t`
- Restart nginx: `sudo systemctl restart nginx`

### 5. Port đã được sử dụng

```bash
# Kiểm tra port đang dùng
sudo lsof -i :5000
sudo lsof -i :3000

# Kill process nếu cần
sudo kill -9 [PID]
```

## Security Checklist

- [ ] Đổi DB_PASSWORD mạnh
- [ ] Đổi JWT_SECRET ngẫu nhiên
- [ ] Enable firewall (UFW)
- [ ] Cài đặt SSL certificate
- [ ] Cấu hình fail2ban (optional)
- [ ] Regular backup database
- [ ] Update system: `sudo apt update && sudo apt upgrade`

## Performance Optimization

1. **Enable Gzip** trong Nginx (đã cấu hình)
2. **Cache static files** (đã cấu hình)
3. **Scale containers** nếu cần:
   ```bash
   docker-compose up -d --scale backend=2
   ```
4. **Monitor resources**: `docker stats`

## Support

- GitHub: https://github.com/intekaih/toystore-app
- Issues: https://github.com/intekaih/toystore-app/issues
