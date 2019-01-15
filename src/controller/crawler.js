const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
  async submitAction() {
    const data = this.ctx.request.body.post;
    let articleAddCount = 0;
    let patentAddCount = 0;
    if (data.articles.length) {
      const Article = this.model('article');
      for (let i = 0; i < data.articles.length; i++) {
        const result = await Article.thenAdd({
          user_id: data.userId,
          article_name: data.articles[i],
          status: 0
        }, {
          user_id: data.userId,
          article_name: data.articles[i]
        });
        if (result.type === 'add') {
          articleAddCount++;
        }
      }
    }
    if (data.patents.length) {
      const Patent = this.model('patent');
      for (let i = 0; i < data.patents.length; i++) {
        const result = await Patent.thenAdd({
          user_id: data.userId,
          patent_code: data.patents[i],
          status: 0
        }, {
          user_id: data.userId,
          patent_code: data.patents[i],
        });
        if (result.type === 'add') {
          patentAddCount++;
        }
      }
    }
    this.ctx.json({
      code: 200,
      message: `提交成功, 新增论文${articleAddCount}篇, 新增专利${patentAddCount}条。`
    });
  }
  async statusAction() {
    const articles = await this.model('article').where({ user_id: this.get('userId') }).select();
    const patents = await this.model('patent').where({ user_id: this.get('userId') }).select();
    const result = {
      code: 200,
      message: "",
      userId: this.get('userId'),
      articles: articles.map(item => {
        if (item.status === 1) {
          return {
            name: item.article_name || '',
            status: this.config('status')[item.status],
            cite: item.cite,
            keywords: item.keywords.split(this.config('emptySpliter')),
            abstract: item.abstract || '',
            authors: item.authors.split(this.config('emptySpliter')),
            journal: item.journal || ''
          }
        } else {
          return {
            name: item.article_name,
            status: this.config('status')[item.status]
          }
        }
      }),
      patents: patents.map(item => {
        if (item.status === 1) {
          return {
            id: item.patent_code,
            name: item.patent_name || '',
            status: this.config('status')[item.status],
            abstract: item.abstract || '',
            rightStatus: item.right_status || '',
            technicalValue: item.technical_value || '',
            economicValue: item.economic_value || '',
            legalValue: item.legal_value || '',
            relatedPatents: JSON.parse(item.related_patents),
            inventors: item.inventors.split(this.config('emptySpliter')),
            type: item.type || ''
          }
        } else {
          return {
            id: item.patent_code,
            status: this.config('status')[item.status]
          }
        }
      })
    }
    this.ctx.json(result);
  }
};
