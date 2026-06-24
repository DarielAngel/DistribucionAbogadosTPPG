import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import LawyersList from '../src/components/LawyersList.vue'
import axios from 'axios'

vi.mock('axios')

const lawyers = [{ id: 1, name: 'Pedro Gómez', province: 'Habana', municipality: 'Plaza', specialization: 'Penal' }]

beforeEach(() => {
  vi.clearAllMocks()
  axios.get.mockResolvedValue({ data: { items: lawyers } })
})

test('shows Editar button for admin users', async () => {
  render(LawyersList, { props: { token: 't', isAdmin: true } })
  await waitFor(() => expect(screen.getByText('Editar')).toBeInTheDocument())
})

test('hides Editar button for non-admin users', async () => {
  render(LawyersList, { props: { token: 't', isAdmin: false } })
  await waitFor(() => expect(screen.getByText('Pedro Gómez')).toBeInTheDocument())
  expect(screen.queryByText('Editar')).not.toBeInTheDocument()
})

test('Editar button emits request-edit with the correct lawyer', async () => {
  const { emitted } = render(LawyersList, { props: { token: 't', isAdmin: true } })
  await waitFor(() => screen.getByText('Editar'))
  await fireEvent.click(screen.getByText('Editar'))
  expect(emitted()['request-edit']).toBeTruthy()
  expect(emitted()['request-edit'][0][0]).toMatchObject({ id: 1, name: 'Pedro Gómez' })
})
