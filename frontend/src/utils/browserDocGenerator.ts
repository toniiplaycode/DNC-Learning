import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  HeadingLevel,
  convertInchesToTwip,
} from "docx";

export const generateDocxFromTemplate = async () => {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
              },
            },
          },
          children: [
            new Paragraph({
              heading: HeadingLevel.TITLE,
              children: [
                new TextRun({
                  text: "MẪU ĐỊNH DẠNG CÂU HỎI TRẮC NGHIỆM",
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({}),
            // Question 1
            new Paragraph({
              children: [
                new TextRun({
                  text: "Question: Đây là câu hỏi thứ nhất?",
                  bold: true,
                }),
              ],
            }),
            new Paragraph({ children: [new TextRun("A. Đáp án thứ nhất")] }),
            new Paragraph({ children: [new TextRun("B. Đáp án thứ hai")] }),
            new Paragraph({ children: [new TextRun("C. Đáp án thứ ba")] }),
            new Paragraph({ children: [new TextRun("D. Đáp án thứ tư")] }),
            new Paragraph({
              children: [new TextRun({ text: "Correct: 2", color: "2E74B5" })],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Explanation: Đây là giải thích tại sao đáp án B là đúng",
                  color: "548235",
                }),
              ],
            }),
            new Paragraph({}),

            // Question 2
            new Paragraph({
              children: [
                new TextRun({
                  text: "Question: Đây là câu hỏi thứ hai?",
                  bold: true,
                }),
              ],
            }),
            new Paragraph({ children: [new TextRun("1. Lựa chọn một")] }),
            new Paragraph({ children: [new TextRun("2. Lựa chọn hai")] }),
            new Paragraph({ children: [new TextRun("3. Lựa chọn ba")] }),
            new Paragraph({
              children: [new TextRun({ text: "Correct: 1", color: "2E74B5" })],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Explanation: Giải thích tại sao lựa chọn 1 là đúng",
                  color: "548235",
                }),
              ],
            }),
            new Paragraph({}),
            // Instructions
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [
                new TextRun({ text: "HƯỚNG DẪN ĐỊNH DẠNG", bold: true }),
              ],
            }),
            ...[
              "Mỗi câu hỏi bắt đầu bằng số thứ tự và dấu chấm (1., 2.,...)",
              "Các đáp án có thể đánh số A,B,C,D hoặc 1,2,3,4",
              "Đáp án đúng đánh dấu bằng 'Correct: X' (X là số thứ tự đáp án)",
              "Giải thích không bắt buộc, bắt đầu bằng 'Explanation:'",
              "Các câu hỏi cách nhau bởi một dòng trống",
            ].map(
              (text) =>
                new Paragraph({
                  children: [new TextRun(text)],
                  bullet: {
                    level: 0,
                  },
                })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
  } catch (error) {
    console.error("Error generating DOCX:", error);
    throw new Error("Failed to generate DOCX template");
  }
};
