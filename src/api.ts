import { API_CONFIG } from "./config";

export interface Account { name: string; balance: number; }

export async function fetchAccounts(accessToken: string): Promise<Account[]> {
  const res = await fetch(API_CONFIG.GET_ACCOUNTS_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json"
    }
  });

  if (res.status === 204) return [];
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`APIM ${res.status} ${res.statusText}: ${text}`);
  }

  const data = await res.json().catch(() => null);
  if (!data) throw new Error("APIM response was not JSON");

  // Accept typical shapes
  if (Array.isArray(data)) return data as Account[];
  if (Array.isArray(data.accounts)) return data.accounts as Account[];
  if (data?.list && Array.isArray(data.list)) return data.list as Account[];

  // If it's a single sample object, normalize to array
  if (data?.name && typeof data.balance === "number") return [data as Account];

  throw new Error("Unexpected accounts response shape");
}
