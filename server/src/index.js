const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mock Data
const vendors = [
  {
    _id: '1',
    name: 'Puesto de Doña María',
    marketName: 'La Cancha',
    category: 'Salteñas',
    description: 'Las mejores salteñas tradicionales de Cochabamba desde 1985.',
    imageUrl: 'https://images.unsplash.com/photo-1606331123901-ec036496660b?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    deliveryTime: '25-35 min',
    isVerified: true
  },
  {
    _id: '2',
    name: 'Jugos El Valle',
    marketName: 'Mercado Rodriguez',
    category: 'Jugos',
    description: 'Jugos naturales frescos y nutritivos.',
    imageUrl: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?auto=format&fit=crop&q=80&w=400',
    rating: 4.5,
    deliveryTime: '20-30 min',
    isVerified: true
  }
];

const mockProducts = [
  { _id: 'p1', vendor: '1', name: 'Salteña de Pollo Especial', price: 8.00, description: 'Pollo desmenuzado, papa, arvejas y el toque secreto.', imageUrl: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&q=80&w=300' },
  { _id: 'p2', vendor: '1', name: 'Salteña de Carne', price: 8.00, description: 'Carne de res de primera con caldo jugoso.', imageUrl: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&q=80&w=300' },
  { _id: 'p3', vendor: '1', name: 'Refresco de Mocochinchi', price: 5.00, description: 'Bebida tradicional de durazno deshidratado.', imageUrl: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?auto=format&fit=crop&q=80&w=300' },
  { _id: 'p4', vendor: '2', name: 'Jugo de Papaya con Leche', price: 12.00, description: 'Papaya fresca madura y leche cremosa.', imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&q=80&w=300' },
  { _id: 'p5', vendor: '2', name: 'Jugo Mixto Tropical', price: 15.00, description: 'Plátano, papaya, piña y naranja.', imageUrl: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?auto=format&fit=crop&q=80&w=300' }
];

// Routes
app.get('/api/vendors', (req, res) => {
  res.json(vendors);
});

app.get('/api/vendors/:id', (req, res) => {
  const vendor = vendors.find(v => v._id === req.params.id);
  if (!vendor) return res.status(404).json({ message: 'Vendedora no encontrada' });
  res.json(vendor);
});

app.get('/api/vendors/:id/products', (req, res) => {
  const products = mockProducts.filter(p => p.vendor === req.params.id);
  res.json(products);
});



// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'LlegoYA API - 🚀 Corriendo con Datos Mock (Sin DB requerida)' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor LlegoYA corriendo en puerto ${PORT}`);
});
