const test = require('node:test')
const assert = require('node:assert/strict')
const {
  isExactToken,
  isOnlineLesson,
  isOfflineLesson,
  findExactLesson,
  findLessonsByCode,
  findKeywordLessons,
  expandLessonQueries,
} = require('./matchLessons')

const list = [
  { id: '11', no: 'H401011.01', code: 'H401011', name: '摄影基础', teachClassName: '线下1班', teachers: '甲' },
  { id: '12', no: 'H401011.02', code: 'H401011', name: '摄影基础', teachClassName: '线上2班', teachers: '乙' },
  { id: '13', no: 'H401012.01', code: 'H401012', name: '油画鉴赏', teachClassName: '面授', teachers: '丙' },
  { id: '14', no: 'H401013.01', code: 'H401013', name: '摄影创作', teachClassName: '网络授课', teachers: '丁', remark: '线上' },
]

const official = [
  {
    id: '1',
    no: 'AM00005.05',
    code: 'AM00005',
    name: '音乐鉴赏',
    teachClassName: '美育（线下）什邡校区',
    teachers: '姜泽瑶',
    campusName: '什邡校区',
    scheduled: true,
    arrangeInfo: [{ weekStateDigest: '3-12周', rooms: '二教104A' }],
  },
  {
    id: '2',
    no: 'AM00005.08',
    code: 'AM00005',
    name: '音乐鉴赏',
    teachClassName: '美育（线上）',
    teachers: '网络教师2',
    campusName: '',
    scheduled: false,
    arrangeInfo: [{ weekStateDigest: '尚未排课', rooms: '' }],
  },
  {
    id: '3',
    no: 'AG40011.01',
    code: 'AG40011',
    name: '基础韩语',
    teachClassName: '公共任选 (什邡校区线下)',
    teachers: '徐小凤',
    campusName: '什邡校区',
    sc: 0,
    limitCount: 80,
  },
  {
    id: '4',
    no: 'AG40011.02',
    code: 'AG40011',
    name: '基础韩语',
    teachClassName: '公共任选 (线上)',
    teachers: '网络教学1',
    campusName: '',
    scheduled: false,
    sc: 200,
    limitCount: 200,
  },
  {
    id: '5',
    no: 'AM00099.01',
    code: 'AM00099',
    name: '计算机网络',
    teachClassName: '美育（线下）成都校区',
    teachers: '张三',
    campusName: '成都校区',
    scheduled: true,
    arrangeInfo: [{ weekStateDigest: '3-12周', rooms: '东教A401' }],
  },
]

test('isExactToken recognizes official task numbers and course codes', () => {
  assert.equal(isExactToken('12'), true)
  assert.equal(isExactToken('H401011'), true)
  assert.equal(isExactToken('H401011.02'), true)
  assert.equal(isExactToken('AM00005.05'), true)
  assert.equal(isExactToken('AG40011'), true)
  assert.equal(isExactToken('摄影'), false)
  assert.equal(isExactToken('摄影 线上'), false)
})

test('findExactLesson matches no, id and code', () => {
  assert.equal(findExactLesson(list, 'H401011.02').id, '12')
  assert.equal(findExactLesson(list, '13').id, '13')
  assert.equal(findExactLesson(official, 'AM00005.05').id, '1')
})

test('official teachClassName distinguishes online and offline', () => {
  assert.equal(isOfflineLesson(official[0]), true)
  assert.equal(isOnlineLesson(official[1]), true)
  assert.equal(isOfflineLesson(official[2]), true)
  assert.equal(isOnlineLesson(official[3]), true)
  assert.equal(isOfflineLesson(official[4]), true)
  assert.equal(isOnlineLesson(official[4]), false)
})

test('keyword AND matches campus and mode, ranking online first', () => {
  const music = findKeywordLessons(official, '音乐鉴赏')
  assert.deepEqual(music.map((item) => item.id), ['2', '1'])
  assert.deepEqual(findKeywordLessons(official, '音乐鉴赏 线上').map((item) => item.id), ['2'])
  assert.deepEqual(findKeywordLessons(official, '音乐鉴赏 线下').map((item) => item.id), ['1'])
  assert.deepEqual(findKeywordLessons(official, '韩语 什邡').map((item) => item.id), ['3'])
})

test('course code expands all classes with online and seats ranked', () => {
  assert.deepEqual(findLessonsByCode(official, 'AM00005').map((item) => item.id), ['2', '1'])
  assert.deepEqual(findLessonsByCode(official, 'AG40011').map((item) => item.id), ['4', '3'])
})

test('expandLessonQueries keeps row order and dedups by id', () => {
  const { rows, logs } = expandLessonQueries(list, [
    { value: '摄影' },
    { value: 'H401011.01' },
    { value: '油画' },
  ])
  assert.deepEqual(rows.map((item) => item.id), ['12', '14', '11', '13'])
  assert.equal(rows.every((item) => item.状态 === 'notselected'), true)
  assert.equal(logs.some((line) => line.includes('摄影 → 3 个教学班')), true)
})

test('expandLessonQueries expands official course codes and keywords', () => {
  const { rows } = expandLessonQueries(official, ['音乐鉴赏', 'AG40011.01'])
  assert.deepEqual(rows.map((item) => item.id), ['2', '1', '3'])
})

test('expandLessonQueries records missing keywords', () => {
  const { rows } = expandLessonQueries(list, ['舞蹈'])
  assert.equal(rows.length, 1)
  assert.equal(rows[0].状态, 'notfound')
  assert.equal(rows[0].名称, '舞蹈')
})
