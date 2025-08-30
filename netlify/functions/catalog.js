// netlify/functions/catalog.js
// ESM version (works with `"type": "module"`)
// Uses Node 18+/20+ built-in fetch — no node-fetch import needed

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const store = process.env.SHOPIFY_STORE;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;

    if (!store || !token) {
      return {
        statusCode: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error:
            'Missing required environment variables: SHOPIFY_STORE and/or SHOPIFY_ADMIN_TOKEN.',
        }),
      };
    }

    // Adjust API version or fields as you like
    const apiVersion = '2024-04';
    const url = `https://${store}.myshopify.com/admin/api/${apiVersion}/products.json?limit=250&fields=id,title,handle,body_html,variants,images`;

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return {
        statusCode: resp.status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Shopify request failed',
          status: resp.status,
          detail: text,
        }),
      };
    }

    const data = await resp.json();

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        count: Array.isArray(data?.products) ? data.products.length : 0,
        products: data?.products ?? [],
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Unexpected error',
        detail: err instanceof Error ? err.message : String(err),
      }),
    };
  }
};
