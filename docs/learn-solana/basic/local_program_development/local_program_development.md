---
sidebar_position: 7
sidebar_label: 本地开发环境配置
sidebar_class_name: green
tags:
  - local-development
  - solana
  - program
---

# 🚀 本地开发环境配置

## 🎯 概述

欢迎来到 Solana 开发世界！让我们一起搭建你的第一个本地开发环境 🛠️

### 📋 开发流程四步走

1. **🦀 安装基础工具** - [Rust](https://www.rust-lang.org/tools/install) 和 [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
2. **🏃 启动本地验证器** - 使用 `surfpool start`（比传统的 solana-test-validator 更香！）
3. **🔨 构建和部署** - `cargo build-sbf` + `solana program deploy` 一键部署
4. **📊 实时查看日志** - `solana logs` 让你的程序对你说话

:::tip 💡 小贴士
完成环境配置后，你就可以在本地愉快地开发 Solana 程序了，无需网络延迟，调试更方便！
:::

## 🖥️ 环境配置指南

### 系统选择建议

🍎 **Mac** / 🐧 **Linux** 用户：恭喜你，直接开始！
🪟 **Windows** 用户：强烈推荐使用 [WSL](https://docs.microsoft.com/en-us/windows/wsl/install)，获得类 Unix 体验

### 🦀 Step 1: 安装 Rust

Rust 是 Solana 程序的基石，让我们先把它装好：

```bash
# 一键安装 Rust（喝杯咖啡☕，等待安装完成）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

[📖 详细安装指南](https://www.rust-lang.org/tools/install)

### 🛠️ Step 2: 安装 Solana CLI

准备好迎接强大的 Solana 命令行工具了吗？

```bash
# 复制粘贴，回车执行 🚀
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```

:::success ✅ 验证安装
安装完成后，运行 `solana --version` 确认安装成功！
:::

## 🎮 Solana CLI 命令大全

### 🔧 配置管理

#### 查看当前配置
```bash
solana config get
```

这个命令会告诉你：
- 📁 **配置文件位置** - CLI 配置存放地
- 🌐 **RPC URL** - 你连接的网络（本地/测试网/主网）
- 🔌 **WebSocket URL** - 实时事件监听地址
- 🔑 **密钥对路径** - 你的身份标识
- ✅ **Commitment** - 交易确认级别

#### 🔄 切换网络

```bash
# 🏠 本地网络（开发首选）
solana config set --url localhost

# 🧪 测试网（部署测试）
solana config set --url devnet

# 💎 主网（生产环境）
solana config set --url mainnet-beta
```

:::warning ⚠️ 网络访问提醒
由于网络原因，访问 devnet 或 mainnet 可能不稳定。开发时推荐：
- **开发阶段**：使用 localhost
- **生产部署**：使用 [QuickNode](https://www.quicknode.com/) 等 RPC 服务
:::

### 🏃‍♂️ 启动本地验证器

#### 传统方式 vs 现代方式

❌ **传统方式**（不推荐）：
```bash
solana-test-validator  # 功能单一，体验一般
```

✅ **现代方式**（强烈推荐）：
```bash
surfpool start  # 功能强大，体验丝滑 ✨
```

:::info 🏄 为什么选择 Surfpool？
[Surfpool](https://surfpool.run) 提供了更友好的开发体验：
- 更快的启动速度
- 更好的日志展示
- 内置实用工具
- [📚 查看文档](https://docs.surfpool.run)
:::

### 📊 实时日志监控

开启日志监控，让你的程序实时"汇报工作"：

```bash
# 本地日志
solana logs

# 监控特定程序（在 devnet/mainnet 上）
solana logs <PROGRAM_ID>

# 高级技巧：过滤 Token 程序调用
solana logs | grep "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke" -A 5
```

💡 **Pro Tip**: 建议开两个终端窗口，一个跑验证器，一个看日志！

### 🔑 密钥管理速查

#### 创建新密钥对
```bash
# 生成并保存到指定路径
solana-keygen new --outfile ~/my-wallet.json
```

#### 查看当前身份
```bash
# 我是谁？（查看公钥）
solana address

# 我有多少钱？（查看余额）
solana balance

# 我需要测试币！（空投 SOL）
solana airdrop 2  # devnet 每次最多 2 SOL
```

## 🌍 Hello World 三剑客

准备好写你的第一个 Solana 程序了吗？三种方式任你选：

### 🎯 选择你的武器

1. **🛡️ [Native 原生开发](./native_program_hello.md)** - 硬核玩家首选
2. **⚓ [Anchor 框架](./anchor_program_hello.md)** - 新手友好，功能强大
3. **🔷 [Solang Solidity](./solang_program_hello.md)** - Ethereum 开发者的福音

## 🏆 挑战任务

### 🎯 目标
独立创建并部署一个程序到 **Devnet**，实现自定义日志输出！

### 📝 任务清单

1. **切换到 Devnet**
   ```bash
   solana config set --url devnet
   ```

2. **修改客户端连接**
   ```typescript
   // 更新连接到 devnet
   let connection = new web3.Connection(web3.clusterApiUrl("devnet"));
   ```

3. **更新浏览器链接**
   ```typescript
   console.log(
       `🎉 Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
   );
   ```

### 🏅 成功标准
- ✅ 程序成功部署到 Devnet
- ✅ 自定义消息出现在日志中
- ✅ 可以在 Solana Explorer 上查看交易

:::success 🎊 恭喜！
完成这个挑战，你就正式入门 Solana 开发了！
:::

## 📚 学习资源

### 官方文档
- 🦀 [Rust 安装指南](https://www.rust-lang.org/tools/install)
- 🛠️ [Solana 工具套件](https://docs.solana.com/cli/install-solana-cli-tools)
- 🔍 [Solana Explorer](https://explorer.solana.com)

### 社区资源
- 💬 [Solana Discord](https://discord.com/invite/solana)
- 🐦 [Solana Twitter](https://twitter.com/solana)

---

💪 **准备好了吗？让我们开始你的 Solana 开发之旅吧！**
