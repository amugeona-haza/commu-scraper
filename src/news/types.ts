export type YorL = '윤석열' | '이재명'

export interface ArticleInfo {
    articleId: string;
    description: string;
}

export interface Article {
    articleId: string;
    title: string;
    createdAt: Date;
    description: string;
    paragraphs: string[];
    images: string[];
    keywords: string[];
    query: YorL
}
