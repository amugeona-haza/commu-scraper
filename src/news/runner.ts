import { scrapPage } from './yhnews'
import { Article } from './types'
import { getExponentiallyUniform } from '../helpers/random'
import { delay } from '../helpers/asyncUtils'
import moment = require('moment')
import * as fs from 'fs'
import { Moment } from 'moment'

const MAXIMUM_PAGE = 50
const QUERY = '이재명'

function writeJson (name: string, data: any) {
  fs.writeFileSync(name, JSON.stringify(data, null, 2))
}

function generateDateRange (date: Moment) {
  const from = moment(date).subtract(1, 'week').format('YYYYMMDD')
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

  const ms = getExponentiallyUniform(800)
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
    date.subtract(1, 'week')
    console.log(`success: ${success.length}, failed: ${failed.length}`)
  } while (START_DATE.diff(date, 'month') <= 6)
  console.log(`complete scraping with query ${QUERY}`)
  console.timeEnd('time')

  writeJson(`${QUERY}_success.json`, success)
  writeJson(`${QUERY}_failed.json`, failed)
}

run()
