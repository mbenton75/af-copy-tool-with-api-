// netlify/functions/catalog.js

export async function handler() {
  const storeRaw = process.env.SHOPIFY_STORE || '';
  const store = storeRaw.replace(/^https?:\/\//, '').replace(/\/+$/, ''); // ensure clean host
  const token = process.env.SHOPIFY_ADMIN_TOKEN;

  if (!store || !token) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing configuration',
        detail: {
          hasStore: !!store,
          hasToken: !!token,
        },
      }),
    };
  }

  const url = `https://${store}/admin/api/2024-04/products.json?limit=5`; // small test
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    // If Shopify responds but with an error (401/403/etc), show it
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        statusCode: res.status,
        body: JSON.stringify({
          error: 'Shopify responded with an error',
          status: res.status,
          statusText: res.statusText,
          url,
          body: text,
        }),
      };
    }

    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ count: data?.products?.length ?? 0, products: data?.products ?? [] }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Unexpected error',
        message: err?.message,
        code: err?.code,
        cause: err?.cause?.code,
        url,
        store,
      }),
    };
  }
}
