# 📚 REFACTORING DOCUMENTATION

## 🎯 Tổng quan

Dự án đã được refactor hoàn toàn để có cấu trúc code rõ ràng, dễ bảo trì và mở rộng.

---

## 📁 Cấu trúc thư mục mới

```
src/
├── api/                    # API Layer - Tất cả API calls
│   ├── client.js          # Axios instance với interceptors
│   ├── auth.api.js        # Auth APIs
│   ├── user.api.js        # User APIs
│   └── productApi.js      # Product APIs
│
├── utils/                  # Utilities - Các hàm tiện ích
│   ├── constants.js       # Các hằng số (status codes, messages, etc.)
│   ├── validation.js      # Các hàm validation
│   ├── format.js          # Các hàm format (tiền tệ, ngày, sdt)
│   └── storage.js         # LocalStorage management
│
├── hooks/                  # Custom Hooks
│   ├── useAuth.js         # Hook cho authentication
│   ├── useForm.js         # Hook quản lý form
│   ├── useDebounce.js     # Hook debounce cho search
│   ├── useProduct.js      # Hook quản lý products
│   └── index.js           # Export tất cả hooks
│
├── components/
│   ├── common/            # Reusable UI Components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Loading/
│   │   ├── ErrorMessage/
│   │   └── index.js       # Export tất cả components
│   │
│   ├── layout/            # Layout components (Navbar, Footer)
│   └── features/          # Feature-specific components
│
├── contexts/              # React Contexts
│   └── AuthContext.js
│
├── pages/                 # Page components
└── config.js             # App configuration
```

---

## 🚀 Cách sử dụng

### 1️⃣ **Config & Constants**

```javascript
// Import config
import config from './config';

// Sử dụng API endpoint
const endpoint = config.api.endpoints.auth.login;

// Import constants
import { HTTP_STATUS, ERROR_MESSAGES, ROUTES } from './utils/constants';

if (status === HTTP_STATUS.UNAUTHORIZED) {
  console.error(ERROR_MESSAGES.SESSION_EXPIRED);
}
```

### 2️⃣ **Validation**

```javascript
import { validateEmail, validatePassword, validateForm } from './utils/validation';

// Validate riêng lẻ
const result = validateEmail('test@example.com');
if (!result.isValid) {
  console.error(result.message);
}

// Validate toàn bộ form
const validation = validateForm(formData, {
  email: { type: 'email', required: true, label: 'Email' },
  password: { type: 'password', required: true, label: 'Mật khẩu' },
});
```

### 3️⃣ **Format Utilities**

```javascript
import { formatCurrency, formatDate, formatPhoneNumber } from './utils/format';

// Format tiền tệ
formatCurrency(150000); // "150,000 ₫"

// Format ngày
formatDate(new Date()); // "21/10/2025"

// Format số điện thoại
formatPhoneNumber('0123456789'); // "0123 456 789"
```

### 4️⃣ **Storage Management**

```javascript
import { setToken, getToken, getUser, clearAuth } from './utils/storage';

// Lưu token
setToken('jwt-token-here');

// Lấy user
const user = getUser();

// Clear auth khi logout
clearAuth();
```

### 5️⃣ **API Calls**

```javascript
import * as authApi from './api/auth.api';
import * as userApi from './api/user.api';
import { getProducts } from './api/productApi';

// Login
const { token, user } = await authApi.login({ TenDangNhap, MatKhau });

// Get profile
const profile = await userApi.getProfile();

// Get products
const data = await getProducts(1, 'búp bê');
```

### 6️⃣ **Custom Hooks**

```javascript
import { useAuth, useForm, useDebounce, useProducts } from './hooks';

// Auth hook
function MyComponent() {
  const { user, login, logout } = useAuth();
  
  // Form hook
  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    { email: { type: 'email', required: true } },
    onSubmit
  );
  
  // Debounce hook
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  // Products hook
  const { products, loading, changePage } = useProducts();
}
```

### 7️⃣ **Common Components**

```javascript
import { Button, Input, Card, Loading, ErrorMessage } from './components/common';

function LoginForm() {
  return (
    <Card title="Đăng nhập">
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="Nhập email"
        icon="📧"
        required
      />
      
      <Input
        name="password"
        type="password"
        label="Mật khẩu"
        showPasswordToggle
        required
      />
      
      <ErrorMessage 
        message="Email hoặc mật khẩu không đúng" 
        type="error" 
      />
      
      <Button 
        variant="primary" 
        size="large" 
        loading={isLoading}
        fullWidth
      >
        Đăng nhập
      </Button>
    </Card>
  );
}
```

---

## 🎨 Component Props

### **Button Props**
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost'
- `size`: 'small' | 'medium' | 'large'
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean

### **Input Props**
- `type`: 'text' | 'email' | 'password' | 'tel' | etc.
- `label`: string
- `error`: string
- `touched`: boolean
- `icon`: React.ReactNode
- `showPasswordToggle`: boolean (for password inputs)
- `required`: boolean

### **Card Props**
- `title`: string
- `subtitle`: string
- `footer`: React.ReactNode
- `variant`: 'default' | 'elevated' | 'outlined'
- `padding`: 'none' | 'small' | 'normal' | 'large'
- `shadow`: boolean
- `hoverable`: boolean

### **Loading Props**
- `variant`: 'spinner' | 'dots' | 'pulse' | 'bars'
- `size`: 'small' | 'medium' | 'large'
- `fullScreen`: boolean
- `text`: string
- `showText`: boolean

### **ErrorMessage Props**
- `message`: string
- `type`: 'error' | 'warning' | 'info' | 'success'
- `onClose`: function
- `showIcon`: boolean

---

## ✅ Lợi ích của cấu trúc mới

### 🎯 **Code Organization**
- ✅ Phân tách rõ ràng theo chức năng (API, Utils, Hooks, Components)
- ✅ Dễ tìm kiếm và bảo trì code
- ✅ Tuân thủ best practices của React

### ♻️ **Reusability**
- ✅ Components có thể tái sử dụng (Button, Input, Card, etc.)
- ✅ Hooks tái sử dụng logic (useForm, useDebounce)
- ✅ Utils functions dùng chung (validation, format)

### 🛡️ **Type Safety & Consistency**
- ✅ Centralized constants (không có magic strings)
- ✅ Validation nhất quán
- ✅ Error handling thống nhất

### 🚀 **Performance**
- ✅ Code splitting tốt hơn
- ✅ Lazy loading dễ dàng
- ✅ Optimized re-renders

### 🧪 **Testability**
- ✅ Dễ viết unit tests
- ✅ Components độc lập, dễ test
- ✅ Utils functions pure, dễ test

### 📈 **Scalability**
- ✅ Dễ thêm features mới
- ✅ Dễ mở rộng components
- ✅ Cấu trúc rõ ràng cho team lớn

---

## 🔄 Migration Guide

### **Cũ → Mới**

#### **1. API Calls**
```javascript
// ❌ CŨ - Inline axios
import axios from 'axios';
const response = await axios.get('http://localhost:5000/api/products');

// ✅ MỚI - Sử dụng API module
import { getProducts } from './api/productApi';
const data = await getProducts();
```

#### **2. Validation**
```javascript
// ❌ CŨ - Validation lặp lại
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  setError('Email không hợp lệ');
}

// ✅ MỚI - Sử dụng validation utils
import { validateEmail } from './utils/validation';
const result = validateEmail(email);
if (!result.isValid) {
  setError(result.message);
}
```

#### **3. Components**
```javascript
// ❌ CŨ - Inline styles
<button style={{ padding: '0.75rem', background: '#007bff' }}>
  Click me
</button>

// ✅ MỚI - Sử dụng Button component
import { Button } from './components/common';
<Button variant="primary">Click me</Button>
```

#### **4. Form Management**
```javascript
// ❌ CŨ - Manual form state
const [email, setEmail] = useState('');
const [errors, setErrors] = useState({});

// ✅ MỚI - Sử dụng useForm hook
import { useForm } from './hooks';
const { values, errors, handleChange } = useForm(
  { email: '' },
  { email: { type: 'email', required: true } }
);
```

---

## 📝 TODO - Các bước tiếp theo

1. ✅ Tạo config và constants
2. ✅ Tạo validation và format utils
3. ✅ Tạo storage management
4. ✅ Refactor API layer với axios client
5. ✅ Tạo custom hooks
6. ✅ Tạo common components
7. ⏳ Refactor các pages để sử dụng components mới
8. ⏳ Tạo layout components (Navbar, Footer)
9. ⏳ Tạo feature-specific components
10. ⏳ Viết tests cho components và utils

---

## 🤝 Contributing

Khi thêm code mới, hãy tuân thủ:
- ✅ Đặt constants trong `utils/constants.js`
- ✅ Đặt validation logic trong `utils/validation.js`
- ✅ Tạo reusable components trong `components/common/`
- ✅ Tạo custom hooks cho logic phức tạp
- ✅ Sử dụng CSS Modules cho styling
- ✅ Document code với JSDoc comments

---

## 📞 Support

Nếu có thắc mắc về cấu trúc mới, liên hệ team lead hoặc xem tài liệu này.

**Happy Coding! 🚀**
