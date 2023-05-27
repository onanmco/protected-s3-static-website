export interface Cookies {
  [ key: string ]: string;
}

export interface QueryStringParameters {
  [ key: string ]: string;
}

export interface State {
  [ key: string ]: any;
  requestedURL: string;
}
