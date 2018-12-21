# 提交用户论文和专利
[POST] /submit
## request: application/json
字段名称 | 数据类型 | 是否必须 | 字段说明
| -- |:--:|:--:| -- |
userId | string | Y | 用户ID
articles | array of string | Y | 论文名称列表
patents | array of string | Y | 专利号列表

``` json
{
  "userId": "10001",
  "articles": [
    "转甜菜碱醛脱氢酶基因豆瓣菜的耐盐性",
    "黄瓜SRAP遗传连锁图的构建及始花节位的基因定位",
    "Gene-expression profiles in hereditary breast cancer"
  ],
  "patents": [
    "CN201210001576.0",
    "CN201310695436.2",
    "CN201510909244.6"
  ]
}
```

## response
字段名称 | 数据类型 | 字段说明
| -- |:--:| -- |
code | string | 状态码。200: 成功，400: 参数错误。
message | string | 成功或错误信息

- 200: 
``` json
{
  "code": "400",
  "message": "至少提交一个论文名或一个专利号"
}
```

# 查询用户论文和专利
[GET] /status/{`userId`}
## request:
字段名称 | 数据类型 | 是否必须 | 字段说明
| -- |:--:|:--:| -- |
userId | int | Y | 用户ID

## response: application/json
字段名称 | 数据类型 | 字段说明
| -- |:--:| -- |
code | string | 状态码。200: 成功，400: 参数错误。
message | string | 错误信息
userId | string | 用户ID
articles | array of `article` object | 论文名称列表
patents | array of `patent` object | 专利名称列表
article.name | string | 论文名称
article.status | string | 论文抓取状态。pending: 待抓取, success: 抓取成功, failed: 抓取失败
article.cite | int | 论文被引用数量
article.keywords | array of string | 论文关键词
article.abstract | string | 论文摘要
article.authors | array of string | 论文作者，最多三位
article.journal | string | 期刊名称
patent.id | string | 专利号
patent.name | string | 专利名称
patent.status | string | 专利抓取状态。pending: 待抓取, success: 抓取成功, failed: 抓取失败
patent.abstract | string | 专利摘要
patent.rightStatus | string | 专利权利状态
patent.technicalValue | string | 专利技术价值分数
patent.economicValue | string | 专利经济价值分数
patent.legalValue | string | 专利法律价值分数
patent.relatedPatents | array of string | 相关专利
patent.inventors | array of string | 发明人列表
patent.type | string | 专利类型

- 200: 
``` json
{
  "code": 200,
  "message": "",
  "userId": "10001",
  "articles": [
    {
      "name": "article1",
      "status": "success",
      "cite": 222,
      "keywords": ["关键词1", "关键词2"],
      "abstract": "摘要摘要摘要摘要摘要",
      "authors": ["王奎洋", "唐金花", "刘成晔"],
      "journal": "《中国科学 化学：中国科学》"
    }
  ],
  "patents": [
    {
      "id": "CN201210001576.0",
      "name": "patent1",
      "status": "success",
      "abstract": "摘要摘要摘要摘要摘要摘要摘要",
      "rightStatus": "有权-审定授权",
      "technicalValue": "36",
      "economicValue": "8",
      "legalValue": "3",
      "relatedPatents": ["CN201710376390.6","CN201510657188.1","CN201510158995.9","CN201510941234.0","CN201510303118.6","CN201310341175.4","CN201710573117.2","CN201180020779.8","CN201080040790.6","CN201510055092.8"],
      "inventors": ["王奎洋", "唐金花", "刘成晔"],
      "type": "中国发明，中国发明授权"
    }
  ]
}
```
