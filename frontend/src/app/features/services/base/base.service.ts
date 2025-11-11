import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class BaseService {
  constructor(private http: HttpClient) {
  }

  /**
   * Http GET
   *
   * @param url URL to call
   * @param params optional parameters such as HttpHeaders, HttpParams, reportProgress etc.
   * @param responseType if other than json
   */
  public get(url: string, params?: any): Observable<any> {
    return this.http.get<any[]>(url, params);
  }

  /**
   * Http PUT
   *
   * @param url URL to call
   * @param data payload
   * @param params parameters such as HttpHeaders, HttpParams, reportProgress etc.
   */
  public put(url: string, data: any, params?: any): Observable<any> {
    return this.invoke('PUT', url, data, params);
  }

  /**
   * Http PATCH
   *
   * @param url URL to call
   * @param data payload
   * @param params parameters such as HttpHeaders, HttpParams, reportProgress etc.
   */
  public patch(url: string, data: any, params?: any): Observable<any> {
    return this.invoke('PATCH', url, data, params);
  }

  /**
   * Http POST
   *
   * @param url URL to call
   * @param data payload
   * @param params parameters such as HttpHeaders, HttpParams, reportProgress etc.
   */
  public post(url: string, data?: any, params?: any): Observable<any> {
    return this.invoke('POST', url, data, params);
  }

  /**
   * Http DELETE
   *
   * @param url URL to call
   * @param params parameters such as HttpHeaders, HttpParams, reportProgress etc.
   */
  public delete(url: string, params?: any): Observable<any> {
    return this.invoke('DELETE', url, null, params);
  }

  private invoke(
    method: string,
    url: string,
    body: any = {},
    params?: any,
    responseType?: any
  ): Observable<any> {
    if (!url) {
      throw new Error('No URL provided.');
    }
    const requestUrl = `${url}`;
    return this.http.request(method, requestUrl, {
      body,
      params,
      responseType,
    });
  }
}
