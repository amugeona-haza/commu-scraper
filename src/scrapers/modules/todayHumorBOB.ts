import {
  IArticle,
  IArticleInfo,
  IComment,
  IParagraph,
  Scraper
} from "../scraper"

import axios from 'axios'
import * as cheerio from 'cheerio'

export default class TodayHumorBOBScraper extends Scraper {
    protected fetchArticleInfoList(page: string): Promise<IArticleInfo[]> {
        throw new Error("Method not implemented.")
    }
    protected fetchArticle(url: string): Promise<IArticle> {
        throw new Error("Method not implemented.")
    }
    protected generateNextPage(page: string): string {
        throw new Error("Method not implemented.")
    }
}
