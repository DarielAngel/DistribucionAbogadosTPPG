const axios = require('axios')

async function run(){
  try{
    const email = `smoke+${Date.now()}@example.com`
    const pw = 'smokepw'
    const base = process.env.VITE_API_URL || 'http://localhost:4000/api'

    console.log('Registering user', email)
    await axios.post(base + '/auth/register', { name: 'smoke', email, password: pw, role: 'admin' })
    console.log('Logging in')
    const login = await axios.post(base + '/auth/login', { email, password: pw })
    const token = login.data.token
    console.log('Token received')
    const res = await axios.get(base + '/lawyers', { headers: { Authorization: 'Bearer ' + token } })
    console.log('Lawyers count:', Array.isArray(res.data) ? res.data.length : 'unknown')
    console.log('Smoke test OK')
    process.exit(0)
  }catch(err){
    console.error('Smoke test failed:', err.response ? err.response.data : err.message)
    process.exit(2)
  }
}

run()
