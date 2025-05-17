import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

# Danh sách các thư mục và tiêu đề
img_groups = [
    ('images/hocviensinhvien', '5.1', 'Học sinh/sinh viên'),
    ('images/giangvien', '5.2', 'Giảng viên'),
    ('images/quantrivien', '5.3', 'Quản trị viên')
]

doc = Document()

# Tạo style 'hinh' nếu chưa có
styles = doc.styles
if 'hinh' not in [s.name for s in styles]:
    hinh_style = styles.add_style('hinh', 1)
    hinh_style.font.name = 'Times New Roman'
    hinh_style.font.size = Pt(12)
    hinh_style.font.bold = True
    hinh_style.font.color.rgb = RGBColor(0, 0, 0)

# Thêm heading chương 5
doc.add_heading('Chương 5. Giao diện hệ thống', level=0)

for folder, group_code, group_title in img_groups:
    # Lấy danh sách file ảnh, sắp xếp theo ngày
    if not os.path.exists(folder):
        continue
    img_files = [f for f in os.listdir(folder) if f.lower().endswith('.png')]
    img_files.sort(key=lambda f: os.path.getmtime(os.path.join(folder, f)))
    # Thêm heading nhóm (5.1, 5.2, 5.3) là heading 2
    doc.add_heading(f'{group_code} {group_title}', level=2)
    # Lặp qua từng hình trong nhóm
    for idx, img_file in enumerate(img_files, 1):
        name = os.path.splitext(img_file)[0].replace('_', ' ')
        # Thêm heading mục 5.x.y là heading 3
        doc.add_heading(f'{group_code}.{idx} {name.capitalize()}', level=3)
        img_path = os.path.join(folder, img_file)
        doc.add_picture(img_path, width=Inches(5.5))
        caption = doc.add_paragraph(f'Hình {group_code}.{idx} {name.capitalize()}', style='hinh')
        caption.alignment = WD_ALIGN_PARAGRAPH.CENTER

doc.save('bao_cao_chuong5.docx')
print('Đã tạo file bao_cao_chuong5.docx thành công!')