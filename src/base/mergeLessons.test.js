const test = require('node:test')
const assert = require('node:assert/strict')
const { mergeLessons, identityTokens, lessonListKey, dropLessons } = require('./mergeLessons')

test('mergeLessons joins elected id rows with timetable no rows', () => {
  const merged = mergeLessons([
    { id: '473020', no: 'E302138.03', name: 'Linux操作系统', teachers: '王浩云', kind: '必修', withdrawable: true },
    { id: '', no: 'E302138.03', name: 'Linux操作系统', teachers: '王浩云', kind: '必修', arrangeInfo: [{ weekDay: 1 }] },
    { id: '473020', no: 'E302138.03', name: 'Linux操作系统' },
  ])
  assert.equal(merged.length, 1)
  assert.equal(merged[0].id, '473020')
  assert.equal(merged[0].no, 'E302138.03')
  assert.equal(merged[0].withdrawable, true)
  assert.equal(merged[0].arrangeInfo.length, 1)
})

test('mergeLessons keeps five official courses unique across sources', () => {
  const elected = [
    { id: '473025', no: 'G302014.04', name: 'PBL项目实践5/5|企业实习（二选一）' },
    { id: '473020', no: 'E302138.03', name: 'Linux操作系统' },
    { id: '473007', no: 'F402101.04', name: '开源信息获取与应用' },
    { id: '472999', no: 'F302160.02', name: '人工智能基础与应用' },
    { id: '472990', no: 'F302159.01', name: 'Office高级应用' },
  ]
  const activities = elected.map(({ no, name }) => ({ id: '', no, name }))
  const merged = mergeLessons([...elected, ...activities, ...elected])
  assert.equal(merged.length, 5)
  assert.deepEqual(merged.map((item) => item.no).sort(), elected.map((item) => item.no).sort())
})

test('mergeLessons does not collapse different classes that only share a name', () => {
  const merged = mergeLessons([
    { id: '1', no: 'A.01', name: '同名课' },
    { id: '2', no: 'A.02', name: '同名课' },
  ])
  assert.equal(merged.length, 2)
})

test('identityTokens strips leading l and ignores empty name', () => {
  assert.deepEqual(identityTokens({ id: 'l473020', no: ' E302138.03 ', code: '' }), ['473020', 'E302138.03'])
})

test('lessonListKey stays unique when rows share a title', () => {
  const a = lessonListKey({ name: '同名课' }, 0)
  const b = lessonListKey({ name: '同名课' }, 1)
  assert.notEqual(a, b)
})

test('dropLessons removes the matched class and keeps the others', () => {
  const list = [
    { id: '473020', no: 'E302138.03', name: 'Linux操作系统' },
    { id: '472990', no: 'F302159.01', name: 'Office高级应用' },
  ]
  const next = dropLessons(list, { id: 'l472990' })
  assert.equal(next.length, 1)
  assert.equal(next[0].no, 'E302138.03')
})
