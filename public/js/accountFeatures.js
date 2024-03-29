// axios are promise, so use async, await
// create a cookie for client side to login account

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logoutBtn = document.querySelector('.logout_btn');

// show ALERT function
const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
};

// LOGIN feature
const loginUser = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/users/login',
            data: {
                email,
                password
            }  
        });
        console.log(res);

        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};

// LOGOUT feature

const logoutUser = async (req, res, next) => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/users/logout'
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Success to logout your account!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (error) {
        console.log('error', 'Error to logout account, please try again!');
    }
};

const signupNewUser = async(data) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/users/signup',
            data
        });
        console.log(res);
        if (res.data.status === 'success') {
            window.setTimeout(() => {
                showAlert('success', 'Congratulate to success sign up account!!!');
                location.assign('/');
            });
        }
    } catch (error) {
        showAlert(error.response.data.message);
    }
};

// CONDITION TO EXCUTE CODE
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        
        e.preventDefault();
    
        // get data from client
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        loginUser(email, password);
    });
};

if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
};

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        signupNewUser({name, email, password, passwordConfirm});
    })
}