# Warehouse Management System (WMS)

Hệ thống Quản lý Kho (Warehouse Management System) là một ứng dụng full-stack được thiết kế để theo dõi, quản lý và vận hành các quy trình trong kho hàng. Dự án hỗ trợ quản lý chi nhánh, quản lý vai trò và phân quyền sử dụng (RBAC), cũng như giám sát chặt chẽ luồng hàng hóa (Nhập/Xuất/Tồn kho/Lô hàng) và hoạt động kinh doanh (Hóa đơn bán hàng).

## 🌟 Chức năng chính (Features)

- **🔐 Quản lý Người dùng & Phân quyền (RBAC)**: Hỗ trợ tạo các vai trò (Roles) và cấp quyền (Permissions) một cách chi tiết để đảm bảo bảo mật và kiểm soát truy cập từ Super Admin đến Nhân viên kho.
- **🏢 Quản lý Chi nhánh & Kho hàng**: Phân tách dữ liệu hàng hoá, tồn kho, thành viên theo từng chi nhánh cụ thể. Mọi nghiệp vụ đều gắn liền với phạm vi quyền hạn theo chi nhánh người dùng đang làm việc.
- **📦 Quản lý Sản phẩm & Lô hàng (Batches)**: Cho phép tạo, sửa, xóa thông tin sản phẩm và theo dõi hạn sử dụng theo từng lô hàng.
- **🔄 Nhập/Xuất kho (Inventory Transactions)**: Tạo phiếu nhập, phiếu xuất và tự động cập nhật số lượng tồn kho theo thời gian thực.
- **🛒 Quản lý Bán hàng (Sales Invoices)**: Tạo hóa đơn bán ra (Sales Invoice), quản lý khách hàng và nhà cung cấp.
- **📊 Dashboard & Báo cáo**: Tổng quan số liệu kho, doanh thu, biến động kho, những mặt hàng sắp hết hạn/hết số lượng trong kho.

## 💻 Công nghệ sử dụng (Tech Stack)

### **Frontend (Giao diện người dùng)**
- **Framework**: [ReactJS](https://react.dev/) (phiên bản ^19) qua [Vite](https://vitejs.dev/)
- **UI Library**: [Ant Design](https://ant.design/) (^6.2)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/), Redux Saga, [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Data Fetching / Caching**: [TanStack React Query](https://tanstack.com/query/latest) & Axios
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Charts**: [Recharts](https://recharts.org/)

### **Backend (Máy chủ & CSDL)**
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- **Authentication & Security**: JWT (JSON Web Tokens), Bcrypt, Helmet, xss-clean, rate-limiter, cors
- **Validation**: [Joi](https://joi.dev/)

---

## 🚀 Hướng dẫn cài đặt (Installation & Setup)

### Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/en/) (phiên bản LTS hoặc >= 18)
- [MongoDB](https://www.mongodb.com/) (Local hoặc MongoDB Atlas)
- **Git**

### Bước 1: Clone dự án
```bash
git clone <repository_url>
cd WareHouseManagement
```

### Bước 2: Thiết lập Backend
```bash
cd BE
```
1. Cài đặt các thư viện phụ thuộc:
```bash
npm install
# Hoặc nếu bạn dùng bun:
bun install
```
2. Cấu hình biến môi trường:
Tạo file `.env` từ file `.env.example`:
```bash
cp .env.example .env
```
Kiểm tra và sửa đổi các thông số trong `.env` nếu cần (như `PORT`, `MONGODB_URL`, `JWT_SECRET`).
3. Seed dữ liệu mặc định (Roles & Permissions):
```bash
npm run seed:rbac
```
4. Khởi chạy Backend ở chế độ Dev:
```bash
npm run dev
```
Mặc định API sẽ chạy ở `http://localhost:4000`.

### Bước 3: Thiết lập Frontend
Mở một terminal mới và trỏ về thư mục Frontend:
```bash
cd ware-house-fe
```
1. Cài đặt các thư viện phụ thuộc:
```bash
npm install
# Hoặc:
bun install
```
2. Cấu hình biến môi trường:
Tạo file `.env` và thiết lập đường dẫn baseUrl tới BE của bạn, thay thế bằng giá trị phù hợp:
```env
VITE_API_BASE_URL=http://localhost:4000/v1/
```
3. Khởi chạy Frontend ở chế độ Dev:
```bash
npm run dev
```

Sau khi Terminal báo thành công, bạn có thể mở đường dẫn `http://localhost:5173` (hoặc cổng mà Vite cung cấp) trên trình duyệt để sử dụng ứng dụng.

---

## 📁 Cấu trúc thư mục (Folder Structure)

Dự án gồm 2 module chính là: Backend (`BE/`) và Frontend (`ware-house-fe/`).

```
WareHouseManagement/
├── BE/                   # Mã nguồn Backend (RESTful APIs)
│   ├── src/
│   │   ├── controllers/  # Xử lý logic API requests
│   │   ├── middlewares/  # Middleware auth, validation, errors
│   │   ├── models/       # Mongoose schemas (Schema DB)
│   │   ├── routes/       # Cấu hình routes API (v1)
│   │   ├── services/     # Tương tác Database
│   │   ├── validations/  # Validation request với Joi
│   │   └── index.js      # Main Express App
│   └── package.json
│
├── ware-house-fe/        # Mã nguồn Frontend (ReactJS)
│   ├── src/
│   │   ├── app/          # Core setup (Store redux, theme)
│   │   ├── components/   # Các UI Components dùng chung (reusable)
│   │   ├── pages/        # Các trang màn hình hiển thị/logic
│   │   ├── services/     # API integration với BE (Axios config)
│   │   ├── store/        # Cấu hình Redux/Saga hoặc Zustand
│   │   └── utils/        # Hàm helper hỗ trợ format, tính toán
│   ├── vite.config.ts    # Config build của vite
│   └── package.json
│
└── README.md             # Tài liệu này
```
