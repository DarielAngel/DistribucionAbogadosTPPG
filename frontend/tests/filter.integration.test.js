import { render, screen, fireEvent } from '@testing-library/vue'
import HeaderBar from '../src/components/HeaderBar.vue'

const LawyersListStub = {
  template: `<div><button data-testid="stub-select" @click="$emit('selection',[{id:42,name:'Test Lawyer'}])">select</button></div>`
}

test('HeaderBar emits filter when LawyersList emits selection (client)', async () => {
  const { emitted, getByText } = render(HeaderBar, {
    props: { token: 't', role: 'client', logoSrc: '/images/login/logo.jpg' },
    global: { stubs: { LawyersList: LawyersListStub } }
  })

  await fireEvent.click(getByText('Filtrar abogados'))
  const selectBtn = await screen.findByTestId('stub-select')
  await fireEvent.click(selectBtn)

  expect(emitted().filter).toBeTruthy()
  expect(emitted().filter[0][0]).toEqual([{ id:42, name:'Test Lawyer' }])
})

test('HeaderBar emits filter when LawyersList emits selection (admin)', async () => {
  const { emitted, getByText } = render(HeaderBar, {
    props: { token: 't', role: 'admin', logoSrc: '/images/login/logo.jpg' },
    global: { stubs: { LawyersList: LawyersListStub } }
  })

  await fireEvent.click(getByText('Filtrar abogados'))
  const selectBtn = await screen.findByTestId('stub-select')
  await fireEvent.click(selectBtn)

  expect(emitted().filter).toBeTruthy()
  expect(emitted().filter[0][0]).toEqual([{ id:42, name:'Test Lawyer' }])
})
