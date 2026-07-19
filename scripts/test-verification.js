// Automated Integration Test for Receipt Cryptographic Verification Pipeline
const path = require('path');
const fs = require('fs');
const db = require('../db/index');
const { generateReceiptPDF } = require('../utils/pdf');
const { verifyReceiptPDF } = require('../utils/verifier');

async function runTest() {
    console.log('========================================================');
    console.log('       RUNNING RECEIPT SECURITY PIPELINE TEST');
    console.log('========================================================\n');

    // Make sure receipts folders exist
    const receiptsDir = path.join(__dirname, '../receipts');
    const studentReceiptsDir = path.join(receiptsDir, 'student');
    const adminReceiptsDir = path.join(receiptsDir, 'admin');

    if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir);
    if (!fs.existsSync(studentReceiptsDir)) fs.mkdirSync(studentReceiptsDir);
    if (!fs.existsSync(adminReceiptsDir)) fs.mkdirSync(adminReceiptsDir);

    let testStudentId = null;
    const testPDFPath = path.join(studentReceiptsDir, 'receipt_9999_Test_Student_Name_student.pdf');

    try {
        // Clean up previous run if crashed
        await db.query('DELETE FROM payments WHERE id = 9999');
        await db.query("DELETE FROM students WHERE national_id = '999-999-999'");

        // 1. Insert a test student
        console.log('[1/5] Creating test student in database...');
        const stuRes = await db.query(
            `INSERT INTO students (
                name, national_id, dob, pob, qualification, phone, address, purpose, level, period, study_type, referral
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
            ['Test Student Name', '999-999-999', '2000-01-01', 'Test Baghdad', 'BSc', '07799999999', 'Test Address', 'Learning', 'B1', 'evening', 'in_person', 'ad']
        );
        testStudentId = stuRes.rows[0].id;
        console.log(`      Created Student ID: ${testStudentId}`);

        // 2. Insert a test payment record (Serial 9999 placeholder signature)
        console.log('[2/5] Registering test payment record...');
        const payRes = await db.query(
            `INSERT INTO payments (id, student_id, amount, payment_type, custom_description, signature) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [9999, testStudentId, 75000.00, 'installment', 'Test Payment Installment', 'TEMP']
        );
        const payment = payRes.rows[0];

        // Format Date
        const dateStr = new Date(payment.created_at).toISOString().split('T')[0];

        // Re-generate signature and update
        const { generateSignature } = require('../utils/pdf');
        const signature = generateSignature(payment.id, 'Test Student Name', payment.amount, dateStr);
        
        await db.query('UPDATE payments SET signature = $1 WHERE id = $2', [signature, payment.id]);
        payment.signature = signature;
        console.log(`      Created Payment Serial: ${payment.id} with Signature: ${signature}`);

        // 3. Generate Receipt PDF
        console.log('[3/5] Generating Signed Receipt PDF...');
        const student = { name: 'Test Student Name', national_id: '999-999-999', phone: '07799999999' };
        await generateReceiptPDF(payment, student, testPDFPath, 'student');
        console.log(`      Receipt PDF generated at: ${testPDFPath}`);

        // 4. Read PDF file and test verifier on the unmodified receipt
        console.log('[4/5] Running verification on authentic PDF file...');
        const pdfBuffer = fs.readFileSync(testPDFPath);
        const verifyResult = await verifyReceiptPDF(pdfBuffer);

        console.log('      Verification Result:', verifyResult.valid ? 'VALID (PASSED)' : 'INVALID (FAILED)');
        console.log('      Reason:', verifyResult.reason);

        if (!verifyResult.valid) {
            console.error('      Verification Details:', verifyResult.details);
            throw new Error('Unmodified PDF failed verification check!');
        }

        // 5. Test verification on tampered data
        console.log('[5/5] Testing verifier resistance against tampering...');
        // We will simulate a tampered PDF by editing the database record and re-checking.
        // Let's modify the amount in the database to 150000.
        // It should reject the original PDF since database details do not match PDF content!
        await db.query('UPDATE payments SET amount = 150000.00 WHERE id = 9999');
        const verifyTamperedResult = await verifyReceiptPDF(pdfBuffer);

        console.log('      Verification with altered database amount Result:', verifyTamperedResult.valid ? 'VALID (FAILED)' : 'INVALID (PASSED)');
        console.log('      Reason:', verifyTamperedResult.reason);

        if (verifyTamperedResult.valid) {
            throw new Error('Altered receipt details were wrongly accepted as valid!');
        }

        console.log('\n========================================================');
        console.log('       ALL SECURITY TESTS COMPLETED SUCCESSFULLY!');
        console.log('========================================================');

    } catch (err) {
        console.error('\n[TEST ERROR]:', err.message);
        process.exit(1);
    } finally {
        // Clean up database records
        console.log('\nCleaning up database records...');
        await db.query('DELETE FROM payments WHERE id = 9999');
        if (testStudentId) {
            await db.query('DELETE FROM students WHERE id = $1', [testStudentId]);
        }
        // Clean up generated file
        if (fs.existsSync(testPDFPath)) {
            fs.unlinkSync(testPDFPath);
        }
        console.log('Cleanup finished.');
        process.exit(0);
    }
}

runTest();
