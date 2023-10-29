const CORS_ORIGIN = '*';

export const headers = new Headers();
headers.set('Access-Control-Allow-Origin', CORS_ORIGIN);
headers.set('Content-Type', 'application/json; charset=UTF-8');