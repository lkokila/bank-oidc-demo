# Bank OIDC + APIM Demo — npm only (fixed endpoint)

This React + Vite app logs in with **WSO2 IS** (Authorization Code + PKCE) and then calls **WSO2 APIM**:
`GET https://localhost:8243/bankdemo/v1/accounts/1/sample`  
with `Authorization: Bearer <access_token>`.

## Run
```bash
npm install
npm run dev
# open http://localhost:5173
```

## Configure
Edit `src/config.ts`:
- Set your **CLIENT_ID**.
- If your IS runs on **9443**, change the OIDC endpoints to 9443.

## WSO2 setup tips
- In IS: SPA app with redirect `http://localhost:5173`, PKCE S256, scopes `openid profile email`.
- In APIM: Publish an API that serves `accounts` sample at `/bankdemo/v1/accounts/1/sample`.
- APIM Key Manager: use IS; ensure the access token issued by IS is accepted by APIM.
- CORS: allow `http://localhost:5173` on the API.
- TLS: trust certs for both IS and APIM in your browser (self-signed otherwise breaks fetch).

## Dev-mode gotcha
React StrictMode can double-invoke effects. This app avoids it in dev and also gate-keeps the code exchange to prevent duplicate `/token` calls.
