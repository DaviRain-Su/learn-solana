---
sidebar_position: 7
sidebar_label: 本地开发环境配置
sidebar_class_name: green
tags:
  - local-development
  - solana
  - program
---

# 本地开发环境配置

## 概述

本地开发的基本流程如下

1. 安装 [Rust](https://www.rust-lang.org/tools/install) 和 [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
2. 使用`Solana CLI`，你可以使用**`solana-test-validator`**命令运行本地测试验证器，初始化账户等基本操作
3. 使用 `cargo build-sbf` 和 `solana program deploy` 命令在本地构建和部署程序
4. 使用 `solana logs` 命令查看程序日志

## 本地环境配置

`Solana Program` 使用`Rust` 编写，调试运行。建议使用`Unix` 系列系统: `Mac` , `Linux` 等。
如果很不幸你使用的是`Windows`,建议使用 `WSL` 下载`Ubuntu` ,并在其中完成运行。

### 在Windows上设置（带有Linux）

#### 下载Windows子系统Linux（WSL）

如果你使用的是`Windows`电脑，建议使用`Windows`子系统`Linux（WSL）`来构建你的`Solana`程序。

打开**管理员**权限的`PowerShell`或`Windows`命令提示符，检查`Windows`版本

```bash
winver
```

如果你使用的是`Windows 10`版本`2004`及更高版本（`Build 19041`及更高版本）或`Windows 11`，请运行以下命令。

```bash
wsl --install
```

如果你正在使用较旧版本的`Windows`，请按照[这里](https://docs.microsoft.com/en-us/windows/wsl/install-manual)的说明进行操作。

你可以在[这里](https://learn.microsoft.com/en-us/windows/wsl/install)阅读更多关于安装`WS`L的信息。

#### 下载Ubuntu

接下来，在这里[下载`Ubuntu`](https://apps.microsoft.com/store/detail/ubuntu-2004/9N6SVWS3RX71?hl=en-us&gl=US)。`Ubuntu`提供了一个终端，可以让你在`Windows`电脑上运行`Linux`。这就是你将运行`Solana CLI`命令的地方。

#### 下载 Rust（适用于 WSL）

接下来，打开`Ubuntu`终端并使用以下命令下载适用于`WSL`的`Rust`。你可以在[此处](https://www.rust-lang.org/learn/get-started)阅读有关下载`Rust`的更多信息。

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### 下载 Solana CLI

现在我们准备下载适用于`Linux`的`Solana CLI`。请在`Ubuntu`终端中运行以下命令。你可以[在此处阅读](https://docs.solana.com/cli/install-solana-cli-tools)有关下载`Solana CLI`的更多信息。

```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.16.10/install)"
```

### 在 macOS 上进行设置

#### 下载 Rust

首先，按照[这里](https://www.rust-lang.org/tools/install)的说明下载`Rust`。

#### 下载Solana CLI

接下来，在终端中运行以下命令下载`Solana CLI`。

```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.16.10/install)"
```

你可以在[这里](https://docs.solana.com/cli/install-solana-cli-tools)了解更多关于下载`Solana CLI`的信息。

## Solana CLI基础

`Solana CLI`是一个命令行界面工具，提供了一系列命令，用于与`Solana`集群进行交互。

在本课程中，我们将介绍一些最常见的命令，但你始终可以通过运行`solana --help`来查看所有可能的`Solana CLI`命令列表。

### Solana CLI 配置

`Solana CLI`存储了一些配置设置，这些设置会影响某些命令的行为。你可以使用以下命令查看当前的配置：

```bash
solana config get
```

`solana config get`命令将返回以下内容：
- 配置文件 - `Solana CLI`所在的文件位于你的计算机上
- `RPC URL` - 你正在使用的端点，将你连接到本地主机、开发网络或主网络
- `WebSocket URL` - 监听来自目标集群的事件的`WebSocket`（在设置`RPC URL`时计算）
- 密钥对路径 - 在运行`Solana CLI`子命令时使用的密钥对路径
- `Commitment` - 提供了网络确认的度量，并描述了一个区块在特定时间点上的最终性程度

你可以随时使用`solana config set`命令更改你的`Solana CLI`配置，然后跟上你想要更新的设置。

最常见的更改将是你要定位的集群。使用`solana config set --url`命令更改`RPC URL`。

```bash
# localhost
solana config set --url localhost

# devnet
solana config set --url devnet

# mainnet-beta
solana config set --url mainnet-beta

```

:::caution
由于某些你知道的原因，devnet 或者 mainnet 可能访问不佳。建议开发过程中使用 localhost 网络。最后需要部署应用的使用，建议使用 [quicknode](https://www.quicknode.com/) 的rpc 节点。
:::

同样地，你可以使用`solana config set --keypair`命令来更改密钥对路径。当运行命令时，`Solana CLI`将使用指定路径下的密钥对。

```bash
solana config set --keypair ~/<FILE_PATH>
```

### 测试验证器

你会发现在测试和调试时运行本地验证器比部署到开发网络更有帮助。

你可以使用`solana-test-validator`命令运行本地测试验证器。该命令会创建一个持续运行的进程，需要单独的命令行窗口。

> 这里不再建议使用`solana-test-validator`来启动本地测试验证器，而是选择[`surfpool`](https://surfpool.run)。 这里是他的[文档网站](https://docs.surfpool.run)，很简单实用 安装之后直接就能启动。

### Stream program logs

通常在打开一个新的控制台并在测试验证器旁边运行`solana logs`命令会很有帮助。这将创建另一个持续进行的进程，用于流式传输与你配置的集群相关的日志。

如果你的CLI配置指向本地主机，则日志将始终与你创建的测试验证器相关联，但你也可以从其他集群（如`Devnet`和`Mainnet Beta`）流式传输日志。当从其他集群流式传输日志时，你需要在命令中包含一个程序`ID`，以限制你所看到的日志仅针对你的特定程序。


### 密钥相关

你可以使用`solana-keygen new --outfile`命令生成一个新的密钥对，并指定文件路径以存储该密钥对。

```bash
solana-keygen new --outfile ~/<FILE_PATH>
```

有时候你可能需要检查你的配置指向哪个密钥对。要查看当前在`solana config`中设置的密钥对的公钥，请使用`solana address`命令。

```bash
solana address
```

要查看在`Solana`配置中设置的当前密钥对的`SOL`余额，请使用`solana balance`命令。

```bash
solana balance
```

要在`Devnet`或`localhost`上进行`SOL`的空投，请使用`solana airdrop`命令。请注意，在`Devnet`上，每次空投限制为2个SOL。

```bash
solana airdrop 2
```

在你开发和测试本地环境中的程序时，很可能会遇到由以下原因引起的错误：

- 使用错误的密钥对
- 没有足够的SOL来部署你的程序或执行交易
- 指向错误的集群

到目前为止，我们已经介绍了一些`CLI`命令，这些命令应该能帮助你快速解决那些问题。

## hello world 程序

- [Native Solana合约实现 - hello, World](./native_program_hello.md)
- [Anchor 合约框架实现 - hello, World 🌍 With PDA
](./anchor_program_hello.md)
- [Solang solidity合约实现 - hello, World](./solang_program_hello.md)

## 挑战

现在轮到你独立构建一些东西了。尝试创建一个新的程序，将你自己的消息打印到程序日志中。这次将你的程序部署到`Devnet`而不是本地主机。

记得使用`solana config set --url`命令将你的`RPC URL`更新为`Devnet`。

只要你将连接和[Solana Explorer](https://explorer.solana.com)的`URL`更新为指向`Devnet`而不是`localhost`，你就可以使用与演示中相同的客户端脚本来调用该程序。

```ts
let connection = new web3.Connection(web3.clusterApiUrl("devnet"));
```

```ts
console.log(
    `Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
);
```

你还可以打开一个单独的命令行窗口，并使用`solana logs | grep " invoke" -A` 。在`Devnet`上使用`solana logs`时，你必须指定程序`ID`。否则，`solana logs`命令将返回来自`Devnet`的持续日志流。例如，你可以按照以下步骤监视对`Token`程序的调用，并显示每个调用的前5行日志：

```bash
solana logs | grep "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke" -A 5
```

## 官方参考文档

- [安装Rust](https://www.rust-lang.org/tools/install)
- [安装Solana工具套件](https://docs.solana.com/cli/install-solana-cli-tools)
