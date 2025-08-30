# AF Copy Tool + Netlify API (Starter)

This is a no-database, **read-only** tool you can deploy on Netlify. It has:
- A React front-end with "Copy Title / Copy Description / Copy Both" buttons.
- A Netlify Function at **/api/catalog** that reads your Shopify products via the **Admin REST API** (using a **Custom App** token).

## What you need
- A Shopify store.
- A Shopify **Custom App** with scopes `read_products` (and optionally `read_inventory`, `read_product_listings`).
- Netlify account.

## Configure environment variables (in Netlify → Site settings → Environment variables)
- `SHOPIFY_STORE` → your store subdomain, e.g. `artsyfartsy-ai` (no protocol, no `.myshopify.com` suffix needed by this starter? We include it automatically).
- `SHOPIFY_ADMIN_TOKEN` → the **Admin API access token** from your custom app.

## Local dev (optional)
```bash
npm install
npm run dev
```

## Deploy to Netlify
1) Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2) In Netlify: **Add new site → Import from Git**.
3) Set build: `npm run build`, publish dir: `dist` (already in `netlify.toml`).
4) Add environment variables shown above.
5) Deploy.

The app will call `/api/catalog` at runtime. If env vars are missing, the function returns an embedded sample payload so you can still see the UI.

## About "Organic"
The function marks a product `organic: true` if the product **has a tag named `organic`** (case-insensitive). You can later switch this to read a metafield if you prefer.
