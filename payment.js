document.addEventListener('DOMContentLoaded', () => {
    // 1. Get Parameters from URL
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name') || 'Student';
    const email = params.get('email') || '';
    const course = params.get('course') || 'Technical Mastery';
    const price = params.get('price') || '15000';

    // 2. Update UI
    document.getElementById('display-name').innerText = name;
    document.getElementById('display-course').innerText = course;
    document.getElementById('display-price').innerText = `₹ ${parseInt(price).toLocaleString('en-IN')}`;

    // 3. Configure UPI Details
    // Replace with your actual UPI ID
    const VPA = "sukhadiyavishvam22-1@okicici";
    const MERCHANT_NAME = "sukhadiya Vishvam";
    const TRANSACTION_NOTE = `Enrollment for ${course}`;

    // 4. Generate UPI URI
    // Format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
    const upiUri = `upi://pay?pa=${VPA}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${price}&cu=INR&tn=${encodeURIComponent(TRANSACTION_NOTE)}`;

    // 5. Generate QR Code
    const qrImage = document.getElementById('qr-code');
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;
    qrImage.src = qrApiUrl;

    // 6. Set Up App Links (Intents)
    // For mobile devices, these will open the respective apps
    const mainPayBtn = document.getElementById('main-pay-btn');
    const gpayLink = document.getElementById('gpay-link');
    const phonepeLink = document.getElementById('phonepe-link');
    const paytmLink = document.getElementById('paytm-link');

    const handlePayment = (e) => {
        // Only try to open intent if on mobile
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            // Intent will open the system's payment picker or the specific app if targeted
            window.location.href = upiUri;
        } else {
            alert('Please scan the QR code using your mobile UPI app to complete the payment.');
        }
    };

    mainPayBtn.addEventListener('click', handlePayment);
    gpayLink.addEventListener('click', (e) => {
        e.preventDefault();
        handlePayment();
    });
    phonepeLink.addEventListener('click', (e) => {
        e.preventDefault();
        handlePayment();
    });
    paytmLink.addEventListener('click', (e) => {
        e.preventDefault();
        handlePayment();
    });

    // 7. Mock Payment Verification
    // In a real app, you'd use a payment gateway callback or polling
    mainPayBtn.addEventListener('mousedown', () => {
        // Just for demo feel
        console.log('Payment initiated...');
    });
});
