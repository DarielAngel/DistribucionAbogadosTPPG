import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import MonthSchedule from '../src/components/MonthSchedule.vue'
import axios from 'axios'

vi.mock('axios')

describe('MonthSchedule cell click shows task details', ()=>{
  beforeEach(()=>{ vi.clearAllMocks() })

  test('clicking an occupied cell displays task description and owner', async ()=>{
    // prepare dates for current day to ensure cell exists in current month
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    // initial lawyers response
    axios.get.mockResolvedValueOnce({ data: { items: [{ id:1, name:'L1' }], total: 1 } })
    // schedules response with one task on today's date
    axios.get.mockResolvedValueOnce({ data: [{ id:100, date: dateStr, type: 'Audiencia', description: 'Descripción X', startTime: '10:00', endTime: '11:00', lawyerId: 1, Lawyer: { id:1, name: 'L1' } }] })

    render(MonthSchedule, { props: { token: 't' } })

    // wait for initial fetch
    await waitFor(()=> expect(axios.get).toHaveBeenCalled())

    // click the first 'Ocupado' cell
    const ocupado = await screen.findByText('Ocupado')
    await fireEvent.click(ocupado)

    // expect the task description to be visible
    await waitFor(()=> expect(screen.getByText('Descripción X')).toBeTruthy())
  })
})
