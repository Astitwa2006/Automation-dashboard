const { request } = require('@playwright/test');
(async () => {
  const context = await request.newContext();
  const resp = await context.get('http://localhost:9999');
  console.log(resp.status(), resp.statusText());
})();
