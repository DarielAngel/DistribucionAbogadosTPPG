import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import Login from '../src/components/Login.vue'
import axios from 'axios'

vi.mock('axios')

test('submits credentials and emits login', async () => {
  axios.post.mockResolvedValue({ data: { role: 'admin' } })
  const utils = render(Login)
  const { emitted } = utils
  const inputs = utils.container.querySelectorAll('input')
  await fireEvent.update(inputs[0], 'user@example.com')
  await fireEvent.update(inputs[1], 'secret')
  await fireEvent.click(screen.getByText('Log In'))
  await waitFor(() => expect(axios.post).toHaveBeenCalled())
  await waitFor(() => expect(emitted().login).toBeTruthy())
  expect(emitted().login[0][0]).toEqual({ role: 'admin' })
})
