// PDF generation utility using pdfkit
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate HMAC signature for a payment
function generateSignature(paymentId, studentName, amount, dateStr) {
   const secret = process.env.RECEIPT_SECRET || 'englishers-receipt-cryptographic-hash-key-999';
   // Normalize values
   const dataString = `Serial:${paymentId}|Student:${studentName.trim()}|Amount:${Number(amount)}|Date:${dateStr}`;
   return crypto.createHmac('sha256', secret).update(dataString).digest('hex');
}

// Generate PDF Receipt
// type: 'student' or 'admin'
function generateReceiptPDF(payment, student, outputPath, type = 'student') {
   return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A5', margin: 30 });
      const writeStream = fs.createWriteStream(outputPath);

      doc.pipe(writeStream);

      // Styling Colors
      const primaryColor = '#1C213F'; // Midnight Blue
      const secondaryColor = '#EE7D52'; // Coral Orange
      const darkGrey = '#333333';
      const lightGrey = '#F4F5F7';

      // Load system Arial fonts on macOS, fallback to standard Helvetica
      const regularFont = fs.existsSync('/System/Library/Fonts/Supplemental/Arial.ttf')
         ? '/System/Library/Fonts/Supplemental/Arial.ttf'
         : 'Helvetica';
      const boldFont = fs.existsSync('/System/Library/Fonts/Supplemental/Arial Bold.ttf')
         ? '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
         : 'Helvetica-Bold';

      doc.registerFont('Arial', regularFont);
      doc.registerFont('Arial-Bold', boldFont);

      // Format Date
      const dateObj = new Date(payment.created_at || new Date());
      const dateStr = dateObj.toISOString().split('T')[0];

      // Generate Signature
      const signature = generateSignature(payment.id, student.name, payment.amount, dateStr);

      // Draw horizontal logo
      const logoPath = path.join(__dirname, '..', 'public', 'images', 'horizontal_logo.png');
      if (fs.existsSync(logoPath)) {
         doc.image(logoPath, 30, 18, { height: 36 });
      } else {
         // Fallback text
         doc.fillColor(primaryColor)
            .font('Arial-Bold')
            .fontSize(16)
            .text('ENGLISHERS CLUB', 30, 20);
      }

      // Brand Sub-header in Slate Gray
      doc.fillColor('#64748B')
         .font('Arial')
         .fontSize(7.5)
         .text('', 30, 56, { features: ['rtla'] });

      // Receipt Type Header
      const headerTitle = type === 'student' ? 'وصل قبض طالب' : 'وصل قبض معهد (للإدارة)';
      doc.fillColor(primaryColor)
         .font('Arial-Bold')
         .fontSize(13)
         .text(headerTitle, 250, 26, { align: 'right', width: doc.page.width - 280, features: ['rtla'] });

      // Orange separator line at bottom of header
      doc.strokeColor(secondaryColor)
         .lineWidth(1.5)
         .moveTo(30, 75)
         .lineTo(doc.page.width - 30, 75)
         .stroke();

      // Reset cursor y position below header banner
      doc.y = 90;

      // Metadata Info Block (Date & Serial - Two Column Layout)
      const colWidth = 170;
      const leftX = 30;
      const rightX = 220;
      const startY = doc.y;

      // Right Column: Serial
      doc.fillColor(primaryColor)
         .font('Arial-Bold')
         .fontSize(8)
         .text('الرقم التسلسلي للوصل:', rightX, startY, { align: 'right', width: colWidth, features: ['rtla'] });

      doc.fillColor(darkGrey)
         .font('Arial')
         .fontSize(10)
         .text(payment.id.toString(), rightX, startY + 12, { align: 'right', width: colWidth });

      // Left Column: Date
      doc.fillColor(primaryColor)
         .font('Arial-Bold')
         .fontSize(8)
         .text('التاريخ:', leftX, startY, { align: 'right', width: colWidth, features: ['rtla'] });

      doc.fillColor(darkGrey)
         .font('Arial')
         .fontSize(10)
         .text(dateStr, leftX, startY + 12, { align: 'right', width: colWidth });

      // Set cursor below metadata block
      doc.y = startY + 35;

      // Separator Line
      doc.rect(30, doc.y, doc.page.width - 60, 1).fill(secondaryColor);
      doc.y += 10;

      // Student Info Details
      doc.fillColor(primaryColor)
         .font('Arial-Bold')
         .fontSize(10)
         .text('تفاصيل بيانات الطالب', 30, doc.y, { align: 'right', width: doc.page.width - 60, features: ['rtla'] });

      doc.y += 15;
      const studentDetailsY = doc.y;

      // Student details in 2 column format
      // Right Column: Name
      const isNameArabic = /[\u0600-\u06FF]/.test(student.name);
      doc.fillColor(primaryColor)
         .font('Arial-Bold')
         .fontSize(8)
         .text('اسم الطالب:', rightX, studentDetailsY, { align: 'right', width: colWidth, features: ['rtla'] });

      doc.fillColor(darkGrey)
         .font('Arial')
         .fontSize(10)
         .text(student.name, rightX, studentDetailsY + 12, { align: 'right', width: colWidth, features: isNameArabic ? ['rtla'] : [] });

      // Left Column: Phone / ID
      doc.fillColor(primaryColor)
         .font('Arial-Bold')
         .fontSize(8)
         .text('البطاقة الوطنية / الهاتف:', leftX, studentDetailsY, { align: 'right', width: colWidth, features: ['rtla'] });

      doc.fillColor(darkGrey)
         .font('Arial')
         .fontSize(10)
         .text(`${student.national_id || 'لا يوجد'} / ${student.phone || 'لا يوجد'}`, leftX, studentDetailsY + 12, { align: 'right', width: colWidth });

      // Set cursor below student details
      doc.y = studentDetailsY + 35;

      // Payment Details Block
      const boxX = 30;
      const boxWidth = doc.page.width - 60;
      const boxHeight = 100;
      const boxY = doc.y;

      doc.rect(boxX, boxY, boxWidth, boxHeight).fill(lightGrey);

      doc.y = boxY + 10;
      doc.fillColor(primaryColor)
         .font('Arial-Bold')
         .fontSize(10)
         .text('خلاصة مبلغ الدفعة', boxX + 15, doc.y, { align: 'right', width: boxWidth - 30, features: ['rtla'] });

      const innerColWidth = 155;
      const innerLeftX = boxX + 15;
      const innerRightX = boxX + 185;
      const innerStartY = doc.y + 15;

      // Right Inner Column: Payment Type & Description
      doc.fillColor(primaryColor)
         .font('Arial-Bold')
         .fontSize(8)
         .text('نوع الدفعة:', innerRightX, innerStartY, { align: 'right', width: innerColWidth, features: ['rtla'] });

      const paymentTypeMap = {
         'installment': 'أقساط شهرية',
         'full': 'دفع كامل المبلغ',
         'custom': 'دفعة مخصصة'
      };
      const payTypeArabic = paymentTypeMap[payment.payment_type.toLowerCase()] || payment.payment_type;

      doc.fillColor(darkGrey)
         .font('Arial')
         .fontSize(9)
         .text(payTypeArabic, innerRightX, innerStartY + 10, { align: 'right', width: innerColWidth, features: ['rtla'] });

      doc.fillColor(primaryColor)
         .font('Arial-Bold')
         .fontSize(8)
         .text('تفاصيل الدفعة:', innerRightX, innerStartY + 28, { align: 'right', width: innerColWidth, features: ['rtla'] });

      const isDescArabic = /[\u0600-\u06FF]/.test(payment.custom_description || '');
      doc.fillColor(darkGrey)
         .font('Arial')
         .fontSize(9)
         .text(payment.custom_description || 'لا يوجد', innerRightX, innerStartY + 38, { align: 'right', width: innerColWidth, features: isDescArabic ? ['rtla'] : [] });

      // Left Inner Column: Amount Paid
      doc.fillColor(primaryColor)
         .font('Arial-Bold')
         .fontSize(8)
         .text('المبلغ المدفوع:', innerLeftX, innerStartY, { align: 'right', width: innerColWidth, features: ['rtla'] });

      doc.fillColor(primaryColor)
         .font('Arial-Bold')
         .fontSize(14)
         .text(`${Number(payment.amount).toLocaleString()} د.ع`, innerLeftX, innerStartY + 12, { align: 'right', width: innerColWidth });

      // Set cursor below the payment box
      doc.y = boxY + boxHeight + 15;

      // Security Box / Admin Reference
      const secBoxY = doc.y;
      if (type === 'student') {
         const secBoxHeight = 85;
         doc.rect(30, secBoxY, doc.page.width - 60, secBoxHeight).fill('#FCF3F0'); // Light coral tint

         doc.y = secBoxY + 8;
         doc.fillColor(secondaryColor)
            .font('Arial-Bold')
            .fontSize(8)
            .text('رمز التحقق الأمني (مقاوم للتلاعب والتزوير)', 40, doc.y, { align: 'right', width: doc.page.width - 80, features: ['rtla'] });

         doc.y += 12;
         doc.fillColor(primaryColor)
            .font('Arial-Bold')
            .fontSize(7)
            .text('التوقيع الرقمي:', 40, doc.y, { align: 'right', features: ['rtla'] });

         doc.fillColor(darkGrey)
            .font('Arial')
            .fontSize(7.5)
            .text(signature, 40, doc.y + 10, { align: 'right', width: doc.page.width - 80 });

         doc.y += 15;
         doc.font('Arial')
            .fontSize(7)
            .fillColor('#666666')
            .text('ملاحظة: هذا الوصل الرقمي مؤمن حاسوبياً. أي تعديل في تفاصيله (الرقم التسلسلي، اسم الطالب، المبلغ، أو التاريخ) سيبطل التوقيع ويفشل عملية التحقق.', 40, doc.y, { align: 'right', width: doc.page.width - 80, features: ['rtla'] });
      } else {
         // Admin copy footer
         const adminBoxHeight = 60;
         doc.rect(30, secBoxY, doc.page.width - 60, adminBoxHeight).fill(lightGrey);

         doc.y = secBoxY + 10;
         // Left Column: Processed by
         doc.fillColor(primaryColor)
            .font('Arial-Bold')
            .fontSize(8)
            .text('تمت المعالجة بواسطة:', leftX, doc.y, { align: 'right', width: colWidth, features: ['rtla'] });

         doc.fillColor(darkGrey)
            .font('Arial')
            .fontSize(9)
            .text(payment.created_by || 'نظام تلقائي', leftX, doc.y + 12, { align: 'right', width: colWidth });

         // Right Column: Admin Reference
         doc.fillColor(primaryColor)
            .font('Arial-Bold')
            .fontSize(8)
            .text('مرجع سجل الإدارة:', rightX, secBoxY + 10, { align: 'right', width: colWidth, features: ['rtla'] });

         doc.fillColor(darkGrey)
            .font('Arial')
            .fontSize(9)
            .text(`DB_PAYMENT_RECORD_ID_${payment.id}`, rightX, secBoxY + 22, { align: 'right', width: colWidth });
      }

      // Footer Brand Line
      doc.rect(0, doc.page.height - 30, doc.page.width, 30).fill(primaryColor);
      doc.fillColor('#FFFFFF')
         .font('Arial')
         .fontSize(7)
         .text('منصة نادي إنكليشرز • نظام التحقق المحلي نشط', 30, doc.page.height - 20, { align: 'right', width: doc.page.width - 60, features: ['rtla'] });

      doc.end();

      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', (err) => reject(err));
   });
}

module.exports = {
   generateSignature,
   generateReceiptPDF
};
