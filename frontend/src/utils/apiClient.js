import axios from 'axios'

export function baseUrl(path = ''){
  const base = import.meta.env.VITE_API_URL || '/api';
  // ensure no double slashes
  if(!path) return base;
  if(path.startsWith('/')) return base.replace(/\/$/, '') + path;
  return base.replace(/\/$/, '') + '/' + path;
}

export function buildHeaders(token){
  return token ? { Authorization: 'Bearer ' + token } : {};
}

export default { axios, baseUrl, buildHeaders }
