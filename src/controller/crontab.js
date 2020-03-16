const BaseRest = require('./rest.js');
const puppeteer = require('puppeteer');

module.exports = class extends BaseRest {
  async crawlAction() {
    const article = await this.model('article').where({ status: 0 }).order({ id: 'ASC' }).find();
    if (!think.isEmpty(article)) {
      const browser = await puppeteer.launch();
      try {
        const page = await browser.newPage();
        await page.goto(`https://xueshu.baidu.com/s?wd=${article.article_name}&sc_hit=1`, {
          waitUntil: 'networkidle0'
        });

        // 获取搜索结果第一篇的paperid
        const frame = page.mainFrame();
        const detailUrl = await frame.$eval('#bdxs_result_lists > #toolbar + div > div.sc_content > h3 > a',
            e => e.href);
        const paperId = detailUrl.match(/paperid=(\w+)/)[1];

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
          journal: journal && journal.toUpperCase().replace('《','').replace('》',''),
          journal_edition,
          status: 1
        });
      } catch (error) {
        await this.model('article').where({
          id: article.id
        }).update({
          status: 2
        });
      }
      browser.close();
    }

    const patent = await this.model('patent').where({ status: 0 }).order({ id: 'ASC' }).find();
    if (!think.isEmpty(patent)) {
      const browser = await puppeteer.launch();
      let cnSuccess = true;
      try {
        const detailPage = await browser.newPage();
        let inputPatentCode = patent.patent_code;

        // 去掉会被屏蔽
        detailPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36');

        await detailPage.goto(`https://www.patexplorer.com/patent/view.html?patid=${inputPatentCode}`, {
          waitUntil: 'load'
        });
        await detailPage.waitFor(5000);

        const detailFrame = detailPage.mainFrame();
        let code, name, status, abstract, rightStatus, inventors, type, technical, economic, legal, related;
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

        code = await getInfo(
          '#Js_patent_view_container .Js_patent_view_item:first-child > .g-info-l > .g-info-l-in .ui-switchable-content > div:first-child > div > ul.abst-info > li:nth-child(1)',
          e => e.childNodes[1].data.trim(),
          ''
        );

        if (code !== inputPatentCode) {
          throw new Error('code 不匹配');
        } else {
          status = 1;
          name = await getInfo(
            '#Js_patentview_main > div.detail_fix > div.u-detail-info-top.fn-clear.u-detail-info-top-bg > span > span',
            e => e.innerHTML,
            ''
          );
          abstract = await getInfo(
            '#Js_patent_view_container .Js_patent_view_item:first-child > .g-info-l > .g-info-l-in .ui-switchable-content > div:first-child > div > div.abstract.contenttext',
            e => e.innerHTML.trim(),
            ''
          );
          rightStatus = await getInfo(
            '#Js_patentview_main > div.detail_fix > div.u-detail-info-top.fn-clear.u-detail-info-top-bg > div.law-status > p',
            e => e.innerText,
            []
          );
          inventors = await getInfo(
            '#Js_patent_view_container .Js_patent_view_item:first-child > .g-info-l > .g-info-l-in .ui-switchable-content > div:first-child > div > ul.abst-info > li:nth-child(6) > a',
            es => es.map(item => item.innerText),
            [],
            true
          );
          type = await getInfo(
            '#Js_patentview_main > div.detail_fix > div.u-detail-info-top.fn-clear.u-detail-info-top-bg > span.title',
            e => e.childNodes[0].data.trim().match(/^\[(.*)\]/)[1],
            ''
          );
          // 点击专利价值度
          await Promise.all([
            detailPage.waitForNavigation({ waitUntil: 'networkidle2' }),
            detailFrame.click('#Js_patentview_main > div.detail_fix > div.tab_container > div > a[data-type="worth"]')
          ]);

          await detailPage.waitFor(5000);

          // 输入密码
          await detailFrame.type(
            'body > div.ui-dialog > div.ui-dialog-content > div > div.patLogin > div.accountLogin > form > div:nth-child(1) > input[type="text"]',
            '18317857539'
          );
          await detailFrame.type(
            'body > div.ui-dialog > div.ui-dialog-content > div > div.patLogin > div.accountLogin > form > div:nth-child(2) > input[type="password"]',
            'W_s_Z_547286408'
          );
          await Promise.all([
            detailPage.waitForNavigation({ waitUntil: 'networkidle2' }),
            detailFrame.click('body > div.ui-dialog > div.ui-dialog-content > div > div.patLogin > div.accountLogin > form > div:nth-child(3) > div.JS_accountLoginBtn')
          ]);

          // 点击专利价值度
          detailFrame.click('#Js_patentview_main > div.detail_fix > div.tab_container > div > a[data-type="worth"]');
          await detailPage.waitForSelector(
            '#Js_patent_view_container > div > div[data-role="worth"] > div.ui-switchable-content > div > div > div.m-worth-top > div.u-worth-des > div > p.count > span'
          );
          await detailPage.waitFor(5000);

          technical = await getInfo('#span1 > div > div > span', e => e.innerText, '');
          economic = await getInfo('#span2 > div > div > span', e => e.innerText, '');
          legal = await getInfo('#span3 > div > div > span', e => e.innerText, '');

          // 跳转到相关专利
          detailFrame.click('#Js_patentview_main > div.detail_fix > div.tab_container > div > a[data-type="relative"]');
          await detailPage.waitForSelector('#Js_patent_view_container > div > div[data-role="relative"] > div.ui-switchable-content > div > table');

          await detailPage.waitFor(5000);

          related = await getInfo(
            '#Js_patent_view_container > div > div[data-role="relative"] > div.ui-switchable-content > div > table > tbody > tr + tr',
            es => es.map(e => {
              let result = {
                id: e.querySelector('td:nth-child(2) > a').innerText,
                name: e.querySelector('td:nth-child(3) > a').innerText,
                applicant: []
              };
              e.querySelectorAll('td:nth-child(4) > a').forEach(node => result.applicant.push(node.innerText));
              return result;
            }),
            [],
            true
          );
        }

        await this.model('patent').where({
          id: patent.id
        }).update({
          status,
          patent_name: name,
          abstract,
          right_status: rightStatus,
          inventors: inventors && inventors.join(this.config('emptySpliter')),
          type,
          technical_value: technical,
          economic_value: economic,
          legal_value: legal,
          related_patents: JSON.stringify(related)
        });
      } catch (error) {
        cnSuccess = false;
      }
      if (!cnSuccess) {
        try {
          const detailPage = await browser.newPage();
          let inputPatentCode = patent.patent_code;

          // 去掉可能会被屏蔽
          detailPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36');

          detailPage.goto(`https://www.tiikong.com/patent/detail/index.do?patentNo=${inputPatentCode}`);
          await detailPage.waitForSelector(
            '#divRightSimilar > div > div.panel-body > ul, #divRightSimilar > div > div.panel-body > div.data-tips-empty'
          );
          const detailFrame = detailPage.mainFrame();
          let code, name, status, abstract, inventors, related;
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

          // 获取并对比code
          code = await getInfo(
            '#profile > table > tbody > tr:nth-child(1) > td:nth-child(2)',
            e => e.innerHTML,
            ''
          );

          if (code !== inputPatentCode) {
            status = 2
            throw new Error('code 不匹配');
          } else {
            status = 1
            name = await getInfo(
              '#patent-title > span',
              e => e.innerHTML,
              ''
            );
            abstract = await getInfo(
              '#summay',
              e => e.innerHTML.trim(),
              ''
            );
            inventors = await getInfo(
              '#profile > table > tbody > tr:nth-child(7) > td:nth-child(2)',
              e => e.innerHTML.split(' &nbsp;&nbsp;').map(item => item.trim()).filter(item => item),
              ''
            );
            related = await getInfo(
              '#divRightSimilar > div > div.panel-body > ul > li > a',
              es => es.map(e => {
                return {
                  id: e.href.match(/patentNo=(.*)\&source/)[1],
                  name: e.innerHTML
                };
              }),
              [],
              true
            );
          }

          await this.model('patent').where({
            id: patent.id
          }).update({
            status,
            patent_name: name,
            abstract,
            inventors: inventors && inventors.join(this.config('emptySpliter')),
            related_patents: JSON.stringify(related)
          });
        } catch (error) {
          await this.model('patent').where({
            id: patent.id
          }).update({
            status: 2
          });
        }
      }
      browser.close();
    }
  }
};
