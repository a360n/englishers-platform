async function test() {
    try {
        console.log('Sending PUT /api/students/1/dues...');
        const res = await fetch('http://localhost:3000/api/students/1/dues', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reg_fee: 10000,
                curriculum_fee: 20000,
                course_fee: 150000
            })
        });
        const data = await res.json();
        console.log('Response Status:', res.status);
        console.log('Response Data:', data);
    } catch (err) {
        console.error('Test Failed:', err);
    }
}

test();
