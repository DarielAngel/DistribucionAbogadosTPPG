const axios = require('axios');

async function run(){
  try{
    const base = 'http://localhost:4000';
    const loginRes = await axios.post(base + '/auth/login', { email: 'admin@example.com', password: 'secret' });
    const token = loginRes.data.token;
    console.log('Got token, fetching lawyers and schedules...');
    const headers = { Authorization: 'Bearer ' + token };
    const lawRes = await axios.get(base + '/lawyers', { headers });
    console.log('Lawyers:', lawRes.data.length);
    const now = new Date();
    const start = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
    const end = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(new Date(now.getFullYear(), now.getMonth()+1,0).getDate()).padStart(2,'0')}`;
    const schedRes = await axios.get(base + `/schedules?startDate=${start}&endDate=${end}`, { headers });
    console.log('Schedules in month:', schedRes.data.length);
    // print first lawyer with some tasks
    const map = {};
    for(const s of schedRes.data){
      map[s.lawyerId] = map[s.lawyerId] || [];
      map[s.lawyerId].push(s);
    }
    const firstLawyer = lawRes.data[0];
    console.log('Sample lawyer:', firstLawyer.name, 'tasks this month:', (map[firstLawyer.id]||[]).length);
  }catch(err){ console.error(err.response? err.response.data : err.message); process.exit(1) }
}

run();
