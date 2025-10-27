const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Đã tạo thư mục uploads');
}

// Cấu hình storage cho Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Thư mục lưu file
  },
  filename: function (req, file, cb) {
    // Tạo tên file tạm thời (sẽ rename sau khi có ID)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    
    // Loại bỏ ký tự đặc biệt trong tên file
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `temp_${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// Validate file type (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
  // Các định dạng ảnh được phép
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)'), false); // Reject file
  }
};

// Cấu hình Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
});

// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Lỗi từ Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Kích thước file vượt quá giới hạn 5MB'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Tên field upload không hợp lệ. Vui lòng dùng field "hinhAnh"'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: err.message || 'Lỗi upload file'
    });
  } else if (err) {
    // Lỗi custom (từ fileFilter)
    return res.status(400).json({
      success: false,
      message: err.message || 'Lỗi upload file'
    });
  }
  
  next();
};

// Hàm xóa file ảnh cũ
const deleteOldImage = (imagePath) => {
  if (!imagePath) return;
  
  // Lấy tên file từ URL hoặc path
  let filename = imagePath;
  if (imagePath.startsWith('/uploads/')) {
    filename = imagePath.replace('/uploads/', '');
  } else {
    filename = path.basename(imagePath);
  }
  
  const filePath = path.join(uploadDir, filename);
  
  // Kiểm tra file có tồn tại không
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log('🗑️ Đã xóa ảnh cũ:', filename);
    } catch (error) {
      console.error('❌ Lỗi xóa ảnh cũ:', error);
    }
  }
};

// Hàm rename file theo ID sản phẩm
const renameFileByProductId = (oldFilename, productId) => {
  if (!oldFilename || !productId) return null;
  
  try {
    const oldPath = path.join(uploadDir, oldFilename);
    const ext = path.extname(oldFilename);
    
    // Tên file mới: product_<ID>_<timestamp><ext>
    const newFilename = `product_${productId}_${Date.now()}${ext}`;
    const newPath = path.join(uploadDir, newFilename);
    
    // Kiểm tra file cũ có tồn tại không
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`✅ Đã đổi tên file: ${oldFilename} -> ${newFilename}`);
      return newFilename;
    }
    
    return oldFilename;
  } catch (error) {
    console.error('❌ Lỗi đổi tên file:', error);
    return oldFilename;
  }
};

module.exports = {
  upload,
  handleUploadError,
  deleteOldImage,
  renameFileByProductId
};
