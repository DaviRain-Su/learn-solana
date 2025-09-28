---
sidebar_position: 9
sidebar_label: Anchor 合约框架实现 - hello, World 🌍 With PDA
sidebar_class_name: green
tags:
  - anchor-program-hello
  - solana
  - program
---

# ⚓ Anchor 合约框架实现 - Hello, World 🌍 With PDA

## 🎯 学习目标

欢迎来到 **Anchor** 的世界！Anchor 是 Solana 开发的瑞士军刀 🔪

在这个教程中，你将学会：
- 🏗️ 使用 Anchor 框架快速构建 Solana 程序
- 💾 创建和管理链上数据存储（PDA）
- 📝 实现数据的初始化和更新
- 🧪 编写和运行测试脚本

:::info 🤔 什么是 Anchor？
**Anchor** 之于 Solana，就像 **React** 之于网页开发：
- 提供了更简洁的语法
- 自动处理很多底层细节
- 让你专注于业务逻辑
- 内置测试框架
:::

## 🛠️ Step 0: 安装 Anchor

### 📦 安装前准备

确保你已经安装了：
- ✅ Rust（Solana 程序的语言）
- ✅ Solana CLI（与区块链交互的工具）
- ☕ 一杯咖啡（提神醒脑）

### 🚀 安装 Anchor

按照 [Anchor 官方安装指南](https://www.anchor-lang.com/docs/installation) 进行安装。

安装完成后，让我们验证一下：

```bash
# 检查 Anchor 是否安装成功
anchor --version
```

期望输出：
```
anchor-cli 0.28.0  # 版本号可能不同
```

:::success 🎉 恭喜！
如果看到版本号，说明 Anchor 已经准备就绪！让我们开始创造奇迹吧！
:::

## 🏗️ Step 1: 创建 Anchor 项目

### 🎨 初始化项目

Anchor 提供了强大的脚手架工具，一条命令搞定项目初始化：

```bash
# 创建名为 hello_world 的 Anchor 项目
anchor init hello_world

# 进入项目目录
cd hello_world
```

:::tip 💡 项目结构解析
```
hello_world/
├── Anchor.toml          # 项目配置文件（类似 package.json）
├── programs/            # 智能合约代码
│   └── hello_world/
│       └── src/
│           └── lib.rs   # 主程序文件
├── tests/              # 测试脚本
└── target/             # 构建产物
```
:::

## 📝 Step 2: 编写智能合约

### 🎯 程序功能设计

我们的程序将实现：
1. **初始化** - 创建一个存储账户并写入初始数据
2. **更新** - 修改存储账户中的数据
3. **PDA** - 使用程序派生地址确保唯一性

### 💻 完整代码实现

打开 `programs/hello_world/src/lib.rs`，替换为以下代码：

```rust
use anchor_lang::prelude::*;

// 🆔 声明程序 ID（部署后会自动更新）
declare_id!("22sSSi7GtQgwXFcjJmGNNKSCLEsiJxyYLFfP3CMWeMLj");

// 🎮 程序主模块 - 所有指令的入口
#[program]
pub mod hello_world {
    use super::*;

    // 📝 初始化指令 - 创建新的 HelloWorld 账户
    pub fn initialize(ctx: Context<Initialize>, data: String) -> Result<()> {
        // 🖨️ 打印传入的数据到日志
        msg!("初始化数据: {}", data);

        // 💾 保存数据到账户
        let hello_world = &mut ctx.accounts.hello_world;
        hello_world.authority = *ctx.accounts.authority.key;
        hello_world.data = data;

        msg!("✅ HelloWorld 账户创建成功！");
        Ok(())
    }

    // 🔄 更新指令 - 修改已存在的数据
    pub fn update(ctx: Context<UpdateHelloWorld>, data: String) -> Result<()> {
        let hello_world = &mut ctx.accounts.hello_world;

        msg!("旧数据: {}", hello_world.data);
        hello_world.data = data;
        msg!("新数据: {}", hello_world.data);

        msg!("✅ 数据更新成功！");
        Ok(())
    }
}

// 🏗️ 初始化上下文 - 定义初始化需要的账户
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,                               // 初始化新账户
        payer = authority,                 // 谁付钱
        space = 8 + HelloWorld::INIT_SPACE,// 分配空间
        seeds = [b"hello-world"],          // PDA 种子
        bump                                // PDA bump
    )]
    pub hello_world: Account<'info, HelloWorld>,

    #[account(mut)]
    pub authority: Signer<'info>,          // 签名者（付钱的人）

    pub system_program: Program<'info, System>,  // 系统程序
}

// 🔄 更新上下文 - 定义更新需要的账户
#[derive(Accounts)]
pub struct UpdateHelloWorld<'info> {
    #[account(
        mut,                        // 可变账户
        seeds = [b"hello-world"],  // 使用相同的种子找到账户
        bump
    )]
    pub hello_world: Account<'info, HelloWorld>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

// 📦 数据结构 - 定义存储在链上的数据
#[account]
#[derive(InitSpace)]  // 自动计算所需空间
pub struct HelloWorld {
    pub authority: Pubkey,     // 32 字节
    #[max_len(100)]           // 最大 100 字符
    pub data: String,          // 动态大小
}

// ❌ 错误码定义
#[error_code]
pub enum ErrorCode {
    #[msg("你没有权限执行此操作")]
    Unauthorized,
    #[msg("无法获取 bump")]
    CannotGetBump,
}
```

:::info 🎓 PDA 是什么？
**PDA (Program Derived Address)** 是 Solana 的独特设计：
- 🔑 由程序控制的特殊地址（没有私钥）
- 🎯 使用种子（seeds）生成，保证唯一性
- 💾 用于存储程序数据
- 🔒 只有对应的程序才能修改

在我们的例子中，`[b"hello-world"]` 是种子，确保每个程序只有一个 HelloWorld 账户。
:::

## 🧪 Step 3: 编写测试脚本

### 📋 测试代码

创建文件 `tests/hello_world.ts`，添加以下测试代码：

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloWorld } from "../target/types/hello_world";

describe("🌍 Hello World 测试套件", () => {
  // 🔧 配置 Provider
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // 📦 获取程序实例
  const program = anchor.workspace.HelloWorld as Program<HelloWorld>;
  const authority = provider.wallet.publicKey;

  // 🔑 计算 PDA 地址
  let [helloWorld] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("hello-world")],  // 种子
    program.programId               // 程序 ID
  );

  // ✅ 测试 1: 初始化
  it("🎉 初始化 HelloWorld 账户", async () => {
    console.log("📍 PDA 地址:", helloWorld.toBase58());

    // 发送初始化交易
    const tx = await program.methods
      .initialize("Hello, Solana! 🚀")
      .accounts({
        helloWorld,
        authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("📝 交易签名:", tx);

    // 获取账户数据
    const accountState = await program.account.helloWorld.fetch(helloWorld);
    console.log("📊 账户状态:", {
      authority: accountState.authority.toBase58(),
      data: accountState.data
    });

    // 断言检查
    expect(accountState.data).toBe("Hello, Solana! 🚀");
  });

  // ✅ 测试 2: 更新数据
  it("🔄 更新 HelloWorld 数据", async () => {
    const newData = "Hello from Anchor! ⚓";

    // 发送更新交易
    const tx = await program.methods
      .update(newData)
      .accounts({
        helloWorld,
        authority,
      })
      .rpc();

    console.log("📝 更新交易签名:", tx);

    // 验证更新
    const accountState = await program.account.helloWorld.fetch(helloWorld);
    console.log("📊 更新后状态:", accountState.data);

    expect(accountState.data).toBe(newData);
  });

  // ✅ 测试 3: 读取数据
  it("📖 读取账户数据", async () => {
    const accountState = await program.account.helloWorld.fetch(helloWorld);
    console.log("🔍 当前数据:", accountState.data);
    console.log("👤 权限所有者:", accountState.authority.toBase58());
  });
});
```

## 🚀 Step 4: 运行本地测试网络

### 🔧 配置 Solana CLI

```bash
# 指向本地网络
solana config set --url localhost

# 确认配置
solana config get
```

### 🏃‍♂️ 启动本地验证器

在**新的终端窗口**中运行：

```bash
# 启动本地 Solana 网络
solana-test-validator
```

:::tip 💡 Pro Tips
推荐使用 3 个终端窗口：
1. 🏃 运行验证器
2. 📊 查看日志：`solana logs`
3. 🛠️ 执行命令
:::

## 🔨 Step 5: 构建和部署

### 🏗️ 构建程序

```bash
# 使用 Anchor 构建（比 cargo build-sbf 更智能）
anchor build
```

构建成功后，你会看到：
- ✅ 程序编译完成
- ✅ IDL 文件生成（接口定义）
- ✅ TypeScript 类型生成

### 🚢 部署到区块链

```bash
# 部署程序
anchor deploy
```

输出示例：
```
Deploying workspace: http://localhost:8899
Upgrade authority: 7cVfgArCheMR6Cs4t6vz5rfnqd56vZq4ndaBrY5xkxXy
Deploying program "hello_world"...
Program path: target/deploy/hello_world.so
Program Id: 2KgowxogBrGqRcgXQEmqFvC3PGtCu66qERNJevYW8Ajh  ⬅️ 你的程序 ID！

Deploy success ✅
```

:::success 🎊 部署成功！
你的 Anchor 程序已经在链上了！程序 ID 是它的唯一标识。
:::

## 📊 Step 6: 运行测试和查看日志

### 🔍 开启日志监控

新开一个终端：

```bash
# 监听你的程序日志
solana logs <PROGRAM_ID>
```

### 🧪 运行测试

```bash
# 执行所有测试
anchor test --skip-local-validator
```

:::info 💡 为什么要 skip-local-validator？
因为我们已经手动启动了验证器，所以跳过 Anchor 自动启动的步骤。
:::

### 🎯 查看结果

成功运行后，你会看到：
```
🌍 Hello World 测试套件
  ✓ 🎉 初始化 HelloWorld 账户 (425ms)
  ✓ 🔄 更新 HelloWorld 数据 (403ms)
  ✓ 📖 读取账户数据 (401ms)

3 passing (1s)
```

## 🌐 在浏览器中查看

1. 打开 [Solana Explorer](https://explorer.solana.com/?cluster=custom)
2. 选择 **Custom RPC URL**
3. 输入 `http://localhost:8899`
4. 搜索你的程序 ID 或交易签名

## 🎊 恭喜完成！

你已经成功掌握了：
- ⚓ **Anchor 框架基础** - 现代 Solana 开发方式
- 🔑 **PDA 概念** - 程序控制的账户
- 💾 **数据存储** - 链上数据管理
- 🧪 **测试驱动开发** - 专业的开发流程

### 🚀 进阶挑战

1. **添加权限控制** 🔒
   - 只允许 authority 更新数据

2. **多账户管理** 📚
   - 使用不同的种子创建多个 HelloWorld 账户

3. **添加更多字段** 📝
   - 时间戳、计数器、状态等

## 🆘 常见问题解答

<details>
<summary>❓ Anchor build 失败？</summary>

检查：
- Node.js 版本 >= 16
- Anchor 版本是否最新：`anchor --version`
- 清理重试：`anchor clean && anchor build`
</details>

<details>
<summary>❓ 找不到 program.methods？</summary>

确保：
1. 先运行 `anchor build` 生成 IDL
2. 检查 `target/types/` 目录是否有类型文件
3. TypeScript 配置正确
</details>

<details>
<summary>❓ PDA 账户已存在错误？</summary>

这说明账户已经初始化过了。解决方案：
- 修改种子创建新 PDA
- 或清理本地账本：`solana-test-validator --reset`
</details>

---

🎯 **下一步：探索更复杂的 Anchor 程序，构建真正的 DApp！** 🚀
