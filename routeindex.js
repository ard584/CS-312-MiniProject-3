const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req,res) => {

	if (!req.session.user_id) {
		return res.redirect('/signin');
	}

	const result = await pool.query('SELECT * FROM blogs ORDER BY date_created DESC');
	res.render('index', {posts: result.rows, user_id: req.session.user_id, name: req.session.name});
});

router.get('/posts/:id/edit', async (req,res) => {
	const id = parseInt(req.params.id);

	const result = await pool.query('SELECT * FROM blogs WHERE blog_id = $1', [id]);
	const post = result.rows[0];

	if (post.creator_user_id !== req.session.user_id) {
		return res.redirect('/');
	}
	res.render('edit', {post:post});
});

router.get('/signup', async (req,res) => {
	res.render('signup', {error:null});
});

router.post('/signup', async (req,res) => {
	const user_id = req.body.user_id;
	const password = req.body.password;
	const name = req.body.name;

	const existing = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);

	if (existing.rows.length > 0) {
		return res.render('signup', {error: 'Name unavailable'});
	}

	await pool.query('INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)', [user_id, password, name]);
	res.redirect('/signin');
});

router.get('/signin', async (req,res) => {
	res.render('signin', {error:null});
});

router.post('/signin', async (req,res) => {
	const user_id = req.body.user_id;
	const password = req.body.password;

	const result = await pool.query('SELECT * FROM users WHERE user_id = $1 AND password = $2', [user_id, password]);

	if (result.rows.length == 0) {
		return res.render('signin', {error: 'What is the password? Clearly not that...'});
	}

	req.session.user_id = result.rows[0].user_id;
	req.session.name = result.rows[0].name;
	res.redirect('/');
});

router.get('/signout', (req,res) => {
	req.session.destroy(() => {
		res.redirect('/signin');
	})
});


router.post('/posts', async (req,res) => {
	const title = req.body.title;
	const content = req.body.content;

	await pool.query (
		'INSERT INTO blogs (creator_name, creator_user_id, title, body) VALUES ($1, $2, $3, $4)',
		[req.session.name, req.session.user_id, title, content]
	);
	res.redirect('/');
});

router.post('/posts/:id/edit', async (req,res) => {
	const id = parseInt(req.params.id);

	await pool.query('UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3 AND creator_user_id = $4', [req.body.title, req.body.content, id, req.session.user_id]);
	res.redirect('/');
});

router.post('/posts/:id/delete', async (req,res) => {
	const id=parseInt(req.params.id);

	await pool.query(
		'DELETE FROM blogs WHERE blog_id = $1 AND creator_user_id = $2', [id, req.session.user_id]
	);

	res.redirect('/');
});

module.exports = router;