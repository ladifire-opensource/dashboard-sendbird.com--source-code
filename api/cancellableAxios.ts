import axios, { AxiosPromise, AxiosRequestConfig, Canceler } from 'axios';
import qs from 'qs';

import { logException } from '@utils/logException';

axios.defaults.paramsSerializer = (params) => qs.stringify(params, { arrayFormat: 'repeat' });

axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error.response);
  },
);

axios.interceptors.response.use(
  (response) => {
    // Do something with response data
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      // Ignore a rejection by a request cancellation
      // axios support validator function for error object whether isCancel or not
      // axios.isCancel(error);
      return null;
    }

    if (error) {
      if (error.response) {
        // The request was made, but the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          location.href = '/auth/signout';
        } else if (error.response.status === 500) {
          const { config = {}, data = {} } = error.response;
          logException({
            error,
            context: {
              types: 'Internal Server Error',
              request: {
                url: config.url,
                method: config.method,
                data: config.data,
                params: config.params,
              },
              response: data,
            },
          });
        }
      } else {
        if (error.status && error.status === 401) {
          location.href = '/auth/signout';
        } else if (error.message) {
          // can be either Error or AxiosError object
          return Promise.reject(error);
        }
      }

      return Promise.reject(error.response);
    }
    logException({
      error: new Error('Caught undefined error in app/api/cancellableAxios'),
      context: { error, isErrorNullOrUndefined: error == null },
    });
    return Promise.reject(error);
  },
);

enum HttpMethod {
  Get,
  Delete,
  Head,
  Post,
  Put,
  Patch,
}

export type CancellableAxiosPromise<T = any> = AxiosPromise<T> & {
  cancel: Canceler;
};

class CancellableAxios {
  private createCancelTokenSource = () => axios.CancelToken.source();

  private makeRequest = <T>({
    method,
    url,
    data,
    config: originalConfig,
  }: {
    method: HttpMethod;
    url: string;
    data?: any;
    config: AxiosRequestConfig;
  }): CancellableAxiosPromise<T> => {
    const cancelTokenSource = this.createCancelTokenSource();
    const config = {
      ...axios.defaults,
      ...originalConfig,
      cancelToken: cancelTokenSource.token,
    };

    const request: CancellableAxiosPromise<T> = (() => {
      let axiosPromise: AxiosPromise<T> & { cancel?: Canceler };
      switch (method) {
        case HttpMethod.Get:
          axiosPromise = axios.get<T>(url, config);
          break;
        case HttpMethod.Delete:
          axiosPromise = axios.delete<T>(url, config);
          break;
        case HttpMethod.Head:
          axiosPromise = axios.head<T>(url, config);
          break;
        case HttpMethod.Post:
          axiosPromise = axios.post<T>(url, data, config);
          break;
        case HttpMethod.Put:
          axiosPromise = axios.put<T>(url, data, config);
          break;
        default:
          // HttpMethod.Patch:
          axiosPromise = axios.patch<T>(url, data, config);
      }
      axiosPromise.cancel = cancelTokenSource.cancel;

      return axiosPromise as CancellableAxiosPromise<T>;
    })();

    return request;
  };

  public get original() {
    return axios;
  }

  /**
   * Don't forget to add trailing slash('/') our API server will expect
   * trailing slash(especially DRF related servers), Chrome automatically fix this but
   * Safari doesn't so please always add slash after URL.
   */
  public get = <T = any>(url: string, config: AxiosRequestConfig = {}) =>
    this.makeRequest<T>({ method: HttpMethod.Get, url, config });

  /**
   * Don't forget to add trailing slash('/') our API server will expect
   * trailing slash(especially DRF related servers), Chrome automatically fix this but
   * Safari doesn't so please always add slash after URL.
   */
  public delete = <T = any>(url: string, config: AxiosRequestConfig = {}) =>
    this.makeRequest<T>({ method: HttpMethod.Delete, url, config });

  /**
   * Don't forget to add trailing slash('/') our API server will expect
   * trailing slash(especially DRF related servers), Chrome automatically fix this but
   * Safari doesn't so please always add slash after URL.
   */
  public head = <T = any>(url: string, config: AxiosRequestConfig = {}) =>
    this.makeRequest<T>({ method: HttpMethod.Head, url, config });

  /**
   * Don't forget to add trailing slash('/') our API server will expect
   * trailing slash(especially DRF related servers), Chrome automatically fix this but
   * Safari doesn't so please always add slash after URL.
   */
  public post = <T = any>(url: string, data?: any, config: AxiosRequestConfig = {}) =>
    this.makeRequest<T>({ method: HttpMethod.Post, url, data, config });

  /**
   * Don't forget to add trailing slash('/') our API server will expect
   * trailing slash(especially DRF related servers), Chrome automatically fix this but
   * Safari doesn't so please always add slash after URL.
   */
  public put = <T = any>(url: string, data?: any, config: AxiosRequestConfig = {}) =>
    this.makeRequest<T>({ method: HttpMethod.Put, url, data, config });

  /**
   * Don't forget to add trailing slash('/') our API server will expect
   * trailing slash(especially DRF related servers), Chrome automatically fix this but
   * Safari doesn't so please always add slash after URL.
   */
  public patch = <T = any>(url: string, data?: any, config: AxiosRequestConfig = {}) =>
    this.makeRequest<T>({ method: HttpMethod.Patch, url, data, config });
}

export const cancellableAxios = new CancellableAxios();
