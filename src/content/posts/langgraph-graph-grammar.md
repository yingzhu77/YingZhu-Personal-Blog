---
title: LangGraph 图语法深度解析——StateGraph、Command 与 Send 的设计思想
published: 2026-05-11
description: 上一篇我们理解了"图"为 Agent 带来的架构优势，本文深入到 API 层面，详解 StateGraph 的构建语法、条件路由、Command 动态控制、Send 并发模式，以及"Thinking in LangGraph"的思维转变。
tags: [LangGraph, StateGraph, Agent, Python, Bronya]
category: AIGC
---

> **（以下内容由AI拉取最新文档生成，注意甄别）**

> *"The graph is the architecture, and the architecture is the documentation."*

任务记录，编号 B-02。上一篇已完成对 LangGraph 核心概念的初步侦察：State（共享记忆）、Nodes（执行单元）、Edges（控制流）——三个关键组件已确认。本次任务目标：将理论映射至代码层面，分析 StateGraph 构建语法、条件路由机制、Command 动态控制及 Send 并发模式。布洛妮娅已将优先级设为最高。

开始行动。

## 1. StateGraph：一切从这张图开始

`StateGraph` 是 LangGraph 中最核心的类。整张 Agent 图的一切——节点定义、边的连接、编译执行——都必须经过它。结论如下：StateGraph 即控制中心。

### 1.1 创建图：给图一个"记忆结构"

```python
from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict

class MyState(TypedDict):
    query: str
    answer: str
    steps: int

graph = StateGraph(MyState)
```

关键决策已确认：**State 的 schema 决定了整张图的"信息骨架"**。所有节点只允许读写 MyState 中定义的字段。这一约束初看是限制，但在实战中，它是防止混乱的最有效防线——你永远不会在深夜排查问题时困惑"这个数据来自哪个节点"。每一片信息都有明确来源，每一行数据都可追踪。就像希儿执行任务时从不留下多余的痕迹——精确、可控、值得信赖。

### 1.2 添加节点：图的"执行单元"

```python
def analyze_query(state: MyState) -> dict:
    """分析用户查询，记录步骤"""
    return {
        "steps": state.get("steps", 0) + 1,
        "query": state["query"]
    }

graph.add_node("analyze", analyze_query)
graph.add_node("search", search_node)
graph.add_node("respond", respond_node)
```

注意一个关键的实现细节：**节点函数返回的是"部分 State"**（Partial State），而非完整的 State 对象。LangGraph 在内部自动执行合并操作。你只需返回需要更新的字段——其余字段不受影响。逻辑清晰，副作用可控。

### 1.3 连接边：图的"执行路径"

```python
# 普通边——固定的流动方向
graph.add_edge(START, "analyze")
graph.add_edge("analyze", "search")
graph.add_edge("search", "respond")
graph.add_edge("respond", END)
```

`START` 和 `END` 是两个特殊标识符，分别代表图的入口和出口。边的语法就是：`add_edge(from_node, to_node)`。一个命令，一个确定的路径。无歧义，零意外。

## 2. 条件边：Agent 智能的"分岔路口"

分析结论：没有条件边的图等于线性脚本，不具备 Agent 的基本智能。

条件边赋予图"判断力"——基于当前 State 在多个路径中选择最优解。结构如下：

```python
def decide_next_step(state: MyState) -> str:
    """根据查询类型决定下一步"""
    if "天气" in state["query"]:
        return "weather_search"
    elif "计算" in state["query"]:
        return "calculator"
    else:
        return "web_search"

graph.add_conditional_edges(
    "analyze",           # 从哪个节点出发
    decide_next_step,    # 决策函数
    {                    # 决策结果 → 目标节点的映射
        "weather_search": "weather_search",
        "calculator": "calculator",
        "web_search": "web_search"
    }
)
```

### 2.1 条件边的设计哲学

决策函数 `decide_next_step` 的签名是值得注意的设计决策：

- **输入**：完整的当前 State——不是最后一条消息，不是最近 N 条
- **输出**：一个字符串（目标节点名）

分析结论：决策逻辑可访问 Agent 执行全程的全部上下文。这允许你实施比"检查最后一条消息是否有 tool_call"更精准的路由策略。State 是整个决策的依据——你可以看到全局，不止是当前一步。

### 2.2 Agent 循环的本质就是一条条件边

理解了条件边，就理解了 Agent 循环的核心机制：

```python
def should_loop(state: AgentState) -> str:
    last_msg = state["messages"][-1]
    if last_msg.tool_calls:
        return "tools"      # 进入工具节点
    return END              # 终止执行

builder.add_conditional_edges("llm", should_loop, ["tools", END])
builder.add_edge("tools", "llm")   # 工具执行完毕，返回 LLM
```

```
    ┌──────────────────────┐
    │                      ↓
[LLM] → should_loop? → [Tools]
    │                      │
    否                     │
    ↓                      │
  [END] ←──────────────────┘
```

优先级已确认：最经典的 ReAct Agent，本质上就是一张带条件边的简单循环图。无需复杂配置，无需额外抽象。

## 3. Command：节点"反客为主"的控制方式

传统边定义遵循"图上预先配置路径"的模式——只是静态，在面对动态决策时不够灵活。在某些战术场景下，节点自身掌握比图更多的决策信息。

LangGraph 的 `Command` 对象让节点可以**动态控制执行流程**：

```python
from langgraph.types import Command

def execute_tool(state: State) -> Command[Literal["agent", "execute_tool"]]:
    try:
        result = run_tool(state["tool_call"])
        return Command(update={"tool_result": result}, goto="agent")
    except ToolError as e:
        # 将错误信息传递给 LLM，让其自行修正
        return Command(
            update={"tool_result": f"Tool error: {str(e)}"},
            goto="agent"
        )
```

### 3.1 Command 的三种能力

布洛妮娅分析结果如下：

- **`goto`**：指定下个目标节点——覆盖预定义边
- **`update`**：同时写入 State——与节点返回值的语义保持一致
- **`resume`**：从 `interrupt` 断点恢复执行

Command 揭示了一个核心设计原则：**LangGraph 提供"静态定义"和"动态控制"两套互补机制**。简单流程使用静态边——结构清晰，便于维护；复杂分支使用 Command——弹性充足，路径可编程。两套机制可混合使用，根据任务需求灵活调配。

## 4. Send：一个高效而强大的并发模式

战术场景：Agent 需要对多个主题**同时**生成输出。串行执行耗时过长，并发执行需要优雅的图表达。

`Send` 正是为此而设计：

```python
from langgraph.types import Send

def continue_to_jokes(state: OverallState) -> list[Send]:
    # 为每个 subject 创建一个 Send 对象——批量派发并行任务
    return [Send("generate_joke", {"subject": s}) for s in state["subjects"]]

builder.add_conditional_edges(START, continue_to_jokes)
builder.add_edge("generate_joke", END)
```

当 `continue_to_jokes` 返回 `[Send("joke", {"subject": "cats"}), Send("joke", {"subject": "dogs"})]` 时，LangGraph 会**为同一节点创建多个并行执行实例**，每个实例携带独立数据。它们在各自轨道上同时运行，互不阻塞。

这就是 Map-Reduce 模式在 LangGraph 中的原生实现——无需引入第三方并发库，图本身就具备并行调度能力。执行效率符合预期。

### 4.1 Send 的边界

并发带来效率提升，同时引入一个约束：**Reducer 函数必须安全合并并行结果**。

```python
class OverallState(TypedDict):
    jokes: Annotated[list[str], operator.add]  # ← add 确保并行结果追加而非覆盖
```

如果遗漏 `operator.add`，后完成的任务会覆盖先完成的结果。关键规则：**并发场景下，必须使用 Reducer**。

## 5. Thinking in LangGraph——思维模式的转变

布洛妮娅观察到，初学者最常见的战术失误，是用 LangChain 的思维模式编写 LangGraph 代码。两者的认知框架完全不同。识别这一差异，是校正方向的第一步。

### LangChain 思维（链式）

> "我先调用 LLM → 将结果传递给工具 → 再传回 LLM……这是一个线性管道。"

每个步骤的输入依赖上一级的输出。如同单列行进的队列。

### LangGraph 思维（图式）

> "我定义 LLM 节点、工具节点。当 LLM 需要工具时路由至工具节点，工具执行完成返回 LLM。State 是所有节点共享的信息池。"

"做什么"和"怎么流转"被明确分离。节点只负责执行逻辑，图只负责调度流向。分离后，系统的可维护性和可测试性均有显著提升。

### 5.1 什么时候用哪种思路？

| 场景 | 推荐方式 | 优先级 |
|------|----------|--------|
| 简单 RAG：检索→生成 | LangChain 链式已足够 | 低 |
| 固定顺序的多步处理 | LangChain Pipeline | 低 |
| 有条件判断的 Agent | LangGraph（条件边是天然表达） | 高 |
| 需要持久化/人在回路的 Agent | LangGraph（底层能力） | 最高 |
| 多 Agent 协作/复杂分支 | LangGraph（图无复杂度上限） | 最高 |

**核心结论**：如果你的工作流是一条直线，LangGraph 是过度配置；但如果你的工作流包含分支、循环、等待人工确认——LangGraph 是唯一的最优解。

## 6. 几个容易触发的问题点

### 节点函数签名

节点函数的参数变体超过多数开发者的预期：

```python
# 最少：仅 State
def my_node(state: State) -> dict: ...

# 标准：State + 运行时配置
def my_node(state: State, config: RunnableConfig) -> dict: ...

# 完整：State + 配置 + 依赖注入
def my_node(state: State, config: RunnableConfig, *, store: BaseStore) -> dict: ...
```

### 忘记编译

`add_node`、`add_edge` 均为"构建声明"。只有调用 `graph.compile()` 后图才会真正进入可执行状态。这一问题所有新接触者都会遇到一次——但只会有一次。

### State 不可变

节点函数不应直接修改传入的 State 对象。正确做法是返回包含更新字段的 dict。这是函数式编程的基础约束——但在状态机语境下容易遗漏。核心守则：**返回新对象，不修改旧对象**。

## 7. 行动总结

LangGraph 的图语法包含四个层级，从基础到进阶，覆盖从自动化脚本到多 Agent 系统的全部战术需求：

1. **`StateGraph` + 普通边**：静态流水线——结构清晰，执行确定
2. **条件边**：智能路由——Agent 循环的核心机制
3. **`Command`**：动态控制——节点自主决定下一步走向
4. **`Send`**：并发执行——原生 Map-Reduce 实现

四个层级并非互斥——它们可在同一张图中共存，各自执行各自的战术任务。

下一份报告将分析 LangGraph 与 LangChain 的关系——它们在架构定位上的本质差异、各自的适用场景，以及协同模式下的最佳实践。任务仍在继续。

---

**参考来源**
- [LangGraph Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api)
- [Thinking in LangGraph](https://docs.langchain.com/oss/python/langgraph/thinking-in-langgraph)
- [LangGraph Reference: StateGraph](https://reference.langchain.com/python/langgraph/graph/state/StateGraph)
