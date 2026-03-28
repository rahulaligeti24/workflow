const PDFDocument = require("pdfkit");
const {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
} = require("docx");

function parseInline(text, baseSize = 22) {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);

  return segments.map((segment) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return new TextRun({
        text: segment.slice(2, -2),
        bold: true,
        font: "Arial",
        size: baseSize,
      });
    }

    return new TextRun({ text: segment, font: "Arial", size: baseSize });
  });
}

function markdownToDocx(markdown) {
  const lines = markdown.split("\n");
  const children = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trimStart().startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBuffer = [];
      } else {
        for (const codeLine of codeBuffer) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: codeLine || " ",
                  font: "Courier New",
                  size: 18,
                  color: "CC0000",
                }),
              ],
              spacing: { before: 0, after: 0 },
              indent: { left: 720 },
            })
          );
        }
        inCodeBlock = false;
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      children.push(new Paragraph({ children: [new TextRun("")], spacing: { before: 60, after: 60 } }));
      continue;
    }

    if (trimmed.startsWith("### ")) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: trimmed.slice(4), bold: true, font: "Arial", size: 22 })],
        })
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: trimmed.slice(3), bold: true, font: "Arial", size: 26 })],
        })
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: trimmed.slice(2), bold: true, font: "Arial", size: 32 })],
        })
      );
      continue;
    }

    if (/^[-*_]{3,}$/.test(trimmed)) {
      children.push(
        new Paragraph({
          children: [new TextRun("")],
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } },
          spacing: { before: 200, after: 200 },
        })
      );
      continue;
    }

    if (/^[-*] /.test(trimmed)) {
      children.push(
        new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          children: parseInline(trimmed.slice(2)),
        })
      );
      continue;
    }

    if (/^\d+\. /.test(trimmed)) {
      const text = trimmed.replace(/^\d+\. /, "");
      children.push(
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          children: parseInline(text),
        })
      );
      continue;
    }

    if (trimmed.startsWith("> ")) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.slice(2),
              italics: true,
              font: "Arial",
              size: 22,
              color: "555555",
            }),
          ],
          indent: { left: 720 },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: "2E75B6", space: 12 } },
          spacing: { before: 80, after: 80 },
        })
      );
      continue;
    }

    children.push(
      new Paragraph({
        children: parseInline(trimmed),
        spacing: { before: 60, after: 60 },
      })
    );
  }

  return children;
}

async function createDocxBuffer(markdown) {
  const children = markdownToDocx(markdown);

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
        {
          reference: "numbers",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: { run: { font: "Arial", size: 22 } },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 32, bold: true, font: "Arial", color: "1F3864" },
          paragraph: { spacing: { before: 320, after: 200 }, outlineLevel: 0 },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 26, bold: true, font: "Arial", color: "2E75B6" },
          paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 22, bold: true, font: "Arial", color: "2E75B6" },
          paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 2 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

function createPdfBuffer(markdown, title) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(24).font("Helvetica-Bold").fillColor("#2c3e50").text(title || "Documentation");
      doc.moveDown(0.3);
      doc.strokeColor("#3498db").lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.8);

      const lines = markdown.split("\n");

      lines.forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed) {
          doc.moveDown(0.3);
        } else if (trimmed.startsWith("# ")) {
          doc.fontSize(20).font("Helvetica-Bold").fillColor("#2c3e50").text(trimmed.slice(2));
          doc.moveDown(0.3);
        } else if (trimmed.startsWith("## ")) {
          doc.fontSize(16).font("Helvetica-Bold").fillColor("#2c3e50").text(trimmed.slice(3));
          doc.moveDown(0.2);
        } else if (trimmed.startsWith("### ")) {
          doc.fontSize(13).font("Helvetica-Bold").fillColor("#34495e").text(trimmed.slice(4));
          doc.moveDown(0.2);
        } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          doc.fontSize(11).font("Helvetica").fillColor("#333333");
          doc.text(`• ${trimmed.slice(2)}`, { indent: 20, width: 450 });
          doc.moveDown(0.15);
        } else if (trimmed.startsWith("```")) {
          return;
        } else if (trimmed.startsWith("> ")) {
          doc.fontSize(10).font("Helvetica-Oblique").fillColor("#7f8c8d");
          doc.text(trimmed.slice(2), { indent: 20, width: 430 });
          doc.moveDown(0.2);
        } else {
          doc.fontSize(11).font("Helvetica").fillColor("#333333");
          if (/\*\*([^*]+)\*\*/.test(trimmed)) {
            doc.fillColor("#2c3e50").text(trimmed.replace(/\*\*/g, ""), { width: 450 });
          } else {
            doc.text(trimmed, { width: 450 });
          }
          doc.moveDown(0.2);
        }
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function createPdfBase64(markdown, title) {
  const pdfBuffer = await createPdfBuffer(markdown, title);
  return pdfBuffer.toString("base64");
}

module.exports = {
  createDocxBuffer,
  createPdfBase64,
  createPdfBuffer,
};
