const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Đã tạo thư mục uploads');
}

// Tạo thư mục temp cho file tạm
const tempDir = path.join(uploadDir, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log('📁 Đã tạo thư mục temp');
}

// Cấu hình storage cho Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Lưu vào thư mục temp, sau đó sẽ di chuyển vào thư mục sản phẩm
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file tạm thời
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    
    // Loại bỏ ký tự đặc biệt trong tên file
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
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
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
  }
});

// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Lỗi từ Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Kích thước file vượt quá giới hạn 10MB'
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

// Hàm tạo thư mục cho sản phẩm
const createProductFolder = (productId) => {
  const productFolder = path.join(uploadDir, `product_${productId}`);
  if (!fs.existsSync(productFolder)) {
    fs.mkdirSync(productFolder, { recursive: true });
    console.log(`📁 Đã tạo thư mục cho sản phẩm ${productId}`);
  }
  return productFolder;
};

// Hàm xử lý ảnh chuyển về tỷ lệ vuông 1:1
const processImageToSquare = async (inputPath, outputPath) => {
  try {
    // Đọc metadata của ảnh để lấy kích thước
    const metadata = await sharp(inputPath).metadata();
    const { width, height } = metadata;
    
    // Tính toán kích thước vuông (lấy cạnh nhỏ hơn)
    const size = Math.min(width, height);
    
    // Tính toán vị trí crop để căn giữa
    const left = Math.floor((width - size) / 2);
    const top = Math.floor((height - size) / 2);
    
    // Xử lý ảnh: crop về vuông và resize nếu cần
    await sharp(inputPath)
      .extract({
        left: left,
        top: top,
        width: size,
        height: size
      })
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(outputPath);
    
    console.log(`✅ Đã xử lý ảnh về tỷ lệ vuông 1:1: ${size}x${size}`);
    return true;
  } catch (error) {
    console.error('❌ Lỗi xử lý ảnh:', error);
    // Nếu lỗi, copy file gốc
    try {
      fs.copyFileSync(inputPath, outputPath);
      console.log('⚠️ Đã copy file gốc do lỗi xử lý');
      return false;
    } catch (copyError) {
      console.error('❌ Lỗi copy file:', copyError);
      return false;
    }
  }
};

// Hàm di chuyển files từ temp vào thư mục sản phẩm (với xử lý ảnh vuông 1:1)
const moveFilesToProductFolder = async (files, productId) => {
  if (!files || files.length === 0) return null;
  
  try {
    const productFolder = createProductFolder(productId);
    const imageUrls = [];
    
    // Xử lý từng file một cách tuần tự để đảm bảo thứ tự
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const tempPath = path.join(tempDir, file.filename);
      const ext = path.extname(file.filename);
      
      // Tên file mới: image_<index>_<timestamp><ext>
      const newFilename = `image_${index}_${Date.now()}${ext}`;
      const newPath = path.join(productFolder, newFilename);
      
      // Kiểm tra file tồn tại
      if (fs.existsSync(tempPath)) {
        // Xử lý ảnh về tỷ lệ vuông 1:1
        await processImageToSquare(tempPath, newPath);
        
        // Xóa file tạm sau khi xử lý xong
        try {
          fs.unlinkSync(tempPath);
        } catch (unlinkError) {
          console.warn('⚠️ Không thể xóa file tạm:', tempPath);
        }
        
        console.log(`✅ Đã xử lý và lưu: ${file.filename} -> product_${productId}/${newFilename}`);
        imageUrls.push(`/uploads/product_${productId}/${newFilename}`);
      }
    }
    
    return JSON.stringify(imageUrls);
  } catch (error) {
    console.error('❌ Lỗi di chuyển files:', error);
    return null;
  }
};

// Hàm xóa file ảnh cũ
const deleteOldImage = (imagePath) => {
  if (!imagePath) return;
  
  try {
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
      fs.unlinkSync(filePath);
      console.log('🗑️ Đã xóa ảnh cũ:', filename);
    }
  } catch (error) {
    console.error('❌ Lỗi xóa ảnh cũ:', error);
  }
};

// Hàm xóa toàn bộ thư mục sản phẩm
const deleteProductFolder = (productId) => {
  const productFolder = path.join(uploadDir, `product_${productId}`);
  
  try {
    if (fs.existsSync(productFolder)) {
      // Xóa tất cả files trong thư mục
      const files = fs.readdirSync(productFolder);
      files.forEach(file => {
        const filePath = path.join(productFolder, file);
        fs.unlinkSync(filePath);
      });
      
      // Xóa thư mục
      fs.rmdirSync(productFolder);
      console.log(`🗑️ Đã xóa thư mục sản phẩm ${productId}`);
    }
  } catch (error) {
    console.error('❌ Lỗi xóa thư mục sản phẩm:', error);
  }
};

// Hàm xóa files tạm trong trường hợp lỗi
const cleanupTempFiles = (files) => {
  if (!files || files.length === 0) return;
  
  files.forEach(file => {
    const tempPath = path.join(tempDir, file.filename);
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
        console.log('🗑️ Đã xóa file tạm:', file.filename);
      } catch (error) {
        console.error('❌ Lỗi xóa file tạm:', error);
      }
    }
  });
};

// Hàm rename file theo ID sản phẩm (giữ lại để tương thích ngược)
const renameFileByProductId = (oldFilename, productId, index = 0) => {
  if (!oldFilename || !productId) return null;
  
  try {
    const oldPath = path.join(uploadDir, oldFilename);
    const ext = path.extname(oldFilename);
    
    // Tên file mới: product_<ID>_<index>_<timestamp><ext>
    const newFilename = `product_${productId}_${index}_${Date.now()}${ext}`;
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

// ==================== BANNER UPLOAD ====================
// Tạo thư mục banner nếu chưa tồn tại
const bannerDir = path.join(uploadDir, 'banner');
if (!fs.existsSync(bannerDir)) {
  fs.mkdirSync(bannerDir, { recursive: true });
  console.log('📁 Đã tạo thư mục banner');
}

// Cấu hình storage cho banner
const bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, bannerDir);
  },
  filename: function (req, file, cb) {
    // Tên file: banner_<timestamp>_<random>.<ext>
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    
    // Loại bỏ ký tự đặc biệt trong tên file
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `banner_${sanitizedName}_${uniqueSuffix}${ext}`);
  }
});

// Multer upload cho banner (single file)
const uploadBanner = multer({
  storage: bannerStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
  }
});

// Hàm xóa file banner cũ
const deleteOldBannerImage = (imagePath) => {
  if (!imagePath) return;
  
  try {
    // Nếu là base64 string, không cần xóa
    if (imagePath.startsWith('data:image/')) {
      return;
    }
    
    // Lấy tên file từ URL hoặc path
    let filename = imagePath;
    if (imagePath.startsWith('/uploads/banner/')) {
      filename = imagePath.replace('/uploads/banner/', '');
    } else if (imagePath.startsWith('uploads/banner/')) {
      filename = imagePath.replace('uploads/banner/', '');
    } else {
      filename = path.basename(imagePath);
    }
    
    const filePath = path.join(bannerDir, filename);
    
    // Kiểm tra file có tồn tại không
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️ Đã xóa banner cũ:', filename);
    }
  } catch (error) {
    console.error('❌ Lỗi xóa banner cũ:', error);
  }
};

// ==================== BRAND LOGO UPLOAD ====================
// Tạo thư mục brands nếu chưa tồn tại
const brandDir = path.join(uploadDir, 'brands');
if (!fs.existsSync(brandDir)) {
  fs.mkdirSync(brandDir, { recursive: true });
  console.log('📁 Đã tạo thư mục brands');
}

// Cấu hình storage cho brand logo
const brandStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, brandDir);
  },
  filename: function (req, file, cb) {
    // Tên file: brand_<timestamp>_<random>.<ext>
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    
    // Loại bỏ ký tự đặc biệt trong tên file
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `brand_${sanitizedName}_${uniqueSuffix}${ext}`);
  }
});

// Multer upload cho brand logo (single file)
const uploadBrandLogo = multer({
  storage: brandStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB cho logo
  }
});

// Hàm xóa file brand logo cũ
const deleteOldBrandLogo = (imagePath) => {
  if (!imagePath) return;
  
  try {
    // Nếu là base64 string hoặc URL bên ngoài, không cần xóa
    if (imagePath.startsWith('data:image/') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return;
    }
    
    // Lấy tên file từ URL hoặc path
    let filename = imagePath;
    if (imagePath.startsWith('/uploads/brands/')) {
      filename = imagePath.replace('/uploads/brands/', '');
    } else if (imagePath.startsWith('uploads/brands/')) {
      filename = imagePath.replace('uploads/brands/', '');
    } else {
      filename = path.basename(imagePath);
    }
    
    const filePath = path.join(brandDir, filename);
    
    // Kiểm tra file có tồn tại không
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️ Đã xóa brand logo cũ:', filename);
    }
  } catch (error) {
    console.error('❌ Lỗi xóa brand logo cũ:', error);
  }
};

module.exports = {
  upload,
  handleUploadError,
  deleteOldImage,
  renameFileByProductId,
  moveFilesToProductFolder,
  deleteProductFolder,
  cleanupTempFiles,
  uploadBanner,
  deleteOldBannerImage,
  uploadBrandLogo,
  deleteOldBrandLogo
};
