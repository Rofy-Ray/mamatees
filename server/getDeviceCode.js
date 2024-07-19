const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../client/.env') });

async function getDeviceCode() {
  try {
    const deviceId = 'B3Z6NAMYQSMTM';
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/getDeviceCode`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    const res = await response.json();
    console.log(res); 
  } catch (error) {
    console.error(error.message);
  }
}

getDeviceCode();
