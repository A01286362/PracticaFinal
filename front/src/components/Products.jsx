import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const API_URL = 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('token');
}

const Products = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '' });

  const fetchProducts = async () => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/productos`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Error al obtener productos');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpen = (product = null) => {
    setEditProduct(product);
    setForm(product ? { nombre: product.nombre, descripcion: product.descripcion, precio: product.precio } : { nombre: '', descripcion: '', precio: '' });
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditProduct(null);
    setForm({ nombre: '', descripcion: '', precio: '' });
    setError('');
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setError('');
    try {
      const method = editProduct ? 'PUT' : 'POST';
      const url = editProduct ? `${API_URL}/productos/${editProduct.id}` : `${API_URL}/productos`;
      const body = JSON.stringify({ ...form, precio: parseFloat(form.precio) });
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al guardar producto');
      }
      handleClose();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas borrar este producto?')) return;
    try {
      const res = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Error al borrar producto');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Productos</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Agregar Producto
      </Button>
      {error && <Typography color="error">{error}</Typography>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell>{prod.id}</TableCell>
                <TableCell>{prod.nombre}</TableCell>
                <TableCell>{prod.descripcion}</TableCell>
                <TableCell>{prod.precio}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(prod)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(prod.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editProduct ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Descripción"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Precio"
            name="precio"
            type="number"
            value={form.precio}
            onChange={handleChange}
            fullWidth
          />
          {error && <Typography color="error">{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products; 