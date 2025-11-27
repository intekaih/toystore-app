-- ============================================
-- TẠO BẢNG BANNER
-- ============================================
-- Mục đích: Quản lý banner hiển thị trên trang chủ
-- Ngày tạo: 2025-01-27
-- ============================================

USE toystore;
GO

-- Kiểm tra và xóa bảng nếu đã tồn tại
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Banner]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[Banner];
    PRINT '✅ Đã xóa bảng Banner cũ';
END
GO

-- Tạo bảng Banner
CREATE TABLE [dbo].[Banner] (
    [ID] INT IDENTITY(1,1) PRIMARY KEY,
    [HinhAnhUrl] NVARCHAR(MAX) NOT NULL,
    [Link] NVARCHAR(500) NULL DEFAULT '/products',
    [ThuTu] INT NOT NULL DEFAULT 1,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [NgayTao] DATETIME NOT NULL DEFAULT GETDATE(),
    [NgayCapNhat] DATETIME NULL
);
GO

-- Tạo index cho IsActive và ThuTu để tối ưu query
CREATE INDEX [IX_Banner_IsActive] ON [dbo].[Banner]([IsActive]);
CREATE INDEX [IX_Banner_ThuTu] ON [dbo].[Banner]([ThuTu]);
CREATE INDEX [IX_Banner_IsActive_ThuTu] ON [dbo].[Banner]([IsActive], [ThuTu]);
GO

-- Thêm comment cho bảng
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Bảng quản lý banner hiển thị trên trang chủ', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'Banner';
GO

-- Thêm comment cho các cột
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'ID banner (auto increment)', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'Banner', 
    @level2type = N'COLUMN', @level2name = N'ID';
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'URL hình ảnh banner', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'Banner', 
    @level2type = N'COLUMN', @level2name = N'HinhAnhUrl';
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Link điều hướng khi click vào banner', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'Banner', 
    @level2type = N'COLUMN', @level2name = N'Link';
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Thứ tự hiển thị (số nhỏ hơn hiển thị trước)', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'Banner', 
    @level2type = N'COLUMN', @level2name = N'ThuTu';
GO

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Trạng thái: 1 = đang hiển thị, 0 = đã ẩn', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'Banner', 
    @level2type = N'COLUMN', @level2name = N'IsActive';
GO

PRINT '✅ Đã tạo bảng Banner thành công!';
GO

