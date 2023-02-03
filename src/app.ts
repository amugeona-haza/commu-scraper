import RuliwebHumorBestScraper from "./scrapers/modules/ruliwebHumorBest"
import { IArticle, Scraper } from "./scrapers/scraper"
import * as fs from 'fs'

interface IResult {
  name: string
  site: string
  data: IArticle[]
}

(async () => {
  const scrapers: Scraper[] = [
    new RuliwebHumorBestScraper
  ]

  const resultList: IResult[] = []
  for await (const scraper of scrapers) {
    const data = await scraper.fetch('1', '60264614')

    const result: IResult = {
      name: scraper.name,
      site: scraper.site,
      data
    }

    resultList.push(result)
  }

  console.log(`${resultList.length} items scrapped`)

  fs.writeFileSync('data.json', JSON.stringify(resultList, null, 2))
})()
