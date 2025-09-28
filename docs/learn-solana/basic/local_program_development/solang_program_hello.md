---
sidebar_position: 10
sidebar_label: Solang solidity合约实现 - hello, World
sidebar_class_name: green
tags:
  - solang-program-hello
  - solana
  - program
---

# 🔷 Solang Solidity合约实现 - Hello, World

## 🎯 为什么选择 Solang？

欢迎来到 **Solana + Solidity** 的奇妙世界！🌟

你是否是一位 **Ethereum 开发者**，想要享受 Solana 的：
- ⚡ **极速交易**（400ms 区块时间）
- 💰 **超低手续费**（< $0.01）
- 🚀 **高吞吐量**（65,000 TPS）

但又不想从零学习 Rust？**Solang 就是你的救星！** 🦸‍♂️

:::info 🤔 什么是 Solang？
**Solang** 是一个 Solidity 编译器，让你能够：
- 📝 用熟悉的 **Solidity** 编写代码
- 🎯 部署到高性能的 **Solana** 网络
- 🔄 重用现有的 Solidity 知识和经验
- 🌉 成为连接 EVM 和 Solana 生态的桥梁
:::

## 🛠️ 环境安装配置

### 📋 前置准备清单

在开始这段激动人心的旅程前，请确保你已经准备好：

✅ **必需工具**：
- 🦀 [Rust](https://www.rust-lang.org/tools/install) - Solana 的基础
- 📦 [Node.js](https://nodejs.org/en) - 运行测试脚本
- 🪟 Windows 用户需要 [WSL](https://solana.com/developers/guides/setup-local-development#windows-users-only)

### 🚀 四步安装大法

#### Step 1: 安装 Solana 工具套件

```bash
# 安装 Solana CLI（包含最新版 Solang）
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# 验证安装
solana --version
solang --version  # 应该看到 v0.3.1 或更高版本
```

#### Step 2: 安装 Anchor 框架

```bash
# 安装兼容 Solang 的 Anchor 版本
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked --force

# 验证安装
anchor --version  # 应该 >= 0.28
```

:::tip 💡 为什么需要 Anchor？
Anchor 从 0.28 版本开始原生支持 Solang！它提供：
- 📐 项目脚手架
- 🧪 测试框架
- 🔧 自动化工具
:::

#### Step 3: VSCode 扩展配置

如果你使用 VSCode（强烈推荐！），请：
1. 安装 [Solang 扩展](https://marketplace.visualstudio.com/items?itemName=solang.solang)
2. **禁用**其他 Solidity 扩展（避免冲突）

#### Step 4: 验证环境

```bash
# 快速检查所有工具是否就绪
solana --version && anchor --version && solang --version
```

看到三个版本号？恭喜！环境配置完成！🎉

## 🏗️ 创建第一个 Solang 项目

### 🎨 初始化项目

使用 Anchor 的魔法命令创建 Solang 项目：

```bash
# 注意 --solidity 参数！这是关键 🔑
anchor init my_first_solang --solidity

# 进入项目目录
cd my_first_solang
```

### 📁 项目结构解析

```
my_first_solang/
├── 📄 Anchor.toml         # 项目配置
├── 📁 solidity/           # Solidity 合约目录 ⭐
│   └── starter.sol        # 你的第一个 Solang 合约
├── 📁 tests/              # 测试脚本
│   └── starter.ts         # TypeScript 测试
└── 📁 target/             # 构建产物
```

## 📝 深入理解链上程序

### 🔍 合约代码解析

打开 `./solidity/starter.sol`，让我们逐行理解这个合约：

```solidity
// 🏷️ 程序 ID 注解 - 指定部署地址
@program_id("F1ipperKF9EfD821ZbbYjS319LXYiBmjhzkkf5a26rC")
contract starter {
    // 💾 状态变量 - 存储在链上
    bool private value = true;

    // 🏗️ 构造函数 - 初始化合约
    @payer(payer)  // 💰 谁来付账单？
    constructor(address payer) {
        print("Hello, World!");  // 📢 打印到程序日志
    }

    // 🔄 翻转函数 - 改变状态
    function flip() public {
        value = !value;  // true ↔️ false
    }

    // 👀 读取函数 - 获取当前值
    function get() public view returns (bool) {
        return value;
    }
}
```

### 🎯 关键差异：Solang vs 传统 Solidity

#### 1️⃣ **程序 ID 注解** 🏷️

```solidity
@program_id("F1ipperKF9EfD821ZbbYjS319LXYiBmjhzkkf5a26rC")
```

:::info 💡 理解程序 ID
- 在 **EVM**：合约地址在部署时生成
- 在 **Solana**：你可以预先指定程序地址
- 这个地址是你程序的"家"🏠
:::

#### 2️⃣ **付费者注解** 💰

```solidity
@payer(payer)  // 指定谁为存储付费
constructor(address payer) { ... }
```

:::warning ⚠️ 重要概念：租金经济
Solana 的存储不是免费的！
- 📦 存储数据需要支付"租金"（SOL）
- 👤 `@payer` 指定谁来支付
- 💡 这确保了网络的可持续性
:::

#### 3️⃣ **状态存储机制** 💾

这是最大的差异！让我们用图表理解：

**EVM 方式**：
```
智能合约
├── 代码逻辑
└── 状态变量 ✅（都在一起）
```

**Solana 方式**：
```
程序（Program）
└── 代码逻辑 ✅

数据账户（Data Account）
└── 状态变量 ✅（分开存储）
```

:::tip 🎓 为什么要分开？
- **并行处理**：不同账户可以并行访问
- **灵活性**：一个程序可以管理多个数据账户
- **效率**：只加载需要的数据
:::

## 🧪 测试文件详解

### 📋 测试代码剖析

让我们看看 `./tests/starter.ts` 如何与合约交互：

```typescript
import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { Starter } from "../target/types/starter"

describe("🌟 Solang Starter 测试", () => {
  // 🔧 配置 Provider - 连接到网络
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  // 🔑 生成数据账户密钥对
  const dataAccount = anchor.web3.Keypair.generate()
  const wallet = provider.wallet

  // 📦 获取程序实例
  const program = anchor.workspace.Starter as Program<Starter>

  it("🎉 初始化并测试合约", async () => {
    // 1️⃣ 调用构造函数 - 创建数据账户
    console.log("📝 调用构造函数...")
    const tx = await program.methods
      .new(wallet.publicKey)              // 构造函数参数
      .accounts({
        dataAccount: dataAccount.publicKey // 指定数据账户
      })
      .signers([dataAccount])             // 签名验证
      .rpc()

    console.log("✅ 交易签名:", tx)

    // 2️⃣ 读取初始状态
    console.log("👀 读取初始值...")
    const val1 = await program.methods
      .get()
      .accounts({ dataAccount: dataAccount.publicKey })
      .view()  // 只读，不需要交易

    console.log("📊 初始状态:", val1)  // true

    // 3️⃣ 翻转状态
    console.log("🔄 翻转值...")
    await program.methods
      .flip()
      .accounts({ dataAccount: dataAccount.publicKey })
      .rpc()

    // 4️⃣ 验证改变
    console.log("👀 读取新值...")
    const val2 = await program.methods
      .get()
      .accounts({ dataAccount: dataAccount.publicKey })
      .view()

    console.log("📊 新状态:", val2)  // false

    // 5️⃣ 断言测试
    console.assert(val1 === true, "初始值应该是 true")
    console.assert(val2 === false, "翻转后应该是 false")
    console.log("✅ 所有测试通过！")
  })
})
```

### 🎯 关键概念理解

#### 数据账户创建流程

```typescript
// 1. 生成密钥对（地址）
const dataAccount = anchor.web3.Keypair.generate()

// 2. 在构造函数中创建账户
.new(wallet.publicKey)  // wallet 付钱
.accounts({ dataAccount: dataAccount.publicKey })  // 账户地址
.signers([dataAccount])  // 证明我们拥有这个地址
```

:::info 💡 为什么需要签名？
签名证明你拥有这个地址的私钥，防止他人随意创建账户到你的地址上！
:::

## 🚀 运行和测试

### 🏃‍♂️ 一键运行测试

```bash
# Anchor 会自动：
# 1. 启动本地验证器
# 2. 构建合约
# 3. 部署到本地网络
# 4. 运行测试
anchor test
```

### ✅ 期望输出

```bash
🌟 Solang Starter 测试
📝 调用构造函数...
✅ 交易签名: 2x7jh3yka9LU6ZeJLUZNNDJSzq6vdUAXk3mUKuP1MYwr...
👀 读取初始值...
📊 初始状态: true
🔄 翻转值...
👀 读取新值...
📊 新状态: false
✅ 所有测试通过！
    ✔ 🎉 初始化并测试合约 (782ms)
```

### 📊 查看程序日志

程序日志保存在 `./.anchor/program-logs/` 目录：

```bash
# 查看日志
cat .anchor/program-logs/*.log
```

你会看到：
```
Program F1ipperKF9EfD821ZbbYjS319LXYiBmjhzkkf5a26rC invoke [1]
Program log: Hello, World! 🎉
Program F1ipperKF9EfD821ZbbYjS319LXYiBmjhzkkf5a26rC consumed 12345 units
```

## 🎊 恭喜完成！

你已经成功：
- ✅ 配置了 Solang 开发环境
- ✅ 理解了 Solana 与 EVM 的关键差异
- ✅ 创建并部署了你的第一个 Solang 合约
- ✅ 编写并运行了测试脚本

### 🌟 你学到了什么？

1. **程序 vs 合约** - Solana 的术语差异
2. **数据账户** - 状态存储的独特方式
3. **租金经济** - 为存储付费的机制
4. **Anchor + Solang** - 强大的开发组合

## 🚀 下一步挑战

### 📚 进阶学习资源

1. **官方示例库** 📦
   - [Solang 程序示例](https://github.com/solana-developers/program-examples)
   - 包含 `basics` 和 `tokens` 实现

2. **挑战任务** 🎯
   - 添加更多状态变量（如计数器）
   - 实现访问控制
   - 创建多个数据账户

3. **社区支持** 💬
   - [Solana Stack Exchange](https://solana.stackexchange.com/) - 问答社区
   - [Hyperledger Discord](https://discord.com/invite/hyperledger) - Solang 维护者

## 🆘 常见问题解答

<details>
<summary>❓ Solang 支持所有 Solidity 特性吗？</summary>

大部分支持！但有些差异：
- ✅ 基本语法、数据类型、函数
- ⚠️ 某些 EVM 特定功能可能不同
- 📖 查看 [Solang 文档](https://solang.readthedocs.io/) 了解详情
</details>

<details>
<summary>❓ 为什么需要数据账户？</summary>

这是 Solana 的设计哲学：
- 程序是无状态的（只有逻辑）
- 数据存在独立账户中
- 实现更好的并行处理
</details>

<details>
<summary>❓ 如何调试 Solang 合约？</summary>

几个技巧：
1. 使用 `print()` 输出日志
2. 查看 `.anchor/program-logs/`
3. 使用 `anchor test --detach` 保持验证器运行
</details>

---

🎯 **准备好了吗？让 Solidity 在 Solana 上飞起来！** 🚀
