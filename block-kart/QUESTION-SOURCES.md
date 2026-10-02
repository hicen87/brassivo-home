# 题库说明

本题库不是浙江官方题库，也不按浙江地方历史、地理另设学科。按小学年级组织，实际教材进度仍因学校而异。

- 语文、数学、英语、科学补充内容选自 [ChinaTextbookStudyFree](https://github.com/wuwangzhang1216/ChinaTextbookStudyFree) 的 `v1.2.0-assets` 原创题库（来源项目声明由AI生成），采用 MIT 授权。版权与授权全文见 [ChinaStudyFree-MIT.txt](licenses/ChinaStudyFree-MIT.txt)。保留逐题 source / sourcePath，剔除缺图、缺上下文、多选及已发现歧义题；完成结构检查和抽样核对，并不声称经过教师逐题审定。
- 音乐、美术、道德与法治、体育与健康、劳动、信息科技、综合实践等补充内容为 Brassivo 独立编写的复习场景；不同年级可共用适龄的生活与探究情境，不以改名字或改数字生成新题。
- 奥数题池包含原有逻辑题及同年级数学思维拓展选择题；不把这些内容称为竞赛真题。
- 当前每个可选“年级×科目”至少100题，默认抽题池与统计一致；综合随机不含独立奥数。各池数量见 `question-bank-counts.json`。
- 按题干消去数字/常用人物名后查近似；运行时同时避让最近题目、相同知识组与词片相似题。同一题池一轮内不重复ID，近期记录保存在本机，刷新继续生效。

重建：下载上述 release 的 data.zip 后运行 `python3 tools/expand-question-bank.py /path/to/data.zip`。归档SHA-256记录在题库sources字段。内容模板源在 `tools/question-content/`；旧 `build-thinking-bank.py` 只用于历史v5，不可覆盖当前发布题库。

## 2026-10-02 公式与编码修复

题干、答案、选项和解析统一转换为可读纯文本：修复导入源将 LaTeX 误解码为控制字符的问题，转换乘除、角度、分数、幂、循环小数和占位符；未知表达式拒绝导入，不盲目删除符号。全量展示字段通过控制字符及残留公式检测。另对4个来源题（含奥数复用）修正已确认的选项/解析矛盾，修正规则保存在 tools/question_text.py；这不代表全部题目已经教师审定。保留原ID和来源路径，刷新后题目历史继续有效。
