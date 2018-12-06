const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
  async submitAction() {
    console.log('submit');
  }
  async statusAction() {
    let article = this.model('article');
    let data = await article.where({user_id: this.userId}).select();
    this.success(data);
  }
};
