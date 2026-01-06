/**
 * OIDC: WSO2 Identity Server
 * If your IS runs on 9443 (direct) instead of 9444, change the port numbers below.
 */
export const OIDC_CONFIG = {
  AUTHORIZATION_ENDPOINT: "https://localhost:9444/oauth2/authorize",
  TOKEN_ENDPOINT: "https://localhost:9444/oauth2/token",
  USERINFO_ENDPOINT: "https://localhost:9444/oauth2/userinfo",
  ENDSESSION_ENDPOINT: "https://localhost:9444/oidc/logout",
  CLIENT_ID: "HpfVbYONf5MwRREA12p14vNQfJAa",
  CLIENT_ID2: "E0bqe3TldZqJ3befDzav0OQkPtIa",
  REDIRECT_URI: "http://localhost:5173",
  SCOPE: "openid profile email",
  BANK_NAME: "Bitwave Bank"
};

/**
 * APIM: Fixed endpoint for the demo data.
 * GET https://localhost:8243/bankdemo/v1/accounts/1/sample
 * with Authorization: Bearer <access_token>
 */
export const API_CONFIG = {
  GET_ACCOUNTS_URL: "https://localhost:8243/accountDetails/1/getAccounts",
  ADD_TRANSACTION_URL: "https://localhost:8243/internalTransfer/1/addTransaction",
  RECENT_TRANSACTIONS_URL: "https://localhost:8243/RecentTransactions/1/recentTransactions"
};
