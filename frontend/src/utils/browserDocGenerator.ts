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
                  text: "BÀI TRẮC NGHIỆM",
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({}),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Tiêu đề: Nhập tiêu đề bài trắc nghiệm tại đây",
                  bold: true,
                }),
              ],
            }),
            new Paragraph({}),
            // Example Question
            new Paragraph({
              children: [
                new TextRun({
                  text: "Câu 1 (1 điểm): Phần tử HTML được đặt trong dấu ngoặc nào?",
                  bold: true,
                }),
              ],
            }),
            new Paragraph({ children: [new TextRun("A. <, > (Đáp án đúng)")] }),
            new Paragraph({ children: [new TextRun("B. [, ]")] }),
            new Paragraph({ children: [new TextRun("C. {, }")] }),
            new Paragraph({ children: [new TextRun("D. (, )")] }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Giải thích: Phần tử HTML được định nghĩa bằng cách sử dụng cặp dấu ngoặc nhọn < và >.",
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
              "- Dòng đầu tiên: 'BÀI TRẮC NGHIỆM' (in hoa)",
              "- Dòng tiếp theo: 'Tiêu đề: ...' (ghi tiêu đề bài trắc nghiệm)",
              "- Mỗi câu hỏi bắt đầu bằng: 'Câu X (Y điểm): Nội dung câu hỏi'",
              "- Các đáp án bắt đầu bằng: 'A. ...', 'B. ...', 'C. ...', 'D. ...'",
              "- Đáp án đúng thêm '(Đáp án đúng)' ở cuối đáp án đó",
              "- Thêm dòng 'Giải thích: ...' nếu muốn giải thích cho câu hỏi",
              "- Các câu hỏi cách nhau bởi một dòng trống",
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
