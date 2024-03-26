// DOM ELEMENTS
const formUserData = document.querySelector('.form-user-data');
const formPassword = document.querySelector('.form-user-settings');


// USE API TO UPDATE DATA
const updateSetting = async (data, type) => {
    const url = (type === 'password') 
            ? '/api/users/updateMyPassword' 
            : '/api/users/updateMe'
    try {
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        if (res.data.status === 'success') {
            showAlert('success', `Success to update your ${type.toUpperCase()}!`);
            window.setTimeout(() => {
                location.assign('/me');
            });
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};

if (formUserData) {
    formUserData.addEventListener('submit', (e) => {
        e.preventDefault();

        // use FormData with data can not input
        const form = new FormData();

        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
       
        updateSetting(form, 'data');
    });
};

if (formPassword) {
    formPassword.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('.save--password-btn').innerHTML = 'Updating...';

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSetting({
            passwordCurrent, 
            password, 
            passwordConfirm}, 'password');

        document.querySelector('.save--password-btn').innerHTML = 'Save password';

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value ='';

    });
};



