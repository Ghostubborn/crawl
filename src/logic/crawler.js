module.exports = class extends think.Logic {
  indexAction() {

  }
  submitAction() {
    const data = this.ctx.request.body.post;
    if (typeof data.userId !== 'number' || !think.isInt(data.userId) || data.userId < 0 ) {
      this.ctx.json({
        code: 400,
        message: 'userId 必须为正整数。'
      });
      return false;
    }
    if ( !think.isArray(data.articles) || !think.isArray(data.patents)) {
      this.ctx.json({
        code: 400,
        message: 'articles 与patents 必须为数组。'
      });
      return false;
    }
    if (!data.articles.length && !data.patents.length) {
      this.ctx.json({
        code: 400,
        message: '请至少提交一篇论文或一个专利'
      });
      return false;
    }
  }
  statusAction() {
    if (!/^\d+$/.test(this.get('userId'))) {
      this.ctx.json({
        code: 400,
        message: '参数错误'
      });
      return false;
    }
  }
};
