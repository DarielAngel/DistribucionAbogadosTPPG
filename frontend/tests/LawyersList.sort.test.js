import { render, screen, waitFor } from '@testing-library/vue'
import LawyersList from '../src/components/LawyersList.vue'
import axios from 'axios'

vi.mock('axios')

describe('LawyersList sorting', ()=>{
  beforeEach(()=>{ vi.clearAllMocks() })

  test('fetched lawyers are shown in alphabetical order', async ()=>{
    // return unsorted list from server
    const unsorted = { data: { items: [ { id: 1, name: 'Zoé' }, { id: 2, name: 'Ana' }, { id: 3, name: 'Luis' } ], total: 3 } }
    axios.get.mockResolvedValueOnce(unsorted)

    render(LawyersList, { props: { token: 't', isAdmin: true } })

    await waitFor(()=> expect(axios.get).toHaveBeenCalled())

    // names should be rendered in alphabetical order: Ana, Luis, Zoé
    const nameEls = await screen.findAllByText(/(Ana|Luis|Zoé)/)
    const texts = nameEls.map(n => n.textContent.trim())
    // find order of unique names
    const unique = [...new Set(texts)]
    expect(unique[0]).toMatch(/Ana/)
    expect(unique[1]).toMatch(/Luis/)
    expect(unique[2]).toMatch(/Zoé/)
  })
})
