const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../client/.env') });

async function getDeviceCode() {
  try {
    const deviceId = 'ZTJKMSK8DDCRB';
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/getDeviceCode?deviceId=${deviceId}`, {
      method: 'GET',
    });
    const res = await response.json();
    console.log(res); 
  } catch (error) {
    console.error(error.message);
  }
}

getDeviceCode();
