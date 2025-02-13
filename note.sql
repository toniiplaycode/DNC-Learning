-- 26. Bảng certificates: Lưu trữ thông tin chứng chỉ khi học viên hoàn thành khóa học
CREATE TABLE certificates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    certificate_number VARCHAR(100) UNIQUE,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 27. Bảng achievements: Quản lý danh sách các thành tích, huy hiệu trong hệ thống
CREATE TABLE achievements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    badge_image_url VARCHAR(255),
    points INT DEFAULT 0,
    requirements JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 28. Bảng user_achievements: Lưu trữ thành tích đã đạt được của người dùng
CREATE TABLE user_achievements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- 29. Bảng course_materials: Quản lý tài liệu học tập của các khóa học
CREATE TABLE course_materials (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(255),
    file_type VARCHAR(50),
    file_size INT,
    download_count INT DEFAULT 0,
    is_downloadable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 30. Bảng class_schedules: Quản lý lịch học, thời khóa biểu của các lớp học
CREATE TABLE class_schedules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    instructor_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    recurring_type ENUM('once', 'daily', 'weekly', 'monthly') DEFAULT 'once',
    recurring_days VARCHAR(50) COMMENT 'Format: 1,2,3,4,5,6,7 for days of week',
    recurring_until DATE,
    location_type ENUM('online', 'offline', 'hybrid') DEFAULT 'online',
    physical_location VARCHAR(255),
    online_meeting_url VARCHAR(255),
    online_meeting_id VARCHAR(100),
    online_meeting_password VARCHAR(100),
    max_participants INT,
    status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- 31. Bảng class_attendance: Quản lý điểm danh của học viên trong các buổi học
CREATE TABLE class_attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    schedule_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES class_schedules(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- 32. Bảng schedule_changes: Theo dõi các thay đổi lịch học
CREATE TABLE schedule_changes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    schedule_id BIGINT NOT NULL,
    original_start_time TIMESTAMP NOT NULL,
    original_end_time TIMESTAMP NOT NULL,
    new_start_time TIMESTAMP NOT NULL,
    new_end_time TIMESTAMP NOT NULL,
    reason TEXT,
    changed_by BIGINT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES class_schedules(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- 33. Bảng instructor_availability: Quản lý thời gian rảnh của giảng viên
CREATE TABLE instructor_availability (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    instructor_id BIGINT NOT NULL,
    day_of_week TINYINT NOT NULL COMMENT '1-7 for Monday-Sunday',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    repeat_weekly BOOLEAN DEFAULT TRUE,
    effective_from DATE,
    effective_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- 34. Bảng schedule_notifications: Quản lý thông báo về lịch học cho người dùng
CREATE TABLE schedule_notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    schedule_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    notification_type ENUM('reminder', 'cancellation', 'change', 'other'),
    notification_time TIMESTAMP,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES class_schedules(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 35. Bảng user_grades: Lưu trữ điểm số của từng bài tập, bài kiểm tra của học viên
CREATE TABLE user_grades (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    lesson_id BIGINT,
    assignment_id BIGINT,
    quiz_id BIGINT,
    grade_type ENUM('assignment', 'quiz', 'midterm', 'final', 'participation') NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    weight DECIMAL(5,2) DEFAULT 1.00 COMMENT 'Trọng số điểm',
    graded_by BIGINT NOT NULL COMMENT 'ID của giảng viên chấm điểm',
    feedback TEXT,
    graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
    FOREIGN KEY (graded_by) REFERENCES users(id)
);

-- 36. Bảng course_completion_grades: Lưu trữ điểm tổng kết của học viên cho mỗi khóa học đã hoàn thành
CREATE TABLE course_completion_grades (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    final_grade DECIMAL(5,2) NOT NULL COMMENT 'Điểm tổng kết',
    grade_status ENUM('pass', 'fail', 'incomplete') NOT NULL,
    completion_date TIMESTAMP,
    assignments_average DECIMAL(5,2) COMMENT 'Điểm trung bình bài tập',
    quizzes_average DECIMAL(5,2) COMMENT 'Điểm trung bình bài kiểm tra',
    midterm_grade DECIMAL(5,2) COMMENT 'Điểm giữa kỳ',
    final_exam_grade DECIMAL(5,2) COMMENT 'Điểm cuối kỳ',
    participation_grade DECIMAL(5,2) COMMENT 'Điểm tham gia',
    attendance_percentage DECIMAL(5,2) COMMENT 'Tỷ lệ tham gia lớp học',
    instructor_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE KEY unique_user_course (user_id, course_id)
);

-- Thêm các chỉ mục để tối ưu truy vấn
ALTER TABLE user_grades ADD INDEX idx_user_course (user_id, course_id);
ALTER TABLE user_grades ADD INDEX idx_grade_type (grade_type);
ALTER TABLE course_completion_grades ADD INDEX idx_completion_date (completion_date);
ALTER TABLE course_completion_grades ADD INDEX idx_grade_status (grade_status);