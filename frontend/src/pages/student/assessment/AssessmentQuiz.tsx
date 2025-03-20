import QuizContent from "../../../components/common/course/QuizContent";
import CustomContainer from "../../../components/common/CustomContainer";

const mockQuestions = [
  {
    id: 1,
    content: "useState hook được sử dụng để làm gì?",
    options: [
      "Quản lý side effects",
      "Quản lý state trong functional component",
      "Tối ưu performance",
      "Xử lý routing",
    ],
    correctAnswer: 1,
    explanation:
      "useState là hook cơ bản để quản lý state trong functional component.",
  },
  {
    id: 2,
    content: "useEffect hook được gọi khi nào?",
    options: [
      "Chỉ khi component mount",
      "Sau mỗi lần render",
      "Khi dependencies thay đổi",
      "Tất cả các trường hợp trên",
    ],
    correctAnswer: 3,
    explanation:
      "useEffect có thể được gọi trong cả 3 trường hợp tùy vào cách sử dụng dependencies.",
  },
  {
    id: 3,
    content: "useMemo hook dùng để làm gì?",
    options: [
      "Tối ưu performance bằng cách cache giá trị",
      "Quản lý state",
      "Xử lý side effects",
      "Tạo ref",
    ],
    correctAnswer: 0,
    explanation:
      "useMemo giúp tối ưu performance bằng cách cache giá trị tính toán.",
  },
  {
    id: 4,
    content: "useCallback hook khác gì với useMemo?",
    options: [
      "useCallback cache function, useMemo cache value",
      "useCallback cache value, useMemo cache function",
      "Không có sự khác biệt",
      "Không thể so sánh",
    ],
    correctAnswer: 0,
    explanation:
      "useCallback được sử dụng để cache function references, trong khi useMemo cache giá trị tính toán.",
  },
  {
    id: 5,
    content: "Custom hooks trong React là gì?",
    options: [
      "Các hooks có sẵn của React",
      "Function bắt đầu bằng use và có thể tái sử dụng logic",
      "Class components",
      "Thư viện bên thứ 3",
    ],
    correctAnswer: 1,
    explanation:
      "Custom hooks là các function bắt đầu bằng use và cho phép tái sử dụng logic giữa các components.",
  },
];

// Sử dụng lại component QuizContent
export const AssessmentQuiz = () => {
  return (
    <CustomContainer>
      <QuizContent
        quizData={{
          id: 1,
          title: "Kiểm tra kiến thức React Hooks",
          description:
            "Hãy hoàn thành bài kiểm tra để đánh giá hiểu biết của bạn về React Hooks",
          timeLimit: 30, // phút
          passingScore: 70,
          questions: mockQuestions, // Dữ liệu câu hỏi sẽ được lấy từ API
          maxAttempts: 3,
        }}
        onComplete={(score) => {
          console.log("Quiz completed with score:", score);
          // Thêm logic cập nhật trạng thái hoàn thành
        }}
      />
    </CustomContainer>
  );
};

// Thêm default export
export default AssessmentQuiz;
