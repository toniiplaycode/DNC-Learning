import { useParams } from "react-router-dom";
import QuizContent from "../../../components/common/course/QuizContent";
import CustomContainer from "../../../components/common/CustomContainer";

// Sử dụng lại component QuizContent
export const AssessmentQuiz = () => {
  const { id } = useParams();

  return (
    <CustomContainer>
      <QuizContent
        quizId={id}
        onComplete={(score) => {
          console.log("Quiz completed with score:", score);
        }}
      />
    </CustomContainer>
  );
};

// Thêm default export
export default AssessmentQuiz;
