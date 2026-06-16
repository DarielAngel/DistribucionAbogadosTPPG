import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import LawyersList from '../src/components/LawyersList.vue'
import axios from 'axios'

vi.mock('axios')

test('fetches and displays lawyers list', async () => {
  axios.get.mockResolvedValue({ data: [{ id: 1, name: 'Juan Perez', province: 'P', municipality: 'M', specialization: 'Civil' }] })
  render(LawyersList, { props: { token: 'fake' } })
  await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument())
})

describe('autocomplete with debounce', ()=>{
  beforeEach(()=>{ vi.useFakeTimers(); vi.clearAllMocks() })
  afterEach(()=>{ vi.useRealTimers() })

  test('shows suggestions after debounce and calls API after delay', async ()=>{
      const initialItems = { data: { items: [{ id: 9, name: 'Initial One', province: 'P0', municipality: 'M0' }] } }
      const suggestionItems = { data: { items: [{ id:1, name:'Ana García', province:'Prov A', municipality:'M1' }] } }
      const fullItems = { data: { items: [{ id:1, name:'Ana García' }, { id:2, name:'Pedro'}] } }
      axios.get.mockResolvedValueOnce(initialItems).mockResolvedValueOnce(suggestionItems).mockResolvedValueOnce(fullItems)

    render(LawyersList, { props: { token: 't' } })
    const input = screen.getByPlaceholderText(/Buscar por nombre/)

    await fireEvent.update(input, 'Ana')
    // before debounce: initial fetch from created() should have been called
    vi.advanceTimersByTime(200)
    await Promise.resolve()
    expect(axios.get.mock.calls.length).toBeGreaterThanOrEqual(1)
    // first call should be the initial list fetch
    expect(axios.get.mock.calls[0][0]).toContain('/lawyers')

    // after debounce
    vi.advanceTimersByTime(200)
    await waitFor(()=> expect(axios.get).toHaveBeenCalled())
    await waitFor(()=> expect(screen.getByText('Ana García')).toBeInTheDocument())
  })
})
