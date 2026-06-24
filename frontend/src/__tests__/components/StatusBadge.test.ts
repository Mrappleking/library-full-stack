import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '../../components/StatusBadge.vue'

describe('StatusBadge', () => {
  it('renders available status text', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'available' } })
    expect(wrapper.text()).toContain('在架')
  })

  it('renders borrowed status text', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'borrowed' } })
    expect(wrapper.text()).toContain('借出')
  })

  it('renders on_hold status text', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'on_hold' } })
    expect(wrapper.text()).toContain('预约中')
  })

  it('renders raw status for unknown status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'unknown' as any } })
    expect(wrapper.text()).toContain('unknown')
  })
})
