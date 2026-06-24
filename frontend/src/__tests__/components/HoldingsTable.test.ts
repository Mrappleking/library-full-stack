import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HoldingsTable from '../../components/HoldingsTable.vue'

describe('HoldingsTable', () => {
  it('renders empty state when no items', () => {
    const wrapper = mount(HoldingsTable, { props: { items: [] } })
    expect(wrapper.text()).toContain('No Data')
  })

  it('renders item list', () => {
    const wrapper = mount(HoldingsTable, {
      props: {
        items: [{
          id: 1, barcode: 'LIB-001', callNumber: 'TP/1',
          location: 'Shelf A', status: 'available', requests: 0, price: 35.0
        }]
      }
    })
    expect(wrapper.text()).toContain('TP/1')
  })
})
