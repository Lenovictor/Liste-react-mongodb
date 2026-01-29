require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());

// CORS - allow frontend origin
const FRONTEND = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: FRONTEND,
  credentials: true
}));

// --- Database ---
const MONGO_URI = process.env.MONGO_URI || 'lenovictor145_db_user:<azerty123@456>@cluster0.snz2dqe.mongodb.net/?appName=Cluster0';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// --- Session ---
const sessionSecret = process.env.SESSION_SECRET || 'please_change_this_secret';
app.use(session({
  name: 'sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// --- Models ---
const { Schema } = mongoose;
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const taskSchema = new Schema({
  title: String,
  description: String,
  done: { type: Boolean, default: false },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', taskSchema);

// --- Helpers ---
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ message: 'Unauthorized. Connecte-toi.' });
}

// --- Auth routes ---
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ message: 'Username déjà pris' });
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ username, passwordHash: hash });
    // create session
    req.session.userId = user._id.toString();
    res.status(201).json({ message: 'Utilisateur créé', user: { id: user._id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Identifiants invalides' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Identifiants invalides' });
    req.session.userId = user._id.toString();
    res.json({ message: 'Connecté', user: { id: user._id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Impossible de se déconnecter' });
    }
    res.clearCookie('sid');
    res.json({ message: 'Déconnecté' });
  });
});

// --- Protected task routes ---
// Get all tasks for the logged in user
app.get('/tasks', requireAuth, async (req, res) => {
  const tasks = await Task.find({ owner: req.session.userId }).sort({ createdAt: -1 });
  res.json(tasks);
});

// Create task
app.post('/tasks', requireAuth, async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: 'title required' });
  const task = await Task.create({ title, description, owner: req.session.userId });
  res.status(201).json(task);
});

// Update task (only owner)
app.put('/tasks/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const t = await Task.findOne({ _id: id, owner: req.session.userId });
  if (!t) return res.status(404).json({ message: 'Task not found' });
  Object.assign(t, req.body);
  await t.save();
  res.json(t);
});

// Delete task (only owner)
app.delete('/tasks/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const t = await Task.findOneAndDelete({ _id: id, owner: req.session.userId });
  if (!t) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted', task: t });
});

// --- simple status route ---
app.get('/', (req, res) => {
  res.json({ ok: true, session: !!(req.session && req.session.userId) });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port', PORT));
