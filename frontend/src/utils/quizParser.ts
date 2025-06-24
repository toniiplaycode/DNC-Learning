import mammoth from "mammoth";
import { QuestionType, QuizOption, QuizQuestion } from "../types/quiz.types";

// Hàm parse từng block câu hỏi theo định dạng mới
const parseCustomQuestionBlock = (
  block: string,
  index: number
): QuizQuestion => {
  // Tách dòng
  const lines = block
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) throw new Error("Empty question block");

  // Lấy dòng đầu là nội dung câu hỏi
  // Ví dụ: Câu 1 (1 điểm): Phần tử HTML được đặt trong dấu ngoặc nào?
  const questionLine = lines[0];
  const questionMatch = questionLine.match(/^Câu \d+ \((\d+) điểm\):(.+)$/i);
  if (!questionMatch)
    throw new Error("Sai định dạng dòng câu hỏi: " + questionLine);
  const points = parseInt(questionMatch[1]) || 1;
  const questionText = questionMatch[2].trim();

  // Lấy các đáp án (A. ...)
  const options: QuizOption[] = [];
  let explanation = "";
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Đáp án: A. ... (Đáp án đúng)
    const optMatch = line.match(/^([A-D])\.\s*(.+?)(\s*\(Đáp án đúng\))?$/);
    if (optMatch) {
      options.push({
        optionText: optMatch[2].trim(),
        isCorrect: !!optMatch[3],
        orderNumber: options.length + 1,
        id: Date.now() + Math.random(),
        questionId: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      continue;
    }
    // Giải thích
    if (line.startsWith("Giải thích:")) {
      explanation = line.replace("Giải thích:", "").trim();
    }
  }
  if (options.length < 2)
    throw new Error("Cần ít nhất 2 đáp án cho câu hỏi: " + questionText);
  if (!options.some((o) => o.isCorrect))
    throw new Error("Chưa đánh dấu đáp án đúng cho câu hỏi: " + questionText);

  return {
    questionText,
    questionType: QuestionType.MULTIPLE_CHOICE,
    points,
    orderNumber: index + 1,
    options,
    correctExplanation: explanation,
    id: Date.now() + Math.random(),
    quizId: Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const parseQuizDocument = async (
  file: File
): Promise<QuizQuestion[]> => {
  try {
    let textContent = "";
    if (file.name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({
        arrayBuffer: await file.arrayBuffer(),
      });
      textContent = result.value;
    } else {
      textContent = await file.text();
    }

    // Kiểm tra toàn bộ file, nếu có dòng bắt đầu bằng 'Câu' mà không đúng định dạng, báo lỗi luôn
    const allLines = textContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of allLines) {
      if (line.startsWith("Câu")) {
        const match = line.match(/^Câu \d+ \(\d+ điểm\):(.+)$/i);
        if (!match) {
          throw new Error(
            `Câu hỏi phải có định dạng: Câu 1 (1 điểm): Nội dung câu hỏi. Sai: ${line}`
          );
        }
      }
    }

    // Lấy phần tiêu đề (nếu có)
    // BÀI TRẮC NGHIỆM\nTiêu đề: ...\n\n...
    let title = "";
    const titleMatch = textContent.match(/Tiêu đề:\s*(.+)/i);
    if (titleMatch) title = titleMatch[1].trim();

    // Tách các block câu hỏi dựa trên "Câu X (Y điểm):"
    const questionBlocks = textContent
      .split(/(?=Câu \d+ \(\d+ điểm\):)/g)
      .filter((b) => b.trim().startsWith("Câu"));
    if (questionBlocks.length === 0)
      throw new Error("Không tìm thấy câu hỏi nào trong file");

    // Parse từng block
    const questions = questionBlocks.map((block, idx) =>
      parseCustomQuestionBlock(block, idx)
    );
    return questions;
  } catch (error: any) {
    throw new Error(`${error.message}`);
  }
};
