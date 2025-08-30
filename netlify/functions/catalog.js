exports.handler = async function(event, context) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  }

  // Preflight for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: ''
    }
  }

  const STORE = process.env.SHOPIFY_STORE || ''
  const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN || ''
  const version = '2024-07' // adjust if needed

  // Fallback sample data if env not set
  if (!STORE || !TOKEN) {
    const sample = {
      items: [
        {
          id: 'gid://shopify/Product/111',
          productNumber: 1,
          brand: 'Bella + Canvas',
          model: '3001U',
          title: 'Standard Unisex Tee — Bella + Canvas 3001U',
          price: 34.50,
          organic: false,
          description: 'A go-to tee with a soft hand and classic fit.\n- 100% Airlume combed and ring-spun cotton\n- Midweight feel\n- Side-seamed, shoulder taping'
        },
        {
          id: 'gid://shopify/Product/222',
          productNumber: 4,
          brand: 'Stanley/Stella',
          model: 'STTU169',
          title: 'Unisex Organic Cotton T-Shirt — Stanley/Stella STTU169',
          price: 42.50,
          organic: true,
          description: 'Certified organic cotton with a premium handfeel.\n- 100% organic ring-spun cotton\n- Medium weight\n- Clean, modern fit'
        }
      ]
    }
    return { statusCode: 200, headers, body: JSON.stringify(sample, null, 2) }
  }

  try {
    const url = `https://${STORE}.myshopify.com/admin/api/${version}/products.json?limit=100&status=active&fields=id,title,handle,vendor,product_type,tags,variants,options`
    const res = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json'
      }
    })
    if (!res.ok) {
      const text = await res.text()
      return { statusCode: res.status, headers, body: JSON.stringify({ error: 'Shopify error', detail: text }) }
    }
    const data = await res.json()
    const items = (data.products || []).map(p => {
      const firstVariant = (p.variants && p.variants[0]) || {}
      // Derive fields for the copy tool
      const organic = (p.tags || '').toLowerCase().split(',').map(t => t.trim()).includes('organic')
      return {
        id: String(p.id),
        productNumber: null, // fill later if you have a mapping
        brand: p.vendor || '',
        model: '',
        title: p.title || '',
        price: firstVariant.price ? Number(firstVariant.price) : null,
        organic,
        description: (firstVariant?.title && firstVariant.title !== 'Default Title') ? `${p.title} — ${firstVariant.title}` : p.title,
        tags: (p.tags || '').split(',').map(t => t.trim()).filter(Boolean)
      }
    })

    return { statusCode: 200, headers, body: JSON.stringify({ items }, null, 2) }
  } catch (e):
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error', detail: String(e) }) }
}
