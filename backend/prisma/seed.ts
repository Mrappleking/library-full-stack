import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('=== SDUST Library Seed (v0.4.0) ===\n')

  // ═══════ 读者类型 (3种 — 山科大真实规则) ═══════
  const patronTypes = [
    { name: '本科生', maxBorrows: 5, loanDays: 30, renewals: 1, renewalDays: 15, finePerDay: 0.10 },
    { name: '研究生', maxBorrows: 10, loanDays: 60, renewals: 2, renewalDays: 30, finePerDay: 0.20 },
    { name: '教师', maxBorrows: 20, loanDays: 180, renewals: 3, renewalDays: 60, finePerDay: 0.50 },
  ]
  const patronRecords: any[] = []
  for (const p of patronTypes) {
    const r = await prisma.patronCategory.upsert({
      where: { name: p.name }, update: {}, create: { name: p.name }
    })
    patronRecords.push(r)
    console.log(`  Patron: ${r.name} (${p.maxBorrows}册×${p.loanDays}d)`)
  }

  // ═══════ 资料类型 (3种) ═══════
  const itemTypes = [
    { name: '普通图书', loanDays: 30, fineRate: 0.10 },
    { name: '新书速递', loanDays: 7, fineRate: 0.20 },
    { name: '工具书', loanDays: 0, fineRate: 0.00 },  // 不外借
  ]
  const itemRecords: any[] = []
  for (const it of itemTypes) {
    const r = await prisma.itemType.upsert({
      where: { name: it.name }, update: {}, create: it
    })
    itemRecords.push(r)
    console.log(`  ItemType: ${r.name} (${r.loanDays}d, ¥${r.fineRate}/d)`)
  }

  // ═══════ 规则矩阵 (3×3=9) ═══════
  console.log('\n[Circulation Rules — 3×3 matrix]')
  for (const p of patronRecords) {
    const pt = patronTypes.find(x => x.name === p.name)!
    for (const it of itemRecords) {
      const itd = itemTypes.find(x => x.name === it.name)!
      const maxB = itd.loanDays === 0 ? 0 : pt.maxBorrows  // 工具书不外借
      await prisma.circulationRule.upsert({
        where: { patronCategoryId_itemTypeId: { patronCategoryId: p.id, itemTypeId: it.id } },
        update: {},
        create: {
          patronCategoryId: p.id, itemTypeId: it.id,
          maxBorrows: maxB, loanDays: itd.loanDays,
          renewals: pt.renewals, renewalDays: pt.renewalDays,
          finePerDay: pt.finePerDay
        }
      })
      console.log(`  ${p.name} × ${it.name} → ${maxB}册/${itd.loanDays}d/¥${pt.finePerDay}`)
    }
  }

  // ═══════ 读者 (学号格式) ═══════
  console.log('\n[Readers]')
  const readers = [
    { username: '2023110101', password: 'reader123', name: '张三', patron: '本科生', phone: '13800000001', email: '2023110101@sdust.edu.cn' },
    { username: '2022110201', password: 'reader123', name: '李四', patron: '研究生', phone: '13800000002', email: '2022110201@sdust.edu.cn' },
    { username: 'T2023001', password: 'reader123', name: '王五', patron: '教师', phone: '13800000003', email: 'wangwu@sdust.edu.cn' },
  ]
  for (const rd of readers) {
    const pc = patronRecords.find((p: any) => p.name === rd.patron)
    const pw = await bcrypt.hash(rd.password, 10)
    const u = await prisma.user.upsert({
      where: { username: rd.username },
      update: { patronCategoryId: pc.id },
      create: { username: rd.username, password: pw, name: rd.name, role: 'reader', phone: rd.phone, email: rd.email, patronCategoryId: pc.id }
    })
    console.log(`  ${u.username} (${rd.patron}) — pw: ${rd.password}`)
  }

  // Admin
  const adminPw = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: adminPw, name: '系统管理员', role: 'admin' }
  })
  console.log(`  ${admin.username} (admin) — pw: admin123`)

  // ═══════ 分类 ═══════
  console.log('\n[Categories]')
  const catNames = ['计算机科学', '文学小说', '自然科学', '历史哲学', '经济管理']
  const catRecords: any[] = []
  for (const name of catNames) {
    const c = await prisma.category.upsert({
      where: { name }, update: {}, create: { name, desc: `${name}类图书` }
    })
    catRecords.push(c)
  }
  console.log(`  ${catRecords.length} categories`)

  // ═══════ 图书 (含新字段 + SDUST校区) ═══════
  console.log('\n[Books + BookItems]')
  const bookData = [
    { isbn: '978-7-111-58444-5', title: '算法导论', author: 'Thomas H. Cormen', publisher: '机械工业出版社', year: 2013, catIdx: 0, clcNumber: 'TP301.6', physicalDesc: '780页', lang: 'chi', country: 'CN', campus: '青岛' },
    { isbn: '978-7-111-52944-6', title: '深入理解计算机系统', author: 'Randal E. Bryant', publisher: '机械工业出版社', year: 2016, catIdx: 0, clcNumber: 'TP303', physicalDesc: '737页', lang: 'chi', country: 'CN', campus: '青岛' },
    { isbn: '978-7-02-000220-7', title: '红楼梦', author: '曹雪芹', publisher: '人民文学出版社', year: 1996, catIdx: 1, clcNumber: 'I242.4', physicalDesc: '1606页', lang: 'chi', country: 'CN', campus: '青岛' },
    { isbn: '978-7-5447-4254-2', title: '百年孤独', author: '加西亚·马尔克斯', publisher: '南海出版公司', year: 2011, catIdx: 1, clcNumber: 'I775.45', physicalDesc: '360页', lang: 'chi', country: 'CO', campus: '泰安' },
    { isbn: '978-7-301-27701-2', title: '时间简史', author: '史蒂芬·霍金', publisher: '北京大学出版社', year: 2016, catIdx: 2, clcNumber: 'P159-49', physicalDesc: '212页', lang: 'chi', country: 'CN', campus: '青岛' },
    { isbn: '978-7-108-04436-5', title: '万历十五年', author: '黄仁宇', publisher: '生活·读书·新知三联书店', year: 2014, catIdx: 3, clcNumber: 'K248.307', physicalDesc: '386页', lang: 'chi', country: 'CN', campus: '济南' },
    { isbn: '978-7-5086-5191-5', title: '从0到1', author: '彼得·蒂尔', publisher: '中信出版社', year: 2015, catIdx: 4, clcNumber: 'F272', physicalDesc: '260页', lang: 'chi', country: 'CN', campus: '青岛' },
  ]

  const locationMap: Record<string, string[]> = {
    '青岛': ['青岛馆A区3楼', '青岛馆B区2楼', '青岛8楼阅览区'],
    '泰安': ['泰安馆自科借阅区', '泰安馆社科借阅区'],
    '济南': ['济南馆自科借阅区', '济南馆社科借阅区'],
  }

  let bookCount = 0, itemCount = 0
  for (const b of bookData) {
    const book = await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: { clcNumber: b.clcNumber, physicalDesc: b.physicalDesc, language: b.lang, country: b.country },
      create: {
        isbn: b.isbn, title: b.title, author: b.author, publisher: b.publisher, year: b.year,
        categoryId: catRecords[b.catIdx].id,
        total: 3, available: 3, status: 'available',
        clcNumber: b.clcNumber, physicalDesc: b.physicalDesc,
        language: b.lang, country: b.country,
        desc: `${b.title} — ${b.author} 著`
      }
    })
    bookCount++

    const locs = locationMap[b.campus] || ['总馆']
    for (let copy = 1; copy <= 3; copy++) {
      const barcode = `LIB-${String(book.id).padStart(6, '0')}-${copy}`
      await prisma.bookItem.upsert({
        where: { barcode },
        update: { campus: b.campus },
        create: {
          barcode,
          callNumber: `${b.clcNumber}/${1000 + book.id}`,
          location: locs[(copy - 1) % locs.length],
          campus: b.campus,
          condition: 'normal', status: 'available',
          price: 59.00, bookId: book.id,
          itemTypeId: itemRecords[0].id,  // 普通图书
          acquiredAt: new Date('2025-01-01')
        }
      })
      itemCount++
    }
  }
  console.log(`  ${bookCount} books, ${itemCount} items (3 per book)`)
  console.log(`  Campuses: ${[...new Set(bookData.map(b => b.campus))].join(', ')}`)
  console.log('\n=== Seed complete ===')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
