const db = require('../models');
const DiaChiGiaoHangUser = db.DiaChiGiaoHangUser;

class AddressService {
  /**
   * Lấy tất cả địa chỉ giao hàng của user
   * @param {number} taiKhoanID - ID tài khoản
   * @returns {Promise<Array>} Danh sách địa chỉ
   */
  async getAllAddressByUser(taiKhoanID) {
    try {
      const addresses = await DiaChiGiaoHangUser.findAll({
        where: { TaiKhoanID: taiKhoanID },
        order: [
          ['MacDinh', 'DESC'], // Địa chỉ mặc định lên đầu
          ['createdAt', 'DESC']
        ]
      });
      return addresses;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách địa chỉ: ${error.message}`);
    }
  }

  /**
   * Lấy địa chỉ mặc định của user
   * @param {number} taiKhoanID - ID tài khoản
   * @returns {Promise<Object|null>} Địa chỉ mặc định
   */
  async getDefaultAddress(taiKhoanID) {
    try {
      const address = await DiaChiGiaoHangUser.findOne({
        where: { 
          TaiKhoanID: taiKhoanID,
          MacDinh: true
        }
      });
      return address;
    } catch (error) {
      throw new Error(`Lỗi khi lấy địa chỉ mặc định: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết một địa chỉ
   * @param {number} diaChiID - ID địa chỉ
   * @param {number} taiKhoanID - ID tài khoản (để verify quyền sở hữu)
   * @returns {Promise<Object|null>} Chi tiết địa chỉ
   */
  async getAddressById(diaChiID, taiKhoanID) {
    try {
      const address = await DiaChiGiaoHangUser.findOne({
        where: { 
          DiaChiID: diaChiID,
          TaiKhoanID: taiKhoanID
        }
      });
      
      if (!address) {
        throw new Error('Không tìm thấy địa chỉ hoặc bạn không có quyền truy cập');
      }
      
      return address;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Thêm địa chỉ giao hàng mới
   * @param {number} taiKhoanID - ID tài khoản
   * @param {Object} addressData - Dữ liệu địa chỉ
   * @returns {Promise<Object>} Địa chỉ vừa tạo
   */
  async createAddress(taiKhoanID, addressData) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { HoTen, SoDienThoai, DiaChi, Phuong, Quan, ThanhPho, MacDinh } = addressData;

      // Validate dữ liệu
      if (!HoTen || !SoDienThoai || !DiaChi || !Phuong || !Quan || !ThanhPho) {
        throw new Error('Vui lòng điền đầy đủ thông tin địa chỉ');
      }

      // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
      if (MacDinh === true) {
        await DiaChiGiaoHangUser.update(
          { MacDinh: false },
          { 
            where: { TaiKhoanID: taiKhoanID },
            transaction 
          }
        );
      }

      // Nếu là địa chỉ đầu tiên, tự động đặt làm mặc định
      const existingCount = await DiaChiGiaoHangUser.count({
        where: { TaiKhoanID: taiKhoanID }
      });

      const newAddress = await DiaChiGiaoHangUser.create({
        TaiKhoanID: taiKhoanID,
        HoTen,
        SoDienThoai,
        DiaChi,
        Phuong,
        Quan,
        ThanhPho,
        MacDinh: existingCount === 0 ? true : (MacDinh || false)
      }, { transaction });

      await transaction.commit();
      return newAddress;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi tạo địa chỉ: ${error.message}`);
    }
  }

  /**
   * Cập nhật địa chỉ giao hàng
   * @param {number} diaChiID - ID địa chỉ
   * @param {number} taiKhoanID - ID tài khoản
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Địa chỉ đã cập nhật
   */
  async updateAddress(diaChiID, taiKhoanID, updateData) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Kiểm tra địa chỉ có tồn tại và thuộc về user không
      const address = await this.getAddressById(diaChiID, taiKhoanID);

      const { HoTen, SoDienThoai, DiaChi, Phuong, Quan, ThanhPho, MacDinh } = updateData;

      // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
      if (MacDinh === true) {
        await DiaChiGiaoHangUser.update(
          { MacDinh: false },
          { 
            where: { 
              TaiKhoanID: taiKhoanID,
              DiaChiID: { [db.Sequelize.Op.ne]: diaChiID } // Khác địa chỉ hiện tại
            },
            transaction 
          }
        );
      }

      // Cập nhật địa chỉ
      await address.update({
        HoTen: HoTen || address.HoTen,
        SoDienThoai: SoDienThoai || address.SoDienThoai,
        DiaChi: DiaChi || address.DiaChi,
        Phuong: Phuong || address.Phuong,
        Quan: Quan || address.Quan,
        ThanhPho: ThanhPho || address.ThanhPho,
        MacDinh: MacDinh !== undefined ? MacDinh : address.MacDinh
      }, { transaction });

      await transaction.commit();
      return address;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi cập nhật địa chỉ: ${error.message}`);
    }
  }

  /**
   * Đặt địa chỉ làm mặc định
   * @param {number} diaChiID - ID địa chỉ
   * @param {number} taiKhoanID - ID tài khoản
   * @returns {Promise<Object>} Địa chỉ đã cập nhật
   */
  async setDefaultAddress(diaChiID, taiKhoanID) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Kiểm tra địa chỉ có tồn tại không
      const address = await this.getAddressById(diaChiID, taiKhoanID);

      // Bỏ mặc định của tất cả địa chỉ khác
      await DiaChiGiaoHangUser.update(
        { MacDinh: false },
        { 
          where: { TaiKhoanID: taiKhoanID },
          transaction 
        }
      );

      // Đặt địa chỉ này làm mặc định
      await address.update({ MacDinh: true }, { transaction });

      await transaction.commit();
      return address;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi đặt địa chỉ mặc định: ${error.message}`);
    }
  }

  /**
   * Xóa địa chỉ giao hàng
   * @param {number} diaChiID - ID địa chỉ
   * @param {number} taiKhoanID - ID tài khoản
   * @returns {Promise<boolean>} True nếu xóa thành công
   */
  async deleteAddress(diaChiID, taiKhoanID) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Kiểm tra địa chỉ có tồn tại không
      const address = await this.getAddressById(diaChiID, taiKhoanID);

      const wasDefault = address.MacDinh;

      // Xóa địa chỉ
      await address.destroy({ transaction });

      // Nếu địa chỉ vừa xóa là mặc định, đặt địa chỉ khác làm mặc định
      if (wasDefault) {
        const firstAddress = await DiaChiGiaoHangUser.findOne({
          where: { TaiKhoanID: taiKhoanID },
          transaction
        });

        if (firstAddress) {
          await firstAddress.update({ MacDinh: true }, { transaction });
        }
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi xóa địa chỉ: ${error.message}`);
    }
  }
}

module.exports = new AddressService();
