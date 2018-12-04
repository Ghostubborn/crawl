

# 提交用户论文和专利
[POST] /submit
## request: application/json
字段名称 | 数据类型 | 是否必须 | 字段说明
| -- |:--:|:--:| -- |
userId | int | Y | 用户ID
articles | list of string | N | 论文名称列表
patents | list of string | N | 专利名称列表

``` json
{
  "userId": 10001,
  "articles": [
    "article1",
    "article2",
    "article3"
  ],
  "patents": [
    "patent1",
    "patent2",
    "patent3"
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
  "message": "至少提交一个论文名或一个专利名"
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
userId | int | 用户ID
articles | list of `article` object | 论文名称列表
patents | list of `patent` object | 专利名称列表
article.name | string | 论文名称
article.status | string | 论文抓取状态。pending: 待抓取, crawing: 抓取中, success: 抓取成功, failed: 抓取失败
article.cite | int | 论文被引用数量
article.keywords | array of string | 论文关键词
article.abstract | string | 论文摘要
patent.name | string | 专利名称
patent.status | string | 专利抓取状态。pending: 待抓取, crawing: 抓取中, success: 抓取成功, failed: 抓取失败
patent.abstract | string | 专利摘要
patent.rightStatus | string | 专利权利状态
patent.technicalValue | string | 专利技术价值
patent.economicValue | string | 专利经济价值
patent.legalValue | string | 专利法律价值
patent.relatedPatents | array of string | 相关专利

- 200: 
``` json
{
  "code": 200,
  "message": "",
  "userId": 10001,
  "articles": [
    {
      "name": "article1",
      "status": "success",
      "cite": 222,
      "keywords": ["关键词1", "关键词2"],
      "abstract": "摘要摘要摘要摘要摘要"
    }
  ],
  "patents": [
    {
      "name": "patent1",
      "status": "success",
      "abstract": "摘要摘要摘要摘要摘要摘要摘要",
      "rightStatus": "有权-审定授权",
      "technicalValue": "36.0",
      "economicValue": "8.0",
      "legalValue": "3.0",
      "relatedPatents": ["专利一", "专利二", "专利三", "专利四", "专利五", "专利六", "专利七", "专利八", "专利九", "专利十"]
    }
  ]
}
```
