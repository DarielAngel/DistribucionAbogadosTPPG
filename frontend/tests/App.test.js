import { render, screen } from '@testing-library/vue'
import App from '../src/App.vue'

test('renders header and login form when not authenticated', async () => {
  render(App)
  expect(screen.getByText('Provincia Abogados')).toBeInTheDocument()
  // Login component labels (labels are not programmatically associated with inputs)
  expect(screen.getByText('Email')).toBeInTheDocument()
  expect(screen.getByText('Password')).toBeInTheDocument()
})
