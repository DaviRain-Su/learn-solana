---
sidebar_position: 78
sidebar_label: 🪙 构建代币铸造器
sidebar_class_name: green
---

# 🪙 构建代币铸造器 - 让你的NFT变成印钞机！

## 🎯 欢迎来到DeFi的核心地带！

嘿，Web3建设者们！👋 经过了漫长的旅程，今天我们要给NFT质押系统加上**最激动人心的功能** —— **代币奖励系统**！想象一下，你的NFT不仅被质押了，还能源源不断地产生代币奖励！💰

> 🎯 **今日任务：** 完成质押系统的代币功能，让质押者能够真正赚取奖励！

### 🗺️ 今日路线图

```
🚀 起点：获取起始代码
    ↓
📦 Step 1: 设置项目环境
    ↓
🔐 Step 2: 实现质押功能（委托+冻结）
    ↓
💰 Step 3: 实现兑换功能（铸造奖励）
    ↓
🔓 Step 4: 实现解除质押（解冻+撤销）
    ↓
🧪 Step 5: 测试所有功能
    ↓
🎉 终点：完整的质押奖励系统！
```

---

## 🏗️ 项目初始化

### 📥 获取起始代码

```bash
# 🎯 克隆起始代码（不包含代币功能）
git clone https://github.com/Unboxed-Software/solana-nft-staking-program
cd solana-nft-staking-program
git checkout solution-sans-tokens

# 📦 安装依赖
npm install

# 🔨 构建程序
cargo build-sbf
```

> 🆕 **新发现！** 你会看到一个 `TS` 文件夹，里面包含了所有TypeScript客户端代码！

### 📁 项目结构概览

```
📦 solana-nft-staking-program/
├── 📂 src/                 # Rust程序代码
│   ├── 📜 processor.rs     # 核心处理逻辑
│   ├── 📜 instruction.rs   # 指令定义
│   └── 📜 state.rs        # 状态管理
├── 📂 ts/                  # TypeScript客户端
│   ├── 📂 src/
│   │   ├── 📜 index.ts     # 主测试文件
│   │   └── 📂 utils/
│   │       ├── 📜 instructions.ts  # 指令构建
│   │       └── 📜 constants.ts     # 常量定义
└── 📂 target/             # 构建输出
```

### 🔧 重要配置更新

在 `ts/src/utils/constants.ts` 中，程序ID从密钥文件读取：

```typescript
// 🔑 从部署的密钥文件读取程序ID
const string = fs.readFileSync(
  "../target/deploy/solana_nft_staking_program-keypair.json",
  "utf8"
)

// 🎯 解析密钥并提取公钥
const secretKey = Uint8Array.from(JSON.parse(string))
export const PROGRAM_ID = Keypair.fromSecretKey(secretKey).publicKey

// 💡 这样每次部署后程序ID会自动更新！
```

---

## 🚀 Step 0: 测试基础功能

在开始之前，让我们先确保基础功能正常：

```bash
# 📍 Step 1: 构建并部署程序
cargo build-sbf
solana program deploy target/deploy/solana_nft_staking_program.so

# 📍 Step 2: 切换到TS目录
cd ts

# 📍 Step 3: 运行测试
npm run start

# ⏳ 耐心等待... 这可能需要1-2分钟
# ✅ 你应该看到: stakes、redeems、unstakes 的输出
```

> 🎉 **成功了？** 太棒了！让我们开始添加代币功能！

---

## 🔐 Step 1: 实现质押功能（Stake）

### 📝 更新processor.rs

首先添加必要的导入：

```rust
// 🎯 添加在文件顶部
use mpl_token_metadata::ID as mpl_metadata_program_id;  // Metaplex元数据程序
use spl_token::ID as spl_token_program_id;              // SPL Token程序

// 🔧 更新现有导入，添加 invoke
use solana_program::program::{invoke, invoke_signed};   // 添加了invoke！
```

### 🎮 更新process_stake函数

在 `process_stake` 函数中添加新账户：

```rust
// 📦 添加代币相关账户
pub fn process_stake(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    // ... 现有账户 ...

    // 🆕 新增账户 - 用于处理NFT和代币
    let nft_mint = next_account_info(account_info_iter)?;          // 🪙 NFT铸币地址
    let nft_edition = next_account_info(account_info_iter)?;       // 📜 NFT版本信息
    let stake_state = next_account_info(account_info_iter)?;       // 📊 质押状态
    let program_authority = next_account_info(account_info_iter)?; // 🔑 程序权限PDA
    let token_program = next_account_info(account_info_iter)?;     // 🎯 Token程序
    let metadata_program = next_account_info(account_info_iter)?;  // 📚 元数据程序

    // ... 继续处理逻辑 ...
}
```

### 🤝 实现委托授权

```rust
// 🎯 Step 1: 委托NFT给程序
// 这允许程序代表用户操作NFT
msg!("🤝 批准委托...");
invoke(
    &spl_token::instruction::approve(
        &spl_token_program_id,      // Token程序ID
        nft_token_account.key,      // NFT代币账户
        program_authority.key,      // 被委托方（我们的程序）
        user.key,                   // 所有者
        &[user.key],               // 签名者
        1,                         // 数量（NFT总是1）
    )?,
    &[
        nft_token_account.clone(),
        program_authority.clone(),
        user.clone(),
        token_program.clone(),
    ],
)?;
msg!("✅ 委托批准成功！");
```

### 🧊 实现NFT冻结

```rust
// 🔑 Step 2: 派生程序权限PDA
let (delegated_auth_pda, delegate_bump) = Pubkey::find_program_address(
    &[b"authority"],  // 种子
    program_id
);

// ✅ 验证PDA
if delegated_auth_pda != *program_authority.key {
    msg!("❌ PDA验证失败！");
    return Err(StakeError::InvalidPda.into());
}

// 🧊 Step 3: 冻结NFT（防止转移）
msg!("🧊 冻结NFT代币账户...");
invoke_signed(
    &mpl_token_metadata::instruction::freeze_delegated_account(
        mpl_metadata_program_id,    // 元数据程序
        *program_authority.key,     // 权限账户
        *nft_token_account.key,     // NFT账户
        *nft_edition.key,          // 版本账户
        *nft_mint.key,             // 铸币账户
    ),
    &[
        program_authority.clone(),
        nft_token_account.clone(),
        nft_edition.clone(),
        nft_mint.clone(),
        metadata_program.clone(),
    ],
    &[&[b"authority", &[delegate_bump]]],  // 🔑 PDA签名种子
)?;
msg!("✅ NFT已成功冻结！不能再转移了！");
```

### 📝 更新TypeScript客户端

在 `ts/src/utils/instructions.ts` 中更新 `createStakingInstruction`：

```typescript
// 🆕 添加新参数
export function createStakingInstruction(
    // ... 现有参数 ...
    nftMint: PublicKey,         // 🪙 NFT铸币地址
    nftEdition: PublicKey,      // 📜 NFT版本
    tokenProgram: PublicKey,    // 🎯 Token程序
    metadataProgram: PublicKey, // 📚 元数据程序
): TransactionInstruction {

    // 🔑 派生权限PDA
    const [delegateAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("authority")],
        programId
    );

    // 📦 更新账户列表（顺序很重要！）
    const accounts = [
        // ... 现有账户 ...
        {
            pubkey: nftMint,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: nftEdition,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: delegateAuthority,
            isWritable: true,  // 需要可写权限
            isSigner: false,
        },
        {
            pubkey: tokenProgram,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: metadataProgram,
            isWritable: false,
            isSigner: false,
        },
    ];

    // ... 返回指令 ...
}
```

---

## 💰 Step 2: 实现兑换功能（Redeem）

### 🎯 更新process_redeem函数

```rust
// 📦 添加新账户
pub fn process_redeem(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    // ... 现有账户 ...

    // 🆕 代币铸造相关账户
    let stake_mint = next_account_info(account_info_iter)?;        // 🪙 质押代币铸币
    let stake_authority = next_account_info(account_info_iter)?;   // 🔑 铸币权限
    let user_stake_ata = next_account_info(account_info_iter)?;    // 💳 用户代币账户
    let token_program = next_account_info(account_info_iter)?;     // 🎯 Token程序

    // 🔑 验证铸币权限PDA
    let (stake_auth_pda, auth_bump) = Pubkey::find_program_address(
        &[b"mint"],  // 种子
        program_id
    );

    if *stake_authority.key != stake_auth_pda {
        msg!("❌ 无效的铸币权限！");
        return Err(StakeError::InvalidPda.into());
    }

    // 🧮 计算奖励数量
    // 暂时使用简单的公式：100 * 质押时间
    let redeem_amount = 100 * unix_time;
    msg!("💰 计算奖励: {} 代币", redeem_amount);

    // 🪙 铸造代币奖励
    msg!("🎁 铸造奖励代币...");
    invoke_signed(
        &spl_token::instruction::mint_to(
            token_program.key,       // Token程序
            stake_mint.key,          // 铸币账户
            user_stake_ata.key,      // 目标账户
            stake_authority.key,     // 权限账户
            &[stake_authority.key],  // 签名者
            redeem_amount.try_into().unwrap(),  // 数量
        )?,
        &[
            stake_mint.clone(),
            user_stake_ata.clone(),
            stake_authority.clone(),
            token_program.clone(),
        ],
        &[&[b"mint", &[auth_bump]]],  // 🔑 PDA签名
    )?;
    msg!("✅ 成功铸造 {} 代币！", redeem_amount);

    Ok(())
}
```

### 📝 更新TypeScript兑换指令

```typescript
// 🆕 更新createRedeemInstruction
export function createRedeemInstruction(
    // ... 现有参数 ...
    mint: PublicKey,           // 🪙 代币铸币
    userStakeATA: PublicKey,   // 💳 用户ATA
    tokenProgram: PublicKey,   // 🎯 Token程序
): TransactionInstruction {

    // 🔑 派生铸币权限PDA
    const [mintAuth] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint")],
        programId
    );

    // 📦 添加新账户
    const accounts = [
        // ... 现有账户 ...
        {
            pubkey: mint,
            isWritable: true,  // 铸币需要写权限
            isSigner: false,
        },
        {
            pubkey: mintAuth,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: userStakeATA,
            isWritable: true,  // 接收代币需要写权限
            isSigner: false,
        },
        {
            pubkey: tokenProgram,
            isWritable: false,
            isSigner: false,
        },
    ];

    // ... 返回指令 ...
}
```

---

## 🔓 Step 3: 实现解除质押（Unstake）

解除质押是**质押和兑换的组合**，需要：
1. 🧊 解冻NFT
2. 🔓 撤销委托
3. 💰 铸造最终奖励

```rust
pub fn process_unstake(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    // 📦 需要所有相关账户
    let nft_mint = next_account_info(account_info_iter)?;
    let nft_edition = next_account_info(account_info_iter)?;
    // ... stake_state ...
    let program_authority = next_account_info(account_info_iter)?;
    let stake_mint = next_account_info(account_info_iter)?;
    let stake_authority = next_account_info(account_info_iter)?;
    let user_stake_ata = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let metadata_program = next_account_info(account_info_iter)?;

    // 🔑 验证两个PDA
    let (delegated_auth_pda, delegate_bump) =
        Pubkey::find_program_address(&[b"authority"], program_id);
    let (stake_auth_pda, auth_bump) =
        Pubkey::find_program_address(&[b"mint"], program_id);

    // ✅ 验证PDA
    if delegated_auth_pda != *program_authority.key {
        return Err(StakeError::InvalidPda.into());
    }
    if *stake_authority.key != stake_auth_pda {
        return Err(StakeError::InvalidPda.into());
    }

    // 🔥 Step 1: 解冻NFT
    msg!("🔥 解冻NFT代币账户...");
    invoke_signed(
        &mpl_token_metadata::instruction::thaw_delegated_account(
            mpl_metadata_program_id,
            *program_authority.key,
            *nft_token_account.key,
            *nft_edition.key,
            *nft_mint.key,
        ),
        &[
            program_authority.clone(),
            nft_token_account.clone(),
            nft_edition.clone(),
            nft_mint.clone(),
            metadata_program.clone(),
        ],
        &[&[b"authority", &[delegate_bump]]],
    )?;

    // 🔓 Step 2: 撤销委托
    msg!("🔓 撤销委托权限...");
    invoke(
        &spl_token::instruction::revoke(
            &spl_token_program_id,
            nft_token_account.key,
            user.key,
            &[user.key],
        )?,
        &[
            nft_token_account.clone(),
            user.clone(),
            token_program.clone(),
        ],
    )?;

    // 💰 Step 3: 铸造最终奖励
    let redeem_amount = 100 * unix_time;
    msg!("💎 铸造最终奖励: {} 代币", redeem_amount);

    invoke_signed(
        &spl_token::instruction::mint_to(
            token_program.key,
            stake_mint.key,
            user_stake_ata.key,
            stake_authority.key,
            &[stake_authority.key],
            redeem_amount.try_into().unwrap(),
        )?,
        &[
            stake_mint.clone(),
            user_stake_ata.clone(),
            stake_authority.clone(),
            token_program.clone(),
        ],
        &[&[b"mint", &[auth_bump]]],
    )?;

    msg!("✅ NFT已解除质押，奖励已发放！");
    Ok(())
}
```

---

## 🧪 Step 4: 完整测试

### 🎯 更新测试文件

在 `ts/src/index.ts` 中：

```typescript
// 🪙 设置质押代币
const stakeMint = new PublicKey("YOUR_BLD_TOKEN_MINT_ADDRESS");

// 💳 获取或创建用户的代币账户
const userStakeATA = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    stakeMint,
    user.publicKey
);

// 🧪 测试兑换功能
await testRedeem(
    connection,
    user,
    nft,
    stakeMint,
    userStakeATA.address
);

// 🧪 测试解除质押
await testUnstaking(
    connection,
    user,
    nft,
    stakeMint,
    userStakeATA.address
);
```

### 🏭 创建BLD代币

在前端项目的 `tokens/bld/index.ts`：

```typescript
// 🔑 派生铸币权限PDA
const [mintAuth] = await web3.PublicKey.findProgramAddress(
    [Buffer.from("mint")],
    programId
);

// 🪙 创建代币后，转移铸币权限给程序
await token.setAuthority(
    connection,
    payer,
    tokenMint,
    payer.publicKey,
    token.AuthorityType.MintTokens,
    mintAuth  // 新的铸币权限
);
```

### 🚀 运行完整测试

```bash
# 📍 Step 1: 创建BLD代币
npm run create-bld-token

# 📋 Step 2: 从cache.json获取铸币地址
# 查看 tokens/bld/cache.json

# 📍 Step 3: 更新stakeMint地址
# 在 ts/src/index.ts 中更新

# 📍 Step 4: 运行测试
cd ts
npm run start

# 🎉 成功输出应该包含：
# ✅ Initialized
# ✅ Staked
# ✅ Redeemed
# ✅ Unstaked
```

---

## 💡 实用技巧与最佳实践

### 🎯 技巧1：调试技巧

```rust
// 🔍 添加详细的日志
msg!("📊 当前状态: {:?}", account_data);
msg!("⏰ 时间差: {} 秒", unix_time);
msg!("💰 奖励计算: {} 代币", redeem_amount);
```

### 🎯 技巧2：错误处理

```rust
// ✅ 始终验证关键账户
if delegated_auth_pda != *program_authority.key {
    msg!("❌ 期望: {}", delegated_auth_pda);
    msg!("❌ 实际: {}", program_authority.key);
    return Err(StakeError::InvalidPda.into());
}
```

### 🎯 技巧3：账户顺序

> ⚠️ **重要：** Rust和TypeScript中的账户顺序必须**完全一致**！

```
检查清单：
□ Rust中的顺序
□ TypeScript指令中的顺序
□ 测试调用中的顺序
```

---

## 🚨 常见问题解决

### ❌ 问题1：PDA验证失败

```rust
// 🔍 检查种子是否一致
// Rust: &[b"authority"]
// TS: [Buffer.from("authority")]
```

### ❌ 问题2：权限错误

```rust
// ✅ 确保账户标记正确
// isWritable: true  // 需要修改的账户
// isSigner: true     // 需要签名的账户
```

### ❌ 问题3：代币未收到

```typescript
// 🔍 检查ATA是否正确创建
console.log("💳 用户ATA:", userStakeATA.address.toString());
```

---

## 🎓 知识总结

### 📚 你掌握的技能

```
┌────────────────────────────────────┐
│      🏆 质押系统大师成就              │
├────────────────────────────────────┤
│ ✅ NFT委托和冻结                     │
│ ✅ 代币铸造和分发                    │
│ ✅ PDA权限管理                      │
│ ✅ 跨程序调用(CPI)                   │
│ ✅ 完整的质押流程                    │
└────────────────────────────────────┘
```

### 🌟 核心概念回顾

1. **委托（Delegate）** - 允许程序操作NFT
2. **冻结（Freeze）** - 防止NFT转移
3. **铸造（Mint）** - 创建新代币作为奖励
4. **PDA签名** - 程序自主执行操作

---

## 🚀 下一步

恭喜你！🎉 你已经构建了一个**完整的NFT质押奖励系统**！这是DeFi世界的核心功能之一！

### 🎯 可以尝试的改进

1. **动态奖励率** - 根据质押时长调整奖励
2. **等级系统** - 质押越久，奖励越高
3. **批量操作** - 一次质押多个NFT
4. **UI集成** - 连接到前端界面

> 💬 **记住：** 这是一个复杂的系统，多练习几次会让你成为真正的Solana大师！

---

**继续前进，构建下一个DeFi独角兽！** 🦄🚀✨
