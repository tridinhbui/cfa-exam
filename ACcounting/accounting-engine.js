/**
 * ==============================================
 * ACCOUNTING ENGINE - Core System
 * ==============================================
 * Hệ thống lõi xử lý nghiệp vụ kế toán
 * Hỗ trợ cả VAS (Việt Nam) và IFRS
 */

// ============================================
// CHART OF ACCOUNTS - HỆ THỐNG TÀI KHOẢN VAS
// ============================================
const ChartOfAccountsVAS = {
    // LOẠI 1 - TÀI SẢN NGẮN HẠN
    '111': { name: 'Tiền mặt', type: 'asset', nature: 'debit', parent: null },
    '1111': { name: 'Tiền Việt Nam', type: 'asset', nature: 'debit', parent: '111' },
    '1112': { name: 'Ngoại tệ', type: 'asset', nature: 'debit', parent: '111' },
    '1113': { name: 'Vàng bạc, kim khí quý', type: 'asset', nature: 'debit', parent: '111' },
    
    '112': { name: 'Tiền gửi ngân hàng', type: 'asset', nature: 'debit', parent: null },
    '1121': { name: 'Tiền Việt Nam', type: 'asset', nature: 'debit', parent: '112' },
    '1122': { name: 'Ngoại tệ', type: 'asset', nature: 'debit', parent: '112' },
    '1123': { name: 'Vàng bạc, kim khí quý', type: 'asset', nature: 'debit', parent: '112' },
    
    '113': { name: 'Tiền đang chuyển', type: 'asset', nature: 'debit', parent: null },
    
    '121': { name: 'Chứng khoán kinh doanh', type: 'asset', nature: 'debit', parent: null },
    '128': { name: 'Đầu tư nắm giữ đến ngày đáo hạn', type: 'asset', nature: 'debit', parent: null },
    
    '131': { name: 'Phải thu của khách hàng', type: 'asset', nature: 'debit', parent: null },
    '133': { name: 'Thuế GTGT được khấu trừ', type: 'asset', nature: 'debit', parent: null },
    '1331': { name: 'Thuế GTGT được khấu trừ của hàng hóa, dịch vụ', type: 'asset', nature: 'debit', parent: '133' },
    '1332': { name: 'Thuế GTGT được khấu trừ của TSCĐ', type: 'asset', nature: 'debit', parent: '133' },
    
    '136': { name: 'Phải thu nội bộ', type: 'asset', nature: 'debit', parent: null },
    '138': { name: 'Phải thu khác', type: 'asset', nature: 'debit', parent: null },
    '1381': { name: 'Tài sản thiếu chờ xử lý', type: 'asset', nature: 'debit', parent: '138' },
    '1385': { name: 'Phải thu về cổ phần hóa', type: 'asset', nature: 'debit', parent: '138' },
    '1388': { name: 'Phải thu khác', type: 'asset', nature: 'debit', parent: '138' },
    
    '141': { name: 'Tạm ứng', type: 'asset', nature: 'debit', parent: null },
    '142': { name: 'Chi phí trả trước ngắn hạn', type: 'asset', nature: 'debit', parent: null },
    
    '151': { name: 'Hàng mua đang đi đường', type: 'asset', nature: 'debit', parent: null },
    '152': { name: 'Nguyên liệu, vật liệu', type: 'asset', nature: 'debit', parent: null },
    '153': { name: 'Công cụ, dụng cụ', type: 'asset', nature: 'debit', parent: null },
    '154': { name: 'Chi phí SXKD dở dang', type: 'asset', nature: 'debit', parent: null },
    '155': { name: 'Thành phẩm', type: 'asset', nature: 'debit', parent: null },
    '156': { name: 'Hàng hóa', type: 'asset', nature: 'debit', parent: null },
    '1561': { name: 'Giá mua hàng hóa', type: 'asset', nature: 'debit', parent: '156' },
    '1562': { name: 'Chi phí thu mua hàng hóa', type: 'asset', nature: 'debit', parent: '156' },
    '1567': { name: 'Hàng hóa bất động sản', type: 'asset', nature: 'debit', parent: '156' },
    '157': { name: 'Hàng gửi đi bán', type: 'asset', nature: 'debit', parent: null },
    '158': { name: 'Hàng hóa kho bảo thuế', type: 'asset', nature: 'debit', parent: null },
    
    // LOẠI 2 - TÀI SẢN DÀI HẠN
    '211': { name: 'Tài sản cố định hữu hình', type: 'asset', nature: 'debit', parent: null },
    '2111': { name: 'Nhà cửa, vật kiến trúc', type: 'asset', nature: 'debit', parent: '211' },
    '2112': { name: 'Máy móc, thiết bị', type: 'asset', nature: 'debit', parent: '211' },
    '2113': { name: 'Phương tiện vận tải', type: 'asset', nature: 'debit', parent: '211' },
    '2114': { name: 'Thiết bị, dụng cụ quản lý', type: 'asset', nature: 'debit', parent: '211' },
    '2115': { name: 'Cây lâu năm, súc vật làm việc', type: 'asset', nature: 'debit', parent: '211' },
    '2118': { name: 'TSCĐ khác', type: 'asset', nature: 'debit', parent: '211' },
    
    '212': { name: 'Tài sản cố định thuê tài chính', type: 'asset', nature: 'debit', parent: null },
    '213': { name: 'Tài sản cố định vô hình', type: 'asset', nature: 'debit', parent: null },
    '2131': { name: 'Quyền sử dụng đất', type: 'asset', nature: 'debit', parent: '213' },
    '2132': { name: 'Quyền phát hành', type: 'asset', nature: 'debit', parent: '213' },
    '2133': { name: 'Bản quyền, bằng sáng chế', type: 'asset', nature: 'debit', parent: '213' },
    '2134': { name: 'Nhãn hiệu hàng hóa', type: 'asset', nature: 'debit', parent: '213' },
    '2135': { name: 'Phần mềm máy vi tính', type: 'asset', nature: 'debit', parent: '213' },
    '2136': { name: 'Giấy phép và giấy phép nhượng quyền', type: 'asset', nature: 'debit', parent: '213' },
    '2138': { name: 'TSCĐ vô hình khác', type: 'asset', nature: 'debit', parent: '213' },
    
    '214': { name: 'Hao mòn TSCĐ', type: 'asset', nature: 'credit', parent: null },
    '2141': { name: 'Hao mòn TSCĐ hữu hình', type: 'asset', nature: 'credit', parent: '214' },
    '2142': { name: 'Hao mòn TSCĐ thuê tài chính', type: 'asset', nature: 'credit', parent: '214' },
    '2143': { name: 'Hao mòn TSCĐ vô hình', type: 'asset', nature: 'credit', parent: '214' },
    '2147': { name: 'Hao mòn BĐS đầu tư', type: 'asset', nature: 'credit', parent: '214' },
    
    '217': { name: 'Bất động sản đầu tư', type: 'asset', nature: 'debit', parent: null },
    
    '221': { name: 'Đầu tư vào công ty con', type: 'asset', nature: 'debit', parent: null },
    '222': { name: 'Đầu tư vào công ty liên doanh, liên kết', type: 'asset', nature: 'debit', parent: null },
    '228': { name: 'Đầu tư khác', type: 'asset', nature: 'debit', parent: null },
    '229': { name: 'Dự phòng tổn thất tài sản', type: 'asset', nature: 'credit', parent: null },
    
    '241': { name: 'Xây dựng cơ bản dở dang', type: 'asset', nature: 'debit', parent: null },
    '242': { name: 'Chi phí trả trước dài hạn', type: 'asset', nature: 'debit', parent: null },
    '243': { name: 'Tài sản thuế thu nhập hoãn lại', type: 'asset', nature: 'debit', parent: null },
    '244': { name: 'Cầm cố, thế chấp, ký quỹ, ký cược', type: 'asset', nature: 'debit', parent: null },
    
    // LOẠI 3 - NỢ PHẢI TRẢ
    '331': { name: 'Phải trả người bán', type: 'liability', nature: 'credit', parent: null },
    '333': { name: 'Thuế và các khoản phải nộp Nhà nước', type: 'liability', nature: 'credit', parent: null },
    '3331': { name: 'Thuế GTGT phải nộp', type: 'liability', nature: 'credit', parent: '333' },
    '33311': { name: 'Thuế GTGT đầu ra', type: 'liability', nature: 'credit', parent: '3331' },
    '33312': { name: 'Thuế GTGT hàng nhập khẩu', type: 'liability', nature: 'credit', parent: '3331' },
    '3332': { name: 'Thuế tiêu thụ đặc biệt', type: 'liability', nature: 'credit', parent: '333' },
    '3333': { name: 'Thuế xuất, nhập khẩu', type: 'liability', nature: 'credit', parent: '333' },
    '3334': { name: 'Thuế thu nhập doanh nghiệp', type: 'liability', nature: 'credit', parent: '333' },
    '3335': { name: 'Thuế thu nhập cá nhân', type: 'liability', nature: 'credit', parent: '333' },
    '3336': { name: 'Thuế tài nguyên', type: 'liability', nature: 'credit', parent: '333' },
    '3337': { name: 'Thuế nhà đất, tiền thuê đất', type: 'liability', nature: 'credit', parent: '333' },
    '3338': { name: 'Thuế bảo vệ môi trường và các loại thuế khác', type: 'liability', nature: 'credit', parent: '333' },
    '3339': { name: 'Phí, lệ phí và các khoản phải nộp khác', type: 'liability', nature: 'credit', parent: '333' },
    
    '334': { name: 'Phải trả người lao động', type: 'liability', nature: 'credit', parent: null },
    '3341': { name: 'Phải trả công nhân viên', type: 'liability', nature: 'credit', parent: '334' },
    '3348': { name: 'Phải trả người lao động khác', type: 'liability', nature: 'credit', parent: '334' },
    
    '335': { name: 'Chi phí phải trả', type: 'liability', nature: 'credit', parent: null },
    '336': { name: 'Phải trả nội bộ', type: 'liability', nature: 'credit', parent: null },
    '337': { name: 'Thanh toán theo tiến độ kế hoạch HĐXD', type: 'liability', nature: 'credit', parent: null },
    '338': { name: 'Phải trả, phải nộp khác', type: 'liability', nature: 'credit', parent: null },
    '3381': { name: 'Tài sản thừa chờ giải quyết', type: 'liability', nature: 'credit', parent: '338' },
    '3382': { name: 'Kinh phí công đoàn', type: 'liability', nature: 'credit', parent: '338' },
    '3383': { name: 'Bảo hiểm xã hội', type: 'liability', nature: 'credit', parent: '338' },
    '3384': { name: 'Bảo hiểm y tế', type: 'liability', nature: 'credit', parent: '338' },
    '3385': { name: 'Phải trả về cổ phần hóa', type: 'liability', nature: 'credit', parent: '338' },
    '3386': { name: 'Bảo hiểm thất nghiệp', type: 'liability', nature: 'credit', parent: '338' },
    '3387': { name: 'Doanh thu chưa thực hiện', type: 'liability', nature: 'credit', parent: '338' },
    '3388': { name: 'Phải trả, phải nộp khác', type: 'liability', nature: 'credit', parent: '338' },
    
    '341': { name: 'Vay và nợ thuê tài chính', type: 'liability', nature: 'credit', parent: null },
    '3411': { name: 'Các khoản đi vay', type: 'liability', nature: 'credit', parent: '341' },
    '3412': { name: 'Nợ thuê tài chính', type: 'liability', nature: 'credit', parent: '341' },
    
    '343': { name: 'Trái phiếu phát hành', type: 'liability', nature: 'credit', parent: null },
    '344': { name: 'Nhận ký quỹ, ký cược', type: 'liability', nature: 'credit', parent: null },
    '347': { name: 'Thuế thu nhập hoãn lại phải trả', type: 'liability', nature: 'credit', parent: null },
    '352': { name: 'Dự phòng phải trả', type: 'liability', nature: 'credit', parent: null },
    '353': { name: 'Quỹ khen thưởng, phúc lợi', type: 'liability', nature: 'credit', parent: null },
    '356': { name: 'Quỹ phát triển khoa học và công nghệ', type: 'liability', nature: 'credit', parent: null },
    
    // LOẠI 4 - VỐN CHỦ SỞ HỮU
    '411': { name: 'Vốn đầu tư của chủ sở hữu', type: 'equity', nature: 'credit', parent: null },
    '4111': { name: 'Vốn góp của chủ sở hữu', type: 'equity', nature: 'credit', parent: '411' },
    '4112': { name: 'Thặng dư vốn cổ phần', type: 'equity', nature: 'credit', parent: '411' },
    '4113': { name: 'Quyền chọn chuyển đổi trái phiếu', type: 'equity', nature: 'credit', parent: '411' },
    '4118': { name: 'Vốn khác', type: 'equity', nature: 'credit', parent: '411' },
    
    '412': { name: 'Chênh lệch đánh giá lại tài sản', type: 'equity', nature: 'credit', parent: null },
    '413': { name: 'Chênh lệch tỷ giá hối đoái', type: 'equity', nature: 'credit', parent: null },
    '414': { name: 'Quỹ đầu tư phát triển', type: 'equity', nature: 'credit', parent: null },
    '417': { name: 'Quỹ dự phòng tài chính', type: 'equity', nature: 'credit', parent: null },
    '418': { name: 'Quỹ khác thuộc vốn chủ sở hữu', type: 'equity', nature: 'credit', parent: null },
    '419': { name: 'Cổ phiếu quỹ', type: 'equity', nature: 'debit', parent: null },
    '421': { name: 'Lợi nhuận sau thuế chưa phân phối', type: 'equity', nature: 'credit', parent: null },
    '4211': { name: 'LNST chưa phân phối năm trước', type: 'equity', nature: 'credit', parent: '421' },
    '4212': { name: 'LNST chưa phân phối năm nay', type: 'equity', nature: 'credit', parent: '421' },
    
    '441': { name: 'Nguồn vốn đầu tư XDCB', type: 'equity', nature: 'credit', parent: null },
    '461': { name: 'Nguồn kinh phí sự nghiệp', type: 'equity', nature: 'credit', parent: null },
    '466': { name: 'Nguồn kinh phí đã hình thành TSCĐ', type: 'equity', nature: 'credit', parent: null },
    
    // LOẠI 5 - DOANH THU
    '511': { name: 'Doanh thu bán hàng và cung cấp dịch vụ', type: 'revenue', nature: 'credit', parent: null },
    '5111': { name: 'Doanh thu bán hàng hóa', type: 'revenue', nature: 'credit', parent: '511' },
    '5112': { name: 'Doanh thu bán các thành phẩm', type: 'revenue', nature: 'credit', parent: '511' },
    '5113': { name: 'Doanh thu cung cấp dịch vụ', type: 'revenue', nature: 'credit', parent: '511' },
    '5114': { name: 'Doanh thu trợ cấp, trợ giá', type: 'revenue', nature: 'credit', parent: '511' },
    '5117': { name: 'Doanh thu kinh doanh BĐS đầu tư', type: 'revenue', nature: 'credit', parent: '511' },
    '5118': { name: 'Doanh thu khác', type: 'revenue', nature: 'credit', parent: '511' },
    
    '515': { name: 'Doanh thu hoạt động tài chính', type: 'revenue', nature: 'credit', parent: null },
    
    '521': { name: 'Các khoản giảm trừ doanh thu', type: 'revenue', nature: 'debit', parent: null },
    '5211': { name: 'Chiết khấu thương mại', type: 'revenue', nature: 'debit', parent: '521' },
    '5212': { name: 'Hàng bán bị trả lại', type: 'revenue', nature: 'debit', parent: '521' },
    '5213': { name: 'Giảm giá hàng bán', type: 'revenue', nature: 'debit', parent: '521' },
    
    // LOẠI 6 - CHI PHÍ SẢN XUẤT, KINH DOANH
    '611': { name: 'Mua hàng', type: 'expense', nature: 'debit', parent: null },
    '621': { name: 'Chi phí nguyên liệu, vật liệu trực tiếp', type: 'expense', nature: 'debit', parent: null },
    '622': { name: 'Chi phí nhân công trực tiếp', type: 'expense', nature: 'debit', parent: null },
    '623': { name: 'Chi phí sử dụng máy thi công', type: 'expense', nature: 'debit', parent: null },
    '627': { name: 'Chi phí sản xuất chung', type: 'expense', nature: 'debit', parent: null },
    '6271': { name: 'Chi phí nhân viên phân xưởng', type: 'expense', nature: 'debit', parent: '627' },
    '6272': { name: 'Chi phí vật liệu', type: 'expense', nature: 'debit', parent: '627' },
    '6273': { name: 'Chi phí dụng cụ sản xuất', type: 'expense', nature: 'debit', parent: '627' },
    '6274': { name: 'Chi phí khấu hao TSCĐ', type: 'expense', nature: 'debit', parent: '627' },
    '6277': { name: 'Chi phí dịch vụ mua ngoài', type: 'expense', nature: 'debit', parent: '627' },
    '6278': { name: 'Chi phí bằng tiền khác', type: 'expense', nature: 'debit', parent: '627' },
    
    '631': { name: 'Giá thành sản xuất', type: 'expense', nature: 'debit', parent: null },
    '632': { name: 'Giá vốn hàng bán', type: 'expense', nature: 'debit', parent: null },
    '635': { name: 'Chi phí tài chính', type: 'expense', nature: 'debit', parent: null },
    
    '641': { name: 'Chi phí bán hàng', type: 'expense', nature: 'debit', parent: null },
    '6411': { name: 'Chi phí nhân viên', type: 'expense', nature: 'debit', parent: '641' },
    '6412': { name: 'Chi phí vật liệu, bao bì', type: 'expense', nature: 'debit', parent: '641' },
    '6413': { name: 'Chi phí dụng cụ, đồ dùng', type: 'expense', nature: 'debit', parent: '641' },
    '6414': { name: 'Chi phí khấu hao TSCĐ', type: 'expense', nature: 'debit', parent: '641' },
    '6415': { name: 'Chi phí bảo hành', type: 'expense', nature: 'debit', parent: '641' },
    '6417': { name: 'Chi phí dịch vụ mua ngoài', type: 'expense', nature: 'debit', parent: '641' },
    '6418': { name: 'Chi phí bằng tiền khác', type: 'expense', nature: 'debit', parent: '641' },
    
    '642': { name: 'Chi phí quản lý doanh nghiệp', type: 'expense', nature: 'debit', parent: null },
    '6421': { name: 'Chi phí nhân viên quản lý', type: 'expense', nature: 'debit', parent: '642' },
    '6422': { name: 'Chi phí vật liệu quản lý', type: 'expense', nature: 'debit', parent: '642' },
    '6423': { name: 'Chi phí đồ dùng văn phòng', type: 'expense', nature: 'debit', parent: '642' },
    '6424': { name: 'Chi phí khấu hao TSCĐ', type: 'expense', nature: 'debit', parent: '642' },
    '6425': { name: 'Thuế, phí và lệ phí', type: 'expense', nature: 'debit', parent: '642' },
    '6426': { name: 'Chi phí dự phòng', type: 'expense', nature: 'debit', parent: '642' },
    '6427': { name: 'Chi phí dịch vụ mua ngoài', type: 'expense', nature: 'debit', parent: '642' },
    '6428': { name: 'Chi phí bằng tiền khác', type: 'expense', nature: 'debit', parent: '642' },
    
    // LOẠI 7 - THU NHẬP KHÁC
    '711': { name: 'Thu nhập khác', type: 'revenue', nature: 'credit', parent: null },
    
    // LOẠI 8 - CHI PHÍ KHÁC
    '811': { name: 'Chi phí khác', type: 'expense', nature: 'debit', parent: null },
    '821': { name: 'Chi phí thuế thu nhập doanh nghiệp', type: 'expense', nature: 'debit', parent: null },
    '8211': { name: 'Chi phí thuế TNDN hiện hành', type: 'expense', nature: 'debit', parent: '821' },
    '8212': { name: 'Chi phí thuế TNDN hoãn lại', type: 'expense', nature: 'debit', parent: '821' },
    
    // LOẠI 9 - XÁC ĐỊNH KẾT QUẢ KINH DOANH
    '911': { name: 'Xác định kết quả kinh doanh', type: 'equity', nature: 'none', parent: null },
};

// ============================================
// SAP GL ACCOUNTS MAPPING
// ============================================
const SAPGLAccounts = {
    // Assets
    '100000': { name: 'Petty Cash', type: 'asset', nature: 'debit', vas: '1111' },
    '110000': { name: 'Bank - Checking', type: 'asset', nature: 'debit', vas: '1121' },
    '120000': { name: 'Accounts Receivable', type: 'asset', nature: 'debit', vas: '131' },
    '130000': { name: 'Input Tax', type: 'asset', nature: 'debit', vas: '1331' },
    '140000': { name: 'Raw Materials', type: 'asset', nature: 'debit', vas: '152' },
    '150000': { name: 'Finished Goods', type: 'asset', nature: 'debit', vas: '155' },
    '160000': { name: 'Trading Goods', type: 'asset', nature: 'debit', vas: '156' },
    '170000': { name: 'GR/IR Clearing', type: 'asset', nature: 'debit', vas: null },
    
    // Fixed Assets
    '200000': { name: 'Buildings', type: 'asset', nature: 'debit', vas: '2111' },
    '210000': { name: 'Machinery & Equipment', type: 'asset', nature: 'debit', vas: '2112' },
    '220000': { name: 'Vehicles', type: 'asset', nature: 'debit', vas: '2113' },
    '230000': { name: 'Accumulated Depreciation', type: 'asset', nature: 'credit', vas: '2141' },
    
    // Liabilities
    '300000': { name: 'Accounts Payable', type: 'liability', nature: 'credit', vas: '331' },
    '310000': { name: 'Output Tax', type: 'liability', nature: 'credit', vas: '33311' },
    '320000': { name: 'Accrued Expenses', type: 'liability', nature: 'credit', vas: '335' },
    '330000': { name: 'Wages Payable', type: 'liability', nature: 'credit', vas: '334' },
    '340000': { name: 'Bank Loans', type: 'liability', nature: 'credit', vas: '3411' },
    
    // Equity
    '400000': { name: 'Share Capital', type: 'equity', nature: 'credit', vas: '4111' },
    '410000': { name: 'Retained Earnings', type: 'equity', nature: 'credit', vas: '421' },
    
    // Revenue
    '500000': { name: 'Sales Revenue', type: 'revenue', nature: 'credit', vas: '5111' },
    '510000': { name: 'Service Revenue', type: 'revenue', nature: 'credit', vas: '5113' },
    '520000': { name: 'Other Income', type: 'revenue', nature: 'credit', vas: '711' },
    
    // Expenses
    '600000': { name: 'Cost of Goods Sold', type: 'expense', nature: 'debit', vas: '632' },
    '610000': { name: 'Raw Material Consumption', type: 'expense', nature: 'debit', vas: '621' },
    '620000': { name: 'Direct Labor', type: 'expense', nature: 'debit', vas: '622' },
    '630000': { name: 'Manufacturing Overhead', type: 'expense', nature: 'debit', vas: '627' },
    '640000': { name: 'Depreciation Expense', type: 'expense', nature: 'debit', vas: '6274' },
    '650000': { name: 'Selling Expenses', type: 'expense', nature: 'debit', vas: '641' },
    '660000': { name: 'Administrative Expenses', type: 'expense', nature: 'debit', vas: '642' },
    '670000': { name: 'Financial Expenses', type: 'expense', nature: 'debit', vas: '635' },
};

// ============================================
// ACCOUNTING ENGINE CLASS
// ============================================
class AccountingEngine {
    constructor() {
        this.mode = 'MISA'; // 'MISA' or 'SAP'
        this.chartOfAccounts = { ...ChartOfAccountsVAS };
        this.sapAccounts = { ...SAPGLAccounts };
        this.journalEntries = [];
        this.documents = [];
        this.partners = [];
        this.items = [];
        this.inventory = {};
        this.accountBalances = {};
        this.documentCounters = {};
        this.auditLog = [];
        this.lockedPeriods = [];
        
        this.initializeData();
    }
    
    /**
     * Get storage key for current company context
     */
    getStorageKey() {
        if (window.companyContext) {
            return window.companyContext.getStorageKey('accountingData');
        }
        return 'accountingData'; // Fallback for backward compatibility
    }
    
    initializeData() {
        // Load from localStorage with company context
        const storageKey = this.getStorageKey();
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
            const data = JSON.parse(savedData);
            this.journalEntries = data.journalEntries || [];
            this.documents = data.documents || [];
            this.partners = data.partners || [];
            this.items = data.items || [];
            this.inventory = data.inventory || {};
            this.accountBalances = data.accountBalances || {};
            this.documentCounters = data.documentCounters || {};
            this.auditLog = data.auditLog || [];
            this.lockedPeriods = data.lockedPeriods || [];
        } else {
            this.initializeDefaultData();
        }
    }
    
    /**
     * Reload data (called when switching companies)
     */
    reloadData() {
        this.journalEntries = [];
        this.documents = [];
        this.partners = [];
        this.items = [];
        this.inventory = {};
        this.accountBalances = {};
        this.documentCounters = {};
        this.auditLog = [];
        this.lockedPeriods = [];
        this.initializeData();
        
        // Emit event
        if (window.eventBus) {
            window.eventBus.emit(window.AppEvents.DATA_LOADED, {
                company: window.companyContext?.currentCompanyId
            });
        }
    }
    
    initializeDefaultData() {
        // Check if we should use training seeds
        const useTrainingSeeds = window.companyContext?.isTraining() && window.TrainingDataSeeds;
        
        if (useTrainingSeeds) {
            // Use rich training data seeds
            this.partners = [...window.TrainingDataSeeds.partners];
            this.items = [...window.TrainingDataSeeds.items];
            
            // Initialize account balances with training seeds
            this.initializeBalances();
            Object.entries(window.TrainingDataSeeds.initialBalances).forEach(([account, balance]) => {
                this.accountBalances[account] = { ...balance };
            });
        } else {
            // Default partners (production or fallback)
            this.partners = [
                { id: 'KH001', name: 'ABC Trading Co.', type: 'customer', address: '123 Le Loi St, D1, HCMC', taxId: '0123456789', balance: 0 },
                { id: 'KH002', name: 'XYZ Services Ltd.', type: 'customer', address: '456 Nguyen Hue St, D1, HCMC', taxId: '0987654321', balance: 0 },
                { id: 'NCC001', name: 'Material Supplier A', type: 'vendor', address: '789 Tran Hung Dao St, D5, HCMC', taxId: '1122334455', balance: 0 },
                { id: 'NCC002', name: 'Equipment Vendor B', type: 'vendor', address: '321 Vo Van Tan St, D3, HCMC', taxId: '5544332211', balance: 0 },
            ];
            
            // Default items
            this.items = [
                { id: 'VL001', name: 'Raw Material X', unit: 'kg', group: 'Raw Materials', account: '152', quantity: 0, value: 0 },
                { id: 'VL002', name: 'Raw Material Y', unit: 'liter', group: 'Raw Materials', account: '152', quantity: 0, value: 0 },
                { id: 'HH001', name: 'Product A', unit: 'unit', group: 'Trading Goods', account: '156', quantity: 0, value: 0 },
                { id: 'HH002', name: 'Product B', unit: 'set', group: 'Trading Goods', account: '156', quantity: 0, value: 0 },
                { id: 'TP001', name: 'Finished Good M', unit: 'unit', group: 'Finished Goods', account: '155', quantity: 0, value: 0 },
            ];
            
            // Initialize account balances
            this.initializeBalances();
        }
        
        // Document counters
        this.documentCounters = {
            PT: 0,  // Cash Receipt
            PC: 0,  // Cash Payment
            BC: 0,  // Bank Credit
            BN: 0,  // Bank Debit
            PN: 0,  // Goods Receipt
            PX: 0,  // Goods Issue
            HDB: 0, // Sales Invoice
            HDM: 0, // Purchase Invoice
            PKT: 0, // Journal Entry
        };
        
        this.auditLog = [];
        this.lockedPeriods = [];
        
        this.saveData();
    }
    
    initializeBalances() {
        // Initialize all accounts with zero balance
        Object.keys(this.chartOfAccounts).forEach(acc => {
            this.accountBalances[acc] = { debit: 0, credit: 0, balance: 0 };
        });
        
        // Set some initial balances for demo
        this.accountBalances['1111'] = { debit: 100000000, credit: 0, balance: 100000000 };
        this.accountBalances['1121'] = { debit: 500000000, credit: 0, balance: 500000000 };
        this.accountBalances['4111'] = { debit: 0, credit: 1000000000, balance: 1000000000 };
    }
    
    saveData() {
        const data = {
            journalEntries: this.journalEntries,
            documents: this.documents,
            partners: this.partners,
            items: this.items,
            inventory: this.inventory,
            accountBalances: this.accountBalances,
            documentCounters: this.documentCounters,
            auditLog: this.auditLog,
            lockedPeriods: this.lockedPeriods,
        };
        const storageKey = this.getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(data));
    }
    
    setMode(mode) {
        this.mode = mode;
    }
    
    // Generate document number
    generateDocNumber(type) {
        const year = new Date().getFullYear().toString().slice(-2);
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        this.documentCounters[type] = (this.documentCounters[type] || 0) + 1;
        const seq = this.documentCounters[type].toString().padStart(4, '0');
        this.saveData();
        return `${type}${year}${month}${seq}`;
    }
    
    // Get current date formatted
    getCurrentDate() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }
    
    // Format currency
    formatCurrency(amount, currency = 'VND') {
        if (currency === 'VND') {
            return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }
    
    // Validate journal entry (Debit = Credit)
    validateJournalEntry(entries) {
        let totalDebit = 0;
        let totalCredit = 0;
        
        entries.forEach(entry => {
            totalDebit += entry.debit || 0;
            totalCredit += entry.credit || 0;
        });
        
        return Math.abs(totalDebit - totalCredit) < 0.01;
    }
    
    // Post journal entry
    postJournalEntry(documentId, date, description, entries, metadata = {}) {
        // Emit posting start event
        if (window.eventBus) {
            window.eventBus.emit(window.AppEvents.POSTING_START, {
                documentId, date, description, entries
            });
        }
        
        // Validate
        if (!this.validateJournalEntry(entries)) {
            if (window.eventBus) {
                window.eventBus.emit(window.AppEvents.POSTING_FAILED, {
                    error: 'Journal entry not balanced! Total Debit ≠ Total Credit'
                });
            }
            throw new Error('Journal entry not balanced! Total Debit ≠ Total Credit');
        }
        
        // Check period lock (for production)
        if (window.companyContext?.isProduction()) {
            const postingPeriod = date.substring(0, 7); // YYYY-MM
            if (this.lockedPeriods.includes(postingPeriod)) {
                if (window.eventBus) {
                    window.eventBus.emit(window.AppEvents.POSTING_FAILED, {
                        error: `Period ${postingPeriod} is locked. Cannot post.`
                    });
                }
                throw new Error(`Period ${postingPeriod} is locked. Cannot post.`);
            }
        }
        
        // Create journal entry
        const journalEntry = {
            id: `JE${Date.now()}`,
            documentId,
            date,
            description,
            entries,
            metadata,
            postedAt: new Date().toISOString(),
            mode: this.mode,
            company: window.companyContext?.currentCompanyId || 'default'
        };
        
        // Update account balances
        entries.forEach(entry => {
            const account = entry.account;
            if (!this.accountBalances[account]) {
                this.accountBalances[account] = { debit: 0, credit: 0, balance: 0 };
            }
            
            this.accountBalances[account].debit += entry.debit || 0;
            this.accountBalances[account].credit += entry.credit || 0;
            
            // Calculate balance based on account nature
            const accountInfo = this.chartOfAccounts[account];
            if (accountInfo) {
                if (accountInfo.nature === 'debit') {
                    this.accountBalances[account].balance = 
                        this.accountBalances[account].debit - this.accountBalances[account].credit;
                } else {
                    this.accountBalances[account].balance = 
                        this.accountBalances[account].credit - this.accountBalances[account].debit;
                }
            }
        });
        
        this.journalEntries.push(journalEntry);
        
        // Add audit log entry (for production)
        if (window.companyContext?.isProduction()) {
            this.addAuditLog('POST', documentId, { journalEntryId: journalEntry.id });
        }
        
        this.saveData();
        
        // Emit posting success event
        if (window.eventBus) {
            window.eventBus.emit(window.AppEvents.POSTING_SUCCESS, {
                journalEntry,
                entries
            });
        }
        
        return journalEntry;
    }
    
    /**
     * Add audit log entry
     */
    addAuditLog(action, documentId, details = {}) {
        this.auditLog.push({
            id: `AL${Date.now()}`,
            timestamp: new Date().toISOString(),
            action,
            documentId,
            details,
            user: 'System' // In real app, would be current user
        });
    }
    
    /**
     * Lock a period (month)
     */
    lockPeriod(period) {
        if (!this.lockedPeriods.includes(period)) {
            this.lockedPeriods.push(period);
            this.addAuditLog('LOCK_PERIOD', null, { period });
            this.saveData();
        }
    }
    
    /**
     * Unlock a period
     */
    unlockPeriod(period) {
        const index = this.lockedPeriods.indexOf(period);
        if (index > -1) {
            this.lockedPeriods.splice(index, 1);
            this.addAuditLog('UNLOCK_PERIOD', null, { period });
            this.saveData();
        }
    }
    
    /**
     * Check if period is locked
     */
    isPeriodLocked(period) {
        return this.lockedPeriods.includes(period);
    }
    
    // Get account balance
    getAccountBalance(account) {
        return this.accountBalances[account] || { debit: 0, credit: 0, balance: 0 };
    }
    
    // Get partner by ID
    getPartner(id) {
        return this.partners.find(p => p.id === id);
    }
    
    // Get item by ID
    getItem(id) {
        return this.items.find(i => i.id === id);
    }
    
    // Update inventory
    updateInventory(itemId, warehouse, quantity, unitPrice, type) {
        const key = `${itemId}_${warehouse}`;
        if (!this.inventory[key]) {
            this.inventory[key] = { quantity: 0, value: 0 };
        }
        
        if (type === 'IN') {
            const newTotal = this.inventory[key].value + (quantity * unitPrice);
            const newQty = this.inventory[key].quantity + quantity;
            this.inventory[key].quantity = newQty;
            this.inventory[key].value = newTotal;
            this.inventory[key].avgCost = newQty > 0 ? newTotal / newQty : 0;
        } else if (type === 'OUT') {
            this.inventory[key].quantity -= quantity;
            // Using weighted average cost
            const costOut = quantity * (this.inventory[key].avgCost || unitPrice);
            this.inventory[key].value -= costOut;
        }
        
        // Update item total
        const item = this.getItem(itemId);
        if (item) {
            let totalQty = 0;
            let totalValue = 0;
            Object.keys(this.inventory).forEach(k => {
                if (k.startsWith(itemId + '_')) {
                    totalQty += this.inventory[k].quantity;
                    totalValue += this.inventory[k].value;
                }
            });
            item.quantity = totalQty;
            item.value = totalValue;
        }
        
        this.saveData();
    }
    
    // Update partner balance
    updatePartnerBalance(partnerId, amount, type) {
        const partner = this.getPartner(partnerId);
        if (partner) {
            if (type === 'DEBIT') {
                partner.balance += amount;
            } else {
                partner.balance -= amount;
            }
            this.saveData();
        }
    }
    
    // Create document
    createDocument(docData) {
        const doc = {
            id: docData.docNumber,
            ...docData,
            createdAt: new Date().toISOString(),
            status: 'posted'
        };
        this.documents.push(doc);
        this.saveData();
        return doc;
    }
    
    // Get documents by type
    getDocumentsByType(type) {
        return this.documents.filter(d => d.docType === type);
    }
    
    // Get recent documents
    getRecentDocuments(limit = 10) {
        return [...this.documents]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }
    
    // Calculate totals for dashboard
    getDashboardData() {
        return {
            cash: this.getAccountBalance('1111').balance + this.getAccountBalance('1112').balance,
            bank: this.getAccountBalance('1121').balance + this.getAccountBalance('1122').balance,
            receivable: this.getAccountBalance('131').balance,
            payable: this.getAccountBalance('331').balance,
        };
    }
    
    // Generate Trial Balance
    generateTrialBalance() {
        const trialBalance = [];
        
        Object.keys(this.chartOfAccounts).forEach(account => {
            const info = this.chartOfAccounts[account];
            const balance = this.getAccountBalance(account);
            
            if (balance.debit > 0 || balance.credit > 0) {
                trialBalance.push({
                    account,
                    name: info.name,
                    type: info.type,
                    openingDebit: 0,
                    openingCredit: 0,
                    periodDebit: balance.debit,
                    periodCredit: balance.credit,
                    closingDebit: info.nature === 'debit' ? balance.balance : 0,
                    closingCredit: info.nature === 'credit' ? balance.balance : 0,
                });
            }
        });
        
        return trialBalance.sort((a, b) => a.account.localeCompare(b.account));
    }
    
    // Suggest journal entry based on transaction type
    suggestJournalEntry(transactionType, data) {
        const suggestions = {
            // MISA suggestions
            'CASH_RECEIPT_CUSTOMER': {
                entries: [
                    { account: '1111', name: 'Tiền mặt', debit: data.amount, credit: 0 },
                    { account: '131', name: 'Phải thu khách hàng', debit: 0, credit: data.amount }
                ],
                explanation: 'Thu tiền mặt từ khách hàng làm tăng tiền mặt (Nợ 111) và giảm công nợ phải thu (Có 131)'
            },
            'CASH_RECEIPT_SALES': {
                entries: [
                    { account: '1111', name: 'Tiền mặt', debit: data.amount * 1.1, credit: 0 },
                    { account: '5111', name: 'Doanh thu bán hàng', debit: 0, credit: data.amount },
                    { account: '33311', name: 'Thuế GTGT đầu ra', debit: 0, credit: data.amount * 0.1 }
                ],
                explanation: 'Bán hàng thu tiền ngay ghi nhận doanh thu và thuế GTGT đầu ra'
            },
            'CASH_PAYMENT_VENDOR': {
                entries: [
                    { account: '331', name: 'Phải trả người bán', debit: data.amount, credit: 0 },
                    { account: '1111', name: 'Tiền mặt', debit: 0, credit: data.amount }
                ],
                explanation: 'Thanh toán tiền cho nhà cung cấp làm giảm công nợ phải trả (Nợ 331) và giảm tiền mặt (Có 111)'
            },
            'CASH_PAYMENT_EXPENSE': {
                entries: [
                    { account: data.expenseAccount || '6428', name: 'Chi phí', debit: data.amount, credit: 0 },
                    { account: '1111', name: 'Tiền mặt', debit: 0, credit: data.amount }
                ],
                explanation: 'Chi tiền mặt cho chi phí hoạt động'
            },
            'STOCK_IN_PURCHASE': {
                entries: [
                    { account: '152', name: 'Nguyên liệu, vật liệu', debit: data.amount, credit: 0 },
                    { account: '1331', name: 'Thuế GTGT được khấu trừ', debit: data.amount * 0.1, credit: 0 },
                    { account: '331', name: 'Phải trả người bán', debit: 0, credit: data.amount * 1.1 }
                ],
                explanation: 'Nhập kho nguyên vật liệu mua chịu: Tăng hàng tồn kho, thuế GTGT đầu vào được khấu trừ, và tăng công nợ phải trả'
            },
            'STOCK_OUT_PRODUCTION': {
                entries: [
                    { account: '621', name: 'Chi phí NVL trực tiếp', debit: data.amount, credit: 0 },
                    { account: '152', name: 'Nguyên liệu, vật liệu', debit: 0, credit: data.amount }
                ],
                explanation: 'Xuất kho nguyên vật liệu cho sản xuất: Tăng chi phí NVL trực tiếp và giảm hàng tồn kho'
            },
            'SALARY_EXPENSE': {
                entries: [
                    { account: '6421', name: 'Chi phí nhân viên quản lý', debit: data.amount, credit: 0 },
                    { account: '334', name: 'Phải trả người lao động', debit: 0, credit: data.amount }
                ],
                explanation: 'Tính lương phải trả cho nhân viên: Ghi nhận chi phí tiền lương và nợ phải trả người lao động'
            },
            'SALARY_PAYMENT': {
                entries: [
                    { account: '334', name: 'Phải trả người lao động', debit: data.amount, credit: 0 },
                    { account: '1121', name: 'Tiền gửi ngân hàng', debit: 0, credit: data.amount }
                ],
                explanation: 'Chi trả lương cho nhân viên qua ngân hàng'
            },
            'DEPRECIATION': {
                entries: [
                    { account: '6274', name: 'Chi phí khấu hao TSCĐ', debit: data.amount, credit: 0 },
                    { account: '2141', name: 'Hao mòn TSCĐ hữu hình', debit: 0, credit: data.amount }
                ],
                explanation: 'Trích khấu hao tài sản cố định: Tăng chi phí khấu hao và tăng giá trị hao mòn lũy kế'
            },
            
            // SAP-style suggestions
            'SAP_GR_STOCK': {
                entries: [
                    { account: '140000', name: 'Raw Materials', debit: data.amount, credit: 0 },
                    { account: '170000', name: 'GR/IR Clearing', debit: 0, credit: data.amount }
                ],
                explanation: 'Goods Receipt (MIGO): Inventory is debited and GR/IR clearing account is credited. Invoice receipt will clear GR/IR against vendor.'
            },
            'SAP_IR_VENDOR': {
                entries: [
                    { account: '170000', name: 'GR/IR Clearing', debit: data.amount, credit: 0 },
                    { account: '130000', name: 'Input Tax', debit: data.amount * 0.1, credit: 0 },
                    { account: '300000', name: 'Accounts Payable', debit: 0, credit: data.amount * 1.1 }
                ],
                explanation: 'Invoice Receipt (MIRO): GR/IR clearing is debited, input tax recorded, and vendor liability created.'
            },
            'SAP_CUSTOMER_INVOICE': {
                entries: [
                    { account: '120000', name: 'Accounts Receivable', debit: data.amount * 1.1, credit: 0 },
                    { account: '500000', name: 'Sales Revenue', debit: 0, credit: data.amount },
                    { account: '310000', name: 'Output Tax', debit: 0, credit: data.amount * 0.1 }
                ],
                explanation: 'Customer Invoice (FB70): Creates receivable from customer, recognizes revenue, and records output tax liability.'
            },
            'SAP_VENDOR_PAYMENT': {
                entries: [
                    { account: '300000', name: 'Accounts Payable', debit: data.amount, credit: 0 },
                    { account: '110000', name: 'Bank - Checking', debit: 0, credit: data.amount }
                ],
                explanation: 'Vendor Payment (F-53): Clears vendor liability and reduces bank balance.'
            },
            'SAP_CUSTOMER_PAYMENT': {
                entries: [
                    { account: '110000', name: 'Bank - Checking', debit: data.amount, credit: 0 },
                    { account: '120000', name: 'Accounts Receivable', debit: 0, credit: data.amount }
                ],
                explanation: 'Customer Payment (F-28): Increases bank balance and clears customer receivable.'
            },
            'SAP_DEPRECIATION': {
                entries: [
                    { account: '640000', name: 'Depreciation Expense', debit: data.amount, credit: 0 },
                    { account: '230000', name: 'Accumulated Depreciation', debit: 0, credit: data.amount }
                ],
                explanation: 'Depreciation Run (AFAB): Records periodic depreciation expense and increases accumulated depreciation.'
            }
        };
        
        return suggestions[transactionType] || null;
    }
    
    // Reset all data
    resetData() {
        localStorage.removeItem('accountingData');
        this.journalEntries = [];
        this.documents = [];
        this.partners = [];
        this.items = [];
        this.inventory = {};
        this.accountBalances = {};
        this.documentCounters = {};
        this.initializeDefaultData();
    }
}

// Initialize global engine instance
const accountingEngine = new AccountingEngine();


