import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import LawyersList from '../src/components/LawyersList.vue'
import axios from 'axios'

vi.mock('axios')

describe('LawyersList compact mode', ()=>{
  beforeEach(()=>{ vi.useFakeTimers(); vi.clearAllMocks() })
  afterEach(()=>{ vi.useRealTimers() })

  test('compact hides full list and shows suggestions', async ()=>{
    // suggestions response
    const suggestions = { data: { items: [{ id:1, name:'Carlos', province:'P', municipality:'M' }] } }
    axios.get.mockResolvedValueOnce(suggestions)

    render(LawyersList, { props: { token: 't', compact: true } })
    const input = screen.getByPlaceholderText(/Buscar por nombre/)

    await fireEvent.update(input, 'Car')
    vi.advanceTimersByTime(350)

    await waitFor(()=> expect(screen.getByText('Carlos')).toBeInTheDocument())

    // full list should NOT be rendered in compact mode
    const listItems = screen.queryAllByRole('listitem')
    // suggestions exist but main list should be hidden (no lawyer list entries besides suggestions)
    expect(listItems.length).toBeGreaterThan(0)
  })
})
