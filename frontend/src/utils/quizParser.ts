import mammoth from "mammoth";
import { QuestionType, QuizOption, QuizQuestion } from "../types/quiz.types";

export const parseQuizDocument = async (
  file: File
): Promise<QuizQuestion[]> => {
  try {
    let textContent = "";
    if (file.type === "application/pdf") {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
      const page = await pdf.getPage(1);
      const content = await page.getTextContent();
      textContent = content.items.map((item: any) => item.str).join("\n");
    } else {
      const result = await mammoth.extractRawText({
        arrayBuffer: await file.arrayBuffer(),
      });
      textContent = result.value;
    }

    // Split by "Question:" and remove any content before the first question
    const questions = textContent
      .split(/Question:/i)
      .slice(1) // Remove content before first "Question:"
      .filter((q) => q.trim());

    return questions.map((questionBlock, index) => {
      const lines = questionBlock.split("\n").filter((line) => line.trim());
      // Remove any leading/trailing whitespace from question text
      const questionText = lines[0].trim();
      const options: QuizOption[] = [];
      let correctExplanation = "";
      let correctAnswerIndex = -1;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith("Correct:")) {
          correctAnswerIndex =
            parseInt(line.replace("Correct:", "").trim()) - 1;
        } else if (line.startsWith("Explanation:")) {
          correctExplanation = line.replace("Explanation:", "").trim();
        } else if (line.match(/^[A-D]\.|^\d+\./)) {
          const optionText = line.replace(/^[A-D]\.|^\d+\./, "").trim();
          options.push({
            optionText,
            isCorrect: false,
            orderNumber: options.length + 1,
            id: Date.now() + Math.random(),
            questionId: Date.now(), // Replace with actual questionId if available
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // Set correct answer
      if (correctAnswerIndex >= 0 && correctAnswerIndex < options.length) {
        options[correctAnswerIndex].isCorrect = true;
      }

      return {
        questionText,
        questionType: QuestionType.MULTIPLE_CHOICE,
        points: 1,
        orderNumber: index + 1,
        options,
        correctExplanation,
        id: Date.now() + Math.random(),
        quizId: Date.now(), // Replace with actual quizId if available
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("Error parsing document:", error);
    throw new Error("Could not parse quiz document");
  }
};
