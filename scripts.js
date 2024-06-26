document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const addRecipeForm = document.getElementById('addRecipeForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            if (username && validatePassword(password)) {
                loginForm.submit();
            } else {
                alert('Please enter a valid username and password.');
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('signupUsername').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;

            if (username && validateEmail(email) && validatePassword(password)) {
                signupForm.submit();
            } else {
                alert('Please fill in all fields correctly.');
            }
        });
    }

    if (addRecipeForm) {
        addRecipeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const description = document.getElementById('description').value;
            const rating = parseFloat(document.getElementById('rating').value);

            if (name && description && rating >= 0 && rating <= 5) {
                addRecipeForm.submit();
            } else {
                alert('Please fill in all fields correctly.');
            }
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }
});
