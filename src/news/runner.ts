import { scrapPage } from './yhnews'
import { Article } from './types'
import { getExponentiallyUniform } from '../helpers/random'
import { delay } from '../helpers/asyncUtils'
import moment = require('moment')
import * as fs from 'fs'

const MAXIMUM_PAGE = 50
const QUERY = '이재명'
const START_DATE = moment()

function writeJson (name: string, data: any) {
  fs.writeFileSync(name, JSON.stringify(data, null, 2))
}

async function runner (from: string, to: string, pageNo: number = 1, successList: Article[] = [], failedList: string[] = []) {
  const triedArticleSize = successList.length + failedList.length
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
  console.log(`start scraping with query ${QUERY}.`)
  console.time('time')
  const { successList, failedList } = await runner('20211121', '20211128')
  console.log(`complete scraping with query ${QUERY}`)
  console.timeEnd('time')

  writeJson(`${QUERY}_success.json`, successList)
  writeJson(`${QUERY}_failed.json`, failedList)
}

run()
