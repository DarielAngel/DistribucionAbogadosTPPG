import axios from 'axios'

axios.defaults.withCredentials = true

export function baseUrl(path = ''){
  const base = import.meta.env.VITE_API_URL || '/api';
  if(!path) return base;
  if(path.startsWith('/')) return base.replace(/\/$/, '') + path;
  return base.replace(/\/$/, '') + '/' + path;
}

// token param kept for backward compat — cookie handles auth automatically
export function buildHeaders(token){
  return token ? { Authorization: 'Bearer ' + token } : {};
}

export default { axios, baseUrl, buildHeaders }
