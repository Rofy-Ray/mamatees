const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../client/.env') });

async function getDeviceCode() {
  try {
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/createDeviceCode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await response.json();
    console.log(res);
  } catch (error) {
    console.error(error.message);
  }
}

getDeviceCode();
