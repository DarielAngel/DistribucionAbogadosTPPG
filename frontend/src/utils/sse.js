// Lightweight SSE wrapper + local emitter for tests
const emitter = (typeof window !== 'undefined' && typeof EventTarget !== 'undefined') ? new EventTarget() : {
  _listeners: {},
  addEventListener(name, fn){ (this._listeners[name] = this._listeners[name]||[]).push(fn) },
  removeEventListener(name, fn){ if(!this._listeners[name]) return; this._listeners[name] = this._listeners[name].filter(f=>f!==fn) },
  dispatchEvent(ev){ const name = ev.type; const list = this._listeners[name]||[]; for(const f of list) try{ f(ev) }catch(e){} }
};

function dispatchLocal(name, payload){
  try{ emitter.dispatchEvent(new CustomEvent(name, { detail: payload })); }
  catch(e){}
}

let _es = null;

function startSSE(){
  if(typeof window === 'undefined') return;
  if(import.meta.env && import.meta.env.VITEST) return;
  if(_es) return; // ya conectado
  const base = import.meta.env.VITE_API_URL || '/api';
  try{
    _es = new EventSource(base + '/events');
    const events = ['lawyer:created','lawyer:deleted','lawyer:updated','schedule:created','schedule:updated','schedule:deleted'];
    events.forEach(evName => {
      _es.addEventListener(evName, e => {
        try{ const data = JSON.parse(e.data); emitter.dispatchEvent(new CustomEvent(evName, { detail: data })); }
        catch(err){ emitter.dispatchEvent(new CustomEvent(evName, { detail: null })); }
      });
    });
    _es.onopen = () => console.debug('SSE connected');
    _es.onerror = () => {}; // reconecta solo, sin spam en consola
  }catch(e){}
}

function stopSSE(){
  if(_es){ _es.close(); _es = null; }
}

export { emitter as default, dispatchLocal, startSSE, stopSSE };
