from docx import Document

# Dữ liệu chi tiết cho từng bảng (chỉ trích xuất các trường chính, bạn có thể bổ sung mô tả nếu muốn)
db_schema = [
    {
        "name": "academic_class_courses",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("class_id", "bigint", "FK", "Tham chiếu academic_classes(id)"),
            ("course_id", "bigint", "FK", "Tham chiếu courses(id)"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "academic_class_instructors",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("class_id", "bigint", "FK", "Tham chiếu academic_classes(id)"),
            ("instructor_id", "bigint", "FK", "Tham chiếu user_instructors(id)"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "academic_classes",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("code", "varchar(20)", "UNIQUE", "Mã lớp"),
            ("name", "varchar(255)", "", "Tên lớp"),
            ("academic_year", "varchar(20)", "", "Năm học"),
            ("status", "enum", "", "Trạng thái"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "assignment_submissions",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("assignment_id", "bigint", "FK", "Tham chiếu assignments(id)"),
            ("user_id", "bigint", "FK", "Tham chiếu users(id)"),
            ("submission_text", "text", "", "Nội dung nộp"),
            ("file_url", "varchar(255)", "", "File đính kèm"),
            ("submitted_at", "timestamp", "", "Thời gian nộp"),
            ("status", "enum", "", "Trạng thái"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "assignments",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("lesson_id", "bigint", "FK", "Tham chiếu course_lessons(id)"),
            ("academic_class_id", "bigint", "FK", "Tham chiếu academic_classes(id)"),
            ("title", "varchar(255)", "", "Tiêu đề"),
            ("description", "text", "", "Mô tả"),
            ("due_date", "timestamp", "", "Hạn nộp"),
            ("max_score", "int", "", "Điểm tối đa"),
            ("file_requirements", "text", "", "Yêu cầu file"),
            ("assignment_type", "enum", "", "Loại bài tập"),
            ("start_time", "datetime", "", "Bắt đầu"),
            ("end_time", "datetime", "", "Kết thúc"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "categories",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("name", "varchar(100)", "", "Tên danh mục"),
            ("description", "text", "", "Mô tả"),
            ("status", "enum", "", "Trạng thái"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "certificates",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("user_id", "bigint", "FK", "Tham chiếu users(id)"),
            ("course_id", "bigint", "FK", "Tham chiếu courses(id)"),
            ("certificate_number", "varchar(100)", "UNIQUE", "Số chứng chỉ"),
            ("certificate_url", "varchar(255)", "", "Đường dẫn chứng chỉ"),
            ("issue_date", "timestamp", "", "Ngày cấp"),
            ("expiry_date", "timestamp", "", "Ngày hết hạn"),
            ("status", "enum", "", "Trạng thái"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "chatbot_response",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("question", "text", "", "Câu hỏi"),
            ("answer", "text", "", "Câu trả lời"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "class_schedules",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("course_id", "bigint", "FK", "Tham chiếu courses(id)"),
            ("instructor_id", "bigint", "FK", "Tham chiếu user_instructors(id)"),
            ("title", "varchar(255)", "", "Tiêu đề"),
            ("description", "text", "", "Mô tả"),
            ("start_time", "timestamp", "", "Bắt đầu"),
            ("end_time", "timestamp", "", "Kết thúc"),
            ("recurring_type", "enum", "", "Lặp lại"),
            ("recurring_days", "varchar(50)", "", "Ngày lặp"),
            ("recurring_until", "date", "", "Lặp đến"),
            ("location_type", "enum", "", "Loại địa điểm"),
            ("physical_location", "varchar(255)", "", "Địa điểm offline"),
            ("online_meeting_url", "varchar(255)", "", "Link online"),
            ("max_participants", "int", "", "Số lượng tối đa"),
            ("status", "enum", "", "Trạng thái"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "course_lesson_discussions",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("lesson_id", "bigint", "FK", "Tham chiếu course_lessons(id)"),
            ("user_id", "bigint", "FK", "Tham chiếu users(id)"),
            ("content", "text", "", "Nội dung thảo luận"),
            ("parent_id", "bigint", "FK", "Thảo luận cha"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "course_lessons",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("section_id", "bigint", "FK", "Tham chiếu course_sections(id)"),
            ("title", "varchar(255)", "", "Tiêu đề"),
            ("content", "text", "", "Nội dung"),
            ("video_url", "varchar(255)", "", "Video bài học"),
            ("duration", "int", "", "Thời lượng (phút)"),
            ("order_number", "int", "", "Thứ tự"),
            ("status", "enum", "", "Trạng thái"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "course_progress",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("user_id", "bigint", "FK", "Tham chiếu users(id)"),
            ("course_id", "bigint", "FK", "Tham chiếu courses(id)"),
            ("lesson_id", "bigint", "FK", "Tham chiếu course_lessons(id)"),
            ("status", "enum", "", "Trạng thái"),
            ("completed_at", "timestamp", "", "Ngày hoàn thành"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "course_sections",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("course_id", "bigint", "FK", "Tham chiếu courses(id)"),
            ("title", "varchar(255)", "", "Tiêu đề"),
            ("description", "text", "", "Mô tả"),
            ("order_number", "int", "", "Thứ tự"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "courses",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("title", "varchar(255)", "", "Tiêu đề"),
            ("description", "text", "", "Mô tả"),
            ("category_id", "bigint", "FK", "Tham chiếu categories(id)"),
            ("instructor_id", "bigint", "FK", "Tham chiếu user_instructors(id)"),
            ("price", "decimal(10,2)", "", "Giá"),
            ("level", "enum", "", "Trình độ"),
            ("status", "enum", "", "Trạng thái"),
            ("thumbnail_url", "varchar(255)", "", "Ảnh đại diện"),
            ("required", "text", "", "Yêu cầu"),
            ("learned", "text", "", "Kết quả đạt được"),
            ("start_date", "date", "", "Ngày bắt đầu"),
            ("end_date", "date", "", "Ngày kết thúc"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "documents",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("course_id", "bigint", "FK", "Tham chiếu courses(id)"),
            ("title", "varchar(255)", "", "Tiêu đề"),
            ("file_url", "varchar(255)", "", "Đường dẫn file"),
            ("file_type", "varchar(50)", "", "Loại file"),
            ("file_size", "int", "", "Kích thước file"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "enrollments",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("user_id", "bigint", "FK", "Tham chiếu users(id)"),
            ("course_id", "bigint", "FK", "Tham chiếu courses(id)"),
            ("enrollment_date", "timestamp", "", "Ngày đăng ký"),
            ("status", "enum", "", "Trạng thái"),
            ("completion_date", "timestamp", "", "Ngày hoàn thành"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "forum_likes",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("forum_id", "bigint", "FK", "Tham chiếu forums(id)"),
            ("user_id", "bigint", "FK", "Tham chiếu users(id)"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "forum_replies",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("forum_id", "bigint", "FK", "Tham chiếu forums(id)"),
            ("user_id", "bigint", "FK", "Tham chiếu users(id)"),
            ("parent_id", "bigint", "FK", "Phản hồi cha"),
            ("content", "text", "", "Nội dung"),
            ("is_solution", "tinyint(1)", "", "Là giải pháp"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "forums",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("course_id", "bigint", "FK", "Tham chiếu courses(id)"),
            ("user_id", "bigint", "FK", "Tham chiếu users(id)"),
            ("title", "varchar(255)", "", "Tiêu đề"),
            ("description", "text", "", "Mô tả"),
            ("thumbnail_url", "text", "", "Ảnh đại diện"),
            ("status", "enum", "", "Trạng thái"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "instructor_availability",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("instructor_id", "bigint", "FK", "Tham chiếu users(id)"),
            ("day_of_week", "tinyint", "", "Thứ trong tuần"),
            ("start_time", "time", "", "Giờ bắt đầu"),
            ("end_time", "time", "", "Giờ kết thúc"),
            ("is_available", "tinyint(1)", "", "Có sẵn"),
            ("repeat_weekly", "tinyint(1)", "", "Lặp lại hàng tuần"),
            ("effective_from", "date", "", "Hiệu lực từ"),
            ("effective_until", "date", "", "Hiệu lực đến"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "messages",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("sender_id", "bigint", "FK", "Người gửi"),
            ("receiver_id", "bigint", "FK", "Người nhận"),
            ("content", "text", "", "Nội dung"),
            ("is_read", "tinyint(1)", "", "Đã đọc"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "notifications",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("user_id", "bigint", "FK", "Tham chiếu users(id)"),
            ("title", "varchar(255)", "", "Tiêu đề"),
            ("content", "text", "", "Nội dung"),
            ("type", "enum", "", "Loại thông báo"),
            ("is_read", "tinyint(1)", "", "Đã đọc"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "payments",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("user_id", "bigint", "FK", "Tham chiếu users(id)"),
            ("course_id", "bigint", "FK", "Tham chiếu courses(id)"),
            ("amount", "decimal(10,2)", "", "Số tiền"),
            ("payment_method", "enum", "", "Phương thức"),
            ("transaction_id", "varchar(100)", "", "Mã giao dịch"),
            ("status", "enum", "", "Trạng thái"),
            ("payment_date", "timestamp", "", "Ngày thanh toán"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "quiz_attempts",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("user_id", "bigint", "FK", "Tham chiếu users(id)"),
            ("quiz_id", "bigint", "FK", "Tham chiếu quizzes(id)"),
            ("start_time", "timestamp", "", "Bắt đầu"),
            ("end_time", "timestamp", "", "Kết thúc"),
            ("score", "decimal(5,2)", "", "Điểm"),
            ("status", "enum", "", "Trạng thái"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "quiz_options",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("question_id", "bigint", "FK", "Tham chiếu quiz_questions(id)"),
            ("content", "text", "", "Nội dung"),
            ("is_correct", "tinyint(1)", "", "Đáp án đúng"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "quiz_questions",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("quiz_id", "bigint", "FK", "Tham chiếu quizzes(id)"),
            ("question_text", "text", "", "Nội dung câu hỏi"),
            ("question_type", "enum", "", "Loại câu hỏi"),
            ("correct_explanation", "text", "", "Giải thích đáp án"),
            ("points", "int", "", "Số điểm"),
            ("order_number", "int", "", "Thứ tự"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "quiz_responses",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("attempt_id", "bigint", "FK", "Tham chiếu quiz_attempts(id)"),
            ("question_id", "bigint", "FK", "Tham chiếu quiz_questions(id)"),
            ("option_id", "bigint", "FK", "Tham chiếu quiz_options(id)"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "quizzes",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("lesson_id", "bigint", "FK", "Tham chiếu course_lessons(id)"),
            ("academic_class_id", "bigint", "FK", "Tham chiếu academic_classes(id)"),
            ("title", "varchar(255)", "", "Tiêu đề"),
            ("description", "text", "", "Mô tả"),
            ("time_limit", "int", "", "Giới hạn thời gian"),
            ("passing_score", "int", "", "Điểm đạt"),
            ("attempts_allowed", "int", "", "Số lần làm"),
            ("quiz_type", "enum", "", "Loại bài kiểm tra"),
            ("show_explanation", "tinyint(1)", "", "Hiện giải thích"),
            ("start_time", "datetime", "", "Bắt đầu"),
            ("end_time", "datetime", "", "Kết thúc"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "reviews",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("user_student_id", "bigint", "FK", "Tham chiếu user_students(id)"),
            ("course_id", "bigint", "FK", "Tham chiếu courses(id)"),
            ("review_type", "enum", "", "Loại đánh giá"),
            ("rating", "int", "", "Số sao"),
            ("review_text", "text", "", "Nội dung"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "user_admins",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("user_id", "bigint", "FK UNIQUE", "Tham chiếu users(id)"),
            ("full_name", "varchar(100)", "", "Họ tên"),
            ("department", "varchar(100)", "", "Phòng ban"),
            ("position", "varchar(100)", "", "Chức vụ"),
            ("admin_level", "enum", "", "Cấp quản trị"),
            ("permissions", "json", "", "Quyền hạn"),
            ("emergency_contact", "varchar(100)", "", "Liên hệ khẩn cấp"),
            ("office_location", "varchar(255)", "", "Văn phòng"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "user_grades",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("user_id", "bigint", "FK", "Tham chiếu users(id)"),
            ("graded_by", "bigint", "FK", "Giảng viên chấm"),
            ("course_id", "bigint", "FK", "Tham chiếu courses(id)"),
            ("lesson_id", "bigint", "FK", "Tham chiếu course_lessons(id)"),
            ("assignment_submission_id", "bigint", "FK", "Tham chiếu assignment_submissions(id)"),
            ("quiz_attempt_id", "bigint", "FK", "Tham chiếu quiz_attempts(id)"),
            ("grade_type", "enum", "", "Loại điểm"),
            ("score", "decimal(5,2)", "", "Điểm"),
            ("max_score", "decimal(5,2)", "", "Điểm tối đa"),
            ("weight", "decimal(5,2)", "", "Trọng số"),
            ("feedback", "text", "", "Nhận xét"),
            ("graded_at", "timestamp", "", "Ngày chấm"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "user_instructors",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("user_id", "bigint", "FK UNIQUE", "Tham chiếu users(id)"),
            ("full_name", "varchar(100)", "", "Họ tên"),
            ("professional_title", "varchar(100)", "", "Chức danh"),
            ("specialization", "varchar(255)", "", "Chuyên môn"),
            ("education_background", "text", "", "Học vấn"),
            ("teaching_experience", "text", "", "Kinh nghiệm"),
            ("bio", "text", "", "Giới thiệu"),
            ("expertise_areas", "text", "", "Lĩnh vực chuyên môn"),
            ("certificates", "text", "", "Chứng chỉ"),
            ("linkedin_profile", "varchar(255)", "", "LinkedIn"),
            ("website", "varchar(255)", "", "Website"),
            ("payment_info", "json", "", "Thông tin thanh toán"),
            ("verification_status", "enum", "", "Trạng thái xác minh"),
            ("verification_documents", "text", "", "Tài liệu xác minh"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "user_students",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("user_id", "bigint", "FK UNIQUE", "Tham chiếu users(id)"),
            ("full_name", "varchar(100)", "", "Họ tên"),
            ("date_of_birth", "date", "", "Ngày sinh"),
            ("gender", "enum", "", "Giới tính"),
            ("education_level", "varchar(100)", "", "Trình độ học vấn"),
            ("occupation", "varchar(100)", "", "Nghề nghiệp"),
            ("bio", "text", "", "Giới thiệu"),
            ("interests", "text", "", "Sở thích"),
            ("address", "text", "", "Địa chỉ"),
            ("city", "varchar(100)", "", "Thành phố"),
            ("country", "varchar(100)", "", "Quốc gia"),
            ("learning_goals", "text", "", "Mục tiêu học tập"),
            ("preferred_language", "varchar(50)", "", "Ngôn ngữ"),
            ("notification_preferences", "json", "", "Tùy chọn thông báo"),
            ("total_courses_enrolled", "int", "", "Số khóa đã đăng ký"),
            ("total_courses_completed", "int", "", "Số khóa đã hoàn thành"),
            ("achievement_points", "int", "", "Điểm thành tích"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "user_students_academic",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("user_id", "bigint", "FK UNIQUE", "Tham chiếu users(id)"),
            ("academic_class_id", "bigint", "FK", "Tham chiếu academic_classes(id)"),
            ("student_code", "varchar(50)", "UNIQUE", "Mã sinh viên"),
            ("full_name", "varchar(100)", "", "Họ tên"),
            ("academic_year", "varchar(20)", "", "Năm học"),
            ("status", "enum", "", "Trạng thái"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    },
    {
        "name": "users",
        "fields": [
            ("id", "bigint", "PK", "ID tự tăng"),
            ("username", "varchar(50)", "UNIQUE", "Tên đăng nhập"),
            ("email", "varchar(100)", "UNIQUE", "Email"),
            ("phone", "varchar(15)", "", "Số điện thoại"),
            ("password", "varchar(255)", "", "Mật khẩu"),
            ("role", "enum", "", "Vai trò"),
            ("status", "enum", "", "Trạng thái"),
            ("avatar_url", "varchar(255)", "", "Ảnh đại diện"),
            ("two_factor_enabled", "tinyint(1)", "", "Bảo mật 2 lớp"),
            ("two_factor_secret", "varchar(100)", "", "Mã bảo mật 2 lớp"),
            ("social_login_provider", "varchar(50)", "", "Đăng nhập MXH"),
            ("social_login_id", "text", "", "ID MXH"),
            ("last_login", "timestamp", "", "Đăng nhập cuối"),
            ("refresh_token", "text", "", "Refresh token"),
            ("created_at", "timestamp", "", "Ngày tạo"),
            ("updated_at", "timestamp", "", "Ngày cập nhật"),
        ]
    }
]

doc = Document()
doc.add_heading('Lược Đồ Cơ Sở Dữ Liệu Hệ Thống E-Learning', 0)

for table in db_schema:
    doc.add_heading(f"Bảng: {table['name']}", level=1)
    t = doc.add_table(rows=1, cols=4)
    t.style = 'Light List Accent 1'
    hdr_cells = t.rows[0].cells
    hdr_cells[0].text = 'Tên thuộc tính'
    hdr_cells[1].text = 'Kiểu dữ liệu'
    hdr_cells[2].text = 'Khóa'
    hdr_cells[3].text = 'Mô tả'
    for field in table['fields']:
        row_cells = t.add_row().cells
        row_cells[0].text = field[0]
        row_cells[1].text = field[1]
        row_cells[2].text = field[2]
        row_cells[3].text = field[3]
doc.add_paragraph()

doc.save('database_schema.docx')
print("Đã tạo file database_schema.docx thành công!")