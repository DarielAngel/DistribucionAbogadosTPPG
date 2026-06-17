// Lightweight SSE wrapper + local emitter for tests
const emitter = (typeof window !== 'undefined' && typeof EventTarget !== 'undefined') ? new EventTarget() : {
  _listeners: {},
  addEventListener(name, fn){ (this._listeners[name] = this._listeners[name]||[]).push(fn) },
  removeEventListener(name, fn){ if(!this._listeners[name]) return; this._listeners[name] = this._listeners[name].filter(f=>f!==fn) },
  dispatchEvent(ev){ const name = ev.type; const list = this._listeners[name]||[]; for(const f of list) try{ f(ev) }catch(e){} }
};

function dispatchLocal(name, payload){
  try{ emitter.dispatchEvent(new CustomEvent(name, { detail: payload })); }
  catch(e){ /* no-op */ }
}

function startSSE(){
  if(typeof window === 'undefined') return null;
  if(import.meta.env && import.meta.env.VITEST) return null; // don't open during tests
  const base = import.meta.env.VITE_API_URL || '/api';
  try{
    const es = new EventSource(base + '/events');
    const events = ['lawyer:created','lawyer:deleted','lawyer:updated','schedule:created','schedule:updated','schedule:deleted'];
    events.forEach(evName => {
      es.addEventListener(evName, e => {
        try{ const data = JSON.parse(e.data); emitter.dispatchEvent(new CustomEvent(evName, { detail: data })); }
        catch(err){ emitter.dispatchEvent(new CustomEvent(evName, { detail: null })); }
      });
    });
    es.onopen = ()=>{ console.debug('SSE connected'); };
    es.onerror = (err)=>{ console.warn('SSE error', err); };
    return es;
  }catch(e){ return null }
}

// auto-start in non-test environments
if(typeof window !== 'undefined' && !(import.meta.env && import.meta.env.VITEST)){
  startSSE();
}

export { emitter as default, dispatchLocal, startSSE };
