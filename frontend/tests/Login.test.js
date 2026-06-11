import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import Login from '../src/components/Login.vue'
import axios from 'axios'

vi.mock('axios')

test('submits credentials and emits login', async () => {
  const fakeToken = 'header.' + Buffer.from(JSON.stringify({ role: 'admin' })).toString('base64') + '.sig'
  axios.post.mockResolvedValue({ data: { token: fakeToken } })
  const utils = render(Login)
  const { emitted } = utils
  const inputs = utils.container.querySelectorAll('input')
  const emailInput = inputs[0]
  const passwordInput = inputs[1]
  await fireEvent.update(emailInput, 'user@example.com')
  await fireEvent.update(passwordInput, 'secret')
  await fireEvent.click(screen.getByText('Log In'))
  // Wait for axios mock to resolve and for component to emit login
  await waitFor(() => expect(axios.post).toHaveBeenCalled())
  await waitFor(() => expect(emitted().login).toBeTruthy())
  expect(emitted().login[0][0]).toEqual({ token: fakeToken, role: 'admin' })
})
