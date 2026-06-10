import { render, screen, waitFor } from '@testing-library/vue'
import LawyersList from '../src/components/LawyersList.vue'
import axios from 'axios'

vi.mock('axios')

test('fetches and displays lawyers list', async () => {
  axios.get.mockResolvedValue({ data: [{ id: 1, name: 'Juan Perez', province: 'P', municipality: 'M', specialization: 'Civil' }] })
  render(LawyersList, { props: { token: 'fake' } })
  await waitFor(() => expect(screen.getByText('Juan Perez')).toBeInTheDocument())
})
