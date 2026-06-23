import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  // Patron Categories
  const patronCat = await prisma.patronCategory.upsert({
    where: { name: '普通读者' },
    update: {},
    create: { name: '普通读者' }
  })
  console.log(`PatronCategory: ${patronCat.name}`)

  // Item Types
  const itemType = await prisma.itemType.upsert({
    where: { name: '普通图书' },
    update: {},
    create: { name: '普通图书', loanDays: 30, fineRate: 0.10 }
  })
  console.log(`ItemType: ${itemType.name} (${itemType.loanDays}d, ¥${itemType.fineRate}/day)`)

  // Circulation Rule
  const rule = await prisma.circulationRule.upsert({
    where: { patronCategoryId_itemTypeId: { patronCategoryId: patronCat.id, itemTypeId: itemType.id } },
    update: {},
    create: {
      patronCategoryId: patronCat.id,
      itemTypeId: itemType.id,
      maxBorrows: 5,
      loanDays: 30,
      renewals: 1,
      renewalDays: 15,
      finePerDay: 0.10
    }
  })
  console.log(`CirculationRule: ${rule.maxBorrows} books × ${rule.loanDays}d`)

  // Admin
  const adminPw = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { patronCategoryId: patronCat.id },
    create: {
      username: 'admin',
      password: adminPw,
      name: '系统管理员',
      role: 'admin',
      patronCategoryId: patronCat.id
    }
  })
  console.log(`Admin: ${admin.username} (admin123)`)

  // Reader
  const readerPw = await bcrypt.hash('reader123', 10)
  const reader = await prisma.user.upsert({
    where: { username: 'reader' },
    update: { patronCategoryId: patronCat.id },
    create: {
      username: 'reader',
      password: readerPw,
      name: '张三',
      role: 'reader',
      patronCategoryId: patronCat.id,
      phone: '13800138000',
      email: 'zhangsan@example.com'
    }
  })
  console.log(`Reader: ${reader.username} (reader123)`)

  // Categories
  const catNames = ['计算机科学', '文学小说', '自然科学', '历史哲学', '经济管理']
  const categoryRecords: any[] = []
  for (const name of catNames) {
    const c = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, desc: `${name}类图书` }
    })
    categoryRecords.push(c)
  }
  console.log(`Categories: ${categoryRecords.length}`)

  // Books + BookItems
  const books = [
    { isbn: '978-7-111-58444-5', title: '算法导论', author: 'Thomas H. Cormen', publisher: '机械工业出版社', year: 2013, catIdx: 0 },
    { isbn: '978-7-111-52944-6', title: '深入理解计算机系统', author: 'Randal E. Bryant', publisher: '机械工业出版社', year: 2016, catIdx: 0 },
    { isbn: '978-7-02-000220-7', title: '红楼梦', author: '曹雪芹', publisher: '人民文学出版社', year: 1996, catIdx: 1 },
    { isbn: '978-7-5447-4254-2', title: '百年孤独', author: '加西亚·马尔克斯', publisher: '南海出版公司', year: 2011, catIdx: 1 },
    { isbn: '978-7-301-27701-2', title: '时间简史', author: '史蒂芬·霍金', publisher: '北京大学出版社', year: 2016, catIdx: 2 },
    { isbn: '978-7-108-04436-5', title: '万历十五年', author: '黄仁宇', publisher: '生活·读书·新知三联书店', year: 2014, catIdx: 3 },
    { isbn: '978-7-5086-5191-5', title: '从0到1', author: '彼得·蒂尔', publisher: '中信出版社', year: 2015, catIdx: 4 },
  ]

  let bookCount = 0
  let itemCount = 0
  for (const b of books) {
    const book = await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: {
        isbn: b.isbn, title: b.title, author: b.author,
        publisher: b.publisher, year: b.year,
        categoryId: categoryRecords[b.catIdx].id,
        total: 3, available: 3, status: 'available',
        desc: `${b.title} — ${b.author} 著`
      }
    })
    bookCount++

    // Create 3 BookItems for each book
    for (let copy = 1; copy <= 3; copy++) {
      const barcode = `LIB-${String(book.id).padStart(6, '0')}-${copy}`
      await prisma.bookItem.upsert({
        where: { barcode },
        update: {},
        create: {
          barcode,
          callNumber: b.catIdx === 0 ? `TP312/${1000 + book.id}` : null,
          location: '总馆A区3楼',
          condition: 'normal',
          status: 'available',
          price: 59.00,
          bookId: book.id,
          itemTypeId: itemType.id,
          acquiredAt: new Date('2025-01-01')
        }
      })
      itemCount++
    }
  }
  console.log(`Books: ${bookCount}, BookItems: ${itemCount}`)
  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
