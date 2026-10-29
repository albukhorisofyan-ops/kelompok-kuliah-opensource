const express = require('express');

const app = express();

// Middleware agar body request berformat JSON bisa dibaca lewat req.body
app.use(express.json());

// Penyimpanan data sementara di memori (hilang saat server dimulai ulang)
let tasks = [
  { id: 1, title: 'Belajar Git', completed: false },
  { id: 2, title: 'Buat Pull Request pertama', completed: false },
];
let nextId = 3;

// GET / : cek bahwa API berjalan
app.get('/', (req, res) => {
  res.json({ message: 'To-Do List API berjalan' });
});

// GET /tasks : ambil semua tugas
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// POST /tasks : buat tugas baru
app.post('/tasks', (req, res) => {
  const { title } = req.body || {};

  const task = {
    id: nextId++,
    title: title,
    completed: false,
  };

  tasks.push(task);
  res.status(201).json(task);
});

// GET /tasks/:id : ambil satu tugas berdasarkan ID
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Tugas tidak ditemukan' });
  }

  res.json(task);
});

// PATCH /tasks/:id : ubah judul dan/atau status tugas
app.patch('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Tugas tidak ditemukan' });
  }

  const { title, completed } = req.body || {};

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res
      .status(400)
      .json({ error: 'Field "completed" harus berupa true atau false' });
  }

  if (
    title !== undefined &&
    (typeof title !== 'string' || title.trim() === '')
  ) {
    return res.status(400).json({ error: 'Judul tidak boleh kosong' });
  }

  if (title !== undefined) {
    task.title = title.trim();
  }

  if (completed !== undefined) {
    task.completed = completed;
  }

  res.json(task);
});

// DELETE /tasks/:id : hapus tugas
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Tugas tidak ditemukan' });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

// Route yang tidak dikenal
app.use((req, res) => {
  res.status(404).json({ error: 'Route tidak ditemukan' });
});

// Error handler dasar
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ error: 'Body request bukan JSON yang valid' });
  }

  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

module.exports = app;
