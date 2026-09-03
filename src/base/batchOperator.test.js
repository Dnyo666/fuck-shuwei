const test = require('node:test')
const assert = require('node:assert/strict')
const {
  normalizeLessonId,
  normalizeProfileId,
  buildOperatorBody,
  classifyOperatorText,
} = require('./batchOperator')

test('buildOperatorBody elects with official form fields', () => {
  assert.equal(
    buildOperatorBody('473020', true),
    'optype=true&operator0=473020%3Atrue%3A0&lesson0=473020&schLessonGroup_473020=undefined',
  )
})

test('buildOperatorBody withdraws with optype false', () => {
  assert.equal(
    buildOperatorBody('l472990', false),
    'optype=false&operator0=472990%3Afalse%3A0&lesson0=472990&schLessonGroup_472990=undefined',
  )
})

test('normalize ids reject non-numeric values', () => {
  assert.throws(() => normalizeLessonId('F302159.01'), /课程 ID 无效/)
  assert.throws(() => normalizeLessonId(''), /课程 ID 无效/)
  assert.throws(() => normalizeProfileId('abc'), /轮次 ID 无效/)
  assert.equal(normalizeProfileId('1002'), '1002')
  assert.equal(normalizeLessonId('l473025'), '473025')
})

test('classifyOperatorText maps official response phrases', () => {
  assert.equal(classifyOperatorText('<body>退课成功</body>'), 'success')
  assert.equal(classifyOperatorText('选课不开放'), 'noopen')
  assert.equal(classifyOperatorText('时间冲突'), 'clash')
  assert.equal(classifyOperatorText('人数已满'), 'full')
  assert.equal(classifyOperatorText('你已经选过该课程'), 'selected')
  assert.equal(classifyOperatorText('403'), 'overtime')
})
