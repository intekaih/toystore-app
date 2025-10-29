+# 🎓 GIẢI THÍCH CHI TIẾT SINGLETON PATTERN - DỄ HIỂU

## 📚 MỤC LỤC
1. [Singleton là gì?](#singleton-là-gì)
2. [Tại sao cần Singleton?](#tại-sao-cần-singleton)
3. [Giải thích từng dòng code DBConnection.js](#giải-thích-dbconnectionjs)
4. [Giải thích từng dòng code Logger.js](#giải-thích-loggerjs)
5. [Giải thích từng dòng code ConfigService.js](#giải-thích-configservicejs)
6. [Cách sử dụng trong thực tế](#cách-sử-dụng-thực-tế)

---

## 🎯 Singleton là gì?

### Ví dụ đời thường:
Hãy tưởng tượng **Tổng thống một quốc gia**:
- Một quốc gia chỉ có **1 Tổng thống duy nhất** tại một thời điểm
- Mọi người muốn liên hệ → đều phải gặp **cùng 1 người đó**
- Không thể có 2-3 Tổng thống khác nhau cùng lúc

**Singleton Pattern = Tổng thống của Class**
- Một class chỉ có **1 instance duy nhất**
- Mọi nơi trong code muốn dùng → đều dùng **chung 1 instance đó**

### Lợi ích:
✅ Tiết kiệm bộ nhớ (không tạo nhiều object giống nhau)
✅ Dữ liệu nhất quán (tất cả đều dùng chung 1 instance)
✅ Quản lý tài nguyên tốt hơn (ví dụ: kết nối database)

---

## 🔍 Tại sao cần Singleton?

### ❌ Không dùng Singleton (Vấn đề):
```javascript
// File A
const dbConnection1 = new DBConnection(); // Tạo kết nối thứ 1

// File B
const dbConnection2 = new DBConnection(); // Tạo kết nối thứ 2

// File C
const dbConnection3 = new DBConnection(); // Tạo kết nối thứ 3

// ❌ Vấn đề: 3 kết nối khác nhau → lãng phí tài nguyên!
// Database chỉ cần 1 connection pool là đủ
```

### ✅ Dùng Singleton (Giải pháp):
```javascript
// File A
const dbConnection = DBConnection.getInstance(); // Lấy instance

// File B
const dbConnection = DBConnection.getInstance(); // Lấy CÙNG instance với File A

// File C
const dbConnection = DBConnection.getInstance(); // Lấy CÙNG instance

// ✅ Lợi ích: Chỉ 1 kết nối duy nhất → tiết kiệm tài nguyên!
```

---

## 📖 Giải thích DBConnection.js

### 🧩 Phần 1: Khai báo Class và Biến

```javascript
class DBConnection {
  // Biến static để lưu instance duy nhất
  static #instance = null;
```

**Giải thích chi tiết:**

1. **`static`** = Biến thuộc về **Class**, không thuộc về object
   ```javascript
   // Ví dụ dễ hiểu:
   class Nguoi {
     static soLuongNguoi = 0; // Thuộc về Class Nguoi
     ten = "";                // Thuộc về mỗi object riêng
   }
   
   const nguoi1 = new Nguoi();
   const nguoi2 = new Nguoi();
   // nguoi1.ten và nguoi2.ten là 2 biến khác nhau
   // Nhưng Nguoi.soLuongNguoi là 1 biến duy nhất chung
   ```

2. **`#instance`** = Biến private (dấu `#` = riêng tư)
   - Không thể truy cập từ bên ngoài class
   - Chỉ class tự mình truy cập được
   
   ```javascript
   DBConnection.#instance; // ❌ LỖI! Không truy cập được từ ngoài
   // Chỉ bên trong class mới dùng được
   ```

3. **`= null`** = Giá trị ban đầu là null (chưa có instance nào)

---

```javascript
  #sequelize = null;
```

**Giải thích:**
- **`#sequelize`** = Biến private lưu đối tượng Sequelize
- **Sequelize** = Thư viện kết nối database (như cầu nối giữa Node.js và SQL Server)
- Ban đầu = null, sẽ được gán giá trị trong constructor

---

```javascript
  #isConnected = false;
```

**Giải thích:**
- **`#isConnected`** = Cờ đánh dấu trạng thái kết nối
- `false` = chưa kết nối
- `true` = đã kết nối thành công
- Dùng để tránh kết nối lại nhiều lần

---

### 🧩 Phần 2: Constructor - Hàm khởi tạo

```javascript
  constructor() {
    // Kiểm tra: Nếu đã có instance rồi → KHÔNG CHO TẠO MỚI
    if (DBConnection.#instance) {
      throw new Error('❌ Không thể tạo instance mới! Sử dụng DBConnection.getInstance()');
    }
```

**Giải thích từng dòng:**

1. **`constructor()`** = Hàm được gọi khi tạo object bằng `new`
   ```javascript
   const db = new DBConnection(); // constructor() sẽ chạy
   ```

2. **`if (DBConnection.#instance)`** = Kiểm tra xem đã có instance chưa?
   - Nếu `#instance` khác null → đã có instance rồi
   - Nếu `#instance` là null → chưa có, OK tạo mới

3. **`throw new Error(...)`** = Ném ra lỗi, dừng chương trình
   - Giống như hét lên: "DỪNG LẠI! Không được tạo nữa!"
   - Người dùng sẽ thấy thông báo lỗi

**Ví dụ thực tế:**
```javascript
const db1 = new DBConnection(); // ✅ OK, chưa có instance → tạo được
const db2 = new DBConnection(); // ❌ LỖI! Đã có db1 rồi → không cho tạo
// Error: ❌ Không thể tạo instance mới!
```

---

```javascript
    this.#sequelize = new Sequelize(
      dbConfig.DB,      // Tên database: 'toystore'
      dbConfig.USER,    // Username: 'sa'
      dbConfig.PASSWORD, // Password
      {
        host: dbConfig.HOST,     // Địa chỉ server: 'localhost'
        port: dbConfig.port,     // Cổng: 1433
        dialect: dbConfig.dialect, // Loại DB: 'mssql' (SQL Server)
        dialectOptions: dbConfig.dialectOptions, // Cấu hình bảo mật
        timezone: dbConfig.timezone,             // Múi giờ
        pool: dbConfig.pool,                     // Connection pool
        logging: (msg) => Logger.getInstance().info(`[Sequelize] ${msg}`),
      }
    );
```

**Giải thích chi tiết:**

1. **`this.#sequelize`** = Lưu object Sequelize vào biến private
2. **`new Sequelize(...)`** = Tạo kết nối đến SQL Server
3. **Các tham số:**
   - `dbConfig.DB` = Tên database cần kết nối
   - `dbConfig.USER` = Tài khoản đăng nhập SQL Server
   - `dbConfig.PASSWORD` = Mật khẩu
   - `host` = Địa chỉ máy chủ (localhost = máy này)
   - `port` = Cổng kết nối (1433 = cổng mặc định SQL Server)
   - `dialect` = Loại database (mssql, mysql, postgres...)
   - `pool` = Connection pool (quản lý số lượng kết nối đồng thời)

4. **`logging: (msg) => ...`** = Hàm in log mỗi khi Sequelize chạy SQL
   ```javascript
   // Ví dụ output:
   // [Sequelize] SELECT * FROM SanPham WHERE ID = 1
   ```

---

```javascript
    Logger.getInstance().info('🔧 DBConnection Singleton đã được khởi tạo');
  }
```

**Giải thích:**
- Gọi Logger (cũng là Singleton) để ghi log
- Thông báo rằng DBConnection đã được tạo thành công
- Output: `[2025-01-30 10:30:00] [INFO] 🔧 DBConnection Singleton đã được khởi tạo`

---

### 🧩 Phần 3: getInstance() - Phương thức QUAN TRỌNG NHẤT

```javascript
  static getInstance() {
    // Nếu chưa có instance → Tạo mới
    if (!DBConnection.#instance) {
      DBConnection.#instance = new DBConnection();
    }
    // Trả về instance (mới tạo hoặc đã có sẵn)
    return DBConnection.#instance;
  }
```

**Giải thích từng dòng:**

1. **`static getInstance()`** = Phương thức static (gọi qua Class, không qua object)
   ```javascript
   DBConnection.getInstance(); // ✅ Đúng
   const db = new DBConnection();
   db.getInstance();           // ❌ Sai! Không gọi qua object
   ```

2. **`if (!DBConnection.#instance)`** = Kiểm tra xem đã có instance chưa?
   - `!` = phủ định (NOT)
   - `!DBConnection.#instance` = Chưa có instance (null)

3. **`DBConnection.#instance = new DBConnection();`** = Tạo instance mới
   - Gọi constructor() → tạo object
   - Lưu vào biến static `#instance`

4. **`return DBConnection.#instance;`** = Trả về instance
   - Lần đầu: trả về instance vừa tạo
   - Các lần sau: trả về instance đã tạo trước đó

**Luồng hoạt động:**

```javascript
// Lần 1: Chưa có instance
const db1 = DBConnection.getInstance();
// 1. Kiểm tra: #instance = null → chưa có
// 2. Tạo mới: #instance = new DBConnection()
// 3. Trả về: db1 = #instance

// Lần 2: Đã có instance rồi
const db2 = DBConnection.getInstance();
// 1. Kiểm tra: #instance != null → đã có rồi
// 2. KHÔNG tạo mới
// 3. Trả về: db2 = #instance (cùng với db1)

console.log(db1 === db2); // true → Cùng 1 object!
```

---

### 🧩 Phần 4: Các phương thức công khai

```javascript
  getSequelize() {
    return this.#sequelize;
  }
```

**Giải thích:**
- Lấy object Sequelize để sử dụng
- Các file khác gọi để query database:
  ```javascript
  const db = DBConnection.getInstance();
  const sequelize = db.getSequelize();
  // Dùng sequelize để truy vấn
  ```

---

```javascript
  async connect() {
    // Nếu đã kết nối rồi → Không kết nối lại
    if (this.#isConnected) {
      Logger.getInstance().info('✅ Database đã được kết nối trước đó');
      return true;
    }
```

**Giải thích:**
- **`async`** = Hàm bất đồng bộ (chờ kết quả từ database)
- **`if (this.#isConnected)`** = Kiểm tra cờ trạng thái
  - Nếu đã kết nối → không cần kết nối lại (tránh lãng phí)
  - In log và thoát ngay

---

```javascript
    try {
      await this.#sequelize.authenticate();
      this.#isConnected = true;
      Logger.getInstance().info('✅ Kết nối database thành công!');
      return true;
    }
```

**Giải thích:**

1. **`try { ... }`** = Thử thực hiện code, nếu lỗi sẽ bắt ở `catch`
2. **`await this.#sequelize.authenticate()`** = Kiểm tra kết nối
   - `authenticate()` = Gửi 1 query test đến database
   - `await` = Chờ kết quả (vì là bất đồng bộ)
   - Nếu OK → tiếp tục, nếu lỗi → nhảy vào `catch`

3. **`this.#isConnected = true`** = Đánh dấu đã kết nối thành công
4. **`return true`** = Trả về true (thành công)

---

```javascript
    catch (error) {
      Logger.getInstance().error(`❌ Kết nối database thất bại: ${error.message}`);
      throw error;
    }
  }
```

**Giải thích:**
- **`catch (error)`** = Bắt lỗi nếu kết nối thất bại
- **`Logger.getInstance().error(...)`** = Ghi log lỗi
- **`throw error`** = Ném lỗi ra ngoài để caller biết
  ```javascript
  try {
    await db.connect();
  } catch (e) {
    console.log('Kết nối thất bại:', e.message);
  }
  ```

---

## 📖 Giải thích Logger.js

### 🧩 Phần 1: Các hằng số

```javascript
  static LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG',
    SUCCESS: 'SUCCESS'
  };
```

**Giải thích:**
- **LEVELS** = Danh sách các mức độ log
- Dùng để phân loại log:
  - `INFO` = Thông tin thông thường
  - `WARN` = Cảnh báo
  - `ERROR` = Lỗi
  - `DEBUG` = Debug (chỉ dùng khi dev)
  - `SUCCESS` = Thành công

**Ví dụ sử dụng:**
```javascript
Logger.getInstance().info('Server đang chạy');     // [INFO]
Logger.getInstance().warn('Cảnh báo: Tài nguyên thấp'); // [WARN]
Logger.getInstance().error('Lỗi kết nối database'); // [ERROR]
```

---

```javascript
  static COLORS = {
    INFO: '\x1b[36m',    // Cyan (màu xanh lơ)
    WARN: '\x1b[33m',    // Yellow (màu vàng)
    ERROR: '\x1b[31m',   // Red (màu đỏ)
    DEBUG: '\x1b[35m',   // Magenta (màu tím)
    SUCCESS: '\x1b[32m', // Green (màu xanh lá)
    RESET: '\x1b[0m'     // Reset về màu mặc định
  };
```

**Giải thích:**
- **ANSI color codes** = Mã màu cho terminal/console
- `\x1b[36m` = Bắt đầu màu cyan
- `\x1b[0m` = Reset về màu bình thường

**Ví dụ output:**
```javascript
console.log('\x1b[31mChữ màu đỏ\x1b[0m');
// Output: Chữ màu đỏ (hiển thị màu đỏ trong console)
```

---

### 🧩 Phần 2: Phương thức ghi log

```javascript
  #log(level, message, metadata = null) {
    const timestamp = this.#getTimestamp();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
```

**Giải thích:**

1. **`#log(level, message, metadata = null)`** = Phương thức private ghi log
   - `level` = Mức độ (INFO, ERROR...)
   - `message` = Nội dung log
   - `metadata = null` = Dữ liệu thêm (mặc định là null)

2. **`const timestamp = this.#getTimestamp()`** = Lấy thời gian hiện tại
   ```javascript
   // Kết quả: "30/01/2025, 10:30:15"
   ```

3. **Template string** = Tạo chuỗi log
   ```javascript
   // Kết quả: "[30/01/2025, 10:30:15] [INFO] Server đang chạy"
   ```

---

```javascript
    if (this.#config.enableConsole) {
      const color = Logger.COLORS[level] || Logger.COLORS.RESET;
      console.log(`${color}${logMessage}${Logger.COLORS.RESET}`);
```

**Giải thích:**

1. **`if (this.#config.enableConsole)`** = Kiểm tra có cho phép log ra console không
   - Có thể tắt trong production để tăng hiệu suất

2. **`const color = Logger.COLORS[level]`** = Lấy màu tương ứng
   ```javascript
   // level = 'INFO' → color = '\x1b[36m' (cyan)
   // level = 'ERROR' → color = '\x1b[31m' (red)
   ```

3. **`console.log(...)`** = In ra console với màu
   ```javascript
   // Kết quả: [30/01/2025, 10:30:15] [INFO] Server đang chạy
   //          (hiển thị màu cyan)
   ```

---

```javascript
      if (metadata) {
        console.log(`${color}Metadata:${Logger.COLORS.RESET}`, metadata);
      }
    }
```

**Giải thích:**
- Nếu có `metadata` (dữ liệu thêm) → in ra
- Ví dụ:
  ```javascript
  Logger.getInstance().info('HTTP Request', {
    method: 'GET',
    url: '/api/products'
  });
  // Output:
  // [INFO] HTTP Request
  // Metadata: { method: 'GET', url: '/api/products' }
  ```

---

```javascript
    if (this.#config.enableFile) {
      this.#writeToFile(logMessage, metadata);
    }
  }
```

**Giải thích:**
- Nếu bật ghi file → gọi `#writeToFile()`
- Log sẽ được lưu vào `backend/logs/app.log`

---

### 🧩 Phần 3: Các phương thức tiện ích

```javascript
  info(message, metadata = null) {
    this.#log(Logger.LEVELS.INFO, message, metadata);
  }

  warn(message, metadata = null) {
    this.#log(Logger.LEVELS.WARN, message, metadata);
  }

  error(message, metadata = null) {
    this.#log(Logger.LEVELS.ERROR, message, metadata);
  }
```

**Giải thích:**
- Các wrapper methods để dễ sử dụng
- Thay vì gọi `logger.#log('INFO', 'message')` (private, không gọi được)
- Chỉ cần gọi `logger.info('message')` (public, dễ dùng)

**Ví dụ:**
```javascript
const logger = Logger.getInstance();
logger.info('Server started');      // [INFO] Server started
logger.warn('Low memory');          // [WARN] Low memory
logger.error('Connection failed');  // [ERROR] Connection failed
```

---

## 📖 Giải thích ConfigService.js

### 🧩 Phần 1: Load cấu hình

```javascript
  #loadConfigs() {
    this.#configs.database = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || '',
      name: process.env.DB_NAME || 'toystore',
      port: parseInt(process.env.DB_PORT) || 1433,
      dialect: 'mssql'
    };
```

**Giải thích từng dòng:**

1. **`process.env.DB_HOST`** = Lấy giá trị từ file `.env`
   ```env
   # File .env
   DB_HOST=localhost
   DB_USER=sa
   DB_PASSWORD=123456
   ```
   - Node.js tự động load `.env` nhờ thư viện `dotenv`
   - `process.env` = Object chứa tất cả biến môi trường

2. **`|| 'localhost'`** = Giá trị mặc định nếu không có trong `.env`
   ```javascript
   process.env.DB_HOST || 'localhost'
   // Nếu DB_HOST có giá trị → dùng giá trị đó
   // Nếu DB_HOST undefined → dùng 'localhost'
   ```

3. **`parseInt(process.env.DB_PORT)`** = Chuyển string → number
   ```javascript
   process.env.DB_PORT;           // "1433" (string)
   parseInt(process.env.DB_PORT); // 1433 (number)
   ```

---

```javascript
    this.#configs.jwt = {
      secret: process.env.JWT_SECRET || 'toystore-secret-key-2025',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'toystore-refresh-secret',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    };
```

**Giải thích:**
- **JWT config** = Cấu hình JSON Web Token (dùng để xác thực)
- `secret` = Khóa bí mật mã hóa token
- `expiresIn` = Thời gian hết hạn (`'24h'` = 24 giờ)
- `refreshSecret` = Khóa cho refresh token
- `refreshExpiresIn` = Thời gian hết hạn refresh token (`'7d'` = 7 ngày)

---

### 🧩 Phần 2: Validation

```javascript
  #validateConfigs() {
    const logger = Logger.getInstance();
    
    if (!this.#configs.database.host || !this.#configs.database.name) {
      logger.warn('⚠️ Database config chưa đầy đủ! Kiểm tra file .env');
    }
```

**Giải thích:**
- Kiểm tra các config quan trọng có đầy đủ không
- `!this.#configs.database.host` = Không có host
- `||` = HOẶC
- Nếu thiếu → in cảnh báo (không crash app)

---

```javascript
    if (this.#configs.jwt.secret === 'toystore-secret-key-2025') {
      logger.warn('⚠️ JWT Secret đang dùng giá trị mặc định! Nên thay đổi trong production');
    }
```

**Giải thích:**
- Kiểm tra xem có dùng secret mặc định không
- Trong production nên dùng secret phức tạp, bảo mật
- `===` = So sánh chặt chẽ (cả giá trị và kiểu dữ liệu)

---

### 🧩 Phần 3: Getter methods

```javascript
  get(key) {
    if (!this.#configs[key]) {
      Logger.getInstance().warn(`⚠️ Config key '${key}' không tồn tại`);
      return null;
    }
    return { ...this.#configs[key] };
  }
```

**Giải thích:**

1. **`get(key)`** = Lấy config theo nhóm
   ```javascript
   config.get('database'); 
   // { host: 'localhost', user: 'sa', ... }
   ```

2. **`if (!this.#configs[key])`** = Kiểm tra key có tồn tại không
   - `this.#configs['database']` ✅ Tồn tại
   - `this.#configs['xyz']` ❌ Không tồn tại → return null

3. **`return { ...this.#configs[key] }`** = Clone object rồi trả về
   - `...` = Spread operator (copy tất cả properties)
   - Tại sao clone? Để tránh sửa trực tiếp config gốc
   
   ```javascript
   const dbConfig = config.get('database');
   dbConfig.host = 'hackhack'; // Chỉ sửa bản copy, không ảnh hưởng gốc
   ```

---

```javascript
  getValue(key, subKey) {
    if (!this.#configs[key] || this.#configs[key][subKey] === undefined) {
      Logger.getInstance().warn(`⚠️ Config '${key}.${subKey}' không tồn tại`);
      return null;
    }
    return this.#configs[key][subKey];
  }
```

**Giải thích:**

1. **`getValue(key, subKey)`** = Lấy giá trị cụ thể
   ```javascript
   config.getValue('database', 'host'); // 'localhost'
   config.getValue('jwt', 'secret');    // 'toystore-secret-key-2025'
   ```

2. **`this.#configs[key][subKey]`** = Truy cập nested property
   ```javascript
   // Tương đương:
   this.#configs.database.host
   this.#configs['database']['host']
   ```

3. **`=== undefined`** = Kiểm tra có tồn tại không
   - Khác với `!= null` vì có thể có giá trị `false` hoặc `0` (vẫn hợp lệ)

---

## 🎮 Cách sử dụng thực tế

### Ví dụ 1: Sử dụng DBConnection trong server.js

```javascript
// 1. Import class Singleton
const DBConnection = require('./utils/DBConnection');

// 2. Lấy instance duy nhất
const dbConnection = DBConnection.getInstance();

// 3. Kết nối database
dbConnection.connect()
  .then(() => {
    console.log('✅ Kết nối thành công!');
    
    // 4. Khởi động server
    app.listen(5000, () => {
      console.log('🚀 Server đang chạy');
    });
  })
  .catch(error => {
    console.error('❌ Kết nối thất bại:', error);
  });
```

**Giải thích luồng:**
1. Import class `DBConnection`
2. Gọi `getInstance()` → lấy/tạo instance duy nhất
3. Gọi `connect()` → kết nối database (async)
4. `.then()` → Nếu thành công, khởi động server
5. `.catch()` → Nếu lỗi, in ra console

---

### Ví dụ 2: Sử dụng Logger ở nhiều nơi

```javascript
// File: controllers/product.controller.js
const Logger = require('../utils/Logger');
const logger = Logger.getInstance();

exports.getAllProducts = async (req, res) => {
  logger.info('📦 Lấy danh sách sản phẩm');
  
  try {
    const products = await SanPham.findAll();
    logger.success(`✅ Tìm thấy ${products.length} sản phẩm`);
    res.json({ success: true, data: products });
  } catch (error) {
    logger.error('❌ Lỗi lấy sản phẩm:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
```

**Giải thích:**
- Mỗi file import `Logger` và gọi `getInstance()`
- Tất cả đều dùng **CÙNG 1 Logger instance**
- Log được ghi vào **CÙNG 1 file** (`app.log`)
- Format log **nhất quán** trong toàn app

---

### Ví dụ 3: Sử dụng ConfigService

```javascript
// File: server.js
const ConfigService = require('./utils/ConfigService');
const config = ConfigService.getInstance();

// Lấy config
const PORT = config.getValue('server', 'port');
const JWT_SECRET = config.getValue('jwt', 'secret');
const DB_HOST = config.getValue('database', 'host');

console.log(`Port: ${PORT}`);        // Port: 5000
console.log(`Secret: ${JWT_SECRET}`); // Secret: toystore-secret-key-2025
console.log(`DB: ${DB_HOST}`);       // DB: localhost

// Kiểm tra môi trường
if (config.isDevelopment()) {
  console.log('🔧 Đang ở chế độ Development');
  config.printConfigs(); // In tất cả config
}

if (config.isProduction()) {
  console.log('🚀 Đang ở chế độ Production');
}
```

**Giải thích:**
- `getValue(group, key)` → Lấy giá trị cụ thể
- `isDevelopment()` / `isProduction()` → Kiểm tra môi trường
- `printConfigs()` → In ra tất cả config (ẩn mật khẩu)

---

## 🎯 So sánh: Có Singleton vs Không có Singleton

### ❌ KHÔNG dùng Singleton (Code tệ):

```javascript
// File A
const sequelize1 = new Sequelize('toystore', 'sa', 'pass', {...});
const products1 = await sequelize1.query('SELECT * FROM SanPham');

// File B
const sequelize2 = new Sequelize('toystore', 'sa', 'pass', {...});
const orders2 = await sequelize2.query('SELECT * FROM HoaDon');

// File C
const sequelize3 = new Sequelize('toystore', 'sa', 'pass', {...});
const users3 = await sequelize3.query('SELECT * FROM TaiKhoan');

// ❌ Vấn đề:
// - 3 kết nối riêng biệt → lãng phí
// - Khó quản lý (đóng kết nối ở đâu?)
// - Cấu hình lặp lại nhiều lần
```

### ✅ DÙNG Singleton (Code tốt):

```javascript
// File A
const db = DBConnection.getInstance();
const sequelize = db.getSequelize();
const products = await sequelize.query('SELECT * FROM SanPham');

// File B
const db = DBConnection.getInstance(); // Cùng instance với File A
const sequelize = db.getSequelize();   // Cùng connection
const orders = await sequelize.query('SELECT * FROM HoaDon');

// File C
const db = DBConnection.getInstance(); // Cùng instance
const sequelize = db.getSequelize();   // Cùng connection
const users = await sequelize.query('SELECT * FROM TaiKhoan');

// ✅ Lợi ích:
// - Chỉ 1 kết nối duy nhất
// - Dễ quản lý (đóng 1 lần ở server.js)
// - Code gọn, nhất quán
```

---

## 📝 Tóm tắt các điểm quan trọng

| Khái niệm | Giải thích đơn giản |
|-----------|-------------------|
| **static** | Thuộc về Class, không thuộc object |
| **#variable** | Biến private (riêng tư), chỉ trong class dùng được |
| **getInstance()** | Phương thức duy nhất để lấy instance |
| **constructor()** | Kiểm tra nếu đã có instance → throw Error |
| **Singleton** | 1 class chỉ có 1 instance duy nhất |

---

## 💡 Câu hỏi thường gặp

### Q1: Tại sao phải dùng `static getInstance()` thay vì `new`?

**Trả lời:**
- `new` → Luôn tạo object mới
- `getInstance()` → Kiểm tra rồi quyết định:
  - Chưa có → Tạo mới
  - Đã có → Trả về cái cũ

```javascript
// new - Tạo mới mãi
const db1 = new DBConnection(); // Object 1
const db2 = new DBConnection(); // Object 2 (khác)
const db3 = new DBConnection(); // Object 3 (khác)

// getInstance() - Dùng chung 1 object
const db1 = DBConnection.getInstance(); // Tạo object 1
const db2 = DBConnection.getInstance(); // Trả về object 1
const db3 = DBConnection.getInstance(); // Trả về object 1
```

---

### Q2: Tại sao dùng `#instance` thay vì `instance`?

**Trả lời:**
- `#instance` (private) → Không ai truy cập được từ ngoài
- `instance` (public) → Ai cũng sửa được → nguy hiểm!

```javascript
// Với public variable (nguy hiểm)
class DB {
  static instance = null;
}
DB.instance = "hack"; // ❌ Ai cũng sửa được!

// Với private variable (an toàn)
class DB {
  static #instance = null;
}
DB.#instance = "hack"; // ❌ ERROR! Không sửa được
```

---

### Q3: Logger ghi vào file như thế nào?

**Trả lời:**
```javascript
#writeToFile(message, metadata) {
  const logFilePath = path.join(this.#config.logDirectory, 'app.log');
  
  // Tạo nội dung log
  let logContent = message + '\n';
  if (metadata) {
    logContent += `Metadata: ${JSON.stringify(metadata)}\n`;
  }
  
  // Ghi vào file (append mode)
  fs.appendFileSync(logFilePath, logContent, 'utf8');
}
```

**Giải thích:**
- `path.join()` → Nối đường dẫn: `backend/logs/app.log`
- `fs.appendFileSync()` → Ghi thêm vào cuối file (không ghi đè)
- `JSON.stringify()` → Chuyển object → string để ghi file

---

## 🎓 Bài tập thực hành

Hãy thử tự tạo một Singleton class đơn giản:

```javascript
class Counter {
  // TODO: Thêm static #instance
  // TODO: Thêm #count = 0
  
  constructor() {
    // TODO: Kiểm tra và throw Error nếu đã có instance
  }
  
  static getInstance() {
    // TODO: Tạo hoặc trả về instance
  }
  
  increment() {
    this.#count++;
  }
  
  getCount() {
    return this.#count;
  }
}

// Test
const counter1 = Counter.getInstance();
counter1.increment(); // count = 1
counter1.increment(); // count = 2

const counter2 = Counter.getInstance();
console.log(counter2.getCount()); // 2 (cùng instance với counter1!)
```

---

Hy vọng tài liệu này giúp bạn hiểu rõ Singleton Pattern! 🎉
