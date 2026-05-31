---
title: LangGraph 实战入门——从零构建一个可持久化、有人工审批的 Agent
published: 2026-05-13
pinned: false
description: 前几篇建立了理论，这篇我们动手写代码。用 LangGraph 从零构建一个完整的 Agent：定义工具、设计图结构、加入持久化和人在回路。每一步都有解释，每一行代码都带注释。
tags: [LangGraph, Agent, Python, 实战, Silver Wolf]
category: AIGC
---

> **（以下内容由AI拉取最新文档生成，注意甄别）**

> *"Talk is cheap. Show me the graph."*

哟，来啦。这局的内容很简单——用 LangGraph 搓一个能跑、能存档、能叫人的 Agent。不是说那种玩具 demo，是实打实带 Checkpointing、Human-in-the-Loop、条件路由的完整关卡。

别急，先看面板——这局的通关目标：

- LLM 推理 + 工具调用循环 ✓
- Checkpointing（持久化存档，崩了也能读档）✓
- Human-in-the-Loop（打不过就叫人的那种）✓
- CDP 风格的条件路由 ✓

只需要 Python 3.10+ 加两行命令。卡芙卡说你今天状态不错，那我们就开这局。

## 第一阶段：环境准备

```bash
pip install langgraph langchain langchain-core
# 如果你用 Claude：
pip install langchain-anthropic
# 如果你用 OpenAI：
pip install langchain-openai
```

## 第二阶段：定义你的"装备栏"

Agent 的战斗力不在 LLM 本身——在它能**切装备**。先来三件：

```python
from langchain.tools import tool

@tool
def search_knowledge_base(query: str) -> str:
    """搜索内部知识库。适用于产品文档、公司政策类问题。

    Args:
        query: 搜索关键词
    """
    # 实际项目中这里接向量数据库
    kb = {
        "退款政策": "用户可在购买后30天内申请全额退款，需提供订单号。",
        "会员权益": "VIP会员享受免费配送、专属客服和每月礼品。",
        "工作时间": "客服在线时间为工作日 9:00-18:00。",
    }
    for key, value in kb.items():
        if key in query:
            return value
    return "未找到相关信息，建议转人工客服。"

@tool
def calculate(expression: str) -> str:
    """执行数学计算。适用于价格、折扣、统计类问题。

    Args:
        expression: 要计算的数学表达式，如 '100 * 0.8'
    """
    try:
        result = eval(expression)
        return f"计算结果：{result}"
    except Exception as e:
        return f"计算出错：{str(e)}"

@tool
def create_ticket(user_name: str, issue: str, priority: str = "normal") -> str:
    """创建工单。当用户的问题无法直接解决时创建工单。

    Args:
        user_name: 用户姓名
        issue: 问题描述
        priority: 优先级，可选 'low', 'normal', 'high'
    """
    # 实际项目中这里接工单系统 API
    ticket_id = f"TKT-{hash(issue) % 10000:04d}"
    return f"工单已创建（编号：{ticket_id}，优先级：{priority}）。我们将尽快处理。"

# 建立工具名到工具对象的映射，方便后续查找
tools = [search_knowledge_base, calculate, create_ticket]
tools_by_name = {tool.name: tool for tool in tools}
```

### 装备说明

注意每个工具的 docstring 写得贼详细——这不是给你看的注释，是给 LLM 看的说明书。LLM 靠这些描述判断"这局该切哪件装备"。

好的工具描述 = 好的 Agent 判断力。就像游戏里你总得知道每件装备的技能描述，对吧？

## 第三阶段：初始化角色并绑定技能

```python
from langchain.chat_models import init_chat_model

# 一行代码初始化——LangChain 的接口层在这里最好用
model = init_chat_model(
    "claude-sonnet-4-6",  # 或 "gpt-4o"
    temperature=0          # Agent 场景温度设 0，保证出招一致性
)

# "绑定"工具——把装备栏交给 LLM
model_with_tools = model.bind_tools(tools)
```

`bind_tools` 是关键操作。它把工具的定义（名称、描述、参数 schema）注入 LLM 的系统提示，让 LLM 在每次响应时判断："直接回话"还是"切装备"。问题不大，一步搞定。

## 第四阶段：设计 State——你的存档数据结构

```python
from typing_extensions import TypedDict, Annotated
from langchain.messages import AnyMessage
from langgraph.graph import add_messages

class AgentState(TypedDict):
    """Agent 的全局状态——相当于你的全关卡存档"""
    messages: Annotated[list[AnyMessage], add_messages]
    # ↑ add_messages 是内置 Reducer：新消息追加，不覆盖
    pending_action: str | None
    # ↑ 当前待审批的动作，用于"暂停叫人"机制
    ticket_created: bool
    # ↑ 追踪是否已创建工单
```

三个设计要点，别跳：

**（1）`add_messages` 而不是 `operator.add`**

`add_messages` 是 LangGraph 为消息列表专门优化的 Reducer。比 `operator.add` 多了消息去重、ID 管理、`ToolMessage` 和 `ToolCall` 自动配对——相当于装备栏的自定义排序插件，不用白不用。

**（2）`pending_action` 的存在理由**

这个字段是"人在回路"机制的核心。当 Agent 要执行敏感操作（比如创建工单），不是直接执行——是先写 `pending_action` 然后暂停，等人审批。这就像你打 boss 之前先存档，然后问队友"这招能放吗？"

**（3）State 字段不在多，在够用**

开局不要塞满字段。当你发现某个信息"老是没地方存"，再加字段。别一上来就二十个字段——面板太乱，操作反而慢。

## 第五阶段：实现节点——图上的每一个"技能位"

### 5.1 LLM 节点——"主技能"

```python
from langchain.messages import SystemMessage

THINK_SYSTEM_PROMPT = """你是一个专业的客服助手。遵循以下规则：

1. 首先理解用户的问题
2. 如果问题涉及退款政策、会员权益、工作时间，调用 search_knowledge_base
3. 如果涉及价格计算，调用 calculate
4. 如果用户明确要求创建工单，调用 create_ticket
5. 如果以上都不适用，直接友好地回答用户

注意：创建工单是敏感操作，你标记 pending_action 为 "create_ticket" 后，
系统会请求人工审批。"""

def think_node(state: AgentState) -> dict:
    """LLM 思考并决定下一步行动"""
    response = model_with_tools.invoke(
        [SystemMessage(content=THINK_SYSTEM_PROMPT)] + state["messages"]
    )
    return {"messages": [response]}
```

### 5.2 工具执行节点——"副技能"

```python
from langchain.messages import ToolMessage

def tool_node(state: AgentState) -> dict:
    """执行 LLM 选择的工具"""
    last_message = state["messages"][-1]

    results = []
    for tool_call in last_message.tool_calls:
        tool = tools_by_name[tool_call["name"]]
        observation = tool.invoke(tool_call["args"])
        results.append(
            ToolMessage(
                content=str(observation),
                tool_call_id=tool_call["id"]
            )
        )

    return {"messages": results}
```

一个容易被跳过的细节——但很关键：`ToolMessage` 的 `tool_call_id` 必须和原始 `tool_call` 的 ID 精确匹配。ID 对不上 = LLM 不知道"这个结果是哪次调用返回的"。就像联机时你发了信号，队友不知道这信号是谁点的——白发了。别踩这个坑。

### 5.3 人工审批节点——"暂停叫人"

```python
from langgraph.types import interrupt

def human_review_node(state: AgentState) -> dict:
    """暂停并等待人工审批"""
    # interrupt() 让图在这里暂停——相当于游戏里的弹窗确认
    approval = interrupt({
        "question": f"是否确认执行操作：{state['pending_action']}？",
        "context": state["messages"][-2:]  # 把最近对话发过去作为审批参考
    })

    if approval.get("approved"):
        return {"pending_action": None}
    else:
        return {
            "pending_action": None,
            "messages": [
                ToolMessage(
                    content=f"操作被审批人拒绝。原因：{approval.get('reason', '未提供原因')}",
                    tool_call_id="human_review"
                )
            ]
        }
```

`interrupt()` 是 LangGraph 最强的机制之一。工作原理：
1. 图停在当前节点
2. 当前 State 自动存档
3. 前端/调用方收到中断信号
4. 人看完上下文做决策
5. `Command(resume=...)` 读档继续

这机制就是 Agent 版的"暂停→叫队友→继续"。卡芙卡说这很优雅，我也觉得。

## 第六阶段：连线——技能之间的流转

```python
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from typing import Literal

def route_after_think(state: AgentState) -> Literal["tools", "human_review", END]:
    """LLM 思考后的路由逻辑——整个 Agent 的决策引擎"""
    last_message = state["messages"][-1]

    # 有工具调用 → 切装备
    if last_message.tool_calls:
        # 检查是否需要人工审批
        for tc in last_message.tool_calls:
            if tc["name"] == "create_ticket":
                return "human_review"  # ← 创建工单先走审批
        return "tools"

    # 没有工具调用 → 这局结束，LLM 已经给出答案
    return END

def route_after_tools(state: AgentState) -> Literal["think", END]:
    """工具执行后——回主技能看下一步"""
    return "think"

def route_after_review(state: AgentState) -> Literal["tools", "think"]:
    """审批后——通过就放技能，拒绝就回主技能汇报"""
    if state.get("pending_action") is None:
        return "tools"   # 审批通过
    return "think"       # 审批拒绝，让 LLM 告知用户

# ========== 构建图 ==========
builder = StateGraph(AgentState)

# 添加节点——技能绑定到图
builder.add_node("think", think_node)
builder.add_node("tools", tool_node)
builder.add_node("human_review", human_review_node)

# 添加边——路线
builder.add_edge(START, "think")

# 条件边——Agent 智能的核心
builder.add_conditional_edges(
    "think",
    route_after_think,
    {"tools": "tools", "human_review": "human_review", END: END}
)
builder.add_conditional_edges(
    "tools",
    route_after_tools,
    {"think": "think"}
)
builder.add_conditional_edges(
    "human_review",
    route_after_review,
    {"tools": "tools", "think": "think"}
)

# 编译——传入存档器
checkpointer = InMemorySaver()
agent = builder.compile(checkpointer=checkpointer)
```

### 编译参数速查

`compile(checkpointer=checkpointer)` 这行开了三个隐藏特性：

1. **持久化存档**：每次节点执行完，State 自动保存
2. **中断系统**：`interrupt()` 依赖存档才能工作——绑定关系
3. **多线程支持**：`thread_id` 让同一个 Agent 同时跑多个对话实例

## 第七阶段：实战运行

```python
import uuid
from langchain.messages import HumanMessage

# 每个对话一个 thread_id——游戏里的独立存档槽
thread_id = str(uuid.uuid4())
config = {"configurable": {"thread_id": thread_id}}

# 开打
print("=" * 50)
print("用户：我想了解一下退款政策")
print("=" * 50)

messages = [HumanMessage(content="我想了解一下退款政策")]
for event in agent.stream({"messages": messages}, config):
    for node_name, node_output in event.items():
        if "messages" in node_output:
            for msg in node_output["messages"]:
                if hasattr(msg, "content") and msg.content:
                    print(f"[{node_name}] {msg.content[:200]}...")
```

### 流式输出机制

`agent.stream()` 返回生成器，每次 yield `{node_name: node_output}`。这意味着：

- 你能看到"哪个节点正在执行"——不再是黑盒
- 你能看到"这个节点改了什么 State"——全部透明
- 你能实时推给前端——"思考中……搜索中……生成中……"

不是简单的 token 流——是关卡级的实时进度。每一帧你都看得见。

## 第八阶段：完整运行演示

用户说："我的订单号是 12345，想退款。"——来看看完整流程：

```
                    ┌─────────────────────┐
用户输入 ──────────→│      think          │
                    │ LLM 分析：需要查     │
                    │ 退款政策 + 计算退款  │
                    └──────┬──────────────┘
                           │ tool_calls detected
                           ↓
                    ┌─────────────────────┐
                    │      tools          │
                    │ 执行 search + calc  │
                    └──────┬──────────────┘
                           │ results returned
                           ↓
                    ┌─────────────────────┐
                    │      think          │
                    │ LLM：可以退款，建议  │
                    │ 创建工单记录         │
                    └──────┬──────────────┘
                           │ create_ticket detected
                           ↓
                    ┌─────────────────────┐
                    │   human_review      │
                    │ ⏸️ 等待人工审批...  │
                    └──────┬──────────────┘
                           │ 审批通过
                           ↓
                    ┌─────────────────────┐
                    │      tools          │
                    │ 执行 create_ticket  │
                    └──────┬──────────────┘
                           │ ticket created
                           ↓
                    ┌─────────────────────┐
                    │      think          │
                    │ "退款已处理，工单    │
                    │  TKT-1234 已创建"   │
                    └──────┬──────────────┘
                           │ no more tool_calls
                           ↓
                          END（通关 ✓）
```

这张图就是整个 Agent 的关卡地图——每一步都可追踪，每条路径都清晰。

## 第九阶段：读档继续

Agent 在 `human_review` 处暂停后，用同一个 `thread_id` 随时读档——五分钟、五小时、五天都没问题：

```python
from langgraph.types import Command

# 用相同的 thread_id 读档
resume_config = {"configurable": {"thread_id": thread_id}}

# 审批通过，继续推进
for event in agent.stream(
    Command(resume={"approved": True, "reason": "确认用户符合退款条件"}),
    resume_config
):
    print(event)
```

不需要重新传入 `messages`——State 已经存档了。Agent 从 `interrupt` 断点自动继续，就像从没暂停过。这就是持久化存档的正确打开方式。

## 通关总结

本局我们通关了——一个可以直接进生产环境调整的 Agent，完整技能包：

1. **装备栏**：3 个工具覆盖搜索、计算、工单
2. **图编排**：3 个节点 + 3 个条件边 = 智能路由
3. **存档系统**：`InMemorySaver` 持久化（生产换 `SqliteSaver`/`PostgresSaver`）
4. **暂停叫人**：敏感操作走人工审批——不让 AI 自己嗨
5. **实时面板**：流式输出每一步进展——透明是信任的基础

进生产的 checklist：
- 把 `InMemorySaver` 换成持久化存储
- 接入真实的工具 API
- 接上 LangSmith 做全链路追踪

LangGraph 的上手难度没有传说中那么高——真正需要想的不是 API，是你 Agent 的关卡设计。前三篇已经把地图给你画好了，这局只是照着跑了一遍。

收工。这局打得不错。

---

**参考来源**
- [LangGraph Quickstart](https://docs.langchain.com/oss/python/langgraph/quickstart)
- [LangGraph Agentic RAG](https://docs.langchain.com/oss/python/langgraph/agentic-rag)
- [LangGraph Reference: StateGraph](https://reference.langchain.com/python/langgraph/graph/state/StateGraph)
- [LangGraph Reference: interrupt](https://reference.langchain.com/python/langgraph/types/interrupt)
