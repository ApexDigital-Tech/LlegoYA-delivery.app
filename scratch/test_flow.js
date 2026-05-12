const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testFlow() {
  console.log('--- STARTING FLOW TEST ---');
  
  // 1. Create a fake order
  const orderId = 'TEST-' + Math.floor(Math.random()*1000);
  const vendorId = 'd290f1ee-6c54-4b01-90e6-d701748f0851'; // Caserita Maria
  const chaskiPhone = '70000001';
  const chaskiName = 'Chaski01';

  console.log('1. Creating order:', orderId);
  await supabase.from('orders').insert([{
    id: orderId,
    client_name: 'Test User',
    client_phone: '80000000',
    vendor_id: vendorId,
    vendor_name: 'Puesto de Doña María',
    total: 15,
    items: ['Salteña Test'],
    status: 'pendiente',
    stage: 1
  }]);

  // 2. Caserita accepts (Stage 2)
  console.log('2. Caserita accepts...');
  await supabase.from('orders').update({ stage: 2, status: 'preparando' }).eq('id', orderId);

  // 3. Caserita ready (Stage 3)
  console.log('3. Caserita ready...');
  await supabase.from('orders').update({ stage: 3, status: 'listo' }).eq('id', orderId);

  // 4. Chaski accepts (Stage 4)
  console.log('4. Chaski accepts...');
  await supabase.from('orders').update({ 
    stage: 4, 
    status: 'en ruta',
    courier_id: chaskiPhone,
    courier_name: chaskiName
  }).eq('id', orderId);

  // 5. Verify
  const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
  console.log('Final state in DB:', JSON.stringify(data, null, 2));

  if (data.stage === 4 && data.courier_id === chaskiPhone) {
    console.log('✅ TEST PASSED: DB state is correct.');
  } else {
    console.log('❌ TEST FAILED: DB state incorrect.');
  }

  // Cleanup
  await supabase.from('orders').delete().eq('id', orderId);
}

testFlow();
