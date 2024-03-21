const loginUser = async (email, password) => {

}



// query form to get data
document.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();

    // get data from client
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email + password);
})