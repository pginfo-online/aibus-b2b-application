# AiBus B2B Agent Portal

Next.js app for the AiBus travel-agent portal.

## Local development

Use Node.js 20.9 or newer. Copy the example environment file and install dependencies:

```bash
cp .env.example .env.local
npm ci
npm run dev
```

The app is available at [http://localhost:3000](http://localhost:3000). Set
`NEXT_PUBLIC_API_URL` in `.env.local` to the API base URL for the backend you
want to use. The production API is `https://aibus.shop/api/v1`.

## Deploy to Vercel

1. Import the B2B app repository into Vercel and use the repository root as the
   project root. Vercel should detect Next.js and use `npm run build`.
2. In **Project Settings → Environment Variables**, add
   `NEXT_PUBLIC_API_URL` with the value `https://aibus.shop/api/v1` for every
   environment you plan to deploy (Production, Preview, and Development).
3. Deploy or redeploy after setting the variable. `NEXT_PUBLIC_` variables are
   included in the client bundle at build time.
4. Ensure the backend allows requests from the deployed Vercel domain in its
   CORS configuration.

The local `.env` and `.env.local` files are intentionally ignored by Git; adding
the URL to one of them does not configure the Vercel project.

## Checks

```bash
npm run lint
npm run build
```
