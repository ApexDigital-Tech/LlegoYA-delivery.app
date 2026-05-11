const supabase = require('./server/src/config/supabase');
const dotenv = require('dotenv');

dotenv.config();

const vendors = [
  {
    id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    name: 'Puesto de Doña María',
    market_name: 'La Cancha',
    category: 'Salteñas',
    description: 'Las mejores salteñas tradicionales de Cochabamba desde 1985.',
    image_url: 'https://images.unsplash.com/photo-1606331123901-ec036496660b?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    delivery_time: '25-35 min',
    is_verified: true
  },
  {
    id: 'd290f1ee-6c54-4b01-90e6-d701748f0852',
    name: 'Jugos El Valle',
    market_name: 'Mercado Rodriguez',
    category: 'Jugos',
    description: 'Jugos naturales frescos y nutritivos.',
    image_url: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?auto=format&fit=crop&q=80&w=400',
    rating: 4.5,
    delivery_time: '20-30 min',
    is_verified: true
  }
];

const seedDB = async () => {
  try {
    console.log('🌱 Conectando a Supabase para sembrar datos...');

    // Limpiar tablas (opcional, cuidado con cascada)
    // await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // await supabase.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { data: createdVendors, error: vError } = await supabase
      .from('vendors')
      .upsert(vendors)
      .select();

    if (vError) throw vError;
    console.log(`✅ ${createdVendors.length} Vendedoras creadas`);

    const products = [
      {
        vendor_id: createdVendors[0].id,
        name: 'Salteña de Pollo Especial',
        price: 8.00,
        description: 'Pollo desmenuzado, papa, arvejas y el toque secreto de Doña María.',
        image_url: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&q=80&w=300'
      },
      {
        vendor_id: createdVendors[0].id,
        name: 'Salteña de Carne',
        price: 8.00,
        description: 'Carne de res de primera con caldo jugoso.',
        image_url: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&q=80&w=300'
      },
      {
        vendor_id: createdVendors[1].id,
        name: 'Jugo de Papaya con Leche',
        price: 12.00,
        description: 'Papaya fresca madura y leche cremosa.',
        image_url: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&q=80&w=300'
      }
    ];

    const { error: pError } = await supabase
      .from('products')
      .insert(products);

    if (pError) throw pError;
    console.log(`✅ ${products.length} Productos creados`);

    console.log('🚀 Semilla completada con éxito en Supabase');
    process.exit();
  } catch (err) {
    console.error('❌ Error sembrando datos:', err);
    process.exit(1);
  }
};

seedDB();
