import {supabase} from './supabase';
import {tokenManager} from './tokenManager';
import {API_TIMEOUT, RETRY_ATTEMPTS} from '@/utils/constants';

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = supabase.supabaseUrl;
  }

  /**
   * Make an authenticated API request with automatic token refresh
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit & ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = API_TIMEOUT,
      retries = RETRY_ATTEMPTS,
      requireAuth = true,
      ...fetchOptions
    } = options;

    // Ensure valid token if authentication is required
    if (requireAuth) {
      const tokenValid = await tokenManager.ensureValidToken();
      if (!tokenValid) {
        return {
          data: null,
          error: 'Authentication failed - please log in again',
          status: 401,
        };
      }
    }

    // Get current session for authorization header
    let headers = {
      'Content-Type': 'application/json',
      'X-Client-Info': 'cmms-mobile-app',
      ...fetchOptions.headers,
    };

    if (requireAuth) {
      const tokens = await tokenManager.getTokens();
      if (tokens) {
        headers = {
          ...headers,
          Authorization: `${tokens.tokenType} ${tokens.accessToken}`,
        };
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 errors by attempting token refresh
      if (response.status === 401 && requireAuth && retries > 0) {
        const refreshSuccess = await tokenManager.refreshToken();
        if (refreshSuccess) {
          // Retry the request with new token
          return this.request<T>(endpoint, {
            ...options,
            retries: retries - 1,
          });
        }
      }

      let data: T | null = null;
      let error: string | null = null;

      if (response.ok) {
        try {
          const text = await response.text();
          data = text ? JSON.parse(text) : null;
        } catch (parseError) {
          error = 'Failed to parse response';
        }
      } else {
        try {
          const errorResponse = await response.json();
          error = errorResponse.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          error = `HTTP ${response.status}: ${response.statusText}`;
        }
      }

      return {
        data,
        error,
        status: response.status,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return {
            data: null,
            error: 'Request timeout',
            status: 408,
          };
        }
        
        // Retry on network errors
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          return this.request<T>(endpoint, {
            ...options,
            retries: retries - 1,
          });
        }

        return {
          data: null,
          error: fetchError.message,
          status: 0,
        };
      }

      return {
        data: null,
        error: 'Unknown error occurred',
        status: 0,
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * Upload file
   */
  async upload<T = any>(
    endpoint: string,
    file: FormData,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {timeout = API_TIMEOUT * 3, ...otherOptions} = options; // Longer timeout for uploads

    return this.request<T>(endpoint, {
      method: 'POST',
      body: file,
      timeout,
      headers: {
        // Don't set Content-Type for FormData, let the browser set it
      },
      ...otherOptions,
    });
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health', {
        requireAuth: false,
        timeout: 5000,
        retries: 1,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();