import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// JsBarcode can't render to SVG in jsdom — mock it
vi.mock('jsbarcode', () => ({
  default: vi.fn((el: HTMLElement, _barcode: string, _opts: Record<string, unknown>) => {
    el.innerHTML = '<svg></svg>'
  }),
}))

import JsBarcode from 'jsbarcode'
import BarcodeLabel from '../../components/BarcodeLabel.vue'

describe('BarcodeLabel', () => {
  it('renders barcode container and calls JsBarcode', () => {
    const wrapper = mount(BarcodeLabel, { props: { barcode: '978-test-isbn' } })
    expect(wrapper.find('div').exists()).toBe(true)
    expect(JsBarcode).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      '978-test-isbn',
      expect.objectContaining({ format: 'CODE128' })
    )
  })

  it('passes custom size props to JsBarcode', () => {
    mount(BarcodeLabel, {
      props: { barcode: 'TEST', width: 3, height: 60, fontSize: 12, displayValue: false }
    })
    expect(JsBarcode).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      'TEST',
      expect.objectContaining({ width: 3, height: 60, fontSize: 12, displayValue: false })
    )
  })
})
