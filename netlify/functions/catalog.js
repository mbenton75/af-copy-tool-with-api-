// netlify/functions/catalog.js
const fetch = global.fetch || ((...args) => import('node-fetch').then(m => m.default(...args)));

exports.handler = async (event) => {
  try {
    const { SHOPIFY_STORE, SHOPIFY_ADMIN_TOKEN } = process.env;

    if (!SHOPIFY_STORE || !SHOPIFY_ADMIN_TOKEN) {
      return {
        statusCode: 500,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'Missing SHOPIFY_STORE or SHOPIFY_ADMIN_TOKEN env var' })
      };
    }

    const url =
      `https://${SHOPIFY_STORE}.myshopify.com/admin/api/2024-07/products.json` +
      `?limit=50&fields=id,title,body_html,handle,variants,images`;

    const res = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        statusCode: res.status,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'Shopify API error', status: res.status, body: text })
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Function crash', message: String(err) })
    };
  }
};
