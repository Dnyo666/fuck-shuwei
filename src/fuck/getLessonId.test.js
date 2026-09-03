const test = require('node:test')
const assert = require('node:assert/strict')
const getLessonId = require('./getLessonId')

function mockLogger() {
  const events = []
  return {
    events,
    sendData(type, data) {
      events.push({ type, data })
    },
  }
}

const list = [
  { id: '12', no: 'H401011.02', code: 'H401011', name: '摄影基础', teachClassName: '线上2班', teachers: '乙' },
  { id: '11', no: 'H401011.01', code: 'H401011', name: '摄影基础', teachClassName: '线下1班', teachers: '甲' },
]

test('getLessonId expands a keyword into teaching classes', () => {
  const config = {
    lessons: [{ value: '摄影' }],
    lessonJSONs: list,
    logger: mockLogger(),
  }
  const next = getLessonId(config)
  assert.deepEqual(next.lessonIds.map((item) => item.id), ['12', '11'])
  assert.equal(next.lessonIds[0].状态, 'notselected')
  assert.equal(config.logger.events.some((item) => item.type === 'log' && String(item.data).includes('摄影 → 2 个教学班')), true)
})

test('getLessonId fails when the round has no teaching classes', () => {
  assert.throws(
    () => getLessonId({
      lessons: [{ value: '摄影' }],
      lessonJSONs: [],
      logger: mockLogger(),
    }),
    /未开放或还没有教学班/,
  )
})
