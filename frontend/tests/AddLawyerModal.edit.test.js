import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import AddLawyerModal from '../src/components/AddLawyerModal.vue'
import axios from 'axios'

vi.mock('axios')
vi.mock('../src/utils/toast', () => ({ showToast: vi.fn() }))

const editLawyer = { id: 5, name: 'Ana López', email: 'ana@test.com', phone: '555-1234', province: 'Habana', municipality: 'Plaza', specialization: 'Civil' }

describe('AddLawyerModal — edit mode', () => {
  beforeEach(() => vi.clearAllMocks())

  test('shows "Editar abogado" title', () => {
    render(AddLawyerModal, { props: { token: 't', editLawyer } })
    expect(screen.getByText('Editar abogado')).toBeInTheDocument()
  })

  test('pre-fills form fields with editLawyer data', () => {
    render(AddLawyerModal, { props: { token: 't', editLawyer } })
    expect(screen.getByDisplayValue('Ana López')).toBeInTheDocument()
    expect(screen.getByDisplayValue('ana@test.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Habana')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Civil')).toBeInTheDocument()
  })

  test('shows "Guardar cambios" submit button', () => {
    render(AddLawyerModal, { props: { token: 't', editLawyer } })
    expect(screen.getByText('Guardar cambios')).toBeInTheDocument()
  })

  test('hides the "Una vez creado…" hint', () => {
    render(AddLawyerModal, { props: { token: 't', editLawyer } })
    expect(screen.queryByText(/Una vez creado/)).not.toBeInTheDocument()
  })

  test('calls PUT /lawyers/:id on submit and emits updated', async () => {
    axios.put.mockResolvedValue({ data: { ...editLawyer, name: 'Ana Modificada' } })
    const { emitted } = render(AddLawyerModal, { props: { token: 't', editLawyer } })
    await fireEvent.click(screen.getByText('Guardar cambios'))
    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/lawyers/5'),
      expect.any(Object),
      expect.any(Object)
    ))
    await waitFor(() => expect(emitted().updated).toBeTruthy())
    expect(axios.post).not.toHaveBeenCalled()
  })
})

describe('AddLawyerModal — create mode (regression)', () => {
  beforeEach(() => vi.clearAllMocks())

  test('shows "Adicionar abogado" title without editLawyer prop', () => {
    render(AddLawyerModal, { props: { token: 't' } })
    expect(screen.getByText('Adicionar abogado')).toBeInTheDocument()
    expect(screen.getByText('Crear abogado')).toBeInTheDocument()
  })

  test('shows the "Una vez creado…" hint', () => {
    render(AddLawyerModal, { props: { token: 't' } })
    expect(screen.getByText(/Una vez creado/)).toBeInTheDocument()
  })

  test('calls POST /lawyers on submit and emits added', async () => {
    axios.post.mockResolvedValue({ data: { id: 1, name: 'Nuevo Abogado' } })
    const { emitted } = render(AddLawyerModal, { props: { token: 't' } })
    await fireEvent.update(screen.getByPlaceholderText('Ej. Ana Pérez'), 'Nuevo Abogado')
    await fireEvent.click(screen.getByText('Crear abogado'))
    await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/lawyers'),
      expect.any(Object),
      expect.any(Object)
    ))
    await waitFor(() => expect(emitted().added).toBeTruthy())
    expect(axios.put).not.toHaveBeenCalled()
  })
})
