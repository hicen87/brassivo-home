# 题库说明

本题库不是浙江官方题库，也不按浙江地方历史、地理另设学科。按小学年级组织，实际教材进度仍因学校而异。

- 语文、数学、英语、科学补充内容选自 [ChinaTextbookStudyFree](https://github.com/wuwangzhang1216/ChinaTextbookStudyFree) 的 `v1.2.0-assets` 原创题库（来源项目声明由AI生成），采用 MIT 授权。版权与授权全文见 [ChinaStudyFree-MIT.txt](licenses/ChinaStudyFree-MIT.txt)。保留逐题 source / sourcePath，剔除缺图、缺上下文、多选及已发现歧义题；完成结构检查和抽样核对，并不声称经过教师逐题审定。
- 音乐、美术、道德与法治、体育与健康、劳动、信息科技、综合实践等补充内容为 Brassivo 独立编写的复习场景；不同年级可共用适龄的生活与探究情境，不以改名字或改数字生成新题。
- 奥数题池包含原有逻辑题及同年级数学思维拓展选择题；不把这些内容称为竞赛真题。
- 当前每个可选“年级×科目”至少100题，默认抽题池与统计一致；综合随机不含独立奥数。各池数量见 `question-bank-counts.json`。
- 按题干消去数字/常用人物名后查近似；运行时同时避让最近题目、相同知识组与词片相似题。同一题池一轮内不重复ID，近期记录保存在本机，刷新继续生效。

重建：下载上述 release 的 data.zip 后运行 `python3 tools/expand-question-bank.py /path/to/data.zip`。归档SHA-256记录在题库sources字段。内容模板源在 `tools/question-content/`；旧 `build-thinking-bank.py` 只用于历史v5，不可覆盖当前发布题库。
