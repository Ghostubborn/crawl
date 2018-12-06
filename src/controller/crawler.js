const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
  async submitAction() {
    const data = this.ctx.request.body.post;
    let articleAddCount = 0;
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
    this.ctx.json({
      code: 200,
      message: `提交成功, 新增论文${articleAddCount}篇。`
    });
  }
  async statusAction() {
    const articles = await this.model('article').where({ user_id: this.get('userId') }).select();
    const result = {
      code: 200,
      message: "",
      userId: Number.parseInt(this.get('userId')),
      articles: articles.map(item => {
        if (item.status === 1) {
          return {
            name: item.article_name,
            status: this.config('status')[item.status],
            cite: item.cite,
            keywords: item.keywords.split(this.config('emptySpliter')),
            abstract: item.abstract,
            authors: item.authors.split(this.config('emptySpliter')),
            journal: item.journal
          }
        } else {
          return {
            name: item.article_name,
            status: this.config('status')[item.status]
          }
        }
      })
    }
    this.ctx.json(result);
  }
};
