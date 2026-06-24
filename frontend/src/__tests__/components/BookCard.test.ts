import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BookCard from '../../components/BookCard.vue'

describe('BookCard', () => {
  it('renders title and author', () => {
    const wrapper = mount(BookCard, {
      props: {
        book: {
          id: 1, isbn: '978-test', title: 'Test Book', author: 'Test Author',
          total: 3, available: 2, status: 'available',
          category: { id: 1, name: 'Test' },
        }
      }
    })
    expect(wrapper.text()).toContain('Test Book')
    expect(wrapper.text()).toContain('Test Author')
  })

  it('shows book title in cover section', () => {
    const wrapper = mount(BookCard, {
      props: {
        book: {
          id: 2, isbn: 'isbn2', title: 'Another Book', author: 'Author',
          total: 1, available: 0, status: 'borrowed',
          category: { id: 1, name: 'Fiction' },
        }
      }
    })
    expect(wrapper.text()).toContain('Another Book')
  })
})
