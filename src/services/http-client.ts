export interface HttpClient {
  get<T>(path: string, init?: RequestInit): Promise<T>;
}

export class FetchHttpClient implements HttpClient {
  constructor(private readonly baseUrl = process.env.BACKEND_API_URL ?? "") {}
  async get<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init);
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    return response.json() as Promise<T>;
  }
}
