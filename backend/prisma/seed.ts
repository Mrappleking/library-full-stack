import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('=== SDUST Library Seed (v0.5.0 — full demo data) ===\n')

  // ===== 1. 读者类型 =====
  const patronData = [
    { name: '本科生', maxBorrows: 5,  loanDays: 30, renewals: 1, renewalDays: 15, finePerDay: 0.10 },
    { name: '研究生', maxBorrows: 10, loanDays: 60, renewals: 2, renewalDays: 30, finePerDay: 0.20 },
    { name: '教师',   maxBorrows: 20, loanDays: 180,renewals: 3, renewalDays: 60, finePerDay: 0.50 },
  ]
  const patrons: any[] = []
  for (const p of patronData) {
    const r = await prisma.patronCategory.upsert({ where: { name: p.name }, update: {}, create: { name: p.name } })
    patrons.push(r)
  }
  console.log(`  读者类型: ${patrons.length}`)

  // ===== 2. 资料类型 =====
  const itemTypeData = [
    { name: '普通图书', loanDays: 30, fineRate: 0.10 },
    { name: '新书速递', loanDays: 7,  fineRate: 0.20 },
    { name: '工具书',   loanDays: 0,  fineRate: 0.00 },
  ]
  const itemTypes: any[] = []
  for (const it of itemTypeData) {
    const r = await prisma.itemType.upsert({ where: { name: it.name }, update: {}, create: it })
    itemTypes.push(r)
  }
  console.log(`  资料类型: ${itemTypes.length}`)

  // ===== 3. 规则矩阵 3×3 =====
  for (const p of patrons) {
    const pt = patronData.find(x => x.name === p.name)!
    for (const it of itemTypes) {
      const itd = itemTypeData.find(x => x.name === it.name)!
      const maxB = itd.loanDays === 0 ? 0 : pt.maxBorrows
      await prisma.circulationRule.upsert({
        where: { patronCategoryId_itemTypeId: { patronCategoryId: p.id, itemTypeId: it.id } },
        update: {},
        create: { patronCategoryId: p.id, itemTypeId: it.id, maxBorrows: maxB, loanDays: itd.loanDays, renewals: pt.renewals, renewalDays: pt.renewalDays, finePerDay: pt.finePerDay },
      })
    }
  }
  console.log(`  规则矩阵: ${patrons.length}×${itemTypes.length}=${patrons.length*itemTypes.length}`)

  // ===== 4. 读者 (8人) =====
  const readerData = [
    { username: '2023110101', pw: 'reader123', name: '张三',   patron: '本科生', phone: '13800000001', email: '2023110101@sdust.edu.cn' },
    { username: '2022110201', pw: 'reader123', name: '李四',   patron: '研究生', phone: '13800000002', email: '2022110201@sdust.edu.cn' },
    { username: 'T2023001',   pw: 'reader123', name: '王五',   patron: '教师',   phone: '13800000003', email: 'wangwu@sdust.edu.cn' },
    { username: '2024110301', pw: 'reader123', name: '赵六',   patron: '本科生', phone: '13800000004', email: '2024110301@sdust.edu.cn' },
    { username: '2023110202', pw: 'reader123', name: '孙七',   patron: '研究生', phone: '13800000005', email: '2023110202@sdust.edu.cn' },
    { username: 'T2024002',   pw: 'reader123', name: '周八',   patron: '教师',   phone: '13800000006', email: 'zhouba@sdust.edu.cn' },
    { username: '2024110401', pw: 'reader123', name: '吴九',   patron: '本科生', phone: '13800000007', email: '2024110401@sdust.edu.cn' },
    { username: '2022110302', pw: 'reader123', name: '郑十',   patron: '研究生', phone: '13800000008', email: '2022110302@sdust.edu.cn' },
  ]
  const readers: any[] = []
  for (const rd of readerData) {
    const pc = patrons.find((p: any) => p.name === rd.patron)
    const pw = await bcrypt.hash(rd.pw, 10)
    const u = await prisma.user.upsert({
      where: { username: rd.username },
      update: { patronCategoryId: pc.id },
      create: { username: rd.username, password: pw, name: rd.name, role: 'reader', phone: rd.phone, email: rd.email, patronCategoryId: pc.id },
    })
    readers.push(u)
  }
  // Admin
  const adminPw = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: adminPw, name: '系统管理员', role: 'admin' },
  })
  console.log(`  读者: ${readers.length} + 1 admin`)

  // ===== 5. 分类 (5个) =====
  const catData = [
    { name: '计算机科学', desc: '计算机编程、算法、人工智能等' },
    { name: '文学小说',   desc: '中外文学名著、小说、散文' },
    { name: '自然科学',   desc: '物理、数学、天文、生物' },
    { name: '历史哲学',   desc: '中外历史、哲学思想' },
    { name: '经济管理',   desc: '经济学、管理学、商业' },
  ]
  const cats: any[] = []
  for (const c of catData) {
    const r = await prisma.category.upsert({ where: { name: c.name }, update: {}, create: c })
    cats.push(r)
  }
  console.log(`  分类: ${cats.length}`)

  // ===== 6. 图书 + 复本 (20+ 书目) =====
  const bookData = [
    // 计算机科学 (catIdx=0)
    { isbn: '978-7-111-58444-5', title: '算法导论',           author: 'Thomas H. Cormen',  pub: '机械工业出版社',   year: 2013, catIdx: 0, clc: 'TP301.6',  desc: '780页', lang: 'chi', campus: '青岛' },
    { isbn: '978-7-111-52944-6', title: '深入理解计算机系统',   author: 'Randal E. Bryant',  pub: '机械工业出版社',   year: 2016, catIdx: 0, clc: 'TP303',    desc: '737页', lang: 'chi', campus: '青岛' },
    { isbn: '978-7-302-57486-0', title: '机器学习',             author: '周志华',             pub: '清华大学出版社',   year: 2016, catIdx: 0, clc: 'TP181',    desc: '425页', lang: 'chi', campus: '青岛' },
    { isbn: '978-7-121-41559-1', title: 'Python深度学习',       author: 'François Chollet',   pub: '电子工业出版社',   year: 2022, catIdx: 0, clc: 'TP311.56', desc: '481页', lang: 'chi', campus: '泰安' },
    { isbn: '978-7-115-60960-1', title: '计算机网络：自顶向下',  author: 'James Kurose',       pub: '人民邮电出版社',   year: 2022, catIdx: 0, clc: 'TP393',    desc: '684页', lang: 'chi', campus: '济南' },
    { isbn: '0-201-61586-X',     title: 'Computer Networks',    author: 'Andrew Tanenbaum',   pub: 'Prentice Hall',    year: 2017, catIdx: 0, clc: 'TP393',    desc: '960pp', lang: 'eng', campus: '青岛' },
    // 文学小说 (catIdx=1)
    { isbn: '978-7-02-000220-7', title: '红楼梦',               author: '曹雪芹',             pub: '人民文学出版社',   year: 1996, catIdx: 1, clc: 'I242.4',   desc: '1606页',lang: 'chi', campus: '青岛' },
    { isbn: '978-7-5447-4254-2', title: '百年孤独',             author: '加西亚·马尔克斯',     pub: '南海出版公司',     year: 2011, catIdx: 1, clc: 'I775.45',  desc: '360页', lang: 'chi', campus: '泰安' },
    { isbn: '978-7-5063-5020-8', title: '平凡的世界',           author: '路遥',               pub: '作家出版社',       year: 2012, catIdx: 1, clc: 'I247.5',   desc: '1296页',lang: 'chi', campus: '青岛' },
    { isbn: '978-7-5404-7062-5', title: '活着',                 author: '余华',               pub: '湖南文艺出版社',   year: 2017, catIdx: 1, clc: 'I247.57',  desc: '191页', lang: 'chi', campus: '泰安' },
    // 自然科学 (catIdx=2)
    { isbn: '978-7-301-27701-2', title: '时间简史',             author: '史蒂芬·霍金',        pub: '北京大学出版社',   year: 1998, catIdx: 2, clc: 'P159-49',  desc: '212页', lang: 'chi', campus: '青岛' },
    { isbn: '978-7-5536-4786-9', title: '上帝掷骰子吗',         author: '曹天元',             pub: '浙江教育出版社',   year: 2018, catIdx: 2, clc: 'O413-49',  desc: '420页', lang: 'chi', campus: '济南' },
    { isbn: '978-7-302-57834-0', title: '从一到无穷大',         author: '乔治·伽莫夫',        pub: '清华大学出版社',   year: 2020, catIdx: 2, clc: 'N49',       desc: '328页', lang: 'chi', campus: '青岛' },
    // 历史哲学 (catIdx=3)
    { isbn: '978-7-108-04436-5', title: '万历十五年',           author: '黄仁宇',             pub: '生活·读书·新知三联书店', year: 1997, catIdx: 3, clc: 'K248.307', desc: '386页', lang: 'chi', campus: '济南' },
    { isbn: '978-7-220-10795-7', title: '人类简史',             author: '尤瓦尔·赫拉利',      pub: '四川人民出版社',   year: 2021, catIdx: 3, clc: 'K02-49',   desc: '440页', lang: 'chi', campus: '青岛' },
    { isbn: '978-7-108-06904-7', title: '中国哲学简史',         author: '冯友兰',             pub: '生活·读书·新知三联书店', year: 2019, catIdx: 3, clc: 'B2',        desc: '416页', lang: 'chi', campus: '泰安' },
    // 经济管理 (catIdx=4)
    { isbn: '978-7-5086-5191-5', title: '从0到1',               author: '彼得·蒂尔',          pub: '中信出版社',       year: 2015, catIdx: 4, clc: 'F272',     desc: '260页', lang: 'chi', campus: '青岛' },
    { isbn: '978-7-5086-6081-8', title: '思考，快与慢',         author: '丹尼尔·卡尼曼',      pub: '中信出版社',       year: 2020, catIdx: 4, clc: 'F069.9',   desc: '484页', lang: 'chi', campus: '泰安' },
    { isbn: '978-7-5049-9117-9', title: '国富论',               author: '亚当·斯密',          pub: '中国人民大学出版社', year: 2021, catIdx: 4, clc: 'F091.33',  desc: '540页', lang: 'chi', campus: '济南' },
    { isbn: '978-4-00-331041-5', title: 'PHP是世界上最好的语言', author: '佚名',               pub: '技术出版社',       year: 2024, catIdx: 0, clc: 'TP312',    desc: '200页', lang: 'jpn', campus: '青岛' },
  ]

  const campusLocs: Record<string, string[]> = {
    '青岛': ['青岛馆A区3楼', '青岛馆B区2楼', '青岛8楼阅览区'],
    '泰安': ['泰安馆自科借阅区', '泰安馆社科借阅区'],
    '济南': ['济南馆自科借阅区', '济南馆社科借阅区'],
  }

  // Track total copies per book: [total, borrowed count, on_hold count]
  const bookStates: Record<number, { total: number; borrowed: number; onHold: number }> = {}

  const bookIds: number[] = []
  // Phase A: create books and items
  for (const bd of bookData) {
    const totalCopies = bd.isbn === '978-7-111-58444-5' ? 5  // 算法导论 — 5 copies
                     : bd.isbn === '978-7-02-000220-7' ? 4  // 红楼梦 — 4 copies
                     : 3
    const book = await prisma.book.upsert({
      where: { isbn: bd.isbn },
      update: {},
      create: {
        isbn: bd.isbn, title: bd.title, author: bd.author,
        publisher: bd.pub, year: bd.year,
        categoryId: cats[bd.catIdx].id,
        total: totalCopies, available: totalCopies, status: 'available',
        clcNumber: bd.clc, physicalDesc: bd.desc, language: bd.lang, country: bd.lang === 'eng' ? 'US' : bd.lang === 'jpn' ? 'JP' : 'CN',
        desc: `${bd.title} — ${bd.author} 著`,
      },
    })
    bookIds.push(book.id)

    const locs = campusLocs[bd.campus] || ['总馆']
    for (let copy = 1; copy <= totalCopies; copy++) {
      const barcode = `LIB-${String(book.id).padStart(6, '0')}-${copy}`
      await prisma.bookItem.upsert({
        where: { barcode },
        update: {},
        create: {
          barcode, callNumber: `${bd.clc}/${1000 + book.id + copy}`,
          location: locs[(copy - 1) % locs.length], campus: bd.campus,
          condition: 'normal', status: 'available',
          price: 49.00 + copy * 10, bookId: book.id,
          itemTypeId: itemTypes[0].id, acquiredAt: new Date('2025-01-01'),
        },
      })
    }
    bookStates[book.id] = { total: totalCopies, borrowed: 0, onHold: 0 }
  }
  console.log(`  图书: ${bookData.length} 种`)

  // ===== 7. 借阅记录 =====
  // Reset all items to available before creating demo borrows
  await prisma.bookItem.updateMany({ where: { status: { not: 'available' } }, data: { status: 'available' } })

  const now = new Date()
  const daysAgo = (n: number) => { const d = new Date(now); d.setDate(d.getDate() - n); return d }
  const r = (idx: number) => readers[idx].id

  // 张三·本科生 [0] — 2 active + 2 returned(overdue) + 1 history
  const u1a1 = createEntry(bookIds[0], r(0), daysAgo(20), daysAgo(-10), undefined, 'active', false)
  const u1a2 = createEntry(bookIds[2], r(0), daysAgo(15), daysAgo(-15), undefined, 'active', false)
  const u1h1 = createEntry(bookIds[8], r(0), daysAgo(60), daysAgo(30), daysAgo(30), 'returned', true)
  const u1h2 = createEntry(bookIds[9], r(0), daysAgo(50), daysAgo(20), daysAgo(15), 'overdue', false)
  const u1h3 = createEntry(bookIds[3], r(0), daysAgo(120), daysAgo(90), daysAgo(88), 'returned', false)

  // 李四·研究生 [1] — 3 active + 1 overdue
  const u2a1 = createEntry(bookIds[4], r(1), daysAgo(10), daysAgo(-50), undefined, 'active', false)
  const u2a2 = createEntry(bookIds[14], r(1), daysAgo(5), daysAgo(-55), undefined, 'active', true)
  const u2a3 = createEntry(bookIds[6], r(1), daysAgo(30), daysAgo(-30), undefined, 'active', false)
  const u2ov = createEntry(bookIds[5], r(1), daysAgo(90), daysAgo(30), undefined, 'active', false)

  // 王五·教师 [2]
  const u3a1 = createEntry(bookIds[18], r(2), daysAgo(7), daysAgo(-173), undefined, 'active', false)
  const u3h1 = createEntry(bookIds[12], r(2), daysAgo(200), daysAgo(140), daysAgo(138), 'returned', true)
  const u3h2 = createEntry(bookIds[11], r(2), daysAgo(150), daysAgo(90), daysAgo(88), 'returned', true)

  // 赵六·本科生 [3]
  const u4a1 = createEntry(bookIds[10], r(3), daysAgo(25), daysAgo(-5), undefined, 'active', false)
  const u4h1 = createEntry(bookIds[13], r(3), daysAgo(45), daysAgo(15), daysAgo(13), 'returned', false)

  // 孙七·研究生 [4] — extra history for stats spread across months
  const u5h1 = createEntry(bookIds[0], r(4), daysAgo(300), daysAgo(270), daysAgo(268), 'returned', false)
  const u5h2 = createEntry(bookIds[1], r(4), daysAgo(250), daysAgo(220), daysAgo(218), 'returned', false)
  const u5h3 = createEntry(bookIds[2], r(4), daysAgo(180), daysAgo(150), daysAgo(148), 'returned', false)
  const u5h4 = createEntry(bookIds[18], r(4), daysAgo(90), daysAgo(60), daysAgo(58), 'returned', false)

  // 周八·教师 [5]
  const u6a1 = createEntry(bookIds[17], r(5), daysAgo(3), daysAgo(-177), undefined, 'active', false)

  // 吴九·本科生 [6]
  const u7h1 = createEntry(bookIds[6], r(6), daysAgo(130), daysAgo(100), daysAgo(98), 'returned', true)
  const u7h2 = createEntry(bookIds[7], r(6), daysAgo(80), daysAgo(50), daysAgo(48), 'returned', false)

  // 郑十·研究生 [7]
  const u8h1 = createEntry(bookIds[0], r(7), daysAgo(200), daysAgo(140), daysAgo(138), 'returned', true)
  const u8h2 = createEntry(bookIds[4], r(7), daysAgo(70), daysAgo(10), undefined, 'active', true)

  const allBorrows = [
    u1a1, u1a2, u1h1, u1h2, u1h3,
    u2a1, u2a2, u2a3, u2ov,
    u3a1, u3h1, u3h2,
    u4a1, u4h1,
    u5h1, u5h2, u5h3, u5h4,
    u6a1,
    u7h1, u7h2,
    u8h1, u8h2,
  ]

  // Create borrows and track book/item state manually
  const borrowRecordIds: number[] = []

  for (const b of allBorrows) {
    // Find an available item for this book
    const item = await prisma.bookItem.findFirst({
      where: { bookId: b.bookId, status: 'available' },
      orderBy: { id: 'asc' },
    })
    if (!item) {
      console.log(`  SKIP borrow: no available copy for book ${b.bookId}`)
      continue
    }

    // Mark item as borrowed
    await prisma.bookItem.update({
      where: { id: item.id },
      data: { status: 'borrowed' },
    })
    bookStates[b.bookId].borrowed++

    // Create borrow record
    const rec = await prisma.borrowRecord.create({
      data: {
        userId: b.userId, bookId: b.bookId, bookItemId: item.id,
        borrowDate: b.borrowDate, dueDate: b.dueDate,
        returnDate: b.returnDate || null, status: b.status,
        renewed: b.renewed,
      },
    })
    borrowRecordIds.push(rec.id)

    // If returned, release the item back
    if (b.returnDate) {
      await prisma.bookItem.update({
        where: { id: item.id },
        data: { status: 'available' },
      })
      bookStates[b.bookId].borrowed--
    } else if (b.status === 'active' && b.dueDate < now) {
      // Track overdue active borrows for fine calculation reference
      // (fines are applied manually in the fine section below)
    }
  }
  console.log(`  借阅记录: ${borrowRecordIds.length} 条`)

  // ===== 8. Update Book.available count =====
  for (const [bookId, state] of Object.entries(bookStates)) {
    const id = parseInt(bookId)
    const avail = state.total - state.borrowed - state.onHold
    await prisma.book.update({
      where: { id },
      data: { available: Math.max(0, avail) },
    })
  }

  // ===== 9. 罚款 =====
  // borrowRecordIds order: [张三*5][李四*4][王五*3][赵六*2][孙七*4][周八][吴九*2][郑十*2]
  // [0]=u1a1 [1]=u1a2 [2]=u1h1 [3]=u1h2(逾期已还) [4]=u1h3
  // [5]=u2a1 [6]=u2a2 [7]=u2a3 [8]=u2ov(active overdue)
  const fineRecords = [
    { borrowRecordId: borrowRecordIds[3], userId: r(0), amount: 5.00,  type: 'overdue' as const, paid: true,  paidAt: daysAgo(15) },   // 张三·逾期还书罚5元
    { borrowRecordId: borrowRecordIds[8], userId: r(1), amount: 60.00, type: 'overdue' as const, paid: false, paidAt: null },            // 李四·逾期未还有人管
  ]
  let fineCount = 0
  for (const f of fineRecords) {
    try {
      await prisma.fine.create({ data: f })
      fineCount++
    } catch { /* already exists */ }
  }
  console.log(`  罚款: ${fineCount} 条`)

  // ===== 10. Update User.totalFines =====
  // Lì sì has 60 unpaid fine
  await prisma.user.update({
    where: { id: r(1) },
    data: { totalFines: 60.00 },
  })

  // ===== 11. 预约 =====
  // 算法导论: 5 copies, 3 active borrowed (张三×1, 李四×(no), 郑十×1) → actually:
  // u1a1 = 算法导论(张三·active), u5h1 = 算法导论(孙七·returned), u8h1 = 算法导论(郑十·returned)
  // So 1 borrowed out of 5, 4 available. Need to force 0 to demonstrate holds.
  const holdBook = bookIds[0]
  await prisma.book.update({ where: { id: holdBook }, data: { available: 0 } })

  const pendingHolds = [
    { userId: r(3), bookId: holdBook }, // 赵六 预约
    { userId: r(4), bookId: holdBook }, // 孙七 也预约
  ]
  for (const h of pendingHolds) {
    await prisma.hold.create({ data: { userId: h.userId, bookId: h.bookId, status: 'pending' } })
  }

  // One "ready" hold: 机器学习 → 张三可取
  const readyBook = bookIds[2]
  const readyItem = await prisma.bookItem.findFirst({ where: { bookId: readyBook, status: 'available' } })
  if (readyItem) {
    await prisma.book.update({ where: { id: readyBook }, data: { available: { decrement: 1 } } })
    await prisma.bookItem.update({ where: { id: readyItem.id }, data: { status: 'on_hold' } })
    await prisma.hold.create({
      data: { userId: r(0), bookId: readyBook, bookItemId: readyItem.id, status: 'ready', expiryDate: new Date(Date.now() + 3 * 86400000) },
    })
  }
  console.log(`  预约: ${pendingHolds.length + 1} 条 (2 pending + 1 ready)`)
  console.log('\n=== Seed complete ===')
}

function createEntry(
  bookId: number, userId: number,
  borrowDate: Date, dueDate: Date, returnDate: Date | undefined,
  status: string, renewed: boolean,
) {
  return { userId, bookId, borrowDate, dueDate, returnDate, status, renewed }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
