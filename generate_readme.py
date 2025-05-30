import os
from pathlib import Path

def get_image_description(filename):
    # Remove file extension and convert to English descriptions
    name = os.path.splitext(filename)[0]
    descriptions = {
        "quantrivien": {
            "Quản lý thống kê": "Statistics Management",
            "Quản lý khóa học (xem nội dung khóa học)": "Course Management (View Course Content)",
            "Đăng nhập quản trị viên": "Admin Login",
            "Quản lý thanh toán": "Payment Management",
            "Quản lý thanh toán (xem thông tin)": "Payment Management (View Information)",
            "Quản lý tài khoản cá nhân": "Personal Account Management",
            "Quản lý lớp học thuật": "Academic Class Management",
            "Quản lý lớp học thuật (hộp thoại)": "Academic Class Management (Dialog)",
            "Quản lý lớp học thuật (xem danh sách)": "Academic Class Management (View List)",
            "Quản lý lớp học thuật (thêm sinh viên)": "Academic Class Management (Add Student)",
            "Quản lý lớp học thuật (phân công)": "Academic Class Management (Assignment)",
            "Quản lý khóa học": "Course Management",
            "Quản lý khóa học (hộp thoại)": "Course Management (Dialog)",
            "Quản lý học viên và sinh viên": "Student Management",
            "Quản lý học viên và sinh viên (xem thông tin)": "Student Management (View Information)",
            "Quản lý giảng viên": "Lecturer Management",
            "Quản lý giảng viên (hộp thoại)": "Lecturer Management (Dialog)",
            "Quản lý giảng viên (truy cập trang giảng viên)": "Lecturer Management (Access Lecturer Page)",
            "Quản lý đánh giá": "Evaluation Management",
            "Danh mục": "Categories",
            "Danh mục (hộp thoại)": "Categories (Dialog)",
            "Hộp thoại chat": "Chat Dialog"
        },
        "giangvien": {
            "Hộp thoại chat": "Chat Dialog",
            "Quản lý bài trắc nghiệm": "Quiz Management",
            "Quản lý bài trắc nghiệm (thêm bài cho lớp học thuật)": "Quiz Management (Add Quiz for Academic Class)",
            "Quản lý bài trắc nghiệm (xem theo lớp)": "Quiz Management (View by Class)",
            "Quản lý bài trắc nghiệm (xem bài làm)": "Quiz Management (View Quiz Attempts)",
            "Quản lý nội dung khóa học": "Course Content Management",
            "Quản lý nội dung khóa học (tài liệu)": "Course Content Management (Documents)",
            "Quản lý nội dung khóa học (bài tập và trắc nghiệm)": "Course Content Management (Assignments and Quizzes)",
            "Quản lý nội dung khóa học (hộp thoại trắc nghiệm)": "Course Content Management (Quiz Dialog)",
            "Quản lý nội dung khóa học (hộp thoại bài tập)": "Course Content Management (Assignment Dialog)",
            "Quản lý nội dung khóa học (thêm nội dung)": "Course Content Management (Add Content)",
            "Quản lý nội dung khóa học (thêm phần học)": "Course Content Management (Add Learning Section)",
            "Quản lý nội dung khóa học (thêm tài liệu)": "Course Content Management (Add Document)",
            "Quản lý nội dung khóa học (xóa nội dung)": "Course Content Management (Delete Content)",
            "Quản lý thống kê": "Statistics Management",
            "Quản lý tài khoản": "Account Management",
            "Quản lý diễn đàn": "Forum Management",
            "Quản lý diễn đàn (xem diễn đàn)": "Forum Management (View Forum)",
            "Quản lý diễn đàn (hộp thoại)": "Forum Management (Dialog)",
            "Quản lý điểm danh": "Attendance Management",
            "Quản lý bài tập": "Assignment Management",
            "Quản lý bài tập (chấm điểm)": "Assignment Management (Grading)",
            "Quản lý bài tập (thêm bài cho lớp học thuật)": "Assignment Management (Add Assignment for Academic Class)",
            "Quản lý bài tập (xem file nộp)": "Assignment Management (View Submitted Files)",
            "Đăng nhập giảng viên": "Lecturer Login",
            "Quản lý thông báo": "Notification Management",
            "Quản lý lớp học thuật": "Academic Class Management",
            "Quản lý lớp học thuật (hộp thoại)": "Academic Class Management (Dialog)",
            "Quản lý lớp học thuật (xem sinh viên)": "Academic Class Management (View Students)",
            "Quản lý lớp học thuật (thêm sinh viên)": "Academic Class Management (Add Student)",
            "Quản lý lớp học thuật (thêm khóa học)": "Academic Class Management (Add Course)",
            "Quản lý lịch dạy": "Teaching Schedule Management",
            "Quản lý lịch dạy (hộp thoại)": "Teaching Schedule Management (Dialog)",
            "Quản lý khóa học": "Course Management",
            "Quản lý khóa học (hộp thoại)": "Course Management (Dialog)",
            "Quản lý học sinh sinh viên": "Student Management",
            "Quản lý học sinh sinh viên (cảnh báo học vụ)": "Student Management (Academic Warning)",
            "Quản lý học sinh sinh viên (bảng điểm)": "Student Management (Grade Table)",
            "Quản lý đánh giá": "Evaluation Management"
        },
        "hocviensinhvien": {
            "Hộp thoại chat": "Chat Dialog",
            "Trang cá nhân": "Personal Page",
            "Trang cá nhân tiến độ học": "Personal Page - Learning Progress",
            "Trang cá nhân thanh toán": "Personal Page - Payment",
            "Trang cá nhân chứng chỉ": "Personal Page - Certificates",
            "Trang cá nhân bảng điểm": "Personal Page - Grade Table",
            "Tìm kiếm thông tin": "Search Information",
            "Thông tin chi tiết giảng viên": "Lecturer Details",
            "Thông báo mail": "Email Notifications",
            "Thanh toán ZaloPay": "ZaloPay Payment",
            "Nộp bài tập": "Submit Assignment",
            "Làm bài trắc nghiệm": "Take Quiz",
            "Kết quả bài tập": "Assignment Results",
            "Hiển thị điểm và đáp án": "Display Scores and Answers",
            "Giao diện chatbot": "Chatbot Interface",
            "Danh sách giảng viên": "Lecturer List",
            "Đăng nhập": "Login",
            "Đăng ký": "Register",
            "Đăng ký khóa học": "Course Registration",
            "Chi tiết nội dung học video": "Learning Content Details - Video",
            "Chi tiết nội dung học văn bản": "Learning Content Details - Text",
            "Chi tiết nội dung học slide": "Learning Content Details - Slides",
            "Chi tiết nội dung học làm bài tập": "Learning Content Details - Assignment",
            "Chi tiết nội dung học làm trắc nghiệm": "Learning Content Details - Quiz",
            "Chi tiết nội dung học xem tài liệu": "Learning Content Details - View Document",
            "Chi tiết diễn đàn": "Forum Details",
            "Các lớp học trực tuyến": "Online Classes",
            "Các khóa học tham gia": "Enrolled Courses",
            "Các diễn đàn": "Forums",
            "Các bài tập và trắc nghiệm": "Assignments and Quizzes",
            "Chi tiết khóa học": "Course Details",
            "Danh sách khóa học": "Course List",
            "Trang chủ": "Homepage",
            "Thông báo": "Notifications",
            "Tham gia học trực tuyến": "Join Online Learning"
        }
    }
    
    for role, role_descriptions in descriptions.items():
        if name in role_descriptions:
            return role_descriptions[name]
    return name

def generate_readme():
    base_path = Path("document/images")
    readme_content = ["# Learning Management System Screenshots\n",
                     "This document contains screenshots of the Learning Management System (LMS) interface for different user roles.\n"]
    
    for role_dir in ["quantrivien", "giangvien", "hocviensinhvien"]:
        role_path = base_path / role_dir
        if not role_path.exists():
            continue
            
        role_title = {
            "quantrivien": "## Administrator Interface",
            "giangvien": "## Lecturer Interface",
            "hocviensinhvien": "## Student Interface"
        }[role_dir]
        
        readme_content.append(f"\n{role_title}\n")
        
        for image_file in sorted(role_path.glob("*.png")):
            description = get_image_description(image_file.name)
            relative_path = f"document/images/{role_dir}/{image_file.name}"
            readme_content.append(f"### {description}\n")
            readme_content.append(f"![{description}]({relative_path})\n")
    
    with open("README.md", "w", encoding="utf-8") as f:
        f.write("\n".join(readme_content))

if __name__ == "__main__":
    generate_readme() 