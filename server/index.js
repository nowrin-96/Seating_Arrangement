const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');
const seed = require('./seed');

const { generateToken, verifyToken, requireAdmin, requireStudent } = require('./auth');
const { getWeekIndex, getSeatingForGender, getStudentCurrentBench } = require('./rotation');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rate Limiter for Login
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // max 10 requests per minute
  message: { error: 'Too many login attempts. Please try again after a minute.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Auto-seed if database is empty
const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin').get().count;
const benchCount = db.prepare('SELECT COUNT(*) as count FROM benches').get().count;
if (adminCount === 0 || benchCount === 0) {
  console.log('Database empty. Running initial seed...');
  seed();
}

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

/**
 * Unified single login endpoint
 */
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const trimmedUsername = username.trim();

  // 1. Check Admin table first
  const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(trimmedUsername);
  if (admin) {
    const isMatch = await bcrypt.compare(password, admin.password);
    if (isMatch) {
      const userPayload = { id: admin.id, username: admin.username, role: 'admin' };
      const token = generateToken(userPayload);
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      return res.json({ message: 'Login successful', user: userPayload, token });
    }
  }

  // 2. Check Student table second
  const student = db.prepare('SELECT * FROM students WHERE username = ?').get(trimmedUsername);
  if (student) {
    const isMatch = await bcrypt.compare(password, student.password);
    if (isMatch) {
      const userPayload = {
        id: student.id,
        username: student.username,
        full_name: student.full_name,
        roll_number: student.roll_number,
        gender: student.gender,
        role: 'student'
      };
      const token = generateToken(userPayload);
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      return res.json({ message: 'Login successful', user: userPayload, token });
    }
  }

  // 3. Generic failure response - never reveal which field was wrong or if username exists
  return res.status(401).json({ error: 'Incorrect username or password' });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// ----------------------------------------------------
// STUDENT ROUTE (Strictly Scoped)
// ----------------------------------------------------

app.get('/api/student/my-bench', requireStudent, (req, res) => {
  const targetDateStr = req.query.date || new Date().toISOString().split('T')[0];

  const configRow = db.prepare("SELECT value FROM config WHERE key = 'rotation_start_date'").get();
  const rotationStartDate = configRow ? configRow.value : new Date().toISOString().split('T')[0];

  const weekIndex = getWeekIndex(rotationStartDate, targetDateStr);

  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.user.id);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found' });
  }

  const genderBenches = db.prepare('SELECT * FROM benches WHERE gender = ? ORDER BY position ASC').all(student.gender);
  const genderStudents = db.prepare('SELECT * FROM students WHERE gender = ?').all(student.gender);

  const seatingInfo = getStudentCurrentBench(student, genderBenches, genderStudents, weekIndex);

  if (!seatingInfo) {
    return res.status(404).json({ error: 'Seating information not available' });
  }

  res.json({
    student: {
      id: student.id,
      full_name: student.full_name,
      roll_number: student.roll_number,
      gender: student.gender
    },
    target_date: targetDateStr,
    rotation_start_date: rotationStartDate,
    week_index: weekIndex,
    bench_info: seatingInfo
  });
});

// ----------------------------------------------------
// ADMIN ROUTES
// ----------------------------------------------------

// Full Seating Chart
app.get('/api/admin/seating-chart', requireAdmin, (req, res) => {
  const targetDateStr = req.query.date || new Date().toISOString().split('T')[0];

  const configRow = db.prepare("SELECT value FROM config WHERE key = 'rotation_start_date'").get();
  const rotationStartDate = configRow ? configRow.value : new Date().toISOString().split('T')[0];

  const weekIndex = getWeekIndex(rotationStartDate, targetDateStr);

  const femaleBenches = db.prepare("SELECT * FROM benches WHERE gender = 'female' ORDER BY position ASC").all();
  const femaleStudents = db.prepare("SELECT id, username, full_name, roll_number, gender, bench_id FROM students WHERE gender = 'female'").all();

  const maleBenches = db.prepare("SELECT * FROM benches WHERE gender = 'male' ORDER BY position ASC").all();
  const maleStudents = db.prepare("SELECT id, username, full_name, roll_number, gender, bench_id FROM students WHERE gender = 'male'").all();

  const femaleSeating = getSeatingForGender(femaleBenches, femaleStudents, weekIndex);
  const maleSeating = getSeatingForGender(maleBenches, maleStudents, weekIndex);

  res.json({
    rotation_start_date: rotationStartDate,
    target_date: targetDateStr,
    week_index: weekIndex,
    female_seating: femaleSeating,
    male_seating: maleSeating
  });
});

// Manage Benches
app.get('/api/admin/benches', requireAdmin, (req, res) => {
  const benches = db.prepare('SELECT * FROM benches ORDER BY gender ASC, position ASC').all();
  res.json(benches);
});

app.post('/api/admin/benches', requireAdmin, (req, res) => {
  const { name, gender, capacity, position } = req.body;
  if (!name || !gender || !capacity) {
    return res.status(400).json({ error: 'Name, gender, and capacity are required' });
  }

  // Calculate position if not provided
  let pos = position;
  if (pos === undefined || pos === null) {
    const maxPosRow = db.prepare('SELECT MAX(position) as maxPos FROM benches WHERE gender = ?').get(gender);
    pos = (maxPosRow && maxPosRow.maxPos !== null) ? maxPosRow.maxPos + 1 : 0;
  }

  const stmt = db.prepare('INSERT INTO benches (name, gender, capacity, position) VALUES (?, ?, ?, ?)');
  const info = stmt.run(name, gender, parseInt(capacity), parseInt(pos));

  const newBench = db.prepare('SELECT * FROM benches WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(newBench);
});

app.put('/api/admin/benches/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, gender, capacity, position } = req.body;

  const bench = db.prepare('SELECT * FROM benches WHERE id = ?').get(id);
  if (!bench) {
    return res.status(404).json({ error: 'Bench not found' });
  }

  db.prepare(`
    UPDATE benches
    SET name = ?, gender = ?, capacity = ?, position = ?
    WHERE id = ?
  `).run(
    name || bench.name,
    gender || bench.gender,
    capacity ? parseInt(capacity) : bench.capacity,
    position !== undefined ? parseInt(position) : bench.position,
    id
  );

  const updated = db.prepare('SELECT * FROM benches WHERE id = ?').get(id);
  res.json(updated);
});

app.delete('/api/admin/benches/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM benches WHERE id = ?').run(id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Bench not found' });
  }
  res.json({ message: 'Bench deleted successfully' });
});

app.post('/api/admin/benches/reorder', requireAdmin, (req, res) => {
  const { benches } = req.body; // Array of { id, position }
  if (!Array.isArray(benches)) {
    return res.status(400).json({ error: 'Benches array required' });
  }

  const updateStmt = db.prepare('UPDATE benches SET position = ? WHERE id = ?');
  const tx = db.transaction(() => {
    for (const b of benches) {
      updateStmt.run(b.position, b.id);
    }
  });
  tx();

  res.json({ message: 'Benches reordered successfully' });
});

// Manage Students
app.get('/api/admin/students', requireAdmin, (req, res) => {
  const students = db.prepare(`
    SELECT s.id, s.username, s.full_name, s.roll_number, s.gender, s.bench_id, b.name as bench_name
    FROM students s
    LEFT JOIN benches b ON s.bench_id = b.id
    ORDER BY s.gender ASC, s.roll_number ASC
  `).all();
  res.json(students);
});

app.post('/api/admin/students', requireAdmin, async (req, res) => {
  const { username, password, full_name, roll_number, gender, bench_id } = req.body;

  if (!username || !password || !full_name || !roll_number || !gender || !bench_id) {
    return res.status(400).json({ error: 'All student fields are required' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const stmt = db.prepare(`
      INSERT INTO students (username, password, full_name, roll_number, gender, bench_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(username.trim(), passwordHash, full_name.trim(), roll_number.trim(), gender, parseInt(bench_id));

    const newStudent = db.prepare(`
      SELECT s.id, s.username, s.full_name, s.roll_number, s.gender, s.bench_id, b.name as bench_name
      FROM students s
      LEFT JOIN benches b ON s.bench_id = b.id
      WHERE s.id = ?
    `).get(info.lastInsertRowid);

    res.status(201).json(newStudent);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Username or Roll Number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/students/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, password, full_name, roll_number, gender, bench_id } = req.body;

  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  try {
    let passwordHash = student.password;
    if (password && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    db.prepare(`
      UPDATE students
      SET username = ?, password = ?, full_name = ?, roll_number = ?, gender = ?, bench_id = ?
      WHERE id = ?
    `).run(
      username || student.username,
      passwordHash,
      full_name || student.full_name,
      roll_number || student.roll_number,
      gender || student.gender,
      bench_id ? parseInt(bench_id) : student.bench_id,
      id
    );

    const updated = db.prepare(`
      SELECT s.id, s.username, s.full_name, s.roll_number, s.gender, s.bench_id, b.name as bench_name
      FROM students s
      LEFT JOIN benches b ON s.bench_id = b.id
      WHERE s.id = ?
    `).get(id);

    res.json(updated);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Username or Roll Number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/students/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM students WHERE id = ?').run(id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Student not found' });
  }
  res.json({ message: 'Student deleted successfully' });
});

// Config Management
app.get('/api/admin/config', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM config').all();
  const config = {};
  rows.forEach(r => { config[r.key] = r.value; });
  res.json(config);
});

app.put('/api/admin/config', requireAdmin, (req, res) => {
  const { rotation_start_date } = req.body;
  if (rotation_start_date) {
    db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES ('rotation_start_date', ?)").run(rotation_start_date);
  }
  res.json({ message: 'Configuration updated successfully' });
});

// Seed Trigger API
app.post('/api/admin/reseed', requireAdmin, async (req, res) => {
  try {
    await seed();
    res.json({ message: 'Database successfully reseeded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export & Import Data JSON
app.get('/api/admin/export', requireAdmin, (req, res) => {
  const config = db.prepare('SELECT * FROM config').all();
  const benches = db.prepare('SELECT * FROM benches').all();
  const students = db.prepare('SELECT id, username, full_name, roll_number, gender, bench_id FROM students').all();
  const admin = db.prepare('SELECT id, username FROM admin').all();

  res.json({
    exported_at: new Date().toISOString(),
    config,
    benches,
    students,
    admin
  });
});

app.post('/api/admin/import', requireAdmin, async (req, res) => {
  const { config, benches, students } = req.body;
  if (!Array.isArray(benches) || !Array.isArray(students)) {
    return res.status(400).json({ error: 'Invalid JSON payload. Must contain benches and students arrays.' });
  }

  try {
    const defaultStudentPassword = await bcrypt.hash('student123', 10);

    const tx = db.transaction(() => {
      db.exec('DELETE FROM students; DELETE FROM benches; DELETE FROM config;');

      // Config
      if (Array.isArray(config)) {
        const stmt = db.prepare('INSERT INTO config (key, value) VALUES (?, ?)');
        config.forEach(c => stmt.run(c.key, c.value));
      }

      // Benches
      const benchStmt = db.prepare('INSERT INTO benches (id, name, gender, capacity, position) VALUES (?, ?, ?, ?, ?)');
      benches.forEach(b => benchStmt.run(b.id, b.name, b.gender, b.capacity, b.position));

      // Students
      const studentStmt = db.prepare('INSERT INTO students (id, username, password, full_name, roll_number, gender, bench_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
      students.forEach(s => {
        const pwd = s.password || defaultStudentPassword;
        studentStmt.run(s.id, s.username, pwd, s.full_name, s.roll_number, s.gender, s.bench_id);
      });
    });

    tx();
    res.json({ message: 'Configuration and data imported successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Import failed: ' + err.message });
  }
});

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Bench Rotation Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
