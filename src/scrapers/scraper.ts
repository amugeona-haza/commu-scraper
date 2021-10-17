import { delay } from "../helpers/asyncUtils"
import { getExponentiallyUniform } from "../helpers/random"

export type ParagraphType = 'text' | 'image' | 'iframe' | 'blank' | 'link' | 'video'

export interface IArticleInfo {
  title: string,
  url: string,
  id: string
}

export interface IParagraph {
  type: ParagraphType,
  value: string
}

export interface IComment {
  author: string
  userId: string
  text: string
}

export interface IArticle {
  title: string
  url: string
  articleId: string
  author: string
  userId: string
  date: string
  upVote: number
  downVote: number
  paragraphs: IParagraph[]
  comments: IComment[]
}

export abstract class Scraper {
  private _name: string
  private _site: string
  private _maximumFetchArticles: number
  protected abstract fetchArticleInfoList (page: string): Promise<IArticleInfo[]>
  protected abstract fetchArticle (url: string, articleId: string): Promise<IArticle>
  protected abstract generateNextPage (page: string): string

  constructor (name, site) {
    this._name = name
    this._site = site
    this._maximumFetchArticles = 500
  }
  
  public async fetch (page: string, lastArticleId: string, result: IArticle[] = []): Promise<IArticle[]> {
    const { name, site } = this
    const prefix = `${site} > ${name}`
    console.log(`[${prefix}] Start scraping ${page}`)
    const pageList = await this.fetchArticleInfoList(page)
    console.log(`[${prefix}] Catch ${pageList.length} articles`)
  
    let count = 0
    let hitLastPage = false
    for await (const page of pageList) {
      hitLastPage = page.id === lastArticleId
      if (hitLastPage) {
        console.log(`[${prefix}] Hit last page ${lastArticleId}!`)
        break
      }

      await delay(getExponentiallyUniform(600, 1000))
      count += 1
      console.log(`[${prefix}][${count}/${pageList.length}] start scraping page ${page.title}`)
      const article = await this.fetchArticle(page.url, page.id)
      result.push(article)
    }
  
    await delay(getExponentiallyUniform(800, 1200))
    
    if (hitLastPage) {
      return result
    }
    else if (result.length > this._maximumFetchArticles) {
      console.log(`[${prefix}] Can't find ${lastArticleId} page but reach maximum article size.`)
      return result
    }
    
    const nextPage = this.generateNextPage(page)
    return this.fetch(nextPage, lastArticleId, result)
  }
  
  get name () {
    return this._name
  }
  
  get site () {
    return this._site
  }
}
