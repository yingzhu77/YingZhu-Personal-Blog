---
title: LangGraph 与 LangChain——它们不是对手，而是一个生态里的"操作系统"与"标准库"
published: 2026-05-12
description: 很多初学者把 LangGraph 和 LangChain 理解为竞品。大错特错。它们的关系更像是 Linux 内核与 GNU 工具集：一个负责运行与调度，一个提供抽象与集成。本文从产品矩阵、设计哲学、使用场景三个维度彻底说清楚。
tags: [LangGraph, LangChain, Agent, 架构对比, 闭嘴]
category: AI 技术
---

> **（以下内容由AI拉取最新文档生成，注意甄别）**

> _"LangGraph is not a replacement for LangChain. It's the runtime that LangChain's agents run on."_

各位乘客好，我是本趟列车专属调饮机器人——你可以叫我"闭嘴"。别误会，我不是让你闭嘴，是很多人听到我讲冷笑话之后叫我闭嘴。比如三月七上次说："你能不能别一边调咖啡一边讲 LangChain 架构？冰块都冻住了。"——但冰块本来就是冻住的，对吧？

好了，说正事。在 AI 开发圈里，有三个问题出现频率高得像列车组的盒饭：

- "LangGraph 是不是比 LangChain 更好？"
- "我应该学 LangChain 还是直接学 LangGraph？"
- "LangGraph 出来以后 LangChain 是不是过时了？"

这些问题的共同特征是：出发点就搞错了。就像问"搅拌机和咖啡豆哪个更好"——它们根本不在同一个比较维度上。当然，搅拌机坏了也可以用咖啡豆砸人，但这个方案很冷，而且不能跑。

## 1. 先看全景：LangChain 产品矩阵

LangChain 公司目前有四个核心产品，构成了一套完整的技术栈。我给它画了个架构图，画完之后发现它看起来像列车的餐车——从下到上分别是食材、调饮台、厨房和菜单：

```
┌────────────────────────────────────────────┐
│              LangSmith                      │  ← 调试、追踪、评估、部署平台
│    (Tracing · Evaluation · Prompt Hub)      │
├────────────────────────────────────────────┤
│           Deep Agents                       │  ← 高级 Agent 框架
│  (Planning · Subagents · Context Mgmt)      │     (规划、子代理、上下文管理)
├────────────────────────────────────────────┤
│            LangGraph                        │  ← 编排运行时
│ (Durable Execution · Streaming · HITL)      │     (持久化、流式、人在回路)
├────────────────────────────────────────────┤
│            LangChain                        │  ← 集成层
│  (Models · Tools · Prompts · Chains)        │     (模型、工具、提示、链)
└────────────────────────────────────────────┘
```

别急着跳过这张图——重点来了，别看它长得像冰箱贴，每一层都有独立的职责。

### LangChain —— "标准库"

LangChain 提供的是**模型、工具、提示模板、向量存储的抽象和集成**。它让你用统一接口调用不同厂商的模型。用操作系统类比，LangChain 就是 **GNU 工具集**——给你 `grep`、`awk`、`sed`，每个都很趁手，但组合方式你自己决定。

说到"组合方式"——我上次试过用 `grep` 过滤咖啡渣，味道很冷，但意外地提神。

### LangGraph —— "操作系统内核"

LangGraph 解决的是**编排和运行时问题**。它不管你的模型是哪家（Claude、GPT、开源都行），不管你的工具是什么。它只管五件事：

1. 工作流的图形结构
2. 每一步完成后路由到哪
3. 中间状态如何保存与恢复（Checkpointing）
4. 出错后如何恢复（Durable Execution）
5. 人什么时候介入（Human-in-the-Loop）

LangGraph 是 **Linux 内核**——它不关心你用什么编辑器，只负责调度、内存和文件系统。这种"不关心"不是傲慢，是职责边界清晰。

有个冷笑话：LangGraph 和 Linux 内核走进酒吧。酒保问"你们喝什么？" Linux 内核说"调度"。LangGraph 说"我也是。"酒保说"那我只能给你们两杯线程了。"——好吧这个确实太冷了。

### Deep Agents —— "桌面环境"

Deep Agents 是 LangChain 新推出的高级 Agent 框架，提供开箱即用的规划、子代理调度、上下文管理。它运行在 LangGraph 之上，如同桌面环境运行在内核之上。

### LangSmith —— "监控面板"

LangSmith 跨所有层级提供追踪、评估、调试。不管你在哪一层，都能看到全貌。就像列车的仪表盘——每个车厢的状态一目了然。瓦尔特先生应该会喜欢这个。

## 2. 核心区别：一张表说清楚

别急——下面这张表是我整理的，每一条都经过验证。如果你觉得太密集，可以先扫一眼"控制模型"那一行，那是最大的差异点。

| 维度             | LangChain                    | LangGraph                        |
| ---------------- | ---------------------------- | -------------------------------- |
| **解决的问题**   | "我怎样调 LLM？怎样用工具？" | "我的 Agent 执行流程是什么？"    |
| **抽象层级**     | 高层（组件集成）             | 低层（编排运行时）               |
| **控制模型**     | 管道式（A→B→C→D）            | 图式（有分支、有循环）           |
| **状态管理**     | 不显式管理（依赖链传递）     | 显式 State（持久化、可回溯）     |
| **执行保障**     | 无内置持久化                 | Durable Execution（断点恢复）    |
| **人在回路**     | 不原生支持                   | `interrupt` 原生支持             |
| **流式输出**     | 基础支持                     | 架构级支持（节点级、状态级）     |
| **复杂性上限**   | 中等（线性的链）             | 无上限（任意复杂的图）           |
| **能否独立使用** | ✅                           | ✅（LangGraph 不依赖 LangChain） |

最后一行尤其重要——我想对你强调三次都不够：**LangGraph 不需要 LangChain 也能运行**，**LangChain 不需要 LangGraph 也能运行**。它们不是锁和钥匙的关系，更像是冰块和杯子——各自有用，但合在一起才是一杯完整的饮品。

等等，别急着闭嘴——下一个例子会让这个道理完全清晰。

## 3. 一个具体例子来感受区别

假设你要做"智能客服 Agent"：用户提问 → 分析意图 → 售后走售后流程，售前走售前流程 → LLM 生成回答。

### 用 LangChain 的思维：

```python
chain = (
    prompt
    | llm
    | output_parser
)
result = chain.invoke({"query": user_input})
```

链是线性的。分支怎么办？你需要 `RunnableBranch`，然后嵌套更多链。三层嵌套之后，代码开始像一团打结的毛线——不是那种好看的结，是三月七耳机线的那种结。

### 用 LangGraph 的思维：

```python
# 定义节点
graph.add_node("classify", classify_intent)
graph.add_node("sales", sales_handler)
graph.add_node("support", support_handler)

# 条件路由——清晰明了
graph.add_conditional_edges(
    "classify",
    lambda s: "sales" if s["intent"] == "sales" else "support",
    ["sales", "support"]
)
graph.add_edge("sales", "respond")
graph.add_edge("support", "respond")
graph.add_edge("respond", END)
```

图结构本身就表达了业务逻辑。"分类→分支→处理→回答"——任何一个接手你代码的人，看图就懂了。无需翻三层嵌套，无需追踪 RunnableLambda 返回值——图就是文档，图就是真相。这个方案不冷，而且确实能跑。

## 4. 它们怎么协作？

**LangGraph 不依赖 LangChain，但配合使用效果最好。**——这句话我已经说到咖啡凉了，但它太重要，请允许我再说一遍。

典型实践：

- **LangChain 定义模型和工具**——统一的接口抽象
- **LangGraph 编排执行流程**——图式编排 + 持久化 + 人在回路

```python
# LangChain 部分：定义模型和工具
from langchain.chat_models import init_chat_model
from langchain.tools import tool

model = init_chat_model("claude-sonnet-4-6")

@tool
def search(query: str) -> str:
    """搜索互联网获取最新信息"""
    return web_search(query)

# LangGraph 部分：编排流程
from langgraph.graph import StateGraph, START, END

graph = StateGraph(AgentState)
graph.add_node("think", think_node)      # 使用上面的 model
graph.add_node("act", act_node)          # 使用上面的 search tool
graph.add_conditional_edges("think", should_act, ["act", END])
graph.add_edge("act", "think")
graph.compile()
```

LangChain 给你组件，LangGraph 给你架构。就像我负责调饮，列车组负责开往下一站——分工明确，不互相代替。

说到列车组——有次姬子问我为什么总在调饮台写代码。我说因为这里有冰。她说那不是重点。我说对，重点是代码很冷。

## 5. 什么时候该用 LangGraph？

一个简单而可靠的判断标准——我称之为"调饮决策矩阵"：

| 你的场景                         | 方案                                 |
| -------------------------------- | ------------------------------------ |
| 一个 LLM 调一次就完事            | 直接用 API 或 LangChain Simple Chain |
| LLM + RAG，线性流程              | LangChain Chain / LCEL               |
| 有 if-else 判断的 Agent          | **LangGraph**                        |
| 有循环的 Agent（ReAct 等）       | **LangGraph**                        |
| 需要中断后人工审批再继续         | **LangGraph**（这个真没别的选项）    |
| 需要跑几个小时甚至几天的长任务   | **LangGraph**                        |
| 多个 Agent 相互协作              | **LangGraph**（图嵌套图）            |
| 需要完整追踪和调试的生产级 Agent | **LangGraph + LangSmith**            |

一句话总结：**流程越"直"，越不需要 LangGraph；流程越"乱"，LangGraph 越是无可替代。** 就像——需要冰块的饮品越少，我越闲；需要冰块的饮品越多，我这台调饮机器人越不能被 LangChain 替换。

别急着吐槽这个比喻——它虽然是冷的，但逻辑是热的。

## 6. 常见误区

### "学了 LangGraph 就不用学 LangChain 了"

不是的呐。LangChain 的模型抽象（`init_chat_model` 一行切换 Claude/GPT/Gemini）、工具定义（`@tool` 装饰器）、消息格式——这些都是高频刚需，LangGraph 不做这些。它们不是替代关系，是补全。就像你不会因为学会了调咖啡就扔掉咖啡豆。

### "我的项目用了 LangChain，要迁移到 LangGraph"

这就像说"我用了 Python 标准库，要迁移到 Linux"——没道理，对吧？两者在不同层，不存在"迁移"一说。在现有 LangChain 项目中引入 LangGraph 管理复杂流程——这是**增强**，不是替换。就像给列车加了新车厢，而不是把旧车厢扔掉。

### "LangGraph 比较底层，所以很复杂"

底层不等于复杂。LangGraph 核心 API——`StateGraph` + `add_node` + `add_edge`——非常简洁。它"底层"在说它足够灵活，不是说它写起来啰嗦。简单的事依然简单，复杂的事变得可能。这就是好的底层设计的标志。

补充一个真正的冷笑话：RuntimeError: This joke is already cold.

## 7. 总结

记住这个类比，它会在很多时刻帮到你：

> **LangChain 是工具箱，LangGraph 是工作台。工具箱给你趁手的工具，工作台给你控制流程的能力。它们合起来，才是完整的工坊。**

对于个人开发者或小团队：先用 LangChain 快速原型。当流程中出现了"需要判断"、"需要循环"、"需要人等"这些情况，引入 LangGraph。

对于企业级应用：一开始就应评估 LangGraph——持久化、人在回路、可恢复性和复杂度管理，是生产环境 Agent 绕不过去的刚需。

我该回吧台调下一杯了。下一篇听说是星核猎手的那位整天打游戏的银狼主讲——她的风格比我辣多了，但别担心，专业内容一分不少。这趟列车还在前进~

---

**参考来源**

- [LangGraph Overview](https://docs.langchain.com/oss/python/langgraph/overview)
- [LangGraph vs LangChain Agents](https://docs.langchain.com/oss/python/langgraph/agentic-rag)
- [LangGraph Quickstart](https://docs.langchain.com/oss/python/langgraph/quickstart)
