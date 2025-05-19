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

# Mô tả chức năng cho từng hình
img_descriptions = {
    # Nhóm học sinh/sinh viên
    'Trang chủ.png': 'Màn hình chính của hệ thống, cung cấp cái nhìn tổng quan về toàn bộ hoạt động học tập, thông báo mới nhất, các khóa học nổi bật và các chức năng truy cập nhanh. Người dùng có thể dễ dàng theo dõi tiến độ học tập, nhận thông báo quan trọng, truy cập nhanh vào các lớp học, bài tập, diễn đàn hoặc các tài liệu học tập. Đây là điểm khởi đầu giúp học viên, giảng viên và quản trị viên định hướng các hoạt động tiếp theo một cách thuận tiện và hiệu quả.',
    # 'Trang cá nhân.png': 'Màn hình tổng quan về thông tin cá nhân của học viên, bao gồm hồ sơ, lịch sử học tập, chứng chỉ đã đạt, tiến độ các khóa học, lịch sử thanh toán và các hoạt động gần đây. Người dùng có thể chỉnh sửa thông tin, đổi mật khẩu, cập nhật ảnh đại diện và theo dõi toàn bộ quá trình học tập của mình. Đây là nơi cá nhân hóa trải nghiệm học tập cho từng người dùng.',
    'Trang cá nhân tiến độ học.png': 'Màn hình cho phép học viên theo dõi tiến độ học tập của mình qua từng khóa học, từng phần học, bài tập và trắc nghiệm. Học viên có thể biết được mình đã hoàn thành bao nhiêu phần trăm nội dung, còn những mục nào chưa hoàn thành và nhận nhắc nhở khi cần thiết.',
    'Trang cá nhân thanh toán.png': 'Màn hình hiển thị chi tiết các khoản thanh toán, lịch sử giao dịch, trạng thái học phí và các khoản phí khác của học viên. Người dùng có thể kiểm tra, tải hóa đơn, thực hiện thanh toán trực tuyến và nhận thông báo khi có thay đổi về tài chính. Chức năng này giúp học viên chủ động quản lý tài chính học tập.',
    'Trang cá nhân chứng chỉ.png': 'Màn hình hiển thị danh sách các chứng chỉ mà học viên đã đạt được sau khi hoàn thành khóa học. Học viên có thể tải về chứng chỉ, xem chi tiết thông tin và chia sẻ thành tích lên mạng xã hội. Chức năng này giúp ghi nhận và khích lệ thành tích học tập.',
    'Trang cá nhân bảng điểm.png': 'Màn hình tổng hợp kết quả học tập của học viên, bao gồm điểm số từng bài tập, bài kiểm tra, trắc nghiệm và điểm tổng kết các khóa học. Học viên có thể xem chi tiết từng mục, nhận nhận xét từ giảng viên và theo dõi tiến độ học tập của mình qua từng giai đoạn.',
    'Tìm kiếm thông tin.png': 'Màn hình tìm kiếm toàn bộ nội dung trong hệ thống, bao gồm khóa học, bài học, tài liệu, giảng viên, diễn đàn và thông báo. Học viên có thể sử dụng bộ lọc nâng cao để tìm kiếm nhanh và chính xác.',
    # 'Thông tin chi tiết giảng viên.png': 'Màn hình hiển thị hồ sơ chi tiết của giảng viên, bao gồm trình độ chuyên môn, kinh nghiệm giảng dạy, các khóa học phụ trách và đánh giá từ học viên. Học viên có thể liên hệ, gửi câu hỏi hoặc phản hồi cho giảng viên.',
    'Thông báo.png': 'Màn hình tổng hợp tất cả các thông báo quan trọng từ hệ thống, giảng viên hoặc quản trị viên.',
    'Thông báo mail.png': 'Đồng thời tích hợp gửi thông báo qua email. Người dùng có thể xem chi tiết từng thông báo, đánh dấu đã đọc, lọc theo loại thông báo (học tập, tài chính, sự kiện, v.v.), nhận thông báo đẩy khi có tin mới, và nhận email để đảm bảo thông tin được truyền tải kịp thời. Chức năng này giúp duy trì kết nối hiệu quả giữa hệ thống và người dùng.',
    'Thanh toán ZaloPay.png': 'Màn hình hỗ trợ học viên thanh toán học phí hoặc các khoản phí khác qua ZaloPay. Người dùng có thể quét mã QR, kiểm tra trạng thái giao dịch, nhận hóa đơn điện tử và lịch sử thanh toán. Chức năng này giúp quá trình thanh toán trở nên nhanh chóng, an toàn và minh bạch.',
    'Tham gia học trực tuyến.png': 'Màn hình cho phép học viên tham gia các lớp học trực tuyến thông qua Google Meet, tích hợp hệ thống điểm danh tự động và theo dõi thời gian học tập. Học viên có thể kết nối vào phiên học, xem thông tin chi tiết về lịch học, và hệ thống sẽ ghi nhận sự hiện diện cũng như thời lượng tham gia của họ, đảm bảo quản lý hiệu quả quá trình học tập.',
    'Nộp bài tập.png': 'Màn hình cho phép học viên nộp bài tập trực tuyến, tải lên file, nhập nội dung trả lời, kiểm tra thời hạn nộp và nhận phản hồi từ giảng viên. Ngoài ra, học viên có thể xem lại các bài đã nộp, chỉnh sửa trước hạn chót, nhận thông báo khi có điểm hoặc nhận xét. Chức năng này giúp quá trình nộp và chấm bài tập trở nên minh bạch, thuận tiện và tiết kiệm thời gian.',
    'Làm bài trắc nghiệm.png': 'Màn hình cho phép học viên thực hiện các bài kiểm tra trắc nghiệm trực tuyến với nhiều dạng câu hỏi khác nhau. Học viên có thể xem thời gian làm bài, chọn đáp án, nộp bài và nhận kết quả ngay sau khi hoàn thành. Ngoài ra, hệ thống còn hỗ trợ lưu tạm thời, xem lại đáp án, nhận nhận xét từ giảng viên và thống kê kết quả. Chức năng này giúp đánh giá năng lực học viên một cách khách quan, nhanh chóng và hiệu quả.',
    'Kết quả bài tập.png': 'Màn hình tổng hợp kết quả các bài tập đã nộp, điểm số, nhận xét của giảng viên và trạng thái hoàn thành. Học viên có thể xem lại bài đã nộp, nhận phản hồi chi tiết và cải thiện kết quả học tập.',
    'Hiển thị điểm và đáp án.png': 'Màn hình hiển thị chi tiết điểm số và đáp án đúng của các bài kiểm tra trắc nghiệm. Học viên có thể so sánh đáp án của mình với đáp án đúng, nhận nhận xét và rút kinh nghiệm cho các lần kiểm tra sau.',
    'Đăng nhập.png': 'Màn hình đăng nhập được thiết kế dành cho học viên và sinh viên trong hệ thống eLearning. Tại đây, học viên/sinh viên nhập tên đăng nhập và mật khẩu để truy cập vào các chức năng học tập như xem nội dung khóa học, làm bài tập, tham gia diễn đàn, và theo dõi tiến độ cá nhân. Chức năng này đảm bảo an toàn, bảo mật và phân quyền truy cập phù hợp với vai trò của họ trong hệ thống.',
    # 'Đăng ký khóa học.png': 'Màn hình cho phép học viên đăng ký các khóa học mới, xem thông tin chi tiết, học phí, lịch học và xác nhận đăng ký trực tuyến. Học viên có thể theo dõi trạng thái đăng ký và nhận thông báo khi được duyệt.',
    'Đăng ký.png': 'Màn hình cho phép học viên đăng ký tài khoản mới bằng cách nhập thông tin cá nhân, email, số điện thoại và thiết lập mật khẩu. Sau khi đăng ký thành công, học viên có thể truy cập vào hệ thống để bắt đầu quá trình học tập. Chức năng này giúp mở rộng đối tượng người dùng và đảm bảo quy trình đăng ký minh bạch, thuận tiện.',
    # 'Chi tiết nội dung học xem tài liệu.png': 'Màn hình cho phép học viên xem và tải về các tài liệu học tập như PDF, Word, PowerPoint, v.v. Hỗ trợ xem trước tài liệu, tìm kiếm nội dung trong file và lưu trữ tài liệu cá nhân.',
    'Chi tiết nội dung học video.png': 'Màn hình phát video bài giảng với các tính năng điều chỉnh tốc độ, tua nhanh/chậm, bật/tắt phụ đề và ghi chú. Học viên có thể học mọi lúc, mọi nơi và chủ động kiểm soát quá trình học.',
    'Chi tiết nội dung học văn bản.png': 'Màn hình trình bày nội dung bài học dạng văn bản, hỗ trợ định dạng phong phú, chèn hình ảnh, bảng biểu và liên kết. Học viên có thể đọc, ghi chú, đánh dấu nội dung quan trọng và tìm kiếm thông tin nhanh chóng.',
    'Chi tiết nội dung học slide.png': 'Màn hình trình chiếu bài giảng dạng slide, hỗ trợ chuyển trang, phóng to/thu nhỏ, ghi chú và tải về slide. Học viên có thể học tập trực quan, dễ tiếp thu kiến thức.',
    'Chi tiết nội dung học làm trắc nghiệm.png': 'Màn hình cung cấp bài kiểm tra trắc nghiệm trong nội dung học, với nhiều dạng câu hỏi, tính năng lưu tạm, xem lại đáp án và nhận kết quả ngay sau khi nộp. Học viên có thể luyện tập, kiểm tra kiến thức và nhận phản hồi tức thì.',
    'Chi tiết nội dung học làm bài tập.png': 'Màn hình hiển thị chi tiết một bài tập trong nội dung học, bao gồm yêu cầu, hướng dẫn, tài liệu tham khảo và nút nộp bài. Học viên có thể đọc kỹ yêu cầu, tải tài liệu, làm bài và nộp trực tiếp trên hệ thống.',
    'Chi tiết khóa học.png': 'Màn hình này cung cấp thông tin chi tiết về một khóa học cụ thể, bao gồm mô tả, mục tiêu, nội dung các phần học, danh sách bài tập, trắc nghiệm, tài liệu tham khảo và thông tin giảng viên phụ trách. Học viên có thể xem tiến độ học, đăng ký hoặc hủy đăng ký khóa học, tải tài liệu, đặt câu hỏi cho giảng viên và tham gia các hoạt động tương tác. Đây là nơi tập trung mọi thông tin và hoạt động liên quan đến một khóa học.',
    'Chi tiết diễn đàn.png': 'Màn hình hiển thị chi tiết một chủ đề thảo luận trong diễn đàn, bao gồm nội dung chủ đề, các bình luận, phản hồi từ học viên và giảng viên. Người dùng có thể đăng bài mới, trả lời, trích dẫn, đính kèm file, và nhận thông báo khi có phản hồi mới. Chức năng này tạo môi trường trao đổi học thuật sôi nổi, giúp học viên giải đáp thắc mắc và học hỏi lẫn nhau.',
    'Hộp thoại chat.png': 'Màn hình hộp thoại chat cho phép học viên, giảng viên và quản trị viên trao đổi trực tiếp, gửi tin nhắn, file, hình ảnh và nhận thông báo khi có tin nhắn mới.',
    'Giao diện chatbot.png': 'Màn hình trò chuyện với chatbot hỗ trợ học tập, cho phép học viên đặt câu hỏi, tìm kiếm tài liệu, nhận hướng dẫn sử dụng hệ thống hoặc giải đáp thắc mắc về bài học.',
    # 'Các lớp học trực tuyến.png': 'Màn hình tổng hợp các lớp học trực tuyến đang diễn ra hoặc sắp tới. Học viên có thể xem lịch học, tham gia lớp qua liên kết trực tuyến, nhận thông báo nhắc lịch và xem lại video ghi hình nếu có.',
    # 'Các khóa học tham gia.png': 'Màn hình hiển thị danh sách các khóa học mà học viên đã đăng ký hoặc đang tham gia. Người dùng có thể xem thông tin chi tiết từng khóa học, truy cập vào nội dung bài học, kiểm tra tiến độ hoàn thành, nhận thông báo từ giảng viên và tham gia các hoạt động học tập như bài tập, trắc nghiệm, diễn đàn thảo luận. Chức năng này giúp học viên quản lý và theo dõi quá trình học tập của mình một cách chủ động.',
    'Danh sách khóa học.png': 'Màn hình tổng hợp tất cả các khóa học trong hệ thống, hỗ trợ tìm kiếm, lọc theo chuyên ngành, trạng thái, giảng viên phụ trách và đăng ký nhanh.',
    'Danh sách giảng viên.png': 'Màn hình hiển thị danh sách tất cả giảng viên trong hệ thống, cho phép học viên xem thông tin, tìm kiếm theo chuyên ngành, liên hệ hoặc gửi phản hồi.',
    # 'Các diễn đàn.png': 'Màn hình tổng hợp các diễn đàn thảo luận trong hệ thống, phân loại theo chủ đề, khóa học hoặc lớp học. Người dùng có thể tìm kiếm, tham gia thảo luận, tạo chủ đề mới và theo dõi các chủ đề quan tâm.',
    'Các bài tập và trắc nghiệm.png': 'Màn hình tổng hợp tất cả các bài tập và bài kiểm tra trắc nghiệm cần hoàn thành trong từng khóa học. Học viên có thể theo dõi hạn nộp, trạng thái hoàn thành và truy cập nhanh vào từng bài.',

    # Nhóm giảng viên
    # 'Quản lý tài khoản.png': 'Màn hình cho phép giảng viên quản lý và cập nhật thông tin tài khoản cá nhân như họ tên, email, số điện thoại, mật khẩu, ảnh đại diện. Ngoài ra, giảng viên có thể thiết lập các tùy chọn bảo mật, nhận thông báo hệ thống và theo dõi lịch sử hoạt động cá nhân. Chức năng này giúp đảm bảo thông tin cá nhân luôn chính xác, bảo mật và thuận tiện cho việc liên hệ, trao đổi với học viên.',
    'Quản lý thông báo.png': 'Màn hình cho phép giảng viên tạo mới, chỉnh sửa, gửi và quản lý các thông báo đến học viên trong lớp hoặc toàn bộ hệ thống. Giảng viên có thể phân loại thông báo theo chủ đề, theo dõi trạng thái đã đọc/chưa đọc, đính kèm tài liệu, hình ảnh và nhận phản hồi từ học viên. Chức năng này giúp đảm bảo thông tin quan trọng được truyền tải kịp thời, tăng cường tương tác giữa giảng viên và học viên.',
    'Quản lý thống kê.png': 'Màn hình cung cấp các báo cáo, thống kê chi tiết về tiến độ học tập, kết quả kiểm tra, tỷ lệ hoàn thành bài tập, mức độ tương tác của học viên trong từng lớp hoặc từng khóa học. Giảng viên có thể lọc, xuất báo cáo theo thời gian, lớp học, khóa học, so sánh kết quả giữa các lớp và nhận gợi ý cải thiện chất lượng giảng dạy. Chức năng này hỗ trợ giảng viên đánh giá hiệu quả đào tạo và điều chỉnh phương pháp giảng dạy phù hợp.',
    # 'Quản lý diễn đàn (xem diễn đàn).png': 'Màn hình cho phép giảng viên xem, quản lý và kiểm duyệt các diễn đàn thảo luận của lớp học. Giảng viên có thể theo dõi các chủ đề nổi bật, trả lời câu hỏi, xóa hoặc ghim chủ đề, kiểm soát nội dung bình luận và khuyến khích học viên tham gia thảo luận tích cực.',
    'Quản lý diễn đàn (hộp thoại).png': 'Màn hình hộp thoại cho phép giảng viên tạo mới, chỉnh sửa hoặc xóa các chủ đề thảo luận, thiết lập quyền truy cập, đính kèm tài liệu, hình ảnh và gửi thông báo đến học viên khi có chủ đề mới. Chức năng này giúp quản lý diễn đàn hiệu quả, tạo môi trường học tập tương tác, sáng tạo.',
    'Quản lý diễn đàn.png': 'Màn hình tổng quan về quản lý diễn đàn, cho phép giảng viên xem danh sách tất cả các diễn đàn, chủ đề, số lượng bài viết, bình luận, mức độ tương tác của học viên và thống kê hoạt động thảo luận. Giảng viên có thể tìm kiếm, lọc, truy cập nhanh vào từng diễn đàn để quản lý nội dung.',
    'Quản lý đánh giá.png': 'Màn hình cho phép giảng viên xem, phản hồi và tổng hợp các đánh giá từ học viên về chất lượng giảng dạy, nội dung khóa học, tài liệu, phương pháp truyền đạt. Giảng viên có thể phân tích xu hướng đánh giá, nhận góp ý cải thiện và xây dựng hình ảnh cá nhân chuyên nghiệp.',
    'Quản lý điểm danh.png': 'Màn hình cho phép giảng viên điểm danh học viên trong từng buổi học, theo dõi lịch sử điểm danh, xuất báo cáo chuyên cần, gửi cảnh báo cho học viên vắng mặt nhiều lần. Chức năng này giúp nâng cao ý thức học tập, đảm bảo sự tham gia đầy đủ của học viên.',
    'Quản lý lịch dạy (hộp thoại).png': 'Màn hình hộp thoại cho phép giảng viên tạo mới, chỉnh sửa, xóa các buổi học, thiết lập lịch dạy, phân công phòng học, gửi thông báo nhắc lịch cho học viên. Giảng viên có thể đồng bộ lịch dạy với các thiết bị cá nhân, đảm bảo không bỏ lỡ buổi học nào.',
    'Quản lý lịch dạy.png': 'Màn hình tổng quan về lịch dạy của giảng viên, hiển thị chi tiết các buổi học, lớp học, thời gian, địa điểm, nội dung giảng dạy. Giảng viên có thể xem, lọc, tìm kiếm lịch dạy theo tuần, tháng, xuất lịch ra file và nhận thông báo nhắc lịch.',
    'Hộp thoại chat.png': 'Màn hình chat cho phép giảng viên trao đổi trực tiếp với học viên, hỗ trợ giải đáp thắc mắc, gửi tài liệu, hình ảnh, thông báo khẩn cấp và lưu trữ lịch sử trò chuyện. Chức năng này giúp tăng cường sự kết nối, hỗ trợ học viên kịp thời.',
    'Quản lý bài tập (thêm bài cho lớp học thuật).png': 'Màn hình cho phép giảng viên tạo mới bài tập cho từng lớp học thuật, thiết lập yêu cầu, thời hạn nộp, đính kèm tài liệu hướng dẫn, phân loại bài tập theo mức độ khó, chủ đề. Giảng viên có thể gửi thông báo giao bài tập đến học viên.',
    'Quản lý bài trắc nghiệm (thêm bài cho lớp học thuật).png': 'Màn hình cho phép giảng viên tạo mới bài trắc nghiệm cho lớp học thuật, thiết lập câu hỏi, đáp án, thời gian làm bài, phân loại theo chủ đề, mức độ. Giảng viên có thể xem trước bài trắc nghiệm, gửi thông báo cho học viên.',
    'Quản lý bài trắc nghiệm (xem bài làm).png': 'Màn hình cho phép giảng viên xem chi tiết bài làm trắc nghiệm của từng học viên, chấm điểm, nhận xét, phát hiện gian lận, xuất kết quả và gửi phản hồi cá nhân hóa.',
    # 'Quản lý bài trắc nghiệm (xem theo lớp).png': 'Màn hình cho phép giảng viên xem tổng hợp kết quả bài trắc nghiệm theo từng lớp, so sánh điểm số, phân tích thống kê, phát hiện học viên cần hỗ trợ thêm.',
    'Quản lý bài trắc nghiệm.png': 'Màn hình tổng quan về quản lý bài trắc nghiệm, cho phép giảng viên tạo mới, chỉnh sửa, xóa, phân loại, xuất kết quả, thống kê điểm số và gửi thông báo cho học viên.',
    # 'Quản lý bài tập (xem file nộp).png': 'Màn hình cho phép giảng viên xem, tải về các file bài tập học viên đã nộp, kiểm tra tiến độ nộp bài, phát hiện gian lận, gửi nhận xét, chấm điểm trực tiếp trên hệ thống.',
    'Quản lý bài tập (chấm điểm).png': 'Màn hình cho phép giảng viên chấm điểm bài tập, nhập nhận xét chi tiết, gửi phản hồi cho từng học viên, xuất bảng điểm và thống kê kết quả học tập.',
    'Quản lý bài tập.png': 'Màn hình này cung cấp đầy đủ các nghiệp vụ liên quan đến quản lý bài tập cho từng lớp học hoặc khóa học. Giảng viên có thể tạo mới bài tập, thiết lập thời hạn nộp, mô tả yêu cầu, đính kèm tài liệu hướng dẫn. Ngoài ra, chức năng còn cho phép xem danh sách bài tập đã giao, chỉnh sửa hoặc xóa bài tập, theo dõi số lượng học viên đã nộp bài, chấm điểm trực tiếp trên hệ thống, nhận xét và trả bài cho học viên. Đối với từng bài tập, giảng viên có thể xem chi tiết từng bài nộp, tải về file đính kèm, và gửi phản hồi cá nhân hóa cho từng học viên. Chức năng này giúp nâng cao hiệu quả quản lý, đánh giá và hỗ trợ học viên trong quá trình học tập.',
    'Quản lý lớp học thuật (thêm sinh viên).png': 'Màn hình cho phép giảng viên thêm sinh viên vào lớp học thuật, tìm kiếm, lọc, phân nhóm sinh viên, gửi thông báo mời tham gia lớp.',
    # 'Quản lý lớp học thuật (xem sinh viên).png': 'Màn hình cho phép giảng viên xem danh sách sinh viên trong lớp, theo dõi tiến độ học tập, điểm số, gửi nhận xét, cảnh báo học vụ.',
    'Quản lý lớp học thuật (thêm khóa học).png': 'Màn hình cho phép giảng viên thêm khóa học vào lớp học thuật, thiết lập lịch học, phân công giảng viên phụ trách.',
    'Quản lý lớp học thuật (hộp thoại).png': 'Màn hình hộp thoại cho phép giảng viên quản lý thông tin lớp học, chỉnh sửa tên lớp, mô tả, lịch học, danh sách sinh viên.',
    'Quản lý lớp học thuật.png': 'Màn hình tổng quan về quản lý lớp học thuật, cho phép giảng viên xem danh sách lớp, lịch học, số lượng sinh viên, tiến độ học tập, gửi thông báo cho lớp.',
    'Quản lý học sinh sinh viên.png': 'Màn hình tổng quan cho phép giảng viên quản lý toàn bộ học sinh/sinh viên trong các lớp học phụ trách. Giảng viên có thể xem danh sách học viên, tìm kiếm, lọc theo lớp học, khóa học hoặc trạng thái học tập. Ngoài ra, giảng viên có thể truy cập vào thông tin chi tiết của từng học viên để xem tiến độ học tập, điểm số, lịch sử tham gia các hoạt động học tập và các cảnh báo học vụ nếu có. Chức năng này giúp giảng viên theo dõi và hỗ trợ học viên một cách hiệu quả.',
    'Quản lý học sinh sinh viên (cảnh báo học vụ).png': 'Màn hình cho phép giảng viên tạo và quản lý các cảnh báo học vụ cho học viên có kết quả học tập yếu hoặc vắng mặt nhiều. Giảng viên có thể thiết lập các tiêu chí cảnh báo, gửi thông báo đến học viên và phụ huynh, theo dõi quá trình cải thiện và đánh giá hiệu quả của các biện pháp hỗ trợ. Chức năng này giúp phát hiện sớm và can thiệp kịp thời để nâng cao chất lượng học tập.',
    'Quản lý học sinh sinh viên (bảng điểm).png': 'Màn hình cho phép giảng viên quản lý và theo dõi bảng điểm của học viên trong các lớp học. Giảng viên có thể nhập điểm cho từng bài tập, bài kiểm tra, trắc nghiệm, tính điểm trung bình, xuất báo cáo điểm số và gửi thông báo kết quả học tập cho học viên. Chức năng này giúp đánh giá chính xác và minh bạch kết quả học tập của học viên.',
    'Quản lý học viên/sinh viên 2.png': 'Màn hình bổ sung cho quản lý học viên/sinh viên, hỗ trợ các nghiệp vụ nâng cao như phân tích học lực, đề xuất hỗ trợ cá nhân.',
    'Quản lý học viên/sinh viên.png': 'Màn hình này cho phép người dùng (giảng viên hoặc quản trị viên) thực hiện đầy đủ các nghiệp vụ liên quan đến quản lý học viên/sinh viên trong hệ thống. Người dùng có thể xem danh sách học viên, tìm kiếm, lọc theo lớp, khóa học hoặc trạng thái học tập. Ngoài ra, màn hình còn hỗ trợ thêm mới học viên, chỉnh sửa thông tin cá nhân, xóa học viên khỏi hệ thống, cũng như truy cập vào chi tiết từng học viên để xem tiến độ học tập, điểm số, lịch sử tham gia các khóa học và các cảnh báo học vụ nếu có. Chức năng này giúp đảm bảo việc quản lý học viên được thực hiện một cách toàn diện, minh bạch và thuận tiện cho các bên liên quan.',
    'Quản lý nội dung khóa học (hộp thoại bài tập).png': 'Màn hình hộp thoại cho phép giảng viên quản lý, thêm mới, chỉnh sửa, xóa bài tập trong nội dung khóa học, đính kèm tài liệu hướng dẫn, phân loại bài tập.',
    'Quản lý nội dung khóa học (hộp thoại trắc nghiệm).png': 'Màn hình hộp thoại cho phép giảng viên quản lý, thêm mới, chỉnh sửa, xóa bài trắc nghiệm trong nội dung khóa học, thiết lập câu hỏi, đáp án.',
    # 'Quản lý nội dung khóa học (bài tập và trắc nghiệm).png': 'Màn hình cho phép giảng viên quản lý tổng hợp các bài tập và trắc nghiệm trong từng khóa học, theo dõi tiến độ hoàn thành của học viên.',
    # 'Quản lý nội dung khóa học (tài liệu).png': 'Màn hình cho phép giảng viên quản lý, thêm mới, chỉnh sửa, xóa tài liệu học tập, phân loại tài liệu theo chủ đề, gửi thông báo khi có tài liệu mới.',
    'Quản lý nội dung khóa học (thêm tài liệu).png': 'Màn hình cho phép giảng viên thêm mới tài liệu học tập vào khóa học, đính kèm file, mô tả chi tiết, phân loại tài liệu.',
    # 'Quản lý nội dung khóa học (xóa nội dung).png': 'Màn hình cho phép giảng viên xóa nội dung không còn phù hợp trong khóa học, đảm bảo nội dung luôn cập nhật, chính xác.',
    'Quản lý nội dung khóa học (thêm nội dung).png': 'Màn hình cho phép giảng viên thêm mới nội dung bài học, bài tập, trắc nghiệm vào khóa học, thiết lập thứ tự, phân loại nội dung.',
    # 'Quản lý nội dung khóa học (thêm phần học).png': 'Màn hình cho phép giảng viên thêm mới phần học vào khóa học, thiết lập mục tiêu, nội dung, thời lượng cho từng phần.',
    'Quản lý nội dung khóa học.png': 'Màn hình tổng quan về quản lý nội dung khóa học, cho phép giảng viên xem, tìm kiếm, chỉnh sửa, phân loại, xuất báo cáo nội dung các khóa học.',
    'Quản lý khóa học (hộp thoại).png': 'Màn hình hộp thoại cho phép giảng viên quản lý thông tin chi tiết của khóa học, chỉnh sửa tên, mô tả, lịch học, giảng viên phụ trách.',
    'Quản lý khóa học.png': 'Đây là màn hình trung tâm cho phép quản trị viên hoặc giảng viên quản lý toàn bộ các khóa học trên hệ thống. Người dùng có thể xem danh sách các khóa học hiện có, tìm kiếm, lọc theo chuyên ngành, trạng thái hoặc giảng viên phụ trách. Ngoài ra, chức năng này còn hỗ trợ thêm mới khóa học, chỉnh sửa thông tin chi tiết (tên, mô tả, học phí, thời lượng, giảng viên phụ trách), xóa hoặc tạm ngưng khóa học. Người dùng cũng có thể truy cập vào từng khóa học để quản lý nội dung bài học, tài liệu, bài tập, trắc nghiệm, cũng như theo dõi số lượng học viên đăng ký và tiến độ học tập của từng lớp. Chức năng này giúp đảm bảo việc tổ chức, vận hành và cập nhật các khóa học được thực hiện hiệu quả, đáp ứng nhu cầu đào tạo đa dạng.',
    'Đăng nhập giảng viên.png': 'Màn hình đăng nhập dành riêng cho giảng viên, cho phép truy cập các chức năng quản lý lớp học, khóa học, bài tập, trắc nghiệm và trao đổi với học viên. Đảm bảo an toàn, bảo mật và phân quyền rõ ràng cho giảng viên.',

    # Nhóm quản trị viên
    # 'Quản lý tài khoản cá nhân.png': 'Màn hình cho phép quản trị viên quản lý, cập nhật thông tin cá nhân như họ tên, email, số điện thoại, mật khẩu, ảnh đại diện và các thiết lập bảo mật. Quản trị viên có thể theo dõi lịch sử hoạt động, nhận thông báo hệ thống và thiết lập các quyền truy cập đặc biệt. Chức năng này giúp đảm bảo thông tin cá nhân luôn chính xác, bảo mật và thuận tiện cho việc quản lý hệ thống.',
    'Quản lý đánh giá.png': 'Màn hình cho phép quản trị viên xem, tổng hợp, phân tích và phản hồi các đánh giá từ học viên về chất lượng đào tạo, giảng viên, khóa học, tài liệu. Quản trị viên có thể lọc, xuất báo cáo đánh giá, phát hiện các vấn đề nổi bật và đề xuất cải tiến chất lượng đào tạo.',
    'Quản lý thống kê.png': 'Màn hình này cung cấp các báo cáo, thống kê tổng hợp về hoạt động học tập, giảng dạy và vận hành hệ thống. Người dùng có thể xem thống kê số lượng học viên, giảng viên, khóa học, bài tập, trắc nghiệm, tỷ lệ hoàn thành khóa học, điểm trung bình, số lượng chứng chỉ đã cấp, doanh thu từ học phí, v.v. Ngoài ra, chức năng còn hỗ trợ lọc, xuất báo cáo theo từng khoảng thời gian, lớp học, khóa học hoặc giảng viên. Thông tin thống kê giúp nhà quản lý đưa ra quyết định kịp thời, tối ưu hóa hoạt động đào tạo và nâng cao chất lượng dịch vụ.',
    # 'Quản lý thanh toán (xem thông tin).png': 'Màn hình cho phép quản trị viên xem chi tiết các giao dịch thanh toán, lịch sử thu chi, trạng thái học phí của từng học viên, xuất hóa đơn, kiểm tra các khoản phí còn nợ và gửi thông báo nhắc thanh toán.',
    'Quản lý thanh toán.png': 'Màn hình tổng quan về quản lý thanh toán học phí, cho phép quản trị viên theo dõi doanh thu, các khoản thu/chi, xuất báo cáo tài chính, kiểm soát các khoản phí phát sinh và đảm bảo minh bạch tài chính trong hệ thống.',
    'Danh mục (hộp thoại).png': 'Màn hình hộp thoại cho phép quản trị viên tạo mới, chỉnh sửa, xóa các danh mục khóa học, phân loại chuyên ngành, thiết lập tiêu chí phân loại, đảm bảo hệ thống danh mục luôn cập nhật, khoa học.',
    'Danh mục.png': 'Màn hình tổng quan về quản lý danh mục khóa học, cho phép xem, tìm kiếm, lọc, chỉnh sửa, xuất báo cáo danh mục, hỗ trợ tổ chức hệ thống khóa học hợp lý.',
    'Hộp thoại chat.png': 'Màn hình chat cho phép quản trị viên trao đổi trực tiếp với người dùng (học viên, giảng viên), hỗ trợ giải đáp thắc mắc, xử lý sự cố, gửi thông báo khẩn cấp và lưu trữ lịch sử trò chuyện.',
    'Quản lý lớp học thuật (thêm sinh viên).png': 'Màn hình cho phép quản trị viên thêm sinh viên vào lớp học thuật, tìm kiếm, lọc, phân nhóm sinh viên, gửi thông báo mời tham gia lớp.',
    # 'Quản lý lớp học thuật (xem danh sách).png': 'Màn hình cho phép quản trị viên xem danh sách lớp học, số lượng sinh viên, giảng viên phụ trách, tiến độ học tập của từng lớp.',
    'Quản lý lớp học thuật (phân công).png': 'Màn hình cho phép quản trị viên phân công giảng viên cho từng lớp học thuật, thiết lập lịch dạy, gửi thông báo phân công.',
    'Quản lý lớp học thuật (hộp thoại).png': 'Màn hình hộp thoại cho phép quản trị viên quản lý thông tin chi tiết của lớp học, chỉnh sửa tên lớp, mô tả, lịch học, danh sách sinh viên, giảng viên.',
    'Quản lý lớp học thuật.png': 'Màn hình tổng quan về quản lý lớp học thuật, cho phép quản trị viên xem, tìm kiếm, lọc, xuất báo cáo danh sách lớp, tiến độ học tập, gửi thông báo cho lớp.',
    # 'Quản lý học viên 2.png': 'Màn hình bổ sung cho quản lý học viên, hỗ trợ các nghiệp vụ nâng cao như phân tích học lực, đề xuất hỗ trợ cá nhân, xuất báo cáo chi tiết.',
    'Quản lý học viên (xem thông tin).png': 'Màn hình cho phép quản trị viên xem chi tiết thông tin học viên, lịch sử học tập, điểm số, trạng thái học phí, cảnh báo học vụ.',
    'Quản lý học viên.png': 'Đây là màn hình tổng quan cho phép quản trị viên hoặc giảng viên quản lý toàn bộ danh sách học viên trong hệ thống. Người dùng có thể tìm kiếm, lọc, thêm mới, chỉnh sửa hoặc xóa học viên, cũng như truy cập vào chi tiết từng học viên để theo dõi tiến độ học tập, điểm số và các thông tin liên quan. Chức năng này giúp việc quản lý học viên trở nên dễ dàng, hiệu quả và chính xác.',
    'Quản lý giảng viên (truy cập trang giảng viên).png': 'Màn hình cho phép quản trị viên truy cập trang thông tin chi tiết của giảng viên, xem lịch sử giảng dạy, đánh giá, phân công lớp học.',
    'Quản lý giảng viên (hộp thoại).png': 'Màn hình hộp thoại cho phép quản trị viên quản lý thông tin giảng viên, chỉnh sửa hồ sơ, phân công lớp học, gửi thông báo.',
    'Quản lý giảng viên.png': 'Màn hình tổng quan về quản lý giảng viên, cho phép xem, tìm kiếm, lọc, xuất báo cáo danh sách giảng viên, phân công giảng dạy.',
    'Quản lý khóa học (xem nội dung khóa học).png': 'Màn hình cho phép quản trị viên xem chi tiết nội dung của từng khóa học, bao gồm bài học, bài tập, trắc nghiệm, tài liệu, giảng viên phụ trách.',
    'Quản lý khóa học (hộp thoại).png': 'Màn hình hộp thoại cho phép quản trị viên quản lý thông tin chi tiết của khóa học, chỉnh sửa tên, mô tả, lịch học, giảng viên phụ trách.',
    'Quản lý khóa học.png': 'Đây là màn hình trung tâm cho phép quản trị viên hoặc giảng viên quản lý toàn bộ các khóa học trên hệ thống. Người dùng có thể xem danh sách các khóa học hiện có, tìm kiếm, lọc theo chuyên ngành, trạng thái hoặc giảng viên phụ trách. Ngoài ra, chức năng này còn hỗ trợ thêm mới khóa học, chỉnh sửa thông tin chi tiết (tên, mô tả, học phí, thời lượng, giảng viên phụ trách), xóa hoặc tạm ngưng khóa học. Người dùng cũng có thể truy cập vào từng khóa học để quản lý nội dung bài học, tài liệu, bài tập, trắc nghiệm, cũng như theo dõi số lượng học viên đăng ký và tiến độ học tập của từng lớp. Chức năng này giúp đảm bảo việc tổ chức, vận hành và cập nhật các khóa học được thực hiện hiệu quả, đáp ứng nhu cầu đào tạo đa dạng.',
    'Đăng nhập quản trị viên.png': 'Màn hình đăng nhập dành riêng cho quản trị viên hệ thống. Tại đây, quản trị viên nhập tên đăng nhập và mật khẩu để truy cập các chức năng quản lý, cấu hình hệ thống, kiểm soát người dùng, khóa học, tài chính và các nghiệp vụ quan trọng khác. Chức năng này đảm bảo an toàn, bảo mật và phân quyền truy cập rõ ràng giữa các vai trò trong hệ thống.'
}

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
    if not os.path.exists(folder):
        continue
    img_files = [f for f in os.listdir(folder) if f.lower().endswith('.png')]
    # Sắp xếp logic cho từng nhóm
    if folder.endswith('hocviensinhvien'):
        logical_order = [
            'Trang chủ.png',
            'Đăng ký.png',
            'Đăng nhập.png',
            'Hộp thoại chat.png',
            'Giao diện chatbot.png',
            # 'Các khóa học tham gia.png',
            'Danh sách khóa học.png',
            'Chi tiết khóa học.png',
            # 'Đăng ký khóa học.png',
            'Thanh toán ZaloPay.png',
            'Chi tiết nội dung học video.png',
            'Chi tiết nội dung học văn bản.png',
            'Chi tiết nội dung học slide.png',
            'Chi tiết nội dung học làm trắc nghiệm.png',
            'Chi tiết nội dung học làm bài tập.png',
            # 'Chi tiết nội dung học xem tài liệu.png',
            # 'Các lớp học trực tuyến.png',
            'Tham gia học trực tuyến.png',
            # 'Trang cá nhân.png',
            'Trang cá nhân tiến độ học.png',
            'Trang cá nhân bảng điểm.png',
            'Trang cá nhân chứng chỉ.png',
            'Trang cá nhân thanh toán.png',
            'Thông báo.png',
            'Thông báo mail.png',
            'Tìm kiếm thông tin.png',
            'Danh sách giảng viên.png',
            # 'Thông tin chi tiết giảng viên.png',
            'Các bài tập và trắc nghiệm.png',
            'Nộp bài tập.png',
            'Kết quả bài tập.png',
            'Làm bài trắc nghiệm.png',
            'Hiển thị điểm và đáp án.png',
            # 'Các diễn đàn.png',
            'Chi tiết diễn đàn.png',
        ]
    elif folder.endswith('giangvien'):
        logical_order = [
            'Đăng nhập giảng viên.png',

            'Quản lý khóa học.png',
            'Quản lý khóa học (hộp thoại).png',

            'Quản lý nội dung khóa học.png',
            # 'Quản lý nội dung khóa học (thêm phần học).png',
            'Quản lý nội dung khóa học (thêm nội dung).png',
            # 'Quản lý nội dung khóa học (tài liệu).png',
            'Quản lý nội dung khóa học (thêm tài liệu).png',
            # 'Quản lý nội dung khóa học (bài tập và trắc nghiệm).png',
            'Quản lý nội dung khóa học (hộp thoại bài tập).png',
            'Quản lý nội dung khóa học (hộp thoại trắc nghiệm).png',
            # 'Quản lý nội dung khóa học (xóa nội dung).png',

            'Quản lý học sinh sinh viên.png',
            'Quản lý học sinh sinh viên (cảnh báo học vụ).png',
            'Quản lý học sinh sinh viên (bảng điểm).png',

            'Quản lý lớp học thuật.png',
            'Quản lý lớp học thuật (hộp thoại).png',
            'Quản lý lớp học thuật (thêm sinh viên).png',
            # 'Quản lý lớp học thuật (xem sinh viên).png',
            'Quản lý lớp học thuật (thêm khóa học).png',

            'Quản lý bài tập.png',
            'Quản lý bài tập (thêm bài cho lớp học thuật).png',
            # 'Quản lý bài tập (xem file nộp).png',
            'Quản lý bài tập (chấm điểm).png',

            'Quản lý bài trắc nghiệm.png',
            'Quản lý bài trắc nghiệm (thêm bài cho lớp học thuật).png',
            'Quản lý bài trắc nghiệm (xem bài làm).png',
            # 'Quản lý bài trắc nghiệm (xem theo lớp).png',

            'Hộp thoại chat.png',

            'Quản lý lịch dạy.png',
            'Quản lý lịch dạy (hộp thoại).png',

            'Quản lý điểm danh.png',

            'Quản lý diễn đàn.png',
            'Quản lý diễn đàn (hộp thoại).png',
            # 'Quản lý diễn đàn (xem diễn đàn).png',

            'Quản lý đánh giá.png',
            'Quản lý thống kê.png',
            'Quản lý thông báo.png',
            # 'Quản lý tài khoản.png',
        ]
    elif folder.endswith('quantrivien'):
        logical_order = [
            'Đăng nhập quản trị viên.png',
            'Quản lý khóa học.png',
            'Quản lý khóa học (hộp thoại).png',
            'Quản lý khóa học (xem nội dung khóa học).png',
            'Quản lý giảng viên.png',
            'Quản lý giảng viên (hộp thoại).png',
            'Quản lý giảng viên (truy cập trang giảng viên).png',
            'Quản lý học viên.png',
            'Quản lý học viên (xem thông tin).png',
            # 'Quản lý học viên 2.png',
            'Quản lý lớp học thuật.png',
            'Quản lý lớp học thuật (hộp thoại).png',
            'Quản lý lớp học thuật (thêm sinh viên).png',
            # 'Quản lý lớp học thuật (xem danh sách).png',
            'Quản lý lớp học thuật (phân công).png',
            'Hộp thoại chat.png',
            'Danh mục.png',
            'Danh mục (hộp thoại).png',
            'Quản lý thanh toán.png',
            # 'Quản lý thanh toán (xem thông tin).png',
            'Quản lý thống kê.png',
            'Quản lý đánh giá.png',
            # 'Quản lý tài khoản cá nhân.png',
        ]
    else:
        logical_order = []
    # Sắp xếp theo logic, các file còn lại thêm vào cuối
    # Lọc bỏ các file đã comment trong logical_order (chỉ lấy các dòng không chứa # sau khi loại bỏ khoảng trắng)
    logical_order_filtered = [f.strip() for f in logical_order if '#' not in f.strip()]
    img_files_sorted = [f for f in logical_order_filtered if f in img_files]
    img_files_sorted += [f for f in img_files if f not in img_files_sorted]
    img_files = img_files_sorted
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
        # Thêm mô tả chức năng
        description = img_descriptions.get(img_file, 'Chức năng chưa được mô tả.')
        doc.add_paragraph(description)

doc.save('bao_cao_chuong5.docx')
print('Đã tạo file bao_cao_chuong5.docx thành công!')