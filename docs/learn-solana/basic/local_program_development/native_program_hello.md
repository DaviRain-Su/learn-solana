---
sidebar_position: 8
sidebar_label: Native Solana合约实现 - hello, World
sidebar_class_name: green
tags:
  - native-program-hello
  - solana
  - program
---

# 🦀 Native Solana合约实现 - Hello, World!

## 🎯 我们要做什么？

今天我们要写你的**第一个 Solana 程序**！就像编程界的传统，我们从 "Hello World" 开始 👋

这个程序虽然简单，但它会让你：
- ✅ 理解 Solana 程序的基本结构
- ✅ 掌握构建和部署流程
- ✅ 学会查看程序日志
- ✅ 成功在区块链上留下你的第一个足迹！

:::tip 🚀 准备工作
开始前，请确保你已经：
- 安装了 [Rust](https://www.rust-lang.org/tools/install) 🦀
- 安装了 [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) 🛠️
- 喝了咖啡 ☕（可选但推荐）
:::

## 📦 Step 1: 创建你的第一个 Rust 项目

### 🎨 初始化项目

让我们创建一个全新的 Rust 项目，就像艺术家准备画布一样：

```bash
# 创建一个库项目（--lib 表示这是一个库，不是可执行文件）
cargo new --lib solana-hello-world-local

# 进入项目目录
cd solana-hello-world-local
```

:::info 💡 小知识
`cargo` 是 Rust 的包管理器，类似于 Node.js 的 `npm` 或 Python 的 `pip`
:::

### 📝 配置 Cargo.toml

现在让我们告诉 Rust 我们需要什么工具。打开 `Cargo.toml` 文件：

```toml
[package]
name = "solana-hello-world-local"
version = "0.1.0"
edition = "2021"

[dependencies]
# 添加 Solana 程序库 - 这是写 Solana 程序的核心依赖
solana-program = "1.16.10"  # 版本号可能会更新

[lib]
# 告诉 Rust 构建成动态库
crate-type = ["cdylib", "lib"]
```

:::caution ⚠️ 版本提醒
不要直接复制版本号！使用以下命令自动添加最新版本：
```bash
cargo add solana-program
```
这样 Cargo 会自动选择兼容的最新版本 🎯
:::

## 🖊️ Step 2: 编写你的第一个 Solana 程序

### 🎭 程序代码解析

打开 `src/lib.rs`，删除默认内容，写入我们的 Hello World 程序：

```rust
// 导入 Solana 程序开发需要的工具
use solana_program::{
    account_info::AccountInfo,  // 账户信息
    entrypoint,                 // 程序入口点宏
    entrypoint::ProgramResult,  // 程序返回类型
    pubkey::Pubkey,             // 公钥类型
    msg                         // 日志宏（就像 console.log）
};

// 🎯 定义程序入口点 - Solana 会从这里开始执行
entrypoint!(process_instruction);

// 🚀 主处理函数 - 所有魔法发生的地方！
pub fn process_instruction(
    program_id: &Pubkey,        // 程序的唯一标识
    accounts: &[AccountInfo],    // 相关账户列表
    instruction_data: &[u8]      // 指令数据（这次我们不用）
) -> ProgramResult {
    // 🎉 在区块链上打印 Hello, world!
    msg!("Hello, world!");

    // 返回成功 ✅
    Ok(())
}
```

:::success 🎊 恭喜！
你刚写完了你的第一个 Solana 程序！虽然简单，但这是通往 Web3 世界的第一步！
:::

## 🏃‍♂️ Step 3: 启动本地测试网络

### 🔧 配置 Solana CLI

首先，让我们把 Solana CLI 指向本地环境：

```bash
# 告诉 Solana CLI："嘿，我们在本地玩！"
solana config set --url localhost

# 确认一下配置是否生效
solana config get
```

你应该看到类似这样的输出：
```
Config File: ~/.config/solana/cli/config.yml
RPC URL: http://localhost:8899  ✅
WebSocket URL: ws://localhost:8900/ (computed)
```

### 🚀 启动本地验证器

打开一个**新的终端窗口**（很重要！），启动本地 Solana 网络：

```bash
# 启动本地测试验证器 - 你的私人区块链！
surfpool start
```

:::tip 💡 Pro Tip
保持这个终端窗口开着！验证器需要持续运行。可以把它想象成你的本地"矿机" ⛏️
:::

看到类似这样的输出就说明成功了：
```
12:48:12.196 Surfnet up and running, emulating local Solana validator (RPC: http://127.0.0.1:8899, WS: ws://127.0.0.1:8900) ⬅️ 这是你的 RPC 地址
12:48:12.196 Connecting surfnet to datasource https://api.mainnet-beta.solana.com
```

## 🔨 Step 4: 构建和部署程序

### 🏗️ 构建程序

回到原来的终端窗口，让我们把 Rust 代码编译成 Solana 可以理解的格式：

```bash
# 构建 Solana 程序（SBF = Solana Binary Format）
cargo build-sbf
```

:::info 🎓 第一次构建？
第一次运行可能需要几分钟，因为需要下载和编译依赖项。去泡杯茶吧！🍵
:::

构建成功后，你会看到：
```
To deploy this program:
  $ solana program deploy /path/to/your/target/deploy/solana_hello_world_local.so
```

### 🚢 部署到区块链

现在是激动人心的时刻 - 部署你的程序！

```bash
# 查看构建产物
ls target/deploy/

# 你应该看到：
# solana_hello_world_local-keypair.json  (程序密钥对)
# solana_hello_world_local.so            (编译后的程序)
```

部署程序：
```bash
# 将你的程序发射到区块链上！🚀
solana program deploy target/deploy/solana_hello_world_local.so
```

成功后，你会得到一个程序 ID：
```
Program Id: 2KgowxogBrGqRcgXQEmqFvC3PGtCu66qERNJevYW8Ajh  ⬅️ 这是你的程序地址！
```

:::success 🎉 里程碑达成！
你的程序现在已经在区块链上了！保存好这个程序 ID，我们马上要用到它。
:::

## 📊 Step 5: 查看程序日志

### 🔍 开启日志监控

在新的终端窗口中，启动日志流：

```bash
# 替换 <PROGRAM_ID> 为你刚才得到的程序 ID
solana logs <PROGRAM_ID>
```

现在这个窗口会实时显示你程序的所有活动！

### 🎮 调用你的程序

有两种方式调用你的程序：

#### 方式 1：使用客户端脚本（推荐）

1. 克隆示例客户端：
```bash
git clone https://github.com/all-in-one-solana/native-hello.git
cd native-hello/hello-frontend
```

2. 更新程序 ID：
打开 `index.ts`，找到这一行：
```typescript
const PROGRAM_ID = new PublicKey("你的程序ID");  // 替换成你的！
```

3. 安装依赖并运行：
```bash
npm install
npm start
```

4. 🎉 查看结果：
- 控制台会输出一个 Solana Explorer 链接
- 点击链接查看你的交易
- 在日志窗口应该能看到 "Hello, world!"

#### 方式 2：使用 Solana CLI（快速测试）

```bash
# 创建一个简单的调用
echo "[]" | solana program invoke <PROGRAM_ID> --fee-payer ~/.config/solana/id.json
```

### 🔎 在 Solana Explorer 查看

1. 打开 [Solana Explorer](https://explorer.solana.com/?cluster=custom)
2. 选择 "Custom RPC URL"
3. 输入 `http://localhost:8899`
4. 搜索你的程序 ID
5. 你能看到程序的所有信息！

## 🎊 恭喜你！

你已经成功：
- ✅ 创建了一个 Solana 程序
- ✅ 部署到了本地测试网
- ✅ 成功调用并看到了日志
- ✅ 成为了一个真正的 Solana 开发者！

### 🚀 下一步

现在你已经掌握了基础，可以尝试：
1. **修改消息** - 让程序输出你的名字
2. **添加参数** - 从 instruction_data 读取数据
3. **处理账户** - 学习如何读写账户数据

:::tip 🌟 学习建议
- 多看日志，理解程序执行流程
- 修改代码，观察变化
- 遇到错误不要慌，查看错误信息
- 加入 Solana 社区，和其他开发者交流！
:::

## 🆘 常见问题

<details>
<summary>❓ 构建失败怎么办？</summary>

检查：
- Rust 版本是否最新：`rustup update`
- Solana CLI 版本：`solana --version`
- 依赖是否正确安装：`cargo clean && cargo build-sbf`
</details>

<details>
<summary>❓ 部署失败提示余额不足？</summary>

本地测试网空投 SOL：
```bash
solana airdrop 2
```
</details>

<details>
<summary>❓ 看不到日志输出？</summary>

确保：
1. 日志命令使用了正确的程序 ID
2. 程序确实被调用了
3. 验证器正在运行
</details>

---

🎯 **现在，去创造更多精彩的 Solana 程序吧！**
