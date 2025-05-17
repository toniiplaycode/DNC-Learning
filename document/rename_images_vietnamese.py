import os

# Mapping học sinh/sinh viên
mapping_hocvien = {
    'dangky.png': 'Đăng ký.png',
    'dangnhap.png': 'Đăng nhập.png',
    'trangcanhan(thanhtoan).png': 'Trang cá nhân thanh toán.png',
    'trangcanhan(bangdiem).png': 'Trang cá nhân bảng điểm.png',
    'trangcanhan(chungchi).png': 'Trang cá nhân chứng chỉ.png',
    'trangcanhan(tiendohoc).png': 'Trang cá nhân tiến độ học.png',
    'trangcanhan.png': 'Trang cá nhân.png',
    'chitietnoidunghoc(lambaitap).png': 'Chi tiết nội dung học làm bài tập.png',
    'chitietnoidunghoc(txt).png': 'Chi tiết nội dung học văn bản.png',
    'chitietnoidunghoc(xemtailieu).png': 'Chi tiết nội dung học xem tài liệu.png',
    'chitietnoidunghoc(lamtracnghiem).png': 'Chi tiết nội dung học làm trắc nghiệm.png',
    'chitietnoidunghoc(slide).png': 'Chi tiết nội dung học slide.png',
    'chitietnoidunghoc(video).png': 'Chi tiết nội dung học video.png',
    'cackhoahocthamgia.png': 'Các khóa học tham gia.png',
    'thamgiahoc.png': 'Tham gia học.png',
    'caclophoctructuyen.png': 'Các lớp học trực tuyến.png',
    'thongtinchitietgiangvien.png': 'Thông tin chi tiết giảng viên.png',
    'ketquabaitap.png': 'Kết quả bài tập.png',
    'nopbaitap.png': 'Nộp bài tập.png',
    'thongbao.png': 'Thông báo.png',
    'hienthidiemvadapan.png': 'Hiển thị điểm và đáp án.png',
    'lambaitracnghiem.png': 'Làm bài trắc nghiệm.png',
    'cacbaitapvatracnghiem.png': 'Các bài tập và trắc nghiệm.png',
    'chatbot.png': 'Giao diện chatbot.png',
    'timkiemthongtin.png': 'Tìm kiếm thông tin.png',
    'chatbox.png': 'Hộp thoại chat.png',
    'chitietdiendan.png': 'Chi tiết diễn đàn.png',
    'cacdiendan.png': 'Các diễn đàn.png',
    'cacgiangvien.png': 'Danh sách giảng viên.png',
    'thanhtoanzalopay.png': 'Thanh toán ZaloPay.png',
    'dangkykhoahoc.png': 'Đăng ký khóa học.png',
    'chitietkhoahoc.png': 'Chi tiết khóa học.png',
    'cackhoahoc.png': 'Danh sách khóa học.png',
    'trangchu.png': 'Trang chủ.png',
}

# Mapping giảng viên
mapping_gv = {
    'quanlytaikhoan.png': 'Quản lý tài khoản.png',
    'quanlythongbao.png': 'Quản lý thông báo.png',
    'quanlythongke.png': 'Quản lý thống kê.png',
    'quanlydiendan(xemdiendan).png': 'Quản lý diễn đàn (xem diễn đàn).png',
    'quanlydiendandialog.png': 'Quản lý diễn đàn (hộp thoại).png',
    'quanlydiendan.png': 'Quản lý diễn đàn.png',
    'quanlydanhgia.png': 'Quản lý đánh giá.png',
    'quanlydiemdanh.png': 'Quản lý điểm danh.png',
    'quanlylichdaydialog.png': 'Quản lý lịch dạy (hộp thoại).png',
    'quanlylichday.png': 'Quản lý lịch dạy.png',
    'chatbox.png': 'Hộp thoại chat.png',
    'quanlybaitapdialog(thembaicholophocthuat).png': 'Quản lý bài tập (thêm bài cho lớp học thuật).png',
    'quanlybaitracnghiemdialog(thembaicholophocthuat).png': 'Quản lý bài trắc nghiệm (thêm bài cho lớp học thuật).png',
    'quanlybaitracnghiem(xembailam).png': 'Quản lý bài trắc nghiệm (xem bài làm).png',
    'quanlybaitracnghiem(xemtheolop).png': 'Quản lý bài trắc nghiệm (xem theo lớp).png',
    'quanlybaitracnghiem.png': 'Quản lý bài trắc nghiệm.png',
    'quanlybaitap(xemfilenop).png': 'Quản lý bài tập (xem file nộp).png',
    'quanlybaitap(chamdiem).png': 'Quản lý bài tập (chấm điểm).png',
    'quanlybaitap.png': 'Quản lý bài tập.png',
    'quanlylophocthuat(themsinhvien).png': 'Quản lý lớp học thuật (thêm sinh viên).png',
    'quanlylophocthuat(xemsinhvien).png': 'Quản lý lớp học thuật (xem sinh viên).png',
    'quanlylophocthuat(themkhoahoc).png': 'Quản lý lớp học thuật (thêm khóa học).png',
    'quanlylophocthuatdialog.png': 'Quản lý lớp học thuật (hộp thoại).png',
    'quanlylophocthuat.png': 'Quản lý lớp học thuật.png',
    'quanlyhocviensinhvien(canhbaohocvu).png': 'Quản lý học viên/sinh viên (cảnh báo học vụ).png',
    'quanlyhocviensinhvien(bangdiem).png': 'Quản lý học viên/sinh viên (bảng điểm).png',
    'quanlyhocviensinhvien2.png': 'Quản lý học viên/sinh viên 2.png',
    'quanlyhocviensinhvien.png': 'Quản lý học viên/sinh viên.png',
    'quanlynoidungkhoahoc(dialogbaitap).png': 'Quản lý nội dung khóa học (hộp thoại bài tập).png',
    'quanlynoidungkhoahoc(dialogtracnghiem).png': 'Quản lý nội dung khóa học (hộp thoại trắc nghiệm).png',
    'quanlynoidungkhoahoc(baitapvatracnghiem).png': 'Quản lý nội dung khóa học (bài tập và trắc nghiệm).png',
    'quanlynoidungkhoahoc(tailieu).png': 'Quản lý nội dung khóa học (tài liệu).png',
    'quanlynoidungkhoahoc(themtailieu).png': 'Quản lý nội dung khóa học (thêm tài liệu).png',
    'quanlynoidungkhoahoc(xoanoidung).png': 'Quản lý nội dung khóa học (xóa nội dung).png',
    'quanlynoidungkhoahoc(themnoidung).png': 'Quản lý nội dung khóa học (thêm nội dung).png',
    'quanlynoidungkhoahoc(themphanhoc).png': 'Quản lý nội dung khóa học (thêm phần học).png',
    'quanlynoidungkhoahoc.png': 'Quản lý nội dung khóa học.png',
    'quanlykhoahocdialog.png': 'Quản lý khóa học (hộp thoại).png',
    'quanlykhoahoc.png': 'Quản lý khóa học.png',
    'dangnhapgiangvien.png': 'Đăng nhập giảng viên.png',
}

# Mapping quản trị viên
mapping_admin = {
    'quanlytaikhoancanhan.png': 'Quản lý tài khoản cá nhân.png',
    'quanlydanhgia.png': 'Quản lý đánh giá.png',
    'quanlythongke.png': 'Quản lý thống kê.png',
    'quanlythanhtoan(xemthongtin).png': 'Quản lý thanh toán (xem thông tin).png',
    'quanlythanhtoan.png': 'Quản lý thanh toán.png',
    'danhmucdialog.png': 'Danh mục (hộp thoại).png',
    'danhmuc.png': 'Danh mục.png',
    'chatbox.png': 'Hộp thoại chat.png',
    'quanlylophocthuat(themsinhvien).png': 'Quản lý lớp học thuật (thêm sinh viên).png',
    'quanlylophocthuat(xemdanhsach).png': 'Quản lý lớp học thuật (xem danh sách).png',
    'quanlylophocthuat(phancong).png': 'Quản lý lớp học thuật (phân công).png',
    'quanlylophocthuatdialog.png': 'Quản lý lớp học thuật (hộp thoại).png',
    'quanlylophocthuat.png': 'Quản lý lớp học thuật.png',
    'quanlyhocvien2.png': 'Quản lý học viên 2.png',
    'quanlyhocvien(xemthongtin).png': 'Quản lý học viên (xem thông tin).png',
    'quanlyhocvien.png': 'Quản lý học viên.png',
    'quanlygiangvien(truycaptranggiangvien).png': 'Quản lý giảng viên (truy cập trang giảng viên).png',
    'quanlygiangviendialog.png': 'Quản lý giảng viên (hộp thoại).png',
    'quanlygiangvien.png': 'Quản lý giảng viên.png',
    'quanlykhoahoc(xembnoidungkhoahoc).png': 'Quản lý khóa học (xem nội dung khóa học).png',
    'quanlykhoahocdialog.png': 'Quản lý khóa học (hộp thoại).png',
    'quanlykhoahoc.png': 'Quản lý khóa học.png',
    'dangnhap.png': 'Đăng nhập quản trị viên.png',
}

# Gộp 3 mapping
mapping = {}
# mapping.update(mapping_hocvien)
mapping.update(mapping_gv)
# mapping.update(mapping_admin)

folders = [
    'images/hocviensinhvien',
    'images/giangvien',
    'images/quantrivien'
]

for folder in folders:
    if not os.path.exists(folder):
        continue
    for filename in os.listdir(folder):
        if filename.endswith('.png'):
            new_name = mapping.get(filename)
            if not new_name:
                # Nếu không có trong mapping, chỉ thay _ thành dấu cách và viết hoa chữ cái đầu mỗi từ
                name_no_ext = os.path.splitext(filename)[0]
                new_name = name_no_ext.replace('_', ' ').capitalize() + '.png'
            old_path = os.path.join(folder, filename)
            new_path = os.path.join(folder, new_name)
            try:
                os.rename(old_path, new_path)
                print(f"Đã đổi tên: {filename} -> {new_name}")
            except FileNotFoundError:
                print(f"Không tìm thấy file: {old_path}")
            except Exception as e:
                print(f"Lỗi khi đổi tên {filename}: {e}") 