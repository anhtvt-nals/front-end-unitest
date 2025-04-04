export class CoreService {
  host: string;
  
  /**
   * Constructor
   */
  constructor() {
    // @To do: Will be replaced with env variable
    this.host = 'https://67eb7353aa794fb3222a4c0e.mockapi.io';
  }

  /**
   * Builds the full URL for the given path
   * @param url 
   * @returns string
   */
  path(url: string) {
    const cleanHost = this.host.replace(/\/+$/, '');
    const cleanUrl = url.replace(/^\/+/, '');
    return [cleanHost, cleanUrl].join('/');
  }

  /**
   * Generic method to call the API
   * @param url 
   * @param method 
   * @param data 
   * @returns 
   */
  async call(url: string, method: string, data?: any) {
    return new Promise(async (resolve, reject) => {
      const context: Record<string, any> = {
        headers: { 'Content-Type': 'application/json' }
      };

      if (method !== 'GET') {
        context['body'] = JSON.stringify(data);
      }

      const response = await fetch(this.path(url), {
        method,
        ...context
      });

      if (!response.ok) {
        reject(`[CLIENT ERROR][CODE: ${response.status}] ${response.statusText}`);
      }
  
      const res = await response.json();
      resolve(res);
    })
  }

  /**
   * Generic method to call the API with GET method
   * @param url 
   * @returns 
   */
  async get(url: string) {
    return this.call(url, 'GET');
  }

  /**
   * Generic method to call the API with POST method
   * @param url 
   * @param data 
   * @returns 
   */
  async post(url: string, data: any){
    return this.call(url, 'POST', data);
  }
}