const supabase = require('./server/src/config/supabase');
const dotenv = require('dotenv');

dotenv.config();

const vendors = [
  {
    id: '6000001',
    name: 'Salteñas "El Horno"',
    market_name: 'La Cancha',
    category: 'Comida',
    description: 'Tradición en cada bocado.',
    image_url: '/assets/saltenas.png',
    rating: 4.9,
    delivery_time: '15-20 min',
    is_verified: true
  },
  {
    id: '6000002',
    name: 'Sándwich de Chola Paulina',
    market_name: 'Mercado Rodriguez',
    category: 'Comida',
    description: 'El clásico sabor de La Paz.',
    image_url: '/assets/sandwich.png',
    rating: 4.8,
    delivery_time: '20-30 min',
    is_verified: true
  },
  {
    id: '6000003',
    name: 'Frutería Mercado Central',
    market_name: 'Mercado Central',
    category: 'Verduras',
    description: 'Frescura del campo a tu mesa.',
    image_url: '/assets/frutas.png',
    rating: 4.7,
    delivery_time: '30-40 min',
    is_verified: true
  },
  {
    id: '6000004',
    name: 'Api con Pastel Tía María',
    market_name: 'Mercado Lanza',
    category: 'Api',
    description: 'Calidez en cada sorbo.',
    image_url: '/assets/api.png',
    rating: 4.9,
    delivery_time: '10-15 min',
    is_verified: true
  },
  {
    id: '6000005',
    name: 'Carnicería "El Torito"',
    market_name: 'Mercado Bolivar',
    category: 'Carnes',
    description: 'Cortes seleccionados de primera.',
    image_url: '/assets/carne.png',
    rating: 4.6,
    delivery_time: '40-50 min',
    is_verified: true
  }
];

const seedDB = async () => {
  try {
    console.log('🌱 Sembrando mercado ULTRA-ELITE con imágenes propias...');
    
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('orders').delete().neq('id', 'NONE');

    const { error: vError } = await supabase.from('vendors').upsert(vendors);
    if (vError) throw vError;

    const products = [
      { vendor_id: '6000001', name: 'Salteña de Pollo', price: 8, image_url: '/assets/saltenas.png' },
      { vendor_id: '6000001', name: 'Salteña de Carne', price: 8, image_url: '/assets/saltenas.png' },
      { vendor_id: '6000002', name: 'Sándwich de Chola Doble', price: 20, image_url: '/assets/sandwich.png' },
      { vendor_id: '6000003', name: 'Bolsa de Manzanas', price: 15, image_url: '/assets/frutas.png' },
      { vendor_id: '6000004', name: 'Api Caliente', price: 7, image_url: '/assets/api.png' },
      { vendor_id: '6000005', name: 'Kilo de Lomo', price: 50, image_url: '/assets/carne.png' }
    ];

    await supabase.from('products').insert(products);
    console.log('🚀 Mercado ULTRA-ELITE completado con IDs 600000X');
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

seedDB();
