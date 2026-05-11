const supabase = require('../config/supabase');

exports.getAllVendors = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .insert([req.body])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ message: 'Vendedora no encontrada' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
