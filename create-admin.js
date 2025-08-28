const axios = require('axios');

async function createAdmin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/seed-admin');
    console.log('Admin user created:', response.data);
  } catch (error) {
    console.error('Error creating admin:', error.response?.data || error.message);
  }
}

createAdmin();
