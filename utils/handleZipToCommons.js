const fs = require("fs");
const JSZip = require("jszip");
const PDFDocument = require("pdfkit");
const path = require("path");
const { PDFDocument: PDFLibDocument } = require("pdf-lib");
const winston = require("winston");
const { customFetch } = require("./helper");
const logger = winston.loggers.get("defaultLogger");

/**
 * The function `handleZipToCommons` takes a download URL for a zip file from IA, extracts the images from the
 * zip file, converts them to PDF format, merges the PDFs into a single document, and saves the
 * resulting PDF file locally.
 * @param IADownloadURL_File - The parameter `IADownloadURL_File` is the URL of a file from IA that needs to be
 * downloaded. It is used in the `zipToPdf` function to fetch the zip file and convert it to PDF.
 * @returns The function `handleZipToCommons` returns a promise that resolves to a status code (either
 * 200 or 404).
 */
async function handleZipToCommons(IADownloadURL_File) {
  async function mergePdf(pdfDataArray) {
    try {
      const mergedPdf = await PDFLibDocument.create();
      for (const pdfData of pdfDataArray) {
        const pdfDoc = await PDFLibDocument.load(pdfData);
        const pages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        );
        for (const page of pages) {
          mergedPdf.addPage(page);
        }
      }

      const mergedPdfFile = await mergedPdf.save();
      await fs.promises.writeFile("commonsPayload.pdf", mergedPdfFile);
      logger.log({
        level: "info",
        message: `Polling -  handleZipToCommons: Successfully saved file from  ${IADownloadURL_File} to local`,
      });
      return 200;
    } catch (error) {
      logger.log({
        level: "error",
        message: `Polling -  handleZipToCommons/mergePdf: ${error}`,
      });
      return 404;
    }
  }

  async function zipToPdf() {
    try {
      const res = await customFetch(
        `${IADownloadURL_File}`,
        "GET",
        new Headers({
          "Content-Type": "application/zip",
        }),
        "file"
      );

      const buffer = await res.buffer();
      const zip = await JSZip.loadAsync(buffer);
      const pdfInstances = [];

      await Promise.all(
        Object.values(zip.files).map(async (file, index) => {
          if (file.dir) return;
          if ([".jpg", ".jpeg", ".png"].includes(path.extname(file.name))) {
            const data = await file.async("nodebuffer");
            const pdfDoc = new PDFDocument();
            const buffers = [];
            const writeStream = new require("stream").Writable({
              write(chunk, encoding, callback) {
                buffers.push(chunk);
                callback();
              },
            });
            pdfDoc.pipe(writeStream);
            pdfDoc.image(data, 0, 0, { fit: [595.28, 841.89] }); // A4 size
            pdfDoc.end();
            return new Promise((resolve) => {
              writeStream.on("finish", () => {
                pdfInstances.push({
                  index,
                  pdfInstance: Buffer.concat(buffers),
                });
                resolve();
              });
            });
          }
        })
      );

      pdfInstances.sort((a, b) => a.index - b.index);

      const sortedPdfInstances = pdfInstances.map(
        ({ pdfInstance }) => pdfInstance
      );
      return await mergePdf(sortedPdfInstances);
    } catch (error) {
      logger.log({
        level: "error",
        message: `Polling -  handleZipToCommons/zipToPdf: ${error}`,
      });
      return 404;
    }
  }
  return await zipToPdf();
}

module.exports = handleZipToCommons;
