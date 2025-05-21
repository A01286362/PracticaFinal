require('dotenv').config();
const express = require('express');
const sql = require('mssql');

const app = express();
app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
}); 