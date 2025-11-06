/**
 * export-pdf.ts
 *
 * Export journal entries to PDF using pdf-lib
 * Simple, readable format with dates and mood indicators
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { JournalEntry } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const moodLabels = {
  low: "Difícil",
  ok: "Neutro",
  high: "Ótimo",
};

/**
 * Export journal entries to PDF
 */
export async function exportJournalToPDF(
  entries: JournalEntry[],
  filename = "diario-focus-flow.pdf"
): Promise<void> {
  // Sort entries by date (oldest first for chronological reading)
  const sortedEntries = [...entries].sort((a, b) =>
    a.dateISO.localeCompare(b.dateISO)
  );

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595; // A4 width in points
  const pageHeight = 842; // A4 height in points
  const margin = 50;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = 20;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;

  // Title
  currentPage.drawText("Meu Diário - Focus Flow", {
    x: margin,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 40;

  // Export date
  const exportDate = format(new Date(), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
  currentPage.drawText(`Exportado em: ${exportDate}`, {
    x: margin,
    y: yPosition,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  yPosition -= 40;

  // Helper: Add new page if needed
  const checkPageSpace = (requiredSpace: number) => {
    if (yPosition - requiredSpace < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
  };

  // Helper: Wrap text to fit width
  const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Render each entry
  for (const entry of sortedEntries) {
    checkPageSpace(200);

    // Date header
    const dateStr = format(parseISO(entry.dateISO), "EEEE, d 'de' MMMM", {
      locale: ptBR,
    });
    currentPage.drawText(dateStr, {
      x: margin,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    yPosition -= 25;

    // Mood indicator
    if (entry.mood) {
      const moodText = `Humor: ${moodLabels[entry.mood]}`;
      currentPage.drawText(moodText, {
        x: margin,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });
      yPosition -= 20;
    }

    // Line 1: Como estou
    checkPageSpace(80);
    currentPage.drawText("Como estou me sentindo:", {
      x: margin,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 15;

    const lines1 = wrapText(entry.lines[0], maxWidth, 10);
    for (const line of lines1) {
      checkPageSpace(15);
      currentPage.drawText(line, {
        x: margin,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= lineHeight;
    }
    yPosition -= 10;

    // Line 2: Como quero me sentir
    checkPageSpace(80);
    currentPage.drawText("Como quero me sentir:", {
      x: margin,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 15;

    const lines2 = wrapText(entry.lines[1], maxWidth, 10);
    for (const line of lines2) {
      checkPageSpace(15);
      currentPage.drawText(line, {
        x: margin,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= lineHeight;
    }
    yPosition -= 10;

    // Line 3: Frase-âncora (highlighted)
    checkPageSpace(80);
    currentPage.drawText("Frase-âncora:", {
      x: margin,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 15;

    const lines3 = wrapText(entry.lines[2], maxWidth - 20, 11);
    for (const line of lines3) {
      checkPageSpace(20);
      currentPage.drawText(line, {
        x: margin + 10,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0.1, 0.3, 0.5),
      });
      yPosition -= lineHeight;
    }
    yPosition -= 10;

    // Tags
    if (entry.tags && entry.tags.length > 0) {
      checkPageSpace(20);
      const tagsText = `Tags: ${entry.tags.join(", ")}`;
      currentPage.drawText(tagsText, {
        x: margin,
        y: yPosition,
        size: 9,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
      yPosition -= 20;
    }

    // Separator line
    checkPageSpace(30);
    yPosition -= 10;
    currentPage.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: pageWidth - margin, y: yPosition },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    yPosition -= 30;
  }

  // Save and download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
