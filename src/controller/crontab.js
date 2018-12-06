const BaseRest = require('./rest.js');
const puppeteer = require('puppeteer');

module.exports = class extends BaseRest {
  async crawlAction() {
    const article = await this.model('article').where({ status: 0 }).order({ id: 'ASC' }).find();
    if (think.isEmpty(article)) {
      return;
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://xueshu.baidu.com/s?wd=${article.article_name}&sc_hit=1`);

    // 获取搜索结果第一篇的paperid
    const frame = page.mainFrame();
    const detailUrl = await frame.$eval('#bdxs_result_lists > div:nth-child(2) > div.sc_content > h3 > a',
        e => e.href);
    const paperId = detailUrl.match(/\%3A\%28([0-9a-f]+)\%29/)[1];

    // 获取论文信息
    const detailPage = await browser.newPage();
    await detailPage.goto(`http://xueshu.baidu.com/usercenter/paper/show?paperid=${paperId}`, {
      waitUntil: 'networkidle0'
    });
    const detailFrame = detailPage.mainFrame();
    let authors, journal, journal_edition, abstract, keywords, cite;
    const getInfo = async (selector, resultFunction, defaultValue, isMultiple) => {
      let result;
      try {
        if (isMultiple) {
          result = await detailFrame.$$eval(selector, resultFunction);
        } else {
          result = await detailFrame.$eval(selector, resultFunction);
        }
      } catch (e) {
        console.log(e.message);
        result = defaultValue;
      }
      return result;
    }
    authors = await getInfo(
      '#dtl_l > div.main-info > div.c_content > div.author_wr > p.author_text > span > a',
      es => es.map(e => e.innerHTML),
      [],
      true
    );
    journal = await getInfo(
      '#dtl_r > div:nth-child(1) > div > div > div.container_right > .journal_title',
      e => e.innerHTML,
      ''
    )
    journal_edition = await getInfo(
      '#dtl_r > div:nth-child(1) > div > div > div.container_right > .journal_content',
      e => e.innerHTML,
      ''
    )
    abstract = await getInfo(
      '#dtl_l > div.main-info > div.c_content > div.abstract_wr > p.abstract',
      e => e.innerHTML,
      ''
    );
    keywords = await getInfo(
      '#dtl_l > div.main-info > div.c_content > div.kw_wr > p.kw_main > span > a',
      es => es.map(e => e.innerHTML),
      [],
      true
    )
    cite = await getInfo(
      '#cited_map_container > div.textTips > div.textTips_cite > span.number',
      e => e.innerHTML,
      ''
    );
    await this.model('article').where({
      id: article.id
    }).update({
      authors: authors.join(this.config('emptySpliter')),
      abstract,
      keywords: keywords.join(this.config('emptySpliter')),
      cite: /^\d+$/.test(cite) ? Number.parseInt(cite) : 0,
      journal,
      journal_edition,
      status: 1
    });

    browser.close();
  }
};
