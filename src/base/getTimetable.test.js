const test = require('node:test')
const assert = require('node:assert/strict')
const {
  parseCourseTableActivities,
  parseCourseTableMeta,
  parseSemesterCalendarId,
  inferCurrentSchoolYear,
  isElectUnavailablePage,
  startTimetableProcess,
  weekStateLabel,
} = require('./getTimetable')

const tableHtml = `
new TaskActivity(1,"","18801(G302014.04)","PBL项目实践5/5|企业实习（二选一）(G302014.04)","r1","弘义楼312","011111111111111110",null,"","","","");
var teachers = [{id:1,name:"陆朝阳",lab:false}];
index = 1 * unitCount + 2;
index = 1 * unitCount + 3;
new TaskActivity(2,"","18802(E302138.03)","Linux操作系统(E302138.03)","r2","弘义楼101","011111111111111110",null,"","","","");
var teachers = [{id:2,name:"张三",lab:false}];
index = 0 * 13 + 8;
index = 0 * 13 + 9;
table0.marshalTable
<a href="/eams/courseTableForStd!taskTable.action?lesson.id=18802">E302138.03</a>
`

const indexHtml = `
<script>bg.form.addInput(form, "ids", "10001");</script>
<script>semesterBar({ empty: jQuery("#semesterBar"), value: 218 });</script>
`

function silentLogger() {
  return { sendData() {} }
}

function mockRequest(routes) {
  const pick = (url, method) => {
    const row = routes.find((item) => (item.method || 'GET') === method && item.match.test(String(url || '')))
    if (!row) throw new Error(`unhandled ${method} ${url}`)
    if (row.error) throw row.error
    return { data: row.data }
  }
  return {
    get: async (url) => pick(url, 'GET'),
    post: async (url) => pick(url, 'POST'),
  }
}

test('parseCourseTableMeta reads addInput and semesterBar', () => {
  const meta = parseCourseTableMeta(indexHtml)
  assert.equal(meta.studentId, '10001')
  assert.equal(meta.semesterId, '218')
})

test('parseCourseTableMeta prefers the std ids and ignores empty semester input', () => {
  const html = `
    <input type="hidden" name="semester.id" value=""/>
    <script>
      if(jQuery("#courseTableType").val()=="std"){
        bg.form.addInput(form,"ids","10001");
      }else{
        bg.form.addInput(form,"ids","4279");
      }
    </script>
  `
  const meta = parseCourseTableMeta(html)
  assert.equal(meta.studentId, '10001')
  assert.equal(meta.semesterId, '')
})

test('parseSemesterCalendarId prefers the current year-term', () => {
  const raw = JSON.stringify({
    yearTerms: ['2026-2027-1'],
    semesters: {
      '2025-2026': [{ id: 200, schoolYear: '2025-2026', name: '2' }],
      '2026-2027': [{ id: 217, schoolYear: '2026-2027', name: '2' }, { id: 218, schoolYear: '2026-2027', name: '1' }],
    },
  })
  assert.equal(parseSemesterCalendarId(raw), '218')
})

test('parseSemesterCalendarId reads official unquoted calendar and empty semesterId', () => {
  const raw = 'y22:[{id:178,schoolYear:"2025-2026",name:"1"},{id:198,schoolYear:"2025-2026",name:"2"}],y23:[{id:218,schoolYear:"2026-2027",name:"1"}]},yearIndex:"-1",termIndex:"-1",semesterId:""}'
  assert.equal(parseSemesterCalendarId(raw, new Date('2026-09-07T14:00:00')), '218')
  assert.deepEqual(inferCurrentSchoolYear(new Date('2026-09-07T14:00:00')), { year: '2026-2027', term: '1' })
})

test('closed elect pages are recognized', () => {
  assert.equal(isElectUnavailablePage('操作失败：不在选课时间内'), true)
  assert.equal(isElectUnavailablePage('<html>选课列表</html>'), false)
})

test('parseCourseTableActivities still builds weekday ranges', () => {
  const acts = parseCourseTableActivities(tableHtml)
  assert.equal(acts.length, 2)
  assert.equal(acts[0].no, 'G302014.04')
  assert.equal(acts[1].no, 'E302138.03')
})

const officialHtml = `
var teachers = [{id:6296,name:"陆朝阳",lab:false}];
activity = new TaskActivity(actTeacherId.join(','),actTeacherName.join(','),"18801(G302014.04)","PBL项目实践5/5|企业实习（二选一）(G302014.04)","518","弘义楼310","01010101010101010000000000000000000000000000000000000",null,"",assistantName,"","");
index =2*unitCount+6;
table0.activities[index][table0.activities[index].length]=activity;
index =2*unitCount+7;
table0.activities[index][table0.activities[index].length]=activity;
var teachers = [{id:6296,name:"陆朝阳",lab:false}];
activity = new TaskActivity(actTeacherId.join(','),actTeacherName.join(','),"18801(G302014.04)","PBL项目实践5/5|企业实习（二选一）(G302014.04)","519","弘义楼312","01111111111111111000000000000000000000000000000000000",null,"",assistantName,"","");
index =1*unitCount+2;
table0.activities[index][table0.activities[index].length]=activity;
index =1*unitCount+3;
table0.activities[index][table0.activities[index].length]=activity;
var teachers = [{id:7546,name:"王浩云",lab:false}];
activity = new TaskActivity(actTeacherId.join(','),actTeacherName.join(','),"17128(E302138.03)","Linux操作系统(E302138.03)","519","弘义楼312","01111111111111111000000000000000000000000000000000000",null,"",assistantName,"","");
index =0*unitCount+8;
table0.activities[index][table0.activities[index].length]=activity;
index =0*unitCount+9;
table0.activities[index][table0.activities[index].length]=activity;
var teachers = [{id:81,name:"李秋璇",lab:false}];
activity = new TaskActivity(actTeacherId.join(','),actTeacherName.join(','),"7803(B300005.02)","工科生的项目管理(B300005.02)","513","弘义楼304","01111111111111111000000000000000000000000000000000000",null,"",assistantName,"","");
index =0*unitCount+6;
table0.activities[index][table0.activities[index].length]=activity;
index =0*unitCount+7;
table0.activities[index][table0.activities[index].length]=activity;
table0.marshalTable
<a href="/eams/courseTableForStd!taskTable.action?lesson.id=473012">B300005.02</a>
`

test('weekStateLabel matches official 1-16 and 单1-15', () => {
  assert.equal(weekStateLabel('01111111111111111000000000000000000000000000000000000'), '1-16')
  assert.equal(weekStateLabel('01010101010101010000000000000000000000000000000000000'), '单1-15')
})

test('parseCourseTableActivities reads the official 我的课表 script', () => {
  const acts = parseCourseTableActivities(officialHtml)
  assert.equal(acts.length, 4)
  const byKey = Object.fromEntries(acts.map((item) => [`${item.weekDay}-${item.startUnit}-${item.place}`, item]))
  assert.equal(byKey['3-7-弘义楼310'].name, 'PBL项目实践5/5|企业实习（二选一）')
  assert.equal(byKey['3-7-弘义楼310'].teachers, '陆朝阳')
  assert.equal(byKey['3-7-弘义楼310'].weekLabel, '单1-15')
  assert.equal(byKey['3-7-弘义楼310'].endUnit, 8)
  assert.equal(byKey['2-3-弘义楼312'].teachers, '陆朝阳')
  assert.equal(byKey['2-3-弘义楼312'].weekLabel, '1-16')
  assert.equal(byKey['1-9-弘义楼312'].name, 'Linux操作系统')
  assert.equal(byKey['1-9-弘义楼312'].teachers, '王浩云')
  assert.equal(byKey['1-7-弘义楼304'].name, '工科生的项目管理')
  assert.equal(byKey['1-7-弘义楼304'].teachers, '李秋璇')
  assert.equal(byKey['1-7-弘义楼304'].no, 'B300005.02')
})

test('startTimetableProcess fills empty semester.id from the calendar', async () => {
  const index = `
    <input type="hidden" name="semester.id" value=""/>
    <script>
      if(jQuery("#courseTableType").val()=="std"){
        bg.form.addInput(form,"ids","10001");
      }else{
        bg.form.addInput(form,"ids","4279");
      }
    </script>
  `
  const calendar = 'y23:[{id:218,schoolYear:"2026-2027",name:"1"}]},yearIndex:"-1",termIndex:"-1",semesterId:""}'
  const request = mockRequest([
    { match: /courseTableForStd\.action$/, data: index },
    { match: /courseTableForStd!innerIndex/, data: index },
    { match: /dataQuery\.action/, method: 'POST', data: calendar },
    { match: /courseTableForStd!courseTable/, method: 'POST', data: tableHtml },
  ])
  const config = await startTimetableProcess({
    url: 'https://www.cduestc.cn',
    cookie: 'JSESSIONID=test',
    request,
    logger: silentLogger(),
  }, { reuseRequest: true, skipElect: true })

  assert.equal(config.timetable.semesterId, '218')
  assert.equal(config.timetable.studentId, '10001')
  assert.ok(config.timetable.activities.length >= 2)
})

test('startTimetableProcess keeps 我的课表 when elect rounds are gone', async () => {
  const request = mockRequest([
    { match: /courseTableForStd\.action$/, data: indexHtml },
    { match: /courseTableForStd!courseTable/, method: 'POST', data: tableHtml },
    { match: /stdElectCourse!innerIndex/, error: new Error('未找到任何选课轮次，请检查是否开放选课') },
    { match: /stdElectCourse!defaultPage/, error: new Error('检测到登录过期...') },
  ])
  const config = await startTimetableProcess({
    url: 'https://www.cduestc.cn',
    cookie: 'JSESSIONID=test',
    request,
    logger: silentLogger(),
    electionProfiles: [{ id: '1002', category: '专业选修', open: false }],
    profileId: '1002',
  }, { reuseRequest: true })

  assert.equal(config.timetable.source, 'courseTable')
  assert.equal(config.timetable.semesterId, '218')
  assert.equal(config.timetable.studentId, '10001')
  assert.ok(config.timetable.activities.length >= 2)
  assert.ok(config.electedLessons.length >= 2)
  assert.equal(config.cookie, 'JSESSIONID=test')
})
