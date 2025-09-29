---
sidebar_position: 63
sidebar_label: 🎮 构建NFT质押程序
sidebar_class_name: green
tags:
  - nft-staking
  - solana
  - native-solana-program
  - program
---

# 🎮 构建NFT质押程序

## 🚀 欢迎来到质押帝国！

嘿，未来的区块链大师！👋 今天我们要一起打造一个**超级酷炫的NFT质押程序**！想象一下，你的NFT不再只是静静地躺在钱包里，而是能够为你**赚取被动收入**！就像把你的数字艺术品变成了一台**印钞机**！💰

> 🎯 **今日任务：** 编写一个完整的质押程序（暂时不涉及代币转账，那是下周的大餐！）

---

## 🛠️ 准备工作站

### 🎪 第一步：搭建开发环境

让我们开始这段激动人心的旅程！首先，打开你的浏览器，进入 [**Solana Playground**](https://beta.solpg.io/?utm_source=buildspace.so&utm_medium=buildspace_project) —— 这是我们的**云端工作室**！

```bash
📝 快速指南：
1. 点击 "Create a New Project" 🆕
2. 给项目起个酷炫的名字（比如 "NFT-Staking-Master"）✨
3. 选择 "Native" 模板 📦
```

### 📁 第二步：创建项目结构

现在，让我们像**建筑大师**一样搭建我们的项目框架！

```
🏗️ 项目结构预览：
┌─────────────────────────────┐
│ 📂 src/                     │
│   ├── 📜 lib.rs            │ ← 指挥中心
│   ├── 📜 entrypoint.rs     │ ← 程序入口
│   ├── 📜 error.rs          │ ← 错误管理
│   ├── 📜 instruction.rs    │ ← 指令定义
│   ├── 📜 processor.rs      │ ← 业务逻辑
│   └── 📜 state.rs          │ ← 状态存储
└─────────────────────────────┘
```

> 💡 **Pro Tip:** 文件命名要清晰！好的命名就像给代码贴上了标签，让你半夜调试时也能快速找到问题！

---

## 📝 开始编码之旅！

### 🎯 配置模块中心 (lib.rs)

让我们从**指挥中心**开始！在 `lib.rs` 中添加以下代码：

```rust
// 🏠 lib.rs - 我们程序的家
// 这里是所有模块的集合地，就像一个购物中心的导航图！

pub mod entrypoint;    // 🚪 程序的大门
pub mod error;         // ⚠️ 错误处理专家
pub mod instruction;   // 📋 指令管理员
pub mod processor;     // 🧠 业务处理大脑
pub mod state;         // 💾 状态存储仓库
```

### 🚪 设置程序入口 (entrypoint.rs)

接下来，让我们打造程序的**欢迎大厅**：

```rust
// 🎪 entrypoint.rs - 程序的红地毯入口
// 所有的交易都从这里开始它们的旅程！

use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey
};
use crate::processor;

// 🎯 这个神奇的宏标记了我们程序的入口点
// 就像在门上挂了个"营业中"的牌子！
entrypoint!(process_instruction);

// 🚀 主处理函数 - 所有魔法发生的地方
pub fn process_instruction(
    program_id: &Pubkey,        // 🆔 我们程序的身份证
    accounts: &[AccountInfo],    // 📦 相关账户的集合
    instruction_data: &[u8]      // 📨 指令数据包
) -> ProgramResult {
    // 🎭 将请求转发给处理器
    processor::process_instruction(program_id, accounts, instruction_data)?;
    Ok(())
}
```

### 🧠 创建处理器骨架 (processor.rs)

现在创建我们的**业务逻辑中心**：

```rust
// 🎮 processor.rs - 程序的大脑
// 这里是所有业务逻辑的家！

use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    pubkey::Pubkey
};

// 🎯 主处理函数 - 临时版本
// 稍后我们会让它变得更强大！
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    // 🚧 施工中...很快就会有精彩内容！
    Ok(())
}
```

> 🔔 **注意：** 现在编译会有警告，别担心！我们马上就会填充这些空白部分！

---

## 📋 定义指令系统 (instruction.rs)

### 🎯 创建指令枚举

让我们定义程序能够执行的**四大绝技**：

```rust
// 📜 instruction.rs - 指令指挥部
// 定义用户可以执行的所有操作！

use solana_program::{ program_error::ProgramError };

// 🎮 质押指令枚举 - 我们程序的技能树！
pub enum StakeInstruction {
    /// 🏗️ 初始化质押账户
    /// 为用户创建一个全新的质押保险箱
    InitializeStakeAccount,

    /// ⚡ 质押NFT
    /// 将NFT锁定并开始赚取奖励
    Stake,

    /// 💰 兑换奖励
    /// 领取累积的奖励代币
    Redeem,

    /// 🔓 解除质押
    /// 取回NFT并领取最终奖励
    Unstake
}

impl StakeInstruction {
    /// 📦 解包函数 - 将字节数据转换为指令
    /// 就像拆快递包裹一样！
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // 🎯 获取第一个字节作为指令类型
        let (&variant, _rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        // 🎭 根据数字匹配对应的指令
        Ok(match variant {
            0 => Self::InitializeStakeAccount,  // 🏗️ 创建账户
            1 => Self::Stake,                    // ⚡ 开始质押
            2 => Self::Redeem,                   // 💰 领取奖励
            3 => Self::Unstake,                  // 🔓 解除质押
            _ => {
                // ❌ 未知指令 - 拒绝执行！
                return Err(ProgramError::InvalidInstructionData)
            }
        })
    }
}
```

---

## 🎮 实现处理器逻辑

### 🧩 更新处理器框架

让我们让处理器**活起来**：

```rust
// 🎯 processor.rs - 完整版
use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,  // 📢 用于输出调试信息
};
use crate::instruction::StakeInstruction;

// 🚀 主处理函数 - 路由中心
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    // 📦 解包指令数据
    let instruction = StakeInstruction::unpack(instruction_data)?;

    // 🎭 根据指令类型路由到对应的处理函数
    match instruction {
        StakeInstruction::InitializeStakeAccount => {
            msg!("🏗️ 初始化质押账户...");
            process_initialize_stake_account(program_id, accounts)
        },
        StakeInstruction::Stake => {
            msg!("⚡ 质押NFT...");
            process_stake(program_id, accounts)
        },
        StakeInstruction::Redeem => {
            msg!("💰 兑换奖励...");
            process_redeem(program_id, accounts)
        },
        StakeInstruction::Unstake => {
            msg!("🔓 解除质押...");
            process_unstake(program_id, accounts)
        },
    }
}

// 🏗️ 初始化质押账户
// 创建一个独特的PDA来存储质押信息
fn process_initialize_stake_account(
    program_id: &Pubkey,
    accounts: &[AccountInfo]
) -> ProgramResult {
    // 📝 解析账户列表
    let account_info_iter = &mut accounts.iter();

    // 👤 用户账户（支付创建费用）
    let user = next_account_info(account_info_iter)?;

    // 🖼️ NFT代币账户
    let nft_token = next_account_info(account_info_iter)?;

    // 💾 质押状态账户（PDA）
    let stake_state = next_account_info(account_info_iter)?;

    // ⚙️ 系统程序（用于创建账户）
    let system_program = next_account_info(account_info_iter)?;

    msg!("✅ 账户解析完成！");
    Ok(())
}

// ⚡ 质押处理函数
fn process_stake(
    program_id: &Pubkey,
    accounts: &[AccountInfo]
) -> ProgramResult {
    msg!("🚧 质押功能开发中...");
    Ok(())
}

// 💰 兑换处理函数
fn process_redeem(
    program_id: &Pubkey,
    accounts: &[AccountInfo]
) -> ProgramResult {
    msg!("🚧 兑换功能开发中...");
    Ok(())
}

// 🔓 解除质押处理函数
fn process_unstake(
    program_id: &Pubkey,
    accounts: &[AccountInfo]
) -> ProgramResult {
    msg!("🚧 解除质押功能开发中...");
    Ok(())
}
```

---

## 📊 定义状态结构 (state.rs)

### 🗃️ 创建数据模型

```rust
// 💾 state.rs - 数据存储中心
// 定义我们要在链上存储的所有信息！

use borsh::{BorshSerialize, BorshDeserialize};
use solana_program::{
    program_pack::{IsInitialized, Sealed},
    pubkey::Pubkey,
    clock::UnixTimestamp,
};

// 👤 用户质押信息结构体
// 这就像用户的质押档案！
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct UserStakeInfo {
    /// 🔄 是否已初始化
    pub is_initialized: bool,

    /// 🖼️ NFT代币账户地址
    pub token_account: Pubkey,

    /// ⏰ 质押开始时间
    pub stake_start_time: UnixTimestamp,

    /// 🕐 上次兑换时间
    pub last_stake_redeem: UnixTimestamp,

    /// 👤 用户公钥
    pub user_pubkey: Pubkey,

    /// 📊 质押状态
    pub stake_state: StakeState,
}

// 📏 计算存储空间大小
impl UserStakeInfo {
    /// 🧮 数据大小计算：
    /// - is_initialized: 1字节 (bool)
    /// - token_account: 32字节 (Pubkey)
    /// - stake_start_time: 8字节 (i64)
    /// - last_stake_redeem: 8字节 (i64)
    /// - user_pubkey: 32字节 (Pubkey)
    /// - stake_state: 1字节 (enum)
    /// 总计 = 1 + 32 + 8 + 8 + 32 + 1 = 82字节
    pub const SIZE: usize = 82;
}

// 🔐 实现必要的trait
impl Sealed for UserStakeInfo {}

impl IsInitialized for UserStakeInfo {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

// 📊 质押状态枚举
#[derive(BorshSerialize, BorshDeserialize, Debug, PartialEq)]
pub enum StakeState {
    /// ⚡ 已质押
    Staked,
    /// 🔓 未质押
    Unstaked,
}
```

---

## ⚠️ 自定义错误系统 (error.rs)

### 🚨 定义友好的错误提示

```rust
// 🚨 error.rs - 错误管理中心
// 让错误信息更友好、更有帮助！

use solana_program::{program_error::ProgramError};
use thiserror::Error;

// 🎭 自定义错误枚举
#[derive(Debug, Error)]
pub enum StakeError {
    /// 😴 账户未初始化
    #[error("账户还在睡觉呢！请先初始化账户 💤")]
    UninitializedAccount,

    /// 🔍 PDA不匹配
    #[error("PDA验证失败！这不是你要找的机器人 🤖")]
    InvalidPda,

    /// 🖼️ 无效的代币账户
    #[error("代币账户无效！请检查NFT地址 🎨")]
    InvalidTokenAccount,

    /// 📊 无效的质押账户
    #[error("质押账户无效！你确定这是你的账户吗？🤔")]
    InvalidStakeAccount,
}

// 🔄 错误转换魔法
impl From<StakeError> for ProgramError {
    fn from(e: StakeError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
```

> 🎉 **成就解锁：** 基础框架搭建完成！现在编译应该没有错误了！

---

## 🚀 实现核心功能

### 🏗️ 完整的初始化函数

```rust
// 📝 processor.rs - 初始化质押账户完整实现

use solana_program::{
    account_info::{ AccountInfo, next_account_info },
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
    sysvar::{ rent::Rent, Sysvar },
    clock::Clock,
    program_pack::IsInitialized,
    system_instruction,
    program::invoke_signed,
    borsh::try_from_slice_unchecked,
    program_error::ProgramError
};
use borsh::BorshSerialize;
use crate::instruction::StakeInstruction;
use crate::error::StakeError;
use crate::state::{ UserStakeInfo, StakeState };

fn process_initialize_stake_account(
    program_id: &Pubkey,
    accounts: &[AccountInfo]
) -> ProgramResult {
    msg!("🏗️ 开始创建质押账户...");

    // 📝 Step 1: 解析账户
    let account_info_iter = &mut accounts.iter();
    let user = next_account_info(account_info_iter)?;
    let nft_token_account = next_account_info(account_info_iter)?;
    let stake_state = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    msg!("👤 用户地址: {}", user.key);
    msg!("🖼️ NFT账户: {}", nft_token_account.key);

    // 🔐 Step 2: 生成PDA（程序派生地址）
    // PDA = 用户地址 + NFT地址的独特组合
    let (stake_state_pda, bump_seed) = Pubkey::find_program_address(
        &[user.key.as_ref(), nft_token_account.key.as_ref()],
        program_id
    );

    // ✅ Step 3: 验证PDA
    if stake_state_pda != *stake_state.key {
        msg!("❌ PDA不匹配！期望: {}, 实际: {}", stake_state_pda, stake_state.key);
        return Err(StakeError::InvalidPda.into());
    }

    // 💰 Step 4: 计算租金
    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(UserStakeInfo::SIZE);
    msg!("💵 需要租金: {} lamports", rent_lamports);

    // 🏗️ Step 5: 创建账户
    msg!("📝 创建PDA账户: {}", stake_state_pda);
    invoke_signed(
        &system_instruction::create_account(
            user.key,                              // 付款方
            stake_state.key,                        // 新账户
            rent_lamports,                          // 租金
            UserStakeInfo::SIZE.try_into().unwrap(), // 大小
            program_id                              // 所有者
        ),
        &[user.clone(), stake_state.clone(), system_program.clone()],
        &[&[
            user.key.as_ref(),
            nft_token_account.key.as_ref(),
            &[bump_seed],  // 🔑 PDA种子
        ]],
    )?;

    // 💾 Step 6: 初始化账户数据
    let mut account_data = try_from_slice_unchecked::<UserStakeInfo>(
        &stake_state.data.borrow()
    ).unwrap();

    // 🔍 Step 7: 检查是否已初始化
    if account_data.is_initialized() {
        msg!("⚠️ 账户已经初始化过了！");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    // 📝 Step 8: 设置初始值
    account_data.token_account = *nft_token_account.key;
    account_data.user_pubkey = *user.key;
    account_data.stake_state = StakeState::Unstaked;  // 初始状态：未质押
    account_data.is_initialized = true;

    // 💾 Step 9: 序列化并保存
    account_data.serialize(&mut &mut stake_state.data.borrow_mut()[..])?;

    msg!("✅ 质押账户创建成功！");
    Ok(())
}
```

### ⚡ 实现质押功能

```rust
// ⚡ 质押NFT的完整实现
fn process_stake(
    program_id: &Pubkey,
    accounts: &[AccountInfo]
) -> ProgramResult {
    msg!("⚡ 开始质押NFT...");

    // 📝 解析账户
    let account_info_iter = &mut accounts.iter();
    let user = next_account_info(account_info_iter)?;
    let nft_token_account = next_account_info(account_info_iter)?;
    let stake_state = next_account_info(account_info_iter)?;

    // 🔐 验证PDA
    let (stake_state_pda, _bump_seed) = Pubkey::find_program_address(
        &[user.key.as_ref(), nft_token_account.key.as_ref()],
        program_id,
    );

    if stake_state_pda != *stake_state.key {
        msg!("❌ PDA验证失败！");
        return Err(StakeError::InvalidPda.into());
    }

    // 📖 读取账户数据
    let mut account_data = try_from_slice_unchecked::<UserStakeInfo>(
        &stake_state.data.borrow()
    ).unwrap();

    // ✅ 验证账户已初始化
    if !account_data.is_initialized() {
        msg!("❌ 账户未初始化！请先初始化账户");
        return Err(ProgramError::UninitializedAccount.into());
    }

    // ⏰ 获取当前时间
    let clock = Clock::get()?;
    msg!("🕐 当前时间戳: {}", clock.unix_timestamp);

    // 📝 更新质押信息
    account_data.token_account = *nft_token_account.key;
    account_data.user_pubkey = *user.key;
    account_data.stake_state = StakeState::Staked;  // 🔥 标记为已质押！
    account_data.stake_start_time = clock.unix_timestamp;
    account_data.last_stake_redeem = clock.unix_timestamp;

    // 💾 保存更新
    account_data.serialize(&mut &mut stake_state.data.borrow_mut()[..])?;

    msg!("🎉 NFT质押成功！开始赚取奖励！");
    Ok(())
}
```

### 💰 实现兑换功能

```rust
// 💰 兑换奖励的完整实现
fn process_redeem(
    program_id: &Pubkey,
    accounts: &[AccountInfo]
) -> ProgramResult {
    msg!("💎 开始兑换奖励...");

    // 📝 解析账户
    let account_info_iter = &mut accounts.iter();
    let user = next_account_info(account_info_iter)?;
    let nft_token_account = next_account_info(account_info_iter)?;
    let stake_state = next_account_info(account_info_iter)?;

    // 🔐 验证PDA
    let (stake_state_pda, _bump_seed) = Pubkey::find_program_address(
        &[user.key.as_ref(), nft_token_account.key.as_ref()],
        program_id,
    );

    if stake_state_pda != *stake_state.key {
        msg!("❌ PDA验证失败！");
        return Err(StakeError::InvalidPda.into());
    }

    // ✍️ 验证签名
    if !user.is_signer {
        msg!("❌ 缺少用户签名！");
        return Err(ProgramError::MissingRequiredSignature);
    }

    // 📖 读取账户数据
    let mut account_data = try_from_slice_unchecked::<UserStakeInfo>(
        &stake_state.data.borrow()
    ).unwrap();

    // 🔍 多重验证
    if !account_data.is_initialized() {
        msg!("❌ 账户未初始化！");
        return Err(ProgramError::UninitializedAccount.into());
    }

    if account_data.stake_state != StakeState::Staked {
        msg!("❌ NFT未处于质押状态！");
        return Err(ProgramError::InvalidArgument);
    }

    if *user.key != account_data.user_pubkey {
        msg!("❌ 用户不匹配！");
        return Err(StakeError::InvalidStakeAccount.into());
    }

    if *nft_token_account.key != account_data.token_account {
        msg!("❌ NFT账户不匹配！");
        return Err(StakeError::InvalidTokenAccount.into());
    }

    // 🧮 计算奖励
    let clock = Clock::get()?;
    let time_elapsed = clock.unix_timestamp - account_data.last_stake_redeem;

    // 🎯 奖励公式：每秒1个代币（简化版）
    let redeem_amount = time_elapsed;
    msg!("⏱️ 质押时长: {} 秒", time_elapsed);
    msg!("💰 可兑换奖励: {} 代币", redeem_amount);

    // 📝 更新最后兑换时间
    account_data.last_stake_redeem = clock.unix_timestamp;
    account_data.serialize(&mut &mut stake_state.data.borrow_mut()[..])?;

    msg!("🎉 成功兑换 {} 个代币！", redeem_amount);
    Ok(())
}
```

### 🔓 实现解除质押功能

```rust
// 🔓 解除质押的完整实现
fn process_unstake(
    program_id: &Pubkey,
    accounts: &[AccountInfo]
) -> ProgramResult {
    msg!("🔓 开始解除质押...");

    // 📝 解析账户
    let account_info_iter = &mut accounts.iter();
    let user = next_account_info(account_info_iter)?;
    let nft_token_account = next_account_info(account_info_iter)?;
    let stake_state = next_account_info(account_info_iter)?;

    // 🔐 验证PDA
    let (stake_state_pda, _bump_seed) = Pubkey::find_program_address(
        &[user.key.as_ref(), nft_token_account.key.as_ref()],
        program_id,
    );

    if stake_state_pda != *stake_state.key {
        msg!("❌ PDA验证失败！");
        return Err(StakeError::InvalidPda.into());
    }

    // ✍️ 验证签名
    if !user.is_signer {
        msg!("❌ 缺少用户签名！");
        return Err(ProgramError::MissingRequiredSignature);
    }

    // 📖 读取账户数据
    let mut account_data = try_from_slice_unchecked::<UserStakeInfo>(
        &stake_state.data.borrow()
    ).unwrap();

    // 🔍 验证状态
    if !account_data.is_initialized() {
        msg!("❌ 账户未初始化！");
        return Err(ProgramError::UninitializedAccount.into());
    }

    if account_data.stake_state != StakeState::Staked {
        msg!("❌ NFT未处于质押状态！");
        return Err(ProgramError::InvalidArgument)
    }

    // 🧮 计算最终奖励
    let clock = Clock::get()?;
    let time_elapsed = clock.unix_timestamp - account_data.last_stake_redeem;
    let redeem_amount = time_elapsed;

    msg!("⏱️ 最后质押时长: {} 秒", time_elapsed);
    msg!("💰 最终奖励: {} 代币", redeem_amount);

    // 🔄 重置质押状态
    msg!("📝 更新质押状态为：未质押");
    account_data.stake_state = StakeState::Unstaked;

    // 💾 保存更新
    account_data.serialize(&mut &mut stake_state.data.borrow_mut()[..])?;

    msg!("🎊 NFT解除质押成功！感谢你的质押！");
    Ok(())
}
```

---

## 🧪 测试你的程序

### 📋 测试清单

```bash
# 🔨 构建程序
cargo build-sbf

# ✅ 确保构建成功！
# 你应该看到：Build successful! 🎉
```

### 💡 调试技巧

> 🔍 **调试小贴士：**
> 1. **使用 `msg!` 宏** - 它是你的最佳朋友！
> 2. **检查每个步骤** - 逐步验证每个操作
> 3. **验证账户** - 确保所有账户都正确传入
> 4. **测试边界情况** - 尝试各种异常输入

---

## 🎯 最佳实践总结

### ✨ 代码质量检查表

- [x] 📝 **清晰的注释** - 每个函数都有说明
- [x] 🔐 **安全验证** - PDA和签名检查
- [x] ⚠️ **错误处理** - 友好的错误提示
- [x] 📊 **状态管理** - 正确的状态转换
- [x] 💾 **数据序列化** - 安全的数据存储

### 🚀 性能优化建议

1. **减少计算** - 预先计算固定值
2. **优化存储** - 使用合适的数据类型
3. **批量操作** - 尽可能合并操作
4. **缓存结果** - 避免重复计算

---

## 🎊 恭喜完成！

### 🏆 你已经学会了：

- ✅ 创建完整的Solana程序结构
- ✅ 实现四大核心功能
- ✅ 使用PDA管理状态
- ✅ 处理时间和奖励计算
- ✅ 实现安全验证

### 🔮 下周预告

下周我们将添加**真正的代币功能**！
- 🪙 整合SPL Token程序
- 💸 实现真实的代币转账
- 🎁 发放质押奖励
- 🔥 完整的DeFi体验！

> 💬 **需要帮助？** 加入我们的Discord社区，大家都在那里互相帮助！

---

**LFG（Let's Fucking Go）!!! 🚀🚀🚀**

你已经完成了第三周的核心内容！继续保持这样的势头，我们一起向着成为**Solana大师**的目标前进！

记住：**每一行代码都让你离目标更近一步！** 💪

Happy Coding! 🎉👨‍💻👩‍💻
