import { render, screen, waitFor } from '@testing-library/vue'
import CalendarView from '../src/components/CalendarView.vue'
import axios from 'axios'

vi.mock('axios')

test('displays schedules for selected date', async () => {
  const items = [{ id: 1, date: '2026-06-10', type: 'Consulta', Lawyer: { name: 'Ana' }, startTime: '10:00', description: 'Consulta inicial' }]
  axios.get.mockResolvedValueOnce({ data: items })
  render(CalendarView, { props: { token: 't' } })
  await waitFor(() => expect(screen.getByText('Ana — Consulta')).toBeInTheDocument())
  expect(screen.getByText(/10:00/)).toBeInTheDocument()
})
