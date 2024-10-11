---
showOnIndexPage: true
date: 2022-12-22 09:50:19
title: PDFSharp
image: PDFSharp.png
description: Read a PDF document with PDFSharp, add some texts and save it with new name
tags:
  - PDF
  - Dotnet
---

## References

[PDFSharp](http://www.pdfsharp.net/)

## Code

~~~C#
using PdfSharp.Drawing;
using PdfSharp.Pdf;
using PdfSharp.Pdf.Advanced;
using PdfSharp.Pdf.IO;

System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

PdfDocument origDocument = PdfReader.Open("C:\\Users\\fleishor\\MyDevelopment\\MyPdfSharp\\MyPdfSharp\\Formular.pdf", PdfDocumentOpenMode.Import);
PdfDocument newDocument = new PdfDocument();

for (int pageIndex = 0; pageIndex < origDocument.Pages.Count; pageIndex++)
{
    newDocument.AddPage(origDocument.Pages[pageIndex]);
}

PdfPage page = newDocument.Pages[0];

XGraphics gfx = XGraphics.FromPdfPage(page);

/*
XColor colorHelpLines = XColors.LightGreen;
XPen lineRed = new XPen(colorHelpLines, 1);
XFont font = new XFont("Verdana", 6, XFontStyle.Regular);
XRect rect = new XRect(0, 0, 20, 10);
for (int y = 0; y < page.Height; y = y + 24)
{
    gfx.DrawLine(lineRed, 0, y, page.Width, y);
    rect.Y = y;
    gfx.DrawString(y.ToString(), font, XBrushes.LightGreen, rect, XStringFormats.BottomLeft);
}
*/

XFont fontText = new XFont("Verdana", 10, XFontStyle.Regular);



XRect rectText = new XRect(65, 264, 350, 24);
gfx.DrawString("Hello, World!", fontText, XBrushes.Black, rectText, XStringFormats.BottomLeft);

rectText = new XRect(65, 288, 350, 24);
gfx.DrawString("Hello, World!", fontText, XBrushes.Black, rectText, XStringFormats.BottomLeft);


newDocument.Save("C:\\Users\\fleishor\\MyDevelopment\\MyPdfSharp\\MyPdfSharp\\FormularAusgefuellt.pdf");
~~~
