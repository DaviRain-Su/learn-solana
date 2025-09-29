# 🎨 创建奖励代币 - 打造你的专属Token王国! 🚀

> 💡 **本章亮点**: 从零开始创建你的第一个Solana代币，让你的NFT生态更加完整！

---

## 🎯 学习目标

在本教程中，你将学会：
- 🪙 创建自定义SPL代币
- 🖼️ 为代币添加元数据和图片
- 🍬 了解Candy Machine的强大功能
- 📦 管理代币相关文件和配置

## 🌟 为什么选择Candy Machine？

既然我们已经成功铸造了第一个`NFT`（恭喜你！🎉），接下来让我们挑战更有趣的内容——铸造一整个系列的`NFT`！

**Candy Machine的超能力** ⚡：
- 🤖 **机器人防护** - 告别恶意抢购
- 🎲 **安全随机化** - 公平分发，人人有机会
- ⚙️ **自动化铸造** - 像糖果机一样简单便捷
- 🔒 **内置安全性** - Solana生态的信赖之选

> 💡 **小贴士**: Candy Machine就像是NFT世界的自动售货机，投币（SOL）即可获得惊喜（NFT）！

## 📁 项目结构搭建 - 让代码有个温馨的家

### 步骤 1: 创建主文件夹 🏗️

```bash
# 在项目根目录执行
mkdir tokens
cd tokens
```

### 步骤 2: 创建子文件夹 📂

```bash
# 创建两个重要的子文件夹
mkdir bld          # 🏆 Builder奖励代币
mkdir candy-machine # 🍭 NFT相关内容
```

你的目录结构应该像这样：

```bash
📦 项目根目录
 ┣ 📂 styles
 ┣ 📂 tokens
 ┃ ┣ 📂 bld         # 💰 我们的奖励代币
 ┃ ┗ 📂 candy-machine # 🎨 NFT配置
```

> 🎯 **最佳实践**: 保持文件结构清晰，未来的你会感谢现在有条理的自己！

### 步骤 3: 搭建BLD代币框架 🏗️

进入`bld`文件夹，创建必要的文件和文件夹：

```bash
cd bld
mkdir assets    # 🖼️ 存放代币图片
touch index.ts  # 📝 主程序文件
```

最终结构：

```bash
📦 tokens/bld
 ┣ 📂 assets
 ┃ ┗ 🖼️ unicorn.png  # 你的代币图片（可以是任何你喜欢的图片！）
 ┗ 📄 index.ts        # 核心代码
```

> ⚠️ **注意事项**: 确保`index.ts`在`bld`文件夹中，而不是在`assets`里面！

### 步骤 4: 修复红色警告 🚨

看到`index.ts`文件显示红色了吗？别慌！这只是因为它还是空的。让我们添加一些代码让它活起来！

## 💻 编写代码 - 让魔法开始！

### 🎬 初始化设置

首先，在`index.ts`中添加基础代码：

```typescript
// 🚀 导入必要的库 - 我们的工具箱
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { initializeKeypair } from "./initializeKeypair"; // 记得移动这个文件哦！

/**
 * 🎯 主函数 - 一切魔法的起点
 */
async function main() {
  // 🌐 连接到Solana开发网
  const connection = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed" // 添加确认级别，更稳定！
  );

  // 🔑 初始化钱包密钥对
  const payer = await initializeKeypair(connection);

  console.log("✅ 钱包初始化成功!");
  console.log("💰 钱包地址:", payer.publicKey.toString());
}

// 🚀 启动程序
main()
  .then(() => {
    console.log("🎉 程序执行成功！");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 出错了:", error);
    process.exit(1);
  });
```

> 💡 **专业提示**: 别忘了将`initializeKeypair.ts`文件从原位置移动到`bld`文件夹中！

### 🎨 添加代币创建功能

现在，让我们添加创建代币的核心代码。在`main`函数**上方**添加：

```typescript
// 📚 导入更多强大的工具
import * as fs from "fs";
import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
  toMetaplexFile,
} from "@metaplex-foundation/js";

import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";

// 🎨 定义你的代币属性 - 让它独一无二！
const TOKEN_NAME = "BUILD";              // 代币名称
const TOKEN_SYMBOL = "BLD";              // 代币符号（简称）
const TOKEN_DESCRIPTION = "A token for buildoors"; // 描述
const TOKEN_IMAGE_NAME = "unicorn.png";  // 🦄 图片名（换成你喜欢的！）
const TOKEN_IMAGE_PATH = `tokens/bld/assets/${TOKEN_IMAGE_NAME}`;

/**
 * 🪙 创建BLD代币的核心函数
 * @param connection - Solana网络连接
 * @param payer - 付款账户
 */
async function createBldToken(
  connection: web3.Connection,
  payer: web3.Keypair
) {
    console.log("🔨 开始创建代币...");

    // 🏭 步骤1: 创建代币铸造账户
    // 这就像是创建了一个"印钞机"
    const tokenMint = await token.createMint(
        connection,        // 网络连接
        payer,            // 谁来付gas费
        payer.publicKey,  // 铸造权限（谁能印钱）
        payer.publicKey,  // 冻结权限（谁能冻结账户）
        2                 // 小数位数（2位小数，如0.01 BLD）
    );

    console.log("✅ 代币铸造创建成功!");
    console.log("🏷️ 代币地址:", tokenMint.toBase58());

    // 🎨 步骤2: 设置Metaplex（用于管理NFT元数据）
    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(payer))  // 使用我们的身份
        .use(
            bundlrStorage({
                address: "https://devnet.bundlr.network",
                providerUrl: "https://api.devnet.solana.com",
                timeout: 60000,  // 60秒超时，避免网络问题
            })
        );

    console.log("📸 正在上传代币图片...");

    // 🖼️ 步骤3: 读取并上传图片
    const imageBuffer = fs.readFileSync(TOKEN_IMAGE_PATH);
    const file = toMetaplexFile(imageBuffer, TOKEN_IMAGE_NAME);
    const imageUri = await metaplex.storage().upload(file);

    console.log("✅ 图片上传成功!");
    console.log("🔗 图片链接:", imageUri);

    // 📝 步骤4: 上传完整的元数据
    const { uri } = await metaplex
        .nfts()
        .uploadMetadata({
            name: TOKEN_NAME,
            description: TOKEN_DESCRIPTION,
            image: imageUri,
            // 可以添加更多属性，如：
            // external_url: "https://yourwebsite.com",
            // attributes: [...]
        });

    console.log("📋 元数据上传成功!");
    console.log("🔗 元数据链接:", uri);

    // 🔍 步骤5: 找到元数据的存储地址（PDA）
    const metadataPda = metaplex.nfts().pdas().metadata({mint: tokenMint});

    // 📦 步骤6: 准备链上元数据
    const tokenMetadata = {
        name: TOKEN_NAME,
        symbol: TOKEN_SYMBOL,
        uri: uri,
        sellerFeeBasisPoints: 0,  // 版税（0 = 0%）
        creators: null,            // 创作者列表
        collection: null,          // 所属集合
        uses: null,               // 使用限制
    } as DataV2;

    // 🛠️ 步骤7: 创建元数据账户指令
    const instruction = createCreateMetadataAccountV2Instruction(
        {
            metadata: metadataPda,
            mint: tokenMint,
            mintAuthority: payer.publicKey,
            payer: payer.publicKey,
            updateAuthority: payer.publicKey
        },
        {
            createMetadataAccountArgsV2: {
                data: tokenMetadata,
                isMutable: true  // 允许后续更新
            }
        }
    );

    // 📤 步骤8: 发送交易
    console.log("📤 正在发送交易到链上...");
    const transaction = new web3.Transaction();
    transaction.add(instruction);

    const transactionSignature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [payer]
    );

    console.log("🎊 交易成功!");
    console.log("📝 交易签名:", transactionSignature);

    // 💾 步骤9: 保存重要信息到本地
    const cacheData = {
        mint: tokenMint.toBase58(),
        imageUri: imageUri,
        metadataUri: uri,
        tokenMetadata: metadataPda.toBase58(),
        metadataTransaction: transactionSignature,
        createdAt: new Date().toISOString()  // 添加时间戳
    };

    fs.writeFileSync(
        "tokens/bld/cache.json",
        JSON.stringify(cacheData, null, 2)  // 格式化JSON，更易读
    );

    console.log("💾 缓存文件已保存!");

    return tokenMint;  // 返回代币地址，可能后续会用到
}
```

### 🔧 更新主函数

更新你的`main`函数：

```typescript
async function main() {
    console.log("🚀 程序启动!");
    console.log("=".repeat(50));

    // 🌐 连接到Solana开发网
    const connection = new web3.Connection(
        web3.clusterApiUrl("devnet"),
        "confirmed"
    );

    // 🔑 初始化钱包
    const payer = await initializeKeypair(connection);

    // 💰 检查余额
    const balance = await connection.getBalance(payer.publicKey);
    console.log(`💰 钱包余额: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

    if (balance < 0.1 * web3.LAMPORTS_PER_SOL) {
        console.log("⚠️ 余额不足！请先获取一些测试币:");
        console.log("🔗 https://solfaucet.com");
        return;
    }

    // 🪙 创建BLD代币
    await createBldToken(connection, payer);

    console.log("=".repeat(50));
}
```

## 🚀 运行你的代码 - 见证奇迹时刻！

### 📦 安装依赖

```bash
# 安装TypeScript运行器
npm install --save-dev ts-node

# 确保安装了所有依赖
npm install
```

### ⚙️ 配置脚本

在`package.json`的`scripts`部分添加：

```json
{
  "scripts": {
    "create-bld-token": "ts-node ./src/tokens/bld/index.ts",
    "check-balance": "ts-node ./src/check-balance.ts"  // 可选：检查余额脚本
  }
}
```

> 💡 **排错提示**: 如果遇到`Cannot use import statement outside a module`错误，检查`tsconfig.json`并设置`"module": "CommonJS"`

### 🎯 执行创建

```bash
npm run create-bld-token
```

你应该看到类似这样的输出：

```
🚀 程序启动!
==================================================
💰 钱包余额: 2.5 SOL
🔨 开始创建代币...
✅ 代币铸造创建成功!
🏷️ 代币地址: 7xKXt...
📸 正在上传代币图片...
✅ 图片上传成功!
...
🎊 交易成功!
💾 缓存文件已保存!
==================================================
🎉 程序执行成功！
```

## 🔍 验证你的成果

### 📄 检查缓存文件

打开生成的`cache.json`文件，你会看到：

```json
{
  "mint": "7xKXtg2...",
  "imageUri": "https://...",
  "metadataUri": "https://...",
  "tokenMetadata": "9yBVt8...",
  "metadataTransaction": "3xHJ9k...",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

### 🌐 在浏览器中查看

1. 复制`mint`地址
2. 访问 [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
3. 粘贴地址并搜索
4. 欣赏你的代币！🎉

## 🎓 知识要点总结

### 🔑 关键概念

| 概念 | 说明 | 重要性 |
|------|------|--------|
| **Mint Account** | 代币的"印钞机" | ⭐⭐⭐⭐⭐ |
| **Metadata** | 代币的描述信息 | ⭐⭐⭐⭐ |
| **PDA** | 程序派生地址 | ⭐⭐⭐⭐ |
| **Bundlr** | 去中心化存储 | ⭐⭐⭐ |

### 💡 专业建议

1. **图片选择** 🖼️
   - 使用PNG或JPG格式
   - 建议尺寸：512x512像素
   - 文件大小不超过2MB

2. **代币命名** 🏷️
   - Symbol限制在10个字符内
   - Name要有意义且独特
   - Description要清晰明了

3. **安全考虑** 🔒
   - 永远不要分享私钥
   - 使用环境变量存储敏感信息
   - 在主网部署前充分测试

## 🚧 常见问题解决

### ❌ 余额不足
```bash
# 获取测试币
solana airdrop 2 --url devnet
```

### ❌ 网络超时
```typescript
// 增加超时时间
bundlrStorage({
    timeout: 120000  // 120秒
})
```

### ❌ 图片上传失败
- 检查图片路径是否正确
- 确认图片文件存在
- 验证文件格式

## 🎊 恭喜你！

你已经成功创建了自己的SPL代币！🎉 这是构建Solana应用的重要一步。

### 🔥 下一步挑战

- 🎨 创建NFT系列
- 🔄 实现代币质押功能
- 💱 构建代币交换系统
- 🎮 集成到游戏中

记住：**每个伟大的DeFi项目都是从一个简单的代币开始的！** 继续探索，继续创造！🚀

---

> 📚 **延伸阅读**:
> - [Solana代币程序文档](https://spl.solana.com/token)
> - [Metaplex文档](https://docs.metaplex.com/)
> - [Candy Machine指南](https://docs.metaplex.com/programs/candy-machine/)
