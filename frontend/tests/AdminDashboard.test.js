import { render, screen, waitFor } from '@testing-library/vue'
import AdminDashboard from '../src/components/AdminDashboard.vue'
import axios from 'axios'

vi.mock('axios')

test('renders lawyers list and calendar entries in admin dashboard', async () => {
  // LawyersList will call /lawyers
  axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'María' }] })
  // CalendarView will call /schedules
  axios.get.mockResolvedValueOnce({ data: [{ id: 2, date: '2026-06-10', type: 'Audiencia', Lawyer: { name: 'María' } }] })

  render(AdminDashboard, { props: { token: 't' } })

  await waitFor(() => expect(screen.getByText('Gestión de abogados')).toBeInTheDocument())
  await waitFor(() => expect(screen.getByText('María')).toBeInTheDocument())
  await waitFor(() => expect(screen.getByText('María — Audiencia')).toBeInTheDocument())
})
