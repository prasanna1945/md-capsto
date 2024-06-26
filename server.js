const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');
const passwordHash = require('password-hash');

const serviceAccount = require('./key.json'); // Path to your service account key file

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
    try {
        const recipesSnapshot = await db.collection('recipes').get();
        const recipes = recipesSnapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() };
        });
        res.render('index', { recipes });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.send('Something went wrong...');
    }
});

app.get('/recipe/:id', async (req, res) => {
    try {
        const recipeRef = await db.collection('recipes').doc(req.params.id).get();
        if (!recipeRef.exists) {
            return res.send('Recipe not found');
        }
        const recipe = recipeRef.data();
        res.render('recipe', { recipe });
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.send('Something went wrong...');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signupSubmit', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUserSnapshot = await db.collection('users')
            .where('email', '==', email)
            .get();

        if (!existingUserSnapshot.empty) {
            return res.send('User with this email already exists.');
        }

        // Hash the password for security
        const hashedPassword = passwordHash.generate(password);

        // Save user data to Firestore
        await db.collection('users').add({
            username: username,
            email: email,
            password: hashedPassword
        });

        res.redirect('/login'); // Redirect to login page after successful signup
    } catch (error) {
        console.error('Error during signup:', error);
        res.send('Something went wrong...');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/loginSubmit', async (req, res) => {
    const { username, password } = req.body;

    console.log('Received login request with username:', username, 'and password:', password);

    try {
        if (!username || !password) {
            return res.send('Invalid username or password.');
        }

        const userSnapshot = await db.collection('users')
            .where('username', '==', username)
            .get();

        if (userSnapshot.empty) {
            return res.send('Invalid username or password.');
        }

        const user = userSnapshot.docs[0].data();

        if (passwordHash.verify(password, user.password)) {
            res.redirect('/dashboard');
        } else {
            res.send('Invalid username or password.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.send('Something went wrong...');
    }
});

app.get('/dashboard', async (req, res) => {
    try {
        const recipesSnapshot = await db.collection('recipes').get();
        const recipes = recipesSnapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() };
        });
        res.render('dashboard', { recipes });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.send('Something went wrong...');
    }
});

app.get('/addRecipe', (req, res) => {
    res.render('addRecipe');
});

app.post('/addRecipeSubmit', async (req, res) => {
    const { name, description, rating } = req.body;

    try {
        await db.collection('recipes').add({
            name: name,
            description: description,
            rating: parseFloat(rating)
        });
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error adding recipe:', error);
        res.send('Something went wrong...');
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
