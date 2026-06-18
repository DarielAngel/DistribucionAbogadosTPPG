import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import AdminDashboard from '../src/components/AdminDashboard.vue'

describe('AdminDashboard refresh behavior', ()=>{
  test('on AddTaskModal added it calls lawyersList.fetch and monthSchedule.reload', async ()=>{
    const fetchMock = vi.fn()
    const reloadMock = vi.fn()

    const LawyersListStub = { template: `<div><button data-testid="select" @click="$emit('select',{ id:1, name:'L' })">select</button></div>`, methods: { fetch: fetchMock } }
    const MonthScheduleStub = { template: `<div></div>`, methods: { reload: reloadMock } }
    const AddTaskModalStub = { template: `<div><button data-testid="add" @click="$emit('added')">add</button></div>` }

    const { getByTestId } = render(AdminDashboard, { global: { stubs: { LawyersList: LawyersListStub, MonthSchedule: MonthScheduleStub, AddTaskModal: AddTaskModalStub } }, props: { token: 't', isAdmin: true, selectedLawyers: [] } })

    // select a lawyer to show the add task button
    const sel = await screen.findByTestId('select')
    await fireEvent.click(sel)

    const addBtn = await screen.findByText('+ Añadir tarea')
    await fireEvent.click(addBtn)

    const emitBtn = await screen.findByTestId('add')
    await fireEvent.click(emitBtn)

    await waitFor(()=> expect(fetchMock).toHaveBeenCalled())
    await waitFor(()=> expect(reloadMock).toHaveBeenCalled())
  })
})
