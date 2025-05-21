require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

app.get('/productos', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query('SELECT * FROM dannywu');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/productos', async (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`INSERT INTO dannywu (nombre, descripcion, precio) VALUES (${nombre}, ${descripcion}, ${precio}); SELECT SCOPE_IDENTITY() AS id;`;
    res.json({ id: result.recordset[0].id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio } = req.body;
  try {
    await sql.connect(dbConfig);
    await sql.query`UPDATE dannywu SET nombre = ${nombre}, descripcion = ${descripcion}, precio = ${precio} WHERE id = ${id}`;
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql.connect(dbConfig);
    await sql.query`DELETE FROM dannywu WHERE id = ${id}`;
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Endpoint de login seguro
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Faltan credenciales' });
  }
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT * FROM dannyusuarios WHERE username = ${username} AND password = ${password}`;
    if (result.recordset.length > 0) {
      // Login válido
      res.json({ success: true, user: { id: result.recordset[0].id, username: result.recordset[0].username } });
    } else {
      // Login inválido
      res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
}); 