const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const mongoURI = 'mongodb://localhost:27017/Biblioteka';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const KsiazkiSchema = new mongoose.Schema({
    tytul: String,
    autor: String,
    wypozyczone: {type: String, default: 'admin'},
    data_wypozyczone: {type: String, default: null}
}, {collection: 'Ksiazki'});

const KontaSchema = new mongoose.Schema({
    login: String,
    haslo: String,
    uprawnienia: {type: Boolean, default: false}
}, {collection: 'Konta'});
  
const Item = mongoose.model('Item', KsiazkiSchema);
const KontaItem = mongoose.model('Konto', KontaSchema);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'pug')
app.use(express.static('public'));

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/mainpage', async (req, res) => {
    try {
        const items = await Item.find();
        res.render('mainpage', {items})
      } catch (error) {
        res.status(500).send('Error fetching items: ' + error.message);
      }
})

app.get('/addbook', (req, res) => {
    res.render('addbook')
})

app.post('/add', async (req, res) => {
    try {
        const { title, author } = req.body;
        const newItem = new Item({ tytul: title, autor: author });
        await newItem.save();
        res.redirect('/mainpage');
    } catch (error) {
        res.status(500).send('Error saving item: ' + error.message);
    }
})

app.post('/sign-in', async (req, res) => {
    try {
        const { login, password, repassword } = req.body;
        let isLogin = await KontaItem.find({login: login});
        if (!isLogin) {
            if (password == repassword) {
                const newItem = new KontaItem({ login: login, haslo: password });
                await newItem.save();
                res.redirect('/mainpage');
            } else {res.send('Passwords are not the same')}
        } else {res.send('This login is already taken')}
    } catch (error) {
        res.status(500).send('Error saving item: ' + error.message);
    }
})

app.post('/log-in', async (req, res) => {
    try {
        const { login, password } = req.body;
        let response = {};
        let user = await KontaItem.findOne({ login: login, password: password });
        if (user) {
            response.name = login;
            response.success = true;
        } else {
            response.error = "Login lub hasło jest niepoprawne!";
            response.success = false;
        }
        res.send(response);
        res.redirect('/mainpage');
    } catch (error) {
        res.status(500).send('Error saving item: ' + error.message);
    }
})

app.listen(port, () => {
    console.log(`Aplikacja nasluchuje na porcie ${port}`);
})