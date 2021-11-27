import { scrapPage } from './yhnews'
import { Article } from './types'
import { getExponentiallyUniform } from '../helpers/random'
import { delay } from '../helpers/asyncUtils'
import * as moment from 'moment'
import { Moment } from 'moment'
import * as fs from 'fs'

//  query constants
const QUERY = '이재명'
const END_CONDITION_AMOUNT = 6
const END_CONDITION_UNIT_OF_TIME = 'month'

//  settings
const DATE_RANGE_AMOUNT = 1
const DATE_RANGE_UNIT = 'week'
const MAXIMUM_PAGE = 50
const DELAY_SCRAPING_MS = 800

function writeJson (name: string, data: any) {
  fs.writeFileSync(name, JSON.stringify(data, null, 2))
}

function generateDateRange (date: Moment) {
  const from = moment(date).subtract(DATE_RANGE_AMOUNT, DATE_RANGE_UNIT).format('YYYYMMDD')
  const to = moment(date).format('YYYYMMDD')
  return { from, to }
}

async function runner (from: string, to: string, pageNo: number = 1, successList: Article[] = [], failedList: string[] = []) {
  console.log(`> [${from} ~ ${to}] scraping ${pageNo} page with query '${QUERY}'`)
  const { success, failed } = await scrapPage(QUERY, pageNo, from, to)

  successList.push(...success)
  failedList.push(...failed)
  console.log(`> success: ${successList.length}`)
  console.log(`> failed: ${failedList.length}`)

  const ms = getExponentiallyUniform(DELAY_SCRAPING_MS)
  await delay(ms)

  if (pageNo > MAXIMUM_PAGE || (success.length + failed.length) === 0) {
    return { successList, failedList }
  }

  return runner(from, to, pageNo + 1, successList, failedList)
}

async function run () {
  const START_DATE = moment()
  const date = moment()

  const success = []
  const failed = []
  console.log(`start scraping with query ${QUERY}.`)
  console.time('time')
  do {
    const { from, to } = generateDateRange(date)
    const { successList, failedList } = await runner(from, to)
    success.push(...successList)
    failed.push(...failedList)
    date.subtract(DATE_RANGE_AMOUNT, DATE_RANGE_UNIT)
    console.log(`success: ${success.length}, failed: ${failed.length}`)
  } while (START_DATE.diff(date, END_CONDITION_UNIT_OF_TIME) <= END_CONDITION_AMOUNT)
  console.log(`complete scraping with query ${QUERY}`)
  console.timeEnd('time')

  writeJson(`${QUERY}_success.json`, success)
  writeJson(`${QUERY}_failed.json`, failed)
}

run()
