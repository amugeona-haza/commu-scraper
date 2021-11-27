import { scrapPage } from './yhnews'
import { Article } from './types'
import { getExponentiallyUniform } from '../helpers/random'
import { delay } from '../helpers/asyncUtils'
import * as fs from 'fs'

const TARGET_ARTICLE_SIZE = 5000
const QUERY = '이재명'

function writeJson (name: string, data: any) {
  fs.writeFileSync(name, JSON.stringify(data, null, 2))
}

async function runner (count: number = 1, successList: Article[] = [], failedList: string[] = []) {
  const triedArticleSize = successList.length + failedList.length
  console.log(`> scraping ${count} page with query '${QUERY}' [${triedArticleSize}/${TARGET_ARTICLE_SIZE}]`)
  const { success, failed } = await scrapPage(QUERY, count)

  successList.push(...success)
  failedList.push(...failed)
  console.log(`>> success: ${success.length}`)
  console.log(`>> failed: ${failed.length}`)

  const ms = getExponentiallyUniform(800)
  await delay(ms)

  if (successList.length + failedList.length > TARGET_ARTICLE_SIZE) {
    return { successList, failedList }
  }

  return runner(count + 1, successList, failedList)
}

async function run () {
  console.log(`start scraping with query ${QUERY}.`)
  console.time('time')
  const { successList, failedList } = await runner()
  console.log(`complete scraping with query ${QUERY}`)
  console.timeEnd('time')

  writeJson(`${QUERY}_success.json`, successList)
  writeJson(`${QUERY}_failed.json`, failedList)
}

run()
