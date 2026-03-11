const responseMessages = {
  common: {
    notFound: 'Không tìm thấy dữ liệu',
    unauthorized: 'Vui lòng đăng nhập',
    forbidden: 'Bạn không có quyền truy cập',
    badRequest: 'Dữ liệu không hợp lệ',
    serverError: 'Có lỗi xảy ra, vui lòng thử lại sau',
    created: 'Tạo mới thành công',
    updated: 'Cập nhật thành công',
    deleted: 'Xóa thành công',
  },
  auth: {
    invalidToken: 'Token không hợp lệ',
    invalidCredentials: 'Email hoặc mật khẩu không đúng',
    refreshTokenNotFound: 'Không tìm thấy refresh token',
    pleaseAuthenticate: 'Vui lòng đăng nhập',
    passwordResetFailed: 'Đặt lại mật khẩu thất bại',
    emailVerificationFailed: 'Xác thực email thất bại',
    sessionExpired: 'Phiên đăng nhập đã hết hạn',
  },
  user: {
    notFound: 'Không tìm thấy người dùng',
    emailTaken: 'Email đã được sử dụng',
    currentPasswordIncorrect: 'Mật khẩu hiện tại không đúng',
    notFoundByEmail: 'Không tìm thấy người dùng với email này',
  },
  branch: {
    notFound: 'Không tìm thấy chi nhánh',
  },
  warehouse: {
    notFound: 'Không tìm thấy kho',
  },
  category: {
    notFound: 'Không tìm thấy danh mục',
  },
  product: {
    notFound: 'Không tìm thấy sản phẩm',
  },
  supplier: {
    notFound: 'Không tìm thấy nhà cung cấp',
  },
  unit: {
    notFound: 'Không tìm thấy đơn vị',
  },
  inventory: {
    notFound: 'Không tìm thấy giao dịch tồn kho',
    alreadyConfirmed: 'Phiếu nhập đã được xác nhận trước đó',
    alreadyCanceled: 'Phiếu nhập đã bị hủy, không thể thao tác',
    cannotCancelCompleted: 'Không thể hủy phiếu nhập đã xác nhận',
    invalidStatusTransition: 'Không thể chuyển trạng thái từ {from} sang {to}',
  },
  sale: {
    notFound: 'Không tìm thấy đơn bán hàng',
    notEnoughStock: 'Không đủ tồn kho',
  },
  productBatch: {
    notFound: 'Không tìm thấy lô sản phẩm',
    invalidManufactureExpiryDate: 'Ngày sản xuất/ngày hết hạn không hợp lệ',
    expiryDateAfterManufactureDate: 'Ngày hết hạn phải sau ngày sản xuất',
    batchCodeExists: 'Mã lô đã tồn tại cho sản phẩm và kho này',
  },
};

module.exports = responseMessages;
