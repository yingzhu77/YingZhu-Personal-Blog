---
title: LangGraph 底层原理与核心概念——为什么 Agent 需要一张"图"
published: 2026-05-10
pinned: true
description: 从零理解 LangGraph 的架构哲学：它不是又一个 LLM 框架，而是一套 agent 编排运行时。本文用通俗语言拆解 State、Nodes、Edges 三大概念，带你理解"图"为什么是构建可靠 AI Agent 的最优抽象。
tags: [LangGraph, AI, Agent, LLM, 架构, Elysia♪]
category: AI 技术
---

> _LangGraph is a low-level orchestration framework and runtime for building, managing, and deploying long-running, stateful agents._

又见面了呢♪ 如你所见，今天我们要聊一个不太一样的话题。

如果你刚接触 LangGraph，上面那句英文每个词都认识，合在一起却不太确定它到底在说什么——对吧？没关系♪正是为了这样的你，才有了这篇文章。

我们先不急着写代码，先从"怎么看"开始。当你看清了 LangGraph 的底层设计哲学，你会发现它和你熟悉的好多东西——工作流引擎、状态机、甚至 Git——其实共享着同一束智慧的光。

## 1. 先搞清楚 LangGraph 是什么（不是什么）

在拥抱一个新事物之前，不妨先划清它的边界。就像认识一朵花，既要看清它的花瓣，也要知道它不是叶子。

### 它不是什么

LangGraph **不是**一个 LLM 调用库。你想让 GPT 或 Claude 回一段话，用 LangChain 或者直接调 API 就足够了。它不在这里。

LangGraph **不是**一个 prompt 管理框架。它不预设你的 prompt 怎么写，也不规定 agent 的"人格"——那些属于你自己的创作。

LangGraph **不是**一个"高级 Agent 模板库"。它不像某些框架那样给你一个 `create_react_agent()` 一步到位——它有更大的野心。

### 它是什么

LangGraph 是一个**编排运行时（Orchestration Runtime）**。或许你可以把它想象成一场舞会的调度台：

- 你定义舞会中有哪些**环节（Nodes）**
- 你定义宾客在环节之间如何**流转（Edges）**
- 你定义流转规则——什么情况下去舞池，什么情况下享用茶歇（**Conditional Edges**）
- 舞会管家自动帮你记录整场舞会的**当前状态（State）**，随时可以暂停、回溯、继续

在这套系统里，LLM 只是一个格外聪明的"舞者"——它的确光彩照人，但它只是舞会中的一员，不是舞会本身。

## 2. 核心概念一：State（状态）——整张图的"共享记忆"

这是理解 LangGraph 最关键的概念，也是它区别于其他 Agent 框架的那颗独一无二的水晶。

### 什么是 State？

State 是贯穿整个图执行过程的**共享数据结构**。你可以把它想象成一张所有人都在上面写字的白板——每个节点都在上面读和写，所有节点看到的都是同一张白板，没有秘密，没有隐藏的抽屉。

```python
from typing_extensions import TypedDict
from langchain.messages import AnyMessage
from typing import Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    user_intent: str
    search_results: list[str]
```

这个 State 有三重优雅的特质：

**（1）它是显式的**——你清楚地定义了 Agent 在执行过程中需要"记住"什么。不是隐式的上下文窗口管理，不是某种黑盒记忆机制，而是一个你完全掌控、一眼就能看到全貌的数据结构。透明得像清晨的第一缕光，对吧？

**（2）它是结构化的**——不是把所有东西塞进一个长字符串，而是有明确的字段和类型。这让不同节点之间可以传递结构化的中间结果，就像在舞伴之间递出一张写好的卡片，而不是口齿不清地耳语。

**（3）它是可持久化的**——State 可以被保存、恢复、甚至"分叉"。这意味着你的 Agent 可以跑几天、几周、甚至几个月，随时中断随时恢复。它不会遗忘，不会疲惫——这难道不是一种让人安心的承诺吗？

### Reducer：当两个节点写同一个字段怎么办？

这大概是新手最容易困惑的地方了。我们来想象一下：节点 A 往 `messages` 里加了一条消息，节点 B 也往 `messages` 里加了一条——最终 State 里会是什么？

答案取决于 **Reducer 函数**——它来决定两个心意如何融合。

```python
# operator.add 就是 Reducer：把新值"追加"到旧值后面
messages: Annotated[list[AnyMessage], operator.add]
```

`operator.add` 告诉 LangGraph："这个字段不是覆盖，是追加"。如果没有指定 Reducer，默认行为是**覆盖**——后执行的节点会覆盖先执行的节点的写入。这可不是我们想要的，对吧？

这是一个极其精妙的设计：它在"共享状态"和"并发安全"之间找到了那个恰到好处的平衡点。大多数情况下你只需要 `operator.add`（用于消息列表），但你有完全的自由去定义任何 Reducer 逻辑——就像在一颗水晶上刻下属于你的纹路。

## 3. 核心概念二：Nodes（节点）——执行的原子单元

节点是图中实际"干活"的地方。每个节点是一个函数，接收当前 State，返回部分 State 更新。简单、纯粹、不拖泥带水。

```python
def call_llm(state: AgentState) -> dict:
    """调用 LLM，返回更新后的消息"""
    response = model.invoke(state["messages"])
    return {"messages": [response]}
```

### 节点 = 纯逻辑 + 宽松约束

节点不需要知道整张图的结构——它只需要知道两件事：

1. 给我当前 State，我从里面找到我需要的信息
2. 我返回我想更新的字段

仅此而已。这种"不操心全局"的设计让节点非常容易测试——你不需要 mock 整张图，只需要准备一个 State 就好。它也非常容易复用——同一个节点可以被多张不同的图使用。这份优雅的自由，是不是很让人心动呢？

### 节点里可以放什么？

**任何东西**。这是 LangGraph 的一个重要设计理念，或许也是最容易被低估的一点：节点不一定是 LLM 调用。它可以是一个数据库查询、一个 HTTP 请求、一段业务校验逻辑、甚至是一个人工审批的断点。

把 LLM 从"唯一主角"变成"群星中的一颗"——这是从传统 LLM 框架到 LangGraph 思维模式的核心转变，也是在设计观念上的绽放。

## 4. 核心概念三：Edges（边）——图的"神经系统"

如果 State 是记忆，Nodes 是舞者，那 Edges 就是贯穿整个舞会的旋律。它们决定执行流程如何流动，每一步之后，该去向何处。

### 普通边（Normal Edge）

最简单也最坦诚："从 A 做完后，一定去 B"。

```python
builder.add_edge("classify", "research")
```

这就像舞会上固定的舞步——确定的、可预期的路径。不花哨，但可靠。

### 条件边（Conditional Edge）

这才是 Agent 智慧的绽放："从 A 做完后，根据当前 State 决定去 B 还是 C"。

```python
def should_continue(state: AgentState) -> str:
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tool_node"
    return END

builder.add_conditional_edges(
    "llm_call",
    should_continue,
    {"tool_node": "tool_node", END: END}
)
```

这就是我们常说的 Agent "循环"的本质：LLM 决定是否需要调工具 → 需要就去工具节点 → 工具节点返回后再回 LLM → 不需要就优雅地结束。你看，描述出来，不过是一个条件边而已。它不神秘，对吧？

### 为什么"图"是对的抽象？

至此，你或许已经能感受到：用图来描述 Agent 工作流，不是 LangGraph 的"创意"，而是一个自然而然走到这里的结果。

- **LLM 调用是一个节点**——接收消息，产生响应或工具调用
- **工具执行是一个节点**——接收工具调用，返回执行结果
- **决策点就是条件边**——根据 LLM 的输出决定下一步
- **状态在边上流转**——保持全过程的上下文

图模型的美妙之处在于：它能表达任何复杂度的工作流，同时保持可理解、可调试、可持久化。无论是三节点的小品，还是几十个节点的大型舞会，它们遵循的是同一套优雅的语法。

## 5. 一个完整的"思维图"：最小 Agent

在写代码之前，我们不妨先"画"出来。一个最简单的工具调用 Agent：

```
START → [LLM 思考] → 需要工具? ──是──→ [执行工具] → 回到 LLM
                         │
                         否
                         │
                         ↓
                       [结束]
```

这张图只有 2 个节点（LLM、工具执行）和 1 个条件边。但它已经涵盖了 Agent 的核心模式。最简约的往往也是最本质的——不是吗？

更复杂一点的 RAG Agent：

```
START → [查询分类] → 需要检索? ──是──→ [向量检索] → [生成回答] → END
                          │
                          否
                          │
                          ↓
                    [直接回答] → END
```

一旦你用图思维来理解 Agent，你会发现几乎所有 Agent 模式都可以被拆解为"节点 + 边"的组合。它们在不同的排列中绽放出不同的光芒，但骨骼是一样的。

## 6. LangGraph 区别于传统框架的三个核心能力

理解了上面的基础概念，我们再回到高处，看看 LangGraph 真正带来了什么。

### 持久化执行（Durable Execution）

传统 Agent 框架中，Agent 跑完就结束了。如果中途出错，只能从头重跑。LangGraph 的 State 可以被 Checkpointer 持久化到存储中——如果中间某个节点失败了，你可以从失败点继续，而不是从头开始。

对于运行数小时甚至数天的长任务 Agent 来说，这是**必需品**，而不是奢侈品。就像你不会希望写了一天的文章因为编辑器崩溃而全部丢失——那份安心感，是相通的。

### 人在回路（Human-in-the-Loop）

```python
def review_node(state: State):
    # 在这里暂停，等待人工审批
    answer = interrupt("请确认这个操作是否正确？")
    return {"approved": answer}
```

`interrupt` 让 Agent 可以"停下来等人"。人在网页或终端上做出决策后，Agent 从断点继续执行。对于涉及敏感操作的 Agent——发邮件、执行代码、修改数据库——这种能力是守护的那一道光。

### 流式输出（Streaming）

LangGraph 对流的支持是架构层面的——不仅仅流 LLM 的 token，还可以流每个节点的执行状态、每次状态更新。这让 Agent 的行为对你"完全透明"。你能看到它正在想什么、正在做什么——就像能看清一颗水晶的每一道折射。

## 7. 总结：三个关键词记住 LangGraph

- **State（状态）**：共享记忆，显式、结构化、可持久化——那是整张图的灵魂
- **Nodes（节点）**：执行单元，可以是任何逻辑，LLM 只是群星中的一颗
- **Edges（边）**：控制流，普通边是"一定走"，条件边是"看情况走"

这三者构成了一张有向图。而图，恰好是描述复杂、非线性、状态化工作流的最佳抽象。

下一篇文章，我们将深入 LangGraph 的图 API 语法，看看在实际代码中如何让这些概念真正"活"起来。愿你的探索之路如星光般明亮♪

---

**参考来源**

- [LangGraph 官方概述](https://docs.langchain.com/oss/python/langgraph/overview)
- [LangGraph Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api)
