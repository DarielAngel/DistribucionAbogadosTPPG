import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import LawyersList from '../src/components/LawyersList.vue'
import axios from 'axios'

vi.mock('axios')

describe('LawyersList search (partial matches)', ()=>{
  beforeEach(()=>{ vi.useFakeTimers(); vi.clearAllMocks() })
  afterEach(()=>{ vi.useRealTimers() })

  test('shows results when searching by partial name', async ()=>{
    // initial fetch
    axios.get.mockResolvedValueOnce({ data: [{ id:1, name:'María', province:'P1', municipality:'M1' }, { id:2, name:'Ana', province:'P2', municipality:'M2' }] })

    // when searching for 'Mar' backend returns only matching entries
    const suggestions = { data: { items: [{ id:1, name:'María', province:'P1', municipality:'M1' }] } }
    const full = { data: { items: [{ id:1, name:'María', province:'P1', municipality:'M1' }] } }
    axios.get.mockResolvedValueOnce(suggestions).mockResolvedValueOnce(full)

    render(LawyersList, { props: { token: 't' } })
    const input = screen.getByPlaceholderText(/Buscar por nombre/)

    await fireEvent.update(input, 'Mar')
    // advance less than debounce to ensure no call yet beyond initial
    vi.advanceTimersByTime(100)
    await Promise.resolve()
    // initial load + no extra
    expect(axios.get).toHaveBeenCalledTimes(1)

    // after debounce
    vi.advanceTimersByTime(300)
    await waitFor(()=> expect(axios.get).toHaveBeenCalled())
    await waitFor(()=> expect(screen.getByText('María')).toBeInTheDocument())
  })

  test('shows results when searching by partial municipality or province', async ()=>{
    // initial fetch
    axios.get.mockResolvedValueOnce({ data: [{ id:10, name:'Pedro', province:'ProvinciaX', municipality:'VillaSur' }, { id:11, name:'Lucía', province:'ProvinciaY', municipality:'CiudadNorte' }] })

    // searching for 'Villa' (partial municipality)
    const sug1 = { data: { items: [{ id:10, name:'Pedro', province:'ProvinciaX', municipality:'VillaSur' }] } }
    const full1 = { data: { items: [{ id:10, name:'Pedro', province:'ProvinciaX', municipality:'VillaSur' }] } }
    // searching for 'Provincia' (partial province)
    const sug2 = { data: { items: [{ id:10, name:'Pedro', province:'ProvinciaX', municipality:'VillaSur' }, { id:11, name:'Lucía', province:'ProvinciaY', municipality:'CiudadNorte' }] } }
    const full2 = { data: { items: [{ id:10, name:'Pedro', province:'ProvinciaX', municipality:'VillaSur' }, { id:11, name:'Lucía', province:'ProvinciaY', municipality:'CiudadNorte' }] } }

    // We'll respond sequentially for two searches (each has suggestion + full)
    axios.get.mockResolvedValueOnce(sug1).mockResolvedValueOnce(full1).mockResolvedValueOnce(sug2).mockResolvedValueOnce(full2)

    render(LawyersList, { props: { token: 't' } })
    const input = screen.getByPlaceholderText(/Buscar por nombre/)

    // municipality partial
    await fireEvent.update(input, 'Villa')
    vi.advanceTimersByTime(350)
    await waitFor(()=> expect(screen.getByText('Pedro')).toBeInTheDocument())

    // province partial
    await fireEvent.update(input, 'Provincia')
    vi.advanceTimersByTime(350)
    await waitFor(()=> expect(screen.getByText('Lucía')).toBeInTheDocument())
  })
})
