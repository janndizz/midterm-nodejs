# Midterm NodeJS Blog Project

## Mô tả

Đây là dự án MVP Blog gồm backend NodeJS, frontend ReactJS, sử dụng MongoDB, Redis, Nginx reverse proxy và worker xử lý file media.

## Cấu trúc thư mục

```
backend/
frontend/
nginx.conf    # Nginx cấu hình cho local
nginx-swarm.conf # Nginx cấu hình cho Docker Swarm
docker-compose.yml
docker-stack.yml
```

## Yêu cầu

- Docker & Docker Compose
- Node.js >= 18
- MongoDB

## Cài đặt dependencies

```sh
cd backend
npm install

cd ../frontend
npm install
```

## Chạy hệ thống bằng Docker Compose

```sh
docker-compose up --build
```

- Truy cập frontend tại: http://localhost:3000
- Backend API: http://localhost:5000/api
- Nginx proxy: http://localhost

## Chạy hệ thống bằng Docker Swarm

```sh
docker swarm init
docker stack deploy -c docker-stack.yml blog-app
```

- Để seed dự liệu mẫu: `docker exec -it $(docker ps -q -f name=blog-app_backend | Select-Object -First 1) npm run seed`

- Để xóa stack: `docker stack rm blog-app`

## Chạy hệ thống bằng npm (local)

### Backend

```sh
cd backend
npm install
npm start
# Nếu muốn seed dữ liệu mẫu:
npm run seed
```

### Frontend

```sh
cd frontend
npm install
npm start
```

## Cấu hình môi trường

### Backend

Tạo file `.env` trong thư mục `backend`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/blogdb
JWT_SECRET=your_secret_key
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Các file cấu hình

- `docker-compose.yml`: Chạy nhiều container backend, frontend, nginx, mongo, redis
- `docker-stack.yml`: Dùng cho Docker Swarm cluster
- `nginx.conf`, `nginx-swarm.conf`: Cấu hình Nginx proxy

## Ghi chú

- Nếu gặp lỗi về quyền thư mục khi chạy Docker, hãy đảm bảo các volume được mount đúng.