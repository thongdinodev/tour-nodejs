// pk_test_51OyseOJbzPGzbdSePbGZgHPSyxMl4Al9RB9yD7Cq1bz8Di6NPsTFnz16G1uEMiyp9qZXUfxEdrOVrhqGJpQ66VEN00axEnLSXv

const bookBtn = document.getElementById('book-tour');

const stripe = Stripe("pk_test_51Oyx4oH3yLB7VM2cYTzfF1NCdlSC7tdRjKdzGtviESHemcoMVJ9banX43hk1DQYIBqW7VBeZjeYi6apXclk0igDJ00T9AfMnxp");

const bookTour = async tourId => {
    try {
        const session = await axios({
            method: 'GET',
            url: `/api/bookings/checkout-session/${tourId}`
        });
        console.log(session);

        // 2) Create checkout form + change credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (error) {
        console.log(error);
        showAlert('error', err);
    }
};

if (bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    });
}