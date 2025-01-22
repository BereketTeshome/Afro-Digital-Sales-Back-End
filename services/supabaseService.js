const { Client } = require('pg');
const config = require('../config/config');

const supabaseClient = new Client({
  user: config.SUPABASE_USER,
  host: config.SUPABASE_HOST,
  database: config.SUPABASE_DB,
  password: config.SUPABASE_PASSWORD,
  port: 5432,
});

supabaseClient.connect();

const getBusinessData = async () => {
  const result = await supabaseClient.query('SELECT * FROM businesses');
  return result.rows;
};

module.exports = { getBusinessData };
