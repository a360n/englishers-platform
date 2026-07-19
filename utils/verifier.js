// Receipt verification utility using pdf-parse and HMAC signature comparison
const { PDFParse } = require('pdf-parse');
const { generateSignature } = require('./pdf');
const db = require('../db/index');

async function verifyReceiptPDF(pdfBuffer) {
    try {
        // Extract text from the PDF buffer
        const parser = new PDFParse({ data: pdfBuffer });
        const pdfData = await parser.getText();
        const text = pdfData.text;

        console.log('Extracted text from PDF for verification:\n', text);

        // Regex parsing of key receipt fields (supports both Arabic and English formats)
        const serialMatch = text.match(/(?:Receipt Serial|الرقم التسلسلي للوصل):\s*(\d+)/i);
        const nameMatch = text.match(/(?:Student Name|اسم الطالب):\s*([^\n\r]+)/i);
        const amountMatch = text.match(/(?:Paid Amount|المبلغ المدفوع):[\s\n\r]*([\d,]+)\s*(?:IQD|د\.ع|ع\.د)/i);
        const dateMatch = text.match(/(?:Date|التاريخ):\s*([\d-]+)/i);
        const signatureMatch = text.match(/(?:Signature|التوقيع الرقمي|التوقيع):[\s\n\r]*([a-fA-F0-9]{64})/i);

        if (!serialMatch || !nameMatch || !amountMatch || !dateMatch || !signatureMatch) {
            return {
                valid: false,
                reason: 'Could not extract all security verification details from the PDF structure. The document format may be incorrect or corrupted.'
            };
        }

        const serial = parseInt(serialMatch[1]);
        const studentName = nameMatch[1].trim();
        const amountRaw = amountMatch[1];
        // Strip commas from amount (e.g., "150,000" -> "150000")
        const amount = parseFloat(amountRaw.replace(/,/g, ''));
        const dateStr = dateMatch[1].trim();
        const pdfSignature = signatureMatch[1].trim();

        // Step 1: Verify cryptographic signature (detects any manual edit in PDF text)
        const expectedSignature = generateSignature(serial, studentName, amount, dateStr);
        
        if (pdfSignature !== expectedSignature) {
            return {
                valid: false,
                reason: 'Cryptographic signature mismatch! The PDF text content has been modified or tampered with.',
                details: { serial, studentName, amount, dateStr, pdfSignature, expectedSignature }
            };
        }

        // Step 2: Cross-verify with database records (detects duplicates or forge-from-scratch attempts)
        const paymentResult = await db.query(
            `SELECT p.*, s.name as student_name, s.national_id, s.phone 
             FROM payments p 
             JOIN students s ON p.student_id = s.id 
             WHERE p.id = $1`,
            [serial]
        );

        if (paymentResult.rows.length === 0) {
            return {
                valid: false,
                reason: `No matching receipt with Serial Number ${serial} found in the database.`,
                details: { serial, studentName, amount, dateStr }
            };
        }

        const dbPayment = paymentResult.rows[0];
        const dbDateStr = new Date(dbPayment.created_at).toISOString().split('T')[0];
        
        // Check if database values match parsed values
        const matchesDB = 
            dbPayment.student_name.trim() === studentName &&
            parseFloat(dbPayment.amount) === amount &&
            dbDateStr === dateStr &&
            dbPayment.signature === pdfSignature;

        if (!matchesDB) {
            return {
                valid: false,
                reason: 'The receipt data matches its signature but does not match the record stored in the database! It might have been forged using an invalid database trace.',
                details: {
                    parsed: { serial, studentName, amount, dateStr },
                    db: {
                        serial: dbPayment.id,
                        studentName: dbPayment.student_name,
                        amount: parseFloat(dbPayment.amount),
                        dateStr: dbDateStr
                    }
                }
            };
        }

        return {
            valid: true,
            reason: 'Receipt is authentic and unmodified.',
            details: {
                serial,
                studentName,
                amount,
                dateStr,
                paymentType: dbPayment.payment_type,
                description: dbPayment.custom_description,
                phone: dbPayment.phone,
                nationalId: dbPayment.national_id
            }
        };

    } catch (error) {
        console.error('Error verifying receipt PDF:', error);
        return {
            valid: false,
            reason: `Verification failed due to server error: ${error.message}`
        };
    }
}

module.exports = {
    verifyReceiptPDF
};
