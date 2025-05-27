const fetch = require('node-fetch');

async function checkApiRoutes() {
  const baseUrl = 'http://localhost:3002'; // Adjust if your dev server is running on a different port
  
  const routes = [
    '/api/test-api-routes',
    '/api/admin/upload',
    '/api/admin/test-upload'
  ];
  
  console.log('Checking API routes...');
  
  for (const route of routes) {
    try {
      console.log(`Testing route: ${route}`);
      const response = await fetch(`${baseUrl}${route}`);
      const status = response.status;
      
      console.log(`${route} - Status: ${status}`);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log(`${route} - Response: `, JSON.stringify(data, null, 2));
        } catch (e) {
          console.log(`${route} - Not a JSON response`);
        }
      }
    } catch (error) {
      console.error(`${route} - Error: ${error.message}`);
    }
    
    console.log('---');
  }
  
  console.log('API route check complete');
}

checkApiRoutes().catch(console.error); 