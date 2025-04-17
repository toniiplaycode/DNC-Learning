import mammoth from "mammoth";
import { QuestionType, QuizOption, QuizQuestion } from "../types/quiz.types";

interface ParsedQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const parseQuestionBlock = (block: string): ParsedQuestion => {
  // Clean up and standardize the text
  const cleanBlock = block
    .replace(/\r\n/g, "\n")
    .replace(/([A-D])\./g, "\n$1.") // Add line break before options
    .replace(/Correct:/g, "\nCorrect:")
    .replace(/Explanation:/g, "\nExplanation:")
    .replace(/[-]+\s*$/gm, ""); // Remove dashes at the end of lines

  const lines = cleanBlock
    .split("\n")
    .map((line) => line.trim().replace(/[-]+$/, "")) // Remove trailing dashes from each line
    .filter((line) => line.length > 0);

  let questionText = "";
  const options: string[] = [];
  let correctAnswer = -1;
  let explanation = "";

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle question
    if (line.startsWith("Question:")) {
      questionText = line.replace(/^Question:\s*/i, "").trim();
      continue;
    }

    // Handle options (A., B., C., D.)
    const optionMatch = line.match(/^([A-D])\.\s*(.+?)[-]*$/i); // Added [-]* to match optional dashes at end
    if (optionMatch) {
      const [, , text] = optionMatch;
      options.push(text.trim());
      continue;
    }

    // Handle correct answer
    if (line.startsWith("Correct:")) {
      correctAnswer = parseInt(line.replace(/Correct:\s*/i, "").trim()) - 1;
      continue;
    }

    // Handle explanation
    if (line.startsWith("Explanation:")) {
      explanation = line.replace(/Explanation:\s*/i, "").trim();
      continue;
    }
  }

  // Validation
  if (!questionText) {
    throw new Error("Question text is missing");
  }
  if (options.length === 0) {
    throw new Error(
      `No options found for question: "${questionText.slice(0, 50)}..."`
    );
  }
  if (correctAnswer === -1) {
    throw new Error(
      `No correct answer specified for question: "${questionText.slice(
        0,
        50
      )}..."`
    );
  }

  return { questionText, options, correctAnswer, explanation };
};

export const parseQuizDocument = async (
  file: File
): Promise<QuizQuestion[]> => {
  try {
    let textContent = "";

    // Extract text content from file
    const result = await mammoth.extractRawText({
      arrayBuffer: await file.arrayBuffer(),
      preserveLineBreaks: true,
    });
    textContent = result.value;

    // Remove header and footer sections
    textContent = textContent
      .replace(
        /MẪU ĐỊNH DẠNG CÂU HỎI TRẮC NGHIỆM[\s\S]*?Question:/i,
        "Question:"
      ) // Remove header
      .replace(/HƯỚNG DẪN ĐỊNH DẠNG[\s\S]*$/i, ""); // Remove footer

    // Split into question blocks and filter out empty blocks
    const blocks = textContent
      .split(/Question:/i)
      .slice(1) // Remove anything before first Question:
      .map((block) => "Question:" + block.trim())
      .filter((block) => block.length > 0);

    if (blocks.length === 0) {
      throw new Error("No questions found in document");
    }

    // Parse each question block
    const questions = blocks.map((block, index) => {
      const parsed = parseQuestionBlock(block);

      return {
        questionText: parsed.questionText,
        questionType: QuestionType.MULTIPLE_CHOICE,
        points: 1,
        orderNumber: index + 1,
        options: parsed.options.map((text, i) => ({
          optionText: text, // Remove the A., B., C., D. prefix
          isCorrect: i === parsed.correctAnswer,
          orderNumber: i + 1,
          id: Date.now() + Math.random(),
          questionId: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        correctExplanation: parsed.explanation,
        id: Date.now() + Math.random(),
        quizId: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    return questions;
  } catch (error) {
    console.error("Error parsing document:", error);
    throw new Error(`Could not parse quiz document: ${error.message}`);
  }
};
