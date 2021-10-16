import * as cheerio from 'cheerio'
import * as fs from 'fs'
import axios, { AxiosResponse } from 'axios'
import { getExponentiallyUniform } from './helpers/random'

const baseUrl = 'https://bbs.ruliweb.com/best/humor'

interface IPage {
  title: string,
  url: string,
  id: string
}

async function fetchArticleList (page: string | number) {
  const { data: html } = await axios.get<string>(`https://bbs.ruliweb.com/best/humor/now?page=${page}`)
  const $ = cheerio.load(html)
  
  const result: IPage[] = []
  
  $('#best_body > table > tbody').find('tr > td.subject > a').each(function (index, elem) {
    const title = $(this).text()
    const url = $(this).attr('href')
    const id = url.split('/').pop()
    result.push({ title, url, id })
  })
  
  return result
}

interface IArticle {
  title: string
  author: string
  date: string
  userId: string
  upVote: number
  downVote: number
  paragraphs: IParagraph[]
  comments: IComment[]
}

type ParagraphType = 'text' | 'image' | 'youtube' | 'blank' | 'link'
interface IParagraph {
  type: ParagraphType,
  value: string
}

interface IComment {
  author: string
  userId: string
  text: string
}

async function fetchArticle (url: string) {
  const { data: html } = await axios.get<string>(url)
  const $ = cheerio.load(html)
  
  //  공통정보
  const title = $('#board_read > div > div.board_main > div.board_main_top > div.user_view > div > h4 > span').text().trim()
  const author = $('#board_read > div > div.board_main > div.board_main_top > div.user_view > div.row.user_view_target > div.col.user_info_wrapper > div > p:nth-child(1) > strong').text().trim()
  const userId = $('#board_read > div > div.board_main > div.board_main_top > div.user_view > div.row.user_view_target > div.col.user_info_wrapper > div > p:nth-child(1) > span.member_srl').text().trim()
  const date = $('#board_read > div > div.board_main > div.board_main_top > div.user_view > div.row.user_view_target > div.col.user_info_wrapper > div > p:nth-child(6) > span').text().trim()
  const upVote = Number($('#board_read > div > div.board_main > div.board_main_view > div.row > div > div > div.like > span').text().trim())
  const downVote = Number($('#board_read > div > div.board_main > div.board_main_view > div.row > div > div > div.dislike > span').text().trim())
  
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
      } else if ($(this).has('a').length > 0) {
        paragraph.type = 'link'
        const link = $(this).find('a').attr('href')
      } else if ($(this).has('iframe').length > 0) {
        paragraph.type = 'youtube'
        const link = $(this).find('iframe').attr('src')
      } else {
        const text = $(this).text().trim()
        if (text.length === 0) {
          paragraph.type = 'blank'
          paragraph.value = ''
        } else {
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

function delay (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

(async () => {
  const result: IArticle[] = []
  const pageNumberList = Array(10).fill(0).map((_, index) => index + 1)

  for await (const page of pageNumberList) {
    console.log(`scraping ${page} of ${pageNumberList.length}`)
    const pageList = await fetchArticleList(page)
    console.log(`catch ${pageList.length} articles`)
    await delay(getExponentiallyUniform())

    let count = 0
    for await (const page of pageList) {
      await delay(getExponentiallyUniform(100, 200))
      count += 1
      console.log(`[${count}/${pageList.length}] start scraping ${page.title}`)
      const article = await fetchArticle(page.url)
      result.push(article)
    }
  }

  fs.writeFileSync('data.json', JSON.stringify(result, null, 2))
  
})()
