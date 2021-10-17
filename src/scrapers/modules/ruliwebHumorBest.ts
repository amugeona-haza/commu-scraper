import {
  IArticle,
  IArticleInfo,
  IComment,
  IParagraph,
  Scraper
} from "../scraper"

import axios from 'axios'
import * as cheerio from 'cheerio'

export default class RuliwebHumorBestScraper extends Scraper {
  constructor () {
    super('Ruliweb Humor Best', 'ruliweb')
  }
  
  async fetchArticleInfoList (page: string | number) {
    const { data: html } = await axios.get<string>(`https://bbs.ruliweb.com/best/humor/now?page=${page}`)
    const $ = cheerio.load(html)
  
    const result: IArticleInfo[] = []
  
    $('#best_body > table > tbody').find('tr > td.subject > a').each(function (index, elem) {
      const title = $(this).text()
      const url = $(this).attr('href')
      const id = url.split('/').pop()
      result.push({ title, url, id })
    })
  
    return result
  }
  
  async fetchArticle (url: string, articleId: string) {
    const { data: html } = await axios.get<string>(url)
    const $ = cheerio.load(html)
  
    //  공통정보
    const title = $('#board_read > div > div.board_main > div.board_main_top > div.user_view > div > h4 > span').text().trim()
    const author = $('#board_read > div > div.board_main > div.board_main_top > div.user_view > div.row.user_view_target > div.col.user_info_wrapper > div > p:nth-child(1) > strong').text().trim()
    const userId = $('#board_read > div > div.board_main > div.board_main_top > div.user_view > div.row.user_view_target > div.col.user_info_wrapper > div > p:nth-child(1) > span.member_srl').text().trim()
    const date = $('#board_read > div > div.board_main > div.board_main_top > div.user_view > div.row.user_view_target > div.col.user_info_wrapper > div > p:nth-child(6) > span').text().trim()
    const upVote = Number($('#board_read > div > div.board_main > div.board_main_view > div.row > div > div > div.like > span').text().trim()) || 0
    const downVote = Number($('#board_read > div > div.board_main > div.board_main_view > div.row > div > div > div.dislike > span').text().trim()) || 0
  
    // Paragraphs
    const paragraphs: IParagraph[] = []
    $('#board_read > div > div.board_main > div.board_main_view > div.view_content > article > div > p')
      .each(function () {
        const paragraph: IParagraph = {
          type: 'text',
          value: ''
        }
      
        if ($(this).has('img').length > 0) {
          paragraph.type = 'image'
          paragraph.value = $(this).find('img').attr('src')
        }
        else if ($(this).has('video').length > 0) {
          paragraph.type = 'video'
          paragraph.value = $(this).find('video').attr('src')
        }
        else if ($(this).has('a').length > 0) {
          paragraph.type = 'link'
          const link = $(this).find('a').attr('href')
        }
        else if ($(this).has('iframe').length > 0) {
          paragraph.type = 'iframe'
          const link = $(this).find('iframe').attr('src')
        }
        else {
          const text = $(this).text().trim()
          if (text.length === 0) {
            paragraph.type = 'blank'
            paragraph.value = ''
          }
          else {
            paragraph.type = 'text'
            paragraph.value = text
          }
        }
        paragraphs.push(paragraph)
      })
  
    //  Comments
    const comments: IComment[] = []
    $('#cmt > div.comment_view_wrapper.row > div.comment_view.normal > table > tbody > tr')
      .each(function () {
        const text = $(this).find('td.comment > div.text_wrapper > span.text').text().trim()
        const author = $(this).find('td.user > div > div').text().trim()
        const userId = $(this).find('td.user > div > span > a').text().trim()
      
        const result: IComment = { text, author, userId }
        comments.push(result)
      })
  
  
    const result: IArticle = {
      title,
      url,
      articleId,
      author,
      userId,
      date,
      upVote,
      downVote,
      paragraphs,
      comments
    }
  
    return result
  }
  
  generateNextPage (page: string) {
    return `${Number(page) + 1}`
  }
}
