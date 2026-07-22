export function showToast(message, type = 'success', duration = 4000){
  if(typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type, duration } }));
}

export default { showToast };
