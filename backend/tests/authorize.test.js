const { authorize } = require('../src/middleware/auth');

function makeRes(){
  const res = {};
  res.status = jest.fn(()=>res);
  res.json = jest.fn(()=>res);
  return res;
}

test('authorize allows matching role', () => {
  const req = { user: { role: 'admin' } };
  const res = makeRes();
  const next = jest.fn();
  const mw = authorize('admin');
  mw(req, res, next);
  expect(next).toHaveBeenCalled();
  expect(res.status).not.toHaveBeenCalled();
});

test('authorize forbids mismatched role', () => {
  const req = { user: { role: 'client' } };
  const res = makeRes();
  const next = jest.fn();
  const mw = authorize('admin');
  mw(req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
});

test('authorize rejects unauthenticated', () => {
  const req = {};
  const res = makeRes();
  const next = jest.fn();
  const mw = authorize('admin');
  mw(req, res, next);
  expect(next).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
});
