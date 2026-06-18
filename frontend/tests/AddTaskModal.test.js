import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import AddTaskModal from '../src/components/AddTaskModal.vue'
import axios from 'axios'

vi.mock('axios')

describe('AddTaskModal', ()=>{
  beforeEach(()=>{ vi.clearAllMocks() })

  test('select lawyer via compact LawyersList and submit task', async ()=>{
    axios.post.mockResolvedValueOnce({ data: { id: 123 } })

    const LawyersListStub = {
      template: `<div><button data-testid="sel" @click="$emit('select',{ id:42, name:'Test' })">select</button></div>`
    }

    const { getByTestId, getByLabelText, getByText, emitted } = render(AddTaskModal, { props: { token: 't' }, global: { stubs: { LawyersList: LawyersListStub } } })

    // select lawyer
    const sel = await screen.findByTestId('sel')
    await fireEvent.click(sel)

    // fill required fields
    const desc = getByLabelText(/Descripción/)
    const start = getByLabelText(/Fecha inicio/)
    const end = getByLabelText(/Fecha fin/)

    await fireEvent.update(desc, 'Test task')
    await fireEvent.update(start, '2026-06-01')
    await fireEvent.update(end, '2026-06-02')

    await fireEvent.click(getByText('Crear tarea'))

    await waitFor(()=> expect(axios.post).toHaveBeenCalled())
    expect(emitted().added).toBeTruthy()
  })
})
