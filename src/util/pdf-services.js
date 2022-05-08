const PDFDocument = require("pdfkit");
const fs = require("fs");
const { Base64Encode } = require("base64-stream");

function buildPdf(invoices,  endCallback) {
  const doc = new PDFDocument({
    bufferPages: true,
    font: "fonts/Roboto-Regular.ttf",
    margin: 50,
  });
  // doc.on("data", dataCallback);
  // doc.on("end", endCallback);
  generateHeader(doc);
  invoices.map((invoice) => {
    generateCustomerInformation(doc, invoice);
    
    generateInvoiceTable(doc, invoice.post);
    doc.addPage();
  });
  
  let out = fs.createWriteStream('output.pdf')
  doc.pipe(out);
  
  // var stream = doc.pipe(new Base64Encode());

  doc.end(); // will trigger the stream to end

  // stream.on("data", dataCallback);

  // stream.on("end", endCallback);
  out.on("finish", endCallback);
}

function generateHeader(doc) {
  doc.fontSize(20).text(`CÁC KHOẢNG THU CHI`, 180, 10);
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Payment is due within 15 days. Thank you for your business.",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateCustomerInformation(doc, invoice) {
  invoice.date.setMinutes(
    invoice.date.getMinutes() + invoice.date.getTimezoneOffset()
  );
  doc
    .fontSize(15)
    .text(`Trong ngày: ${invoice.date.toLocaleDateString("br-FR")}`, 70, 50);
}
// new Date().

function generateTableRow(doc, x, y, c1, c2, c3, c4) {
  doc
    .fontSize(10)
    .text(c1, 50 + x, 70 + y)
    .text(c2, 50 + x, 85 + y)
    .text(c3, 50 + x, 100 + y)
    .text(c4, 50 + x, 115 + y);
  // .text(c5, 30+x, 450+y);
}
function generateInvoiceTable(doc, post) {
  let x = 0,
    y = 0;
  post.map((post, i) => {
    // console.log(post);
    if (i > 8) {
      x = 300;
      y = i - 9;
    }
    const position = y * 75;
    y++;
    generateTableRow(
      doc,
      x,
      position,
      "Số tiền:",
      "Ghi chú:",
      "Nhóm:",
      "Kiểu:"
    );
    generateTableRow(
      doc,
      x + 50,
      position,
      post.money,
      post.note,
      post.group,
      post.type
    );
  });
}

module.exports = { buildPdf };
