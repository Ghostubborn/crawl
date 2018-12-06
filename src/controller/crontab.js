const BaseRest = require('./rest.js');
const puppeteer = require('puppeteer');

module.exports = class extends BaseRest {
  async crawlAction() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://xueshu.baidu.com/usercenter/paper/show?paperid=5ec07f8b8c7efcb63426e2f50d947aad&site=xueshu_se');
    await page.screenshot({path: 'sound.png'});

    var frame = page.mainFrame();
    const abstract = await frame.$eval('#dtl_l > div.main-info > div.c_content > div.abstract_wr > p.abstract',
        e => e.innerHTML);
    const keywords = await frame.$$eval('#dtl_l > div.main-info > div.c_content > div.kw_wr > p.kw_main > span > a',
        es => es.map(e => e.innerHTML));
    const cite = await frame.$eval('#dtl_l > div.main-info > div.c_content > div.ref_wr > p.ref-wr-num > a',
        e => e.innerHTML);
    console.log(abstract);
    console.log(keywords);
    console.log(cite.trim());
    browser.close();
  }
};
