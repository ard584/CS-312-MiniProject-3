//main

const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));
app.use(express.urlencoded({extended:true}));

const session = require('express-session');

//remembers who is logged in
app.use(session({
	secret: 'itslikeariddle',
	//if nothing changes, doesnt re-save
	resave: false,
	//no session until sign-in
	saveUninitialized: false
}));

const PORT = 3000;

const indexRouter = require('./routes/routeindex');
app.use('/', indexRouter);

app.listen(PORT, () => {
	console.log('Running')
})