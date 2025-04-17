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
            // Example Question
            new Paragraph({
              children: [
                new TextRun({
                  text: "--Question: Câu hỏi?",
                  bold: true,
                }),
              ],
            }),
            new Paragraph({ children: [new TextRun("-A. Đáp án 1")] }),
            new Paragraph({ children: [new TextRun("-B. Đáp án 2")] }),
            new Paragraph({ children: [new TextRun("-C. Đáp án 3")] }),
            new Paragraph({ children: [new TextRun("-D. Đáp án 4")] }),
            new Paragraph({
              children: [
                new TextRun({ text: "--Correct: 1", color: "2E74B5" }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "--Explanation: Đáp án 1 đúng vì...",
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
              "Bắt đầu câu hỏi với '--Question:'",
              "Các đáp án bắt đầu với dấu gạch ngang '-A.', '-B.', '-C.', '-D.'",
              "Đáp án đúng đánh dấu bằng '--Correct: X' (X là số thứ tự đáp án)",
              "Giải thích bắt đầu bằng '--Explanation:'",
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
