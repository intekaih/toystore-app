const db = require('../models');
const DTOMapper = require('../utils/DTOMapper');

const Banner = db.Banner;

/**
 * 📋 Lấy danh sách banner đang active (public)
 * GET /api/banners
 */
exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: {
        IsActive: true
      },
      order: [['ThuTu', 'ASC'], ['ID', 'DESC']]
    });

    const bannersData = banners.map(b => DTOMapper.toCamelCase({
      ID: b.ID,
      HinhAnhUrl: b.HinhAnhUrl,
      Link: b.Link,
      ThuTu: b.ThuTu,
      IsActive: b.IsActive === 1 || b.IsActive === true
    }));

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách banner thành công',
      data: { banners: bannersData }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy danh sách banner:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

