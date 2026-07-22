import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import AddLawyerModal from '../src/components/AddLawyerModal.vue'
import axios from 'axios'

vi.mock('axios')

describe('AddLawyerModal', ()=>{
  beforeEach(()=>{ vi.clearAllMocks() })

  test('inputs accept text and submit creates lawyer', async ()=>{
    axios.post.mockResolvedValueOnce({ data: { id: 99, name: 'Test', email: 't@e.com' } })
    const { emitted, getByLabelText, getByText } = render(AddLawyerModal, { props: { token: 't' } })

    const name = getByLabelText(/Nombre/)
    const email = getByLabelText(/Email/)

    await fireEvent.update(name, 'Test')
    await fireEvent.update(email, 't@e.com')

    expect(name.value).toBe('Test')
    expect(email.value).toBe('t@e.com')

    await fireEvent.click(getByText('Crear abogado'))

    await waitFor(()=> expect(axios.post).toHaveBeenCalled())
    expect(emitted().added).toBeTruthy()
  })
})
