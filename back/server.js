require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://witty-river-04a0be710.6.azurestaticapps.net'
  ],
  credentials: true
}));

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

// Middleware para proteger endpoints con JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token requerido' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

app.get('/productos', authenticateToken, async (req, res) => {
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
    const result = await sql.query`SELECT * FROM dannyusuarios WHERE username = ${username}`;
    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
    const user = result.recordset[0];
    // Comparar hash
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
    // Generar JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ success: true, user: { id: user.id, username: user.username }, token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Endpoint para registrar usuario nuevo
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Faltan credenciales' });
  }
  try {
    await sql.connect(dbConfig);
    // Verificar si el usuario ya existe
    const exists = await sql.query`SELECT * FROM dannyusuarios WHERE username = ${username}`;
    if (exists.recordset.length > 0) {
      return res.status(409).json({ message: 'El usuario ya existe' });
    }
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    await sql.query`INSERT INTO dannyusuarios (username, password) VALUES (${username}, ${hashedPassword})`;
    res.json({ success: true, message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Obtener todos los usuarios (protegido)
app.get('/usuarios', authenticateToken, async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query('SELECT id, username FROM dannyusuarios');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Editar usuario (protegido)
app.put('/usuarios/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  try {
    await sql.connect(dbConfig);
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await sql.query`UPDATE dannyusuarios SET username = ${username}, password = ${hashedPassword} WHERE id = ${id}`;
    } else {
      await sql.query`UPDATE dannyusuarios SET username = ${username} WHERE id = ${id}`;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Borrar usuario (protegido)
app.delete('/usuarios/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await sql.connect(dbConfig);
    await sql.query`DELETE FROM dannyusuarios WHERE id = ${id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Documentación de la API disponible en: http://localhost:${PORT}/api-docs`);
}); 