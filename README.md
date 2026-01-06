# Bank OIDC + APIM Demo — npm only (fixed endpoint)

This React + Vite app demonstrates **OpenID Connect (OIDC)** authentication with **WSO2 Identity Server (IS)** using Authorization Code + PKCE flow, followed by secure API calls to **WSO2 API Manager (APIM)** with bearer tokens.

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:5173
```

## Configuration

### 1. Edit `src/config.ts`

Update the following values based on your WSO2 setup:

```typescript
export const OIDC_CONFIG = {
  AUTHORIZATION_ENDPOINT: "https://localhost:9444/oauth2/authorize",
  TOKEN_ENDPOINT: "https://localhost:9444/oauth2/token",
  USERINFO_ENDPOINT: "https://localhost:9444/oauth2/userinfo",
  ENDSESSION_ENDPOINT: "https://localhost:9444/oidc/logout",
  CLIENT_ID: "YOUR_CLIENT_ID_FOR_LOGIN",        // Primary client for login & account API calls (This application can have the required login flow including MFA and Branding)
  CLIENT_ID2: "YOUR_CLIENT_ID_FOR_TRANSACTIONS", // Secondary client for email OTP transactions
  REDIRECT_URI: "http://localhost:5173",
  SCOPE: "openid profile email",
  BANK_NAME: "Bitwave Bank"
};

export const API_CONFIG = {
  GET_ACCOUNTS_URL: "https://localhost:8243/accountDetails/1/getAccounts",
  ADD_TRANSACTION_URL: "https://localhost:8243/internalTransfer/1/addTransaction",
  RECENT_TRANSACTIONS_URL: "https://localhost:8243/RecentTransactions/1/recentTransactions"
};
```

## WSO2 Identity Server (IS) Setup

### Start IS with Port Offset

WSO2 IS must run on **port 9444** (port offset = 1):

```bash
cd <IS_HOME>/bin
./wso2server.sh -Dport.offset=1
# Windows: wso2server.bat -Dport.offset=1
```

This ensures IS listens on `https://localhost:9444`.

### Register Two OAuth2 Clients

Create **two separate SPA applications** in IS:

#### Client 1: Login & Account API Calls
- **Application Name**: `bank-oidc-app`
- **Protocol**: OpenID Connect
- **Application Type**: Single Page Application
- **Redirect URI**: `http://localhost:5173`
- **Allowed Grant Types**: Authorization Code
- **Token Endpoint Authentication**: None (public client with PKCE)
- **PKCE**: Mandatory (S256)
- **Scopes**: `openid`, `profile`, `email`
- **Client ID**: `HpfVbYONf5MwRREA12p14vNQfJAa` (or generated)
- Store this as `CLIENT_ID` in config.ts

#### Client 2: Email OTP Transactions
- **Application Name**: `bank-otp-app`
- **Protocol**: OpenID Connect
- **Application Type**: Single Page Application
- **Redirect URI**: `http://localhost:5173`
- **Allowed Grant Types**: Authorization Code
- **Token Endpoint Authentication**: None (public client with PKCE)
- **PKCE**: Mandatory (S256)
- **Scopes**: `openid`, `internal_login`, `email`
- **Client ID**: `E0bqe3TldZqJ3befDzav0OQkPtIa` (or generated)
- Store this as `CLIENT_ID2` in config.ts

### Enable Email OTP

Add the following config in the IS/repository/conf/deployment.toml file to enable email OTP with mailtrap https://mailtrap.io/
Add username, password from the mailtrap Sandbox

```toml
[output_adapter.email]
from_address= "otp@bitwave.com"
username= "<mailtrap_sandbox_username>"
password= "<mailtrap_sandbox_password>"
hostname= "sandbox.smtp.mailtrap.io"
port= 2525
enable_start_tls= true
enable_authentication= true
signature = "bitwave.com"
```
---

## WSO2 API Manager (APIM) Setup

### Start APIM

```bash
cd <APIM_HOME>/bin
./api-manager.sh
# Windows: api-manager.bat
# APIM runs on https://localhost:8243
```

### Configure IS as Key Manager (OAuth2 Provider)
Follow instructions in the below document
https://apim.docs.wso2.com/en/latest/api-security/key-management/third-party-key-managers/configure-wso2is7-connector/


In APIM Admin Console:

1. Navigate to **Settings > Key Manager**
2. Add a new Key Manager with these details:
   - **Name**: `WSO2-IS`
   - **Key Manager Type**: `WSO2-Identity-Server`
   - **Server URL**: `https://localhost:9444`
   - **Introspection URL**: `https://localhost:9444/oauth2/introspect`
   - **Token URL**: `https://localhost:9444/oauth2/token`
   - **Revoke URL**: `https://localhost:9444/oauth2/revoke`
   - **Userinfo URL**: `https://localhost:9444/oauth2/userinfo`
   - **Client ID & Secret**: (from an APIM-IS service account, if required)
3. Click **Save**
4. Set this Key Manager as **Default** (if not already)

### Create APIs in APIM

Publish the following APIs in APIM to match the endpoints in `config.ts`. The appropriate backends for the APIs can be implemented using any language/framework. 

#### API 1: Account Details
- **Name**: `AccountDetails`
- **Context**: `/accountDetails`
- **Version**: `1`
- **Resource Path**: `/1/getAccounts`
- **Method**: POST
- **Backend URL**: (mock service or your bank backend)
- **Security**: OAuth2

#### API 2: Internal Transfer
- **Name**: `InternalTransfer`
- **Context**: `/internalTransfer`
- **Version**: `1`
- **Resource Path**: `/1/addTransaction`
- **Method**: POST
- **Backend URL**: (mock service or your bank backend)
- **Security**: OAuth2

#### API 3: Recent Transactions
- **Name**: `RecentTransactions`
- **Context**: `/RecentTransactions`
- **Version**: `1`
- **Resource Path**: `/1/recentTransactions`
- **Method**: POST
- **Backend URL**: (mock service or your bank backend)
- **Security**: OAuth2

### Enable CORS

For each API in APIM:
1. Navigate to **Runtime** settings
2. Enable **CORS** and add:
   - **Access-Control-Allow-Origins**: `http://localhost:5173`
   - **Access-Control-Allow-Headers**: `Content-Type, Authorization`
   - **Access-Control-Allow-Methods**: `POST, OPTIONS`

---

## TLS Certificate Trust

Since both IS and APIM use self-signed certificates:

1. **Browser**: Accept or install the self-signed certificates for:
   - `https://localhost:9444` (IS)
   - `https://localhost:8243` (APIM)
2. **Fetch API**: May require additional certificate configuration depending on your environment.

---

## App Features

- **Login Flow**: OpenID Connect with PKCE Authorization Code flow
- **Account Overview**: Fetches account balances from APIM
- **Recent Transactions**: Displays transaction history (collapsible section)
- **Secure Transfer**: Email OTP-protected transaction using secondary client
- **Session Management**: Token refresh and RP-initiated logout

---

## Dev-Mode Notes

- React StrictMode can double-invoke effects in development. This app prevents duplicate token exchanges using a ref gate and session storage tracking.
- Tokens are persisted in `sessionStorage` for page reloads within the same session.
- All sensitive operations (OTP, transactions) use bearer tokens from the configured Key Manager.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change port offset or kill the process using the port |
| "Redirect URI mismatch" | Ensure redirect URI in IS matches `http://localhost:5173` exactly |
| Token exchange fails | Verify IS is running on 9444 and PKCE is enabled for the client |
| "Missing bearer token" error | Ensure Key Manager is configured in APIM and tokens are valid |
| CORS errors | Enable CORS on APIs in APIM for `http://localhost:5173` |
| Certificate errors | Accept self-signed certificates in browser or configure trusted CA |
