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
    notFound: 'Không tìm thấy cửa hàng',
  },
  warehouse: {
    notFound: 'Không tìm thấy kho',
  },
  product: {
    notFound: 'Không tìm thấy sản phẩm',
    excel: {
      invalidFile: 'File không hợp lệ. Vui lòng tải lên file Excel (.xlsx, .xls)',
      noData: 'File Excel không có dữ liệu (chỉ có header hoặc rỗng)',
      importSuccess: 'Nhập sản phẩm thành công',
    },
    imageInvalidType: 'Chỉ chấp nhận ảnh định dạng JPG, PNG hoặc WEBP',
    imageTooLarge: 'Ảnh vượt quá kích thước cho phép (tối đa 2MB)',
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
    cannotUpdateNonPending: 'Chỉ có thể cập nhật phiếu nhập đang chờ xác nhận',
    cannotDeleteNonPending: 'Chỉ có thể xóa phiếu nhập đang chờ xác nhận',
    invalidStatusTransition: 'Không thể chuyển trạng thái từ {from} sang {to}',
  },
  sale: {
    notFound: 'Không tìm thấy đơn bán hàng',
    notEnoughStock: 'Không đủ tồn kho',
    batchExpired: 'Lô sản phẩm đã hết hạn, vui lòng chọn lô khác',
    branchWarehouseMismatch: 'Chi nhánh không khớp với kho xuất',
  },
  productBatch: {
    notFound: 'Không tìm thấy lô sản phẩm',
    invalidManufactureExpiryDate: 'Ngày sản xuất/ngày hết hạn không hợp lệ',
    expiryDateAfterManufactureDate: 'Ngày hết hạn phải sau ngày sản xuất',
    batchCodeExists: 'Mã lô đã tồn tại cho sản phẩm và kho này',
  },
};

module.exports = responseMessages;
