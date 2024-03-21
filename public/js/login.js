// axios are promise, so use async, await
// create a cookie for client side to login account

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
    } catch (error) {
        console.log(error.response.data);
    }
};



// query form to get data
document.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();

    // get data from client
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    loginUser(email, password);
});