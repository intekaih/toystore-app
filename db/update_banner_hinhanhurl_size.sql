-- ============================================
-- CẬP NHẬT KÍCH THƯỚC CỘT HinhAnhUrl
-- ============================================
-- Mục đích: Tăng kích thước cột HinhAnhUrl để lưu được base64 string
-- Ngày tạo: 2025-01-27
-- ============================================

USE toystore;
GO

-- Kiểm tra xem bảng Banner có tồn tại không
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Banner]') AND type in (N'U'))
BEGIN
    -- Cập nhật kích thước cột HinhAnhUrl lên NVARCHAR(MAX) để lưu được base64 string dài
    ALTER TABLE [dbo].[Banner]
    ALTER COLUMN [HinhAnhUrl] NVARCHAR(MAX) NOT NULL;
    
    PRINT '✅ Đã cập nhật kích thước cột HinhAnhUrl thành công!';
END
ELSE
BEGIN
    PRINT '❌ Bảng Banner chưa tồn tại. Vui lòng chạy create_banner_table.sql trước.';
END
GO

