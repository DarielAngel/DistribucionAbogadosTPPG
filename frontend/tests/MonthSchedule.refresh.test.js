import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import MonthSchedule from '../src/components/MonthSchedule.vue'
import axios from 'axios'

vi.mock('axios')

describe('MonthSchedule refresh', ()=>{
  beforeEach(()=>{ vi.clearAllMocks() })

  test('clicking refresh triggers fetchPage (axios calls)', async ()=>{
    // initial lawyers response
    axios.get.mockResolvedValueOnce({ data: { items: [{ id:1, name:'L1' }], total: 1 } })
    // initial schedules response
    axios.get.mockResolvedValueOnce({ data: [] })

    const { getByText } = render(MonthSchedule, { props: { token: 't' } })
    // wait for initial fetch to finish
    await waitFor(()=> expect(axios.get).toHaveBeenCalled())

    const beforeCalls = axios.get.mock.calls.length
    const btn = getByText('Refrescar')
    await fireEvent.click(btn)

    await waitFor(()=> expect(axios.get.mock.calls.length).toBeGreaterThan(beforeCalls))
  })
})
