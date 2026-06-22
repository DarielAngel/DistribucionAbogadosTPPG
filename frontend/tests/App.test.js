import { render, screen, waitFor } from '@testing-library/vue'
import App from '../src/App.vue'
import axios from 'axios'

vi.mock('axios')

test('renders header and login form when not authenticated', async () => {
  // Simulate no active session — /auth/me rejects → sessionReady=true → Login shown
  axios.get.mockRejectedValue(new Error('unauthenticated'))
  render(App)
  expect(screen.getByText('Provincia Abogados')).toBeInTheDocument()
  await waitFor(() => expect(screen.getByText('Login ID')).toBeInTheDocument())
  expect(screen.getByText('Password')).toBeInTheDocument()
})
