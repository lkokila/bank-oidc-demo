# Claude React Expert Agent Context

## Project Overview

**Bank OIDC Demo** - A React 18 + TypeScript banking application demonstrating OpenID Connect (OIDC) authentication integrated with WSO2 Identity Server (IS) and API Manager (APIM).

**Tech Stack:**
- React 18.3.1
- TypeScript 5.5.4
- Vite 7.2.6 (build tool)
- Framer Motion 11.2.10 (animations)
- Lucide React 0.454.0 (icons)

**Key Architecture:**
- Single-page React app with OIDC/PKCE authentication flow
- Supports multiple OAuth2 client IDs for different auth scenarios
- Email OTP authentication flow integration
- Transaction management and account overview features
- Session storage for token persistence

---

## Project Structure

```
src/
├── main.tsx              # Vite entry point
├── ui/
│   └── BankOIDCDemoApp.tsx  # Main React component (complete app)
├── api.ts               # API integration (fetchAccounts)
├── config.ts            # Configuration (endpoints, client IDs, bank name)
```

---

## Core Components & Features

### Main Component: `BankOIDCDemoApp.tsx`

**Key State Management:**
```typescript
// Authentication
tokens              // OAuth2 tokens (access_token, id_token, refresh_token)
userInfo            // User profile from /userinfo endpoint
error               // Error messaging

// Account data
accounts            // Array of Account objects with balances
refreshingAccounts  // Set<string> tracking accounts in animation state

// Transaction data
transactions        // Tx[] (Date, Description, Amount)
txLoading           // Loading state for transaction fetch

// OTP flow
otpVisible          // Show/hide OTP input UI
otpValue            // User-entered OTP code
otpRequesting       // Loading state for OTP operations
otpError            // OTP-specific error messages
otpResponse         // Normalized authorize response data
```

**Key Functions:**

1. **`startLogin(clientId?: string)`**
   - Initiates PKCE authorization flow
   - Generates code_verifier, code_challenge, and state
   - Stores PKCE state in sessionStorage
   - Redirects to authorization endpoint

2. **`exchangeCodeForTokens(code, state)`**
   - Automatically triggered when redirect_uri receives `code` parameter
   - Uses stored code_verifier for PKCE validation
   - Exchanges authorization code for tokens
   - Handles client ID persistence across auth flows

3. **`emailOtpFlow(clientId?: string)`**
   - Initiates email OTP authentication via /authorize endpoint
   - Extracts sessionId and username from stored id_token
   - Sends POST to AUTHORIZATION_ENDPOINT with response_mode=direct
   - Returns OTP flow metadata (flowId, authenticatorId)

4. **`startEmailOtp(clientId?)`**
   - Calls emailOtpFlow and normalizes response structure
   - Handles multiple field name variations (flowID/flowId, etc.)
   - Shows OTP input UI on success

5. **`submitOtp()`**
   - Submits OTP code to /authn endpoint
   - Uses flowId and authenticatorId from authorize response
   - Exchanges resulting auth code for tokens (using CLIENT_ID2)
   - Automatically handles post-OTP token exchange

6. **`fetchRecentTransactions()`**
   - Fetches recent transactions via APIM endpoint
   - Requires valid access_token
   - Filters transactions and displays in chronological order
   - Handles multiple token field name variations

7. **`rpLogout()`**
   - Initiates RP-initiated logout via /endsession endpoint
   - Includes id_token_hint for server-side session cleanup
   - Clears client-side session storage

**Effect Hooks:**

- **Token acquisition effect** (line 50-75): Fetches userInfo and accounts when tokens change
- **Code consumption effect** (line 358-381): Single-invoke auth code exchange with duplicate prevention

---

## Configuration (`config.ts`)

Expected exports:
```typescript
OIDC_CONFIG: {
  BANK_NAME: string
  CLIENT_ID: string              // Primary client
  CLIENT_ID2: string             // OTP/transaction flow client
  AUTHORIZATION_ENDPOINT: string  // /authorize
  TOKEN_ENDPOINT: string          // /token
  USERINFO_ENDPOINT: string       // /userinfo
  ENDSESSION_ENDPOINT: string     // /endsession
  REDIRECT_URI: string            // Callback URL
  SCOPE: string                   // OAuth2 scopes (openid profile email)
}

API_CONFIG: {
  URL: string  // APIM accounts endpoint
}
```

---

## Authentication Flows

### PKCE Authorization Code Flow (Standard Login)
```
1. startLogin() → PKCE params → Authorize endpoint
2. Redirect loop with code
3. exchangeCodeForTokens() → Token endpoint
4. Store tokens in sessionStorage
5. Fetch userInfo and accounts
```

### Email OTP Flow (Transaction Authorization)
```
1. startEmailOtp(CLIENT_ID2) → emailOtpFlow()
2. POST /authorize with response_mode=direct
3. Server returns flowId + authenticatorId
4. User enters OTP in UI
5. submitOtp() → POST /authn with OTP
6. Server returns auth code
7. Token exchange with CLIENT_ID2
```

### Token Refresh
```
1. Use refresh_token with grant_type=refresh_token
2. Persists client_id (_client_id) for next refresh
3. Updates sessionStorage tokens
```

---

## UI Components

### Utility Components (Inline Styled)
- **`Btn`**: Button with conditional primary styling
- **`CardBox`**: Card container with border and shadow

### Main Sections
1. **Header**: Bank logo/name, Sign in/out buttons
2. **Main Content (2-column grid)**:
   - **Left Column**: Accounts overview, transactions, transfer UI
   - **Right Column**: OIDC session info, user profile, error display
3. **Animations**: Framer Motion fade-in, account refresh glow

---

## Common Development Tasks

### Adding a New API Endpoint
1. Add config entry in `config.ts`
2. Create API function in `api.ts` following `fetchAccounts` pattern
3. Add state for response data
4. Create effect hook or button handler to invoke API
5. Display results with loading/error states using `CardBox`

### Modifying OTP Flow
- Edit `emailOtpFlow()` for request parameters
- Edit `submitOtp()` for response handling
- Verify `authnHref` extraction if endpoint structure changes
- Test with actual OTP-enabled client

### Styling
- All inline styles (no CSS modules/Tailwind)
- Color palette: Slate grays (#0f172a, #64748b, #e2e8f0)
- Spacing: 8px base unit (8, 12, 16, 24px)
- Border radius: 8-16px

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Token exchange fails at redirect | Missing PKCE verifier in sessionStorage | Ensure sessionStorage not cleared between page loads |
| OTP endpoint 404 | Wrong authnHref extraction | Check response structure; add console.log to inspect |
| "Missing bearer token" error | Token field name mismatch | Update token extraction logic to check all field names |
| Accounts don't update | Effect dependency issue | Check `useEffect` dependencies include tokens array |
| Double token exchange | Race condition in code consumption | Already handled with `exchangeRef` and `usedKey` tracking |

---

## Best Practices for This Codebase

1. **Token Management**
   - Always check `_client_id` field for multi-client scenarios
   - Use fallback logic for field names (access_token || token || id_token)
   - Clear tokens in finally blocks for logout

2. **Error Handling**
   - Set error state before API calls (setError(""))
   - Capture both response status and body
   - Use try/catch with `.catch(() => "")` for text/json parsing

3. **Session Storage**
   - Wrap sessionStorage access in try/catch
   - Use `loadSession()` helper with fallback values
   - Clean up PKCE state after successful token exchange

4. **React Patterns**
   - Use functional components with hooks only
   - Avoid prop drilling; keep state near where it's used
   - Use motion.div for animations (already integrated)

5. **OIDC Security**
   - Always use PKCE (code_challenge, code_verifier)
   - Validate state parameter matches before token exchange
   - Include id_token_hint for RP-initiated logout

---

## Testing Checklist

- [ ] PKCE flow completes with valid tokens
- [ ] Tokens persist across page reload
- [ ] refresh_token successfully refreshes access_token
- [ ] Accounts API returns correct response shape
- [ ] User info displays all claims correctly
- [ ] OTP flow triggers /authorize and /authn in correct sequence
- [ ] Multiple client IDs don't interfere with each other
- [ ] Logout clears sessionStorage and redirects
- [ ] Error messages display for all failure paths
