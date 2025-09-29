---
sidebar_position: 70
sidebar_label: ⚔️ 跨程序调用 - Boss战斗
sidebar_class_name: green
---

# ⚔️ 跨程序调用（CPI）- 终极Boss战斗指南

## 🎮 欢迎来到Solana的多人副本！

还记得那些**史诗级Boss战**吗？你一个人站在巨龙面前，血条长得看不到尽头...😱 然后你意识到："我需要队友！"

这就是今天要学的**跨程序调用（CPI）**！它让你的程序可以召唤其他程序来并肩作战，就像复仇者联盟集结对抗灭霸！💪

![](./img/giphy.gif)

> 🎯 **今日任务：** 掌握CPI的力量，成为Solana世界的召唤师！

---

## 🌟 什么是跨程序调用？

### 🎭 一个简单的比喻

想象你在经营一家**披萨店**🍕：
- 你擅长做披萨（你的核心程序）
- 但送外卖呢？你可以**调用外卖平台**（调用Token程序）
- 收款呢？你可以**调用支付系统**（调用另一个程序）

这就是CPI的魅力 —— **不要重复造轮子，直接调用现成的服务！**

```rust
// 🍕 你的披萨程序
fn make_pizza() -> Pizza {
    // 做披萨的逻辑
}

// 📞 调用外卖服务（CPI）
fn deliver_pizza(pizza: Pizza) {
    // 不用自己送，调用外卖程序！
    invoke_delivery_program(pizza);  // 这就是CPI！
}
```

### 🚀 CPI的超能力

```
┌────────────────────────────────────┐
│       🎮 CPI 能力展示板              │
├────────────────────────────────────┤
│ ✅ 调用任何已部署的程序              │
│ ✅ 组合多个程序的功能                │
│ ✅ 让PDA可以"签名"                  │
│ ✅ 构建乐高积木式的DApp              │
│ ✅ 将整个Solana变成你的API           │
└────────────────────────────────────┘
```

---

## 🛠️ CPI的两把利剑

### ⚔️ 武器一：`invoke` - 普通攻击

```rust
// 🗡️ invoke - 当你不需要PDA签名时使用
pub fn invoke(
    instruction: &Instruction,     // 📜 要执行的指令
    account_infos: &[AccountInfo]   // 📦 需要的账户
) -> ProgramResult
```

**使用场景：**
- 👤 用户已经签名了
- 🎯 直接传递签名权限
- 💨 简单直接的调用

### ⚔️ 武器二：`invoke_signed` - 必杀技

```rust
// ⚡ invoke_signed - 当你需要PDA签名时使用
pub fn invoke_signed(
    instruction: &Instruction,      // 📜 要执行的指令
    account_infos: &[AccountInfo],  // 📦 需要的账户
    signers_seeds: &[&[&[u8]]]     // 🔑 PDA的种子（重要！）
) -> ProgramResult
```

**使用场景：**
- 🤖 程序需要代表PDA签名
- 🔐 访问程序控制的账户
- 💎 执行特权操作

### 🎯 快速对比

```
┌─────────────┬────────────────┬─────────────────┐
│   特性      │    invoke      │  invoke_signed  │
├─────────────┼────────────────┼─────────────────┤
│ PDA签名     │      ❌        │       ✅        │
│ 复杂度      │      低 📗     │      中 📙      │
│ 使用频率    │     较少 📊    │     频繁 📈     │
│ 种子参数    │      无        │      必需       │
└─────────────┴────────────────┴─────────────────┘
```

---

## 📦 构建你的第一个CPI

### 🎯 Step 1：创建指令结构

```rust
use solana_program::instruction::{AccountMeta, Instruction};

// 🏗️ 第一步：定义你要传递的数据
#[derive(BorshSerialize, BorshDeserialize)]
struct TransferData {
    amount: u64,  // 💰 转账金额
}

// 📝 第二步：准备账户列表
let accounts = vec![
    // AccountMeta::new(账户地址, 是否是签名者)
    AccountMeta::new(from_account, true),     // 💸 付款方（签名者+可写）
    AccountMeta::new(to_account, false),      // 💰 收款方（只需可写）
    AccountMeta::read_only(authority, true),  // 👤 权限账户（签名者+只读）
];

// 🎁 第三步：序列化数据
let instruction_data = TransferData {
    amount: 1000000  // 1 SOL = 1,000,000 lamports
};
let data = instruction_data.try_to_vec()?;

// 🚀 第四步：创建指令
let instruction = Instruction {
    program_id: token_program_id,  // 🎯 目标程序
    accounts,                       // 📦 账户列表
    data,                          // 📊 数据负载
};
```

> 💡 **Pro Tip：** AccountMeta的记忆技巧：
> - `new` = ✏️ 可写
> - `read_only` = 👀 只读
> - `true` = ✍️ 需要签名
> - `false` = 🔓 不需要签名

---

## 🎮 实战示例：调用Token程序

### 🪙 示例1：使用 `invoke` 转账

```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program::invoke,
    pubkey::Pubkey,
    msg,
};

pub fn transfer_tokens_with_invoke(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    msg!("🚀 开始代币转账...");

    // 📦 解析账户
    let account_info_iter = &mut accounts.iter();
    let source = next_account_info(account_info_iter)?;      // 源账户
    let destination = next_account_info(account_info_iter)?; // 目标账户
    let authority = next_account_info(account_info_iter)?;   // 权限账户
    let token_program = next_account_info(account_info_iter)?; // Token程序

    msg!("💰 转账金额: {} lamports", amount);

    // 🏗️ 构建转账指令
    let transfer_instruction = spl_token::instruction::transfer(
        token_program.key,     // Token程序ID
        source.key,            // 源代币账户
        destination.key,       // 目标代币账户
        authority.key,         // 转账权限
        &[],                   // 额外签名者（这里没有）
        amount,                // 转账金额
    )?;

    // 📞 执行CPI调用！
    msg!("📞 调用Token程序...");
    invoke(
        &transfer_instruction,
        &[
            source.clone(),      // 需要传递所有相关账户
            destination.clone(),
            authority.clone(),
            token_program.clone(),
        ],
    )?;

    msg!("✅ 转账成功！");
    Ok(())
}
```

### 🤖 示例2：使用 `invoke_signed` 与PDA

```rust
pub fn transfer_from_pda(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
    seed_phrase: &str,  // PDA种子短语
) -> ProgramResult {
    msg!("🤖 PDA转账开始...");

    // 📦 解析账户
    let account_info_iter = &mut accounts.iter();
    let pda_account = next_account_info(account_info_iter)?;
    let destination = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let pda_signer = next_account_info(account_info_iter)?;

    // 🔑 准备PDA种子
    let (expected_pda, bump_seed) = Pubkey::find_program_address(
        &[seed_phrase.as_bytes()],
        program_id
    );

    // ✅ 验证PDA
    if expected_pda != *pda_signer.key {
        msg!("❌ PDA不匹配！");
        return Err(ProgramError::InvalidSeeds);
    }

    msg!("🔑 使用bump seed: {}", bump_seed);

    // 🏗️ 构建转账指令
    let transfer_instruction = spl_token::instruction::transfer(
        token_program.key,
        pda_account.key,      // PDA的代币账户
        destination.key,      // 目标账户
        pda_signer.key,       // PDA作为签名者
        &[],                  // 无额外签名者
        amount,
    )?;

    // 🎯 准备签名种子
    let seeds = &[
        seed_phrase.as_bytes(),
        &[bump_seed],  // 别忘了bump！
    ];

    // ⚡ 使用invoke_signed执行CPI
    msg!("⚡ 使用PDA签名调用...");
    invoke_signed(
        &transfer_instruction,
        &[
            pda_account.clone(),
            destination.clone(),
            pda_signer.clone(),
            token_program.clone(),
        ],
        &[seeds],  // 🔑 这里传入种子让PDA"签名"
    )?;

    msg!("🎉 PDA转账成功！");
    Ok(())
}
```

---

## 🚨 常见错误与解决方案

### ❌ 错误1：签名者权限提升

```bash
# 错误信息
EF1M4SPfKcchb6scq297y8FPCaLvj5kGjwMzjTM68wjA's signer privilege escalated
Program returned error: "Cross-program invocation with unauthorized signer or writable account"
```

**🔍 原因：** 你试图让一个账户签名，但它不应该签名

**💊 解决方案：**
```rust
// ❌ 错误
AccountMeta::new(some_account, true)  // 不应该是签名者！

// ✅ 正确
AccountMeta::new(some_account, false)  // 不是签名者
```

### ❌ 错误2：写权限提升

```bash
# 错误信息
2qoeXa9fo8xVHzd2h9mVcueh6oK3zmAiJxCTySM5rbLZ's writable privilege escalated
```

**🔍 原因：** 账户需要标记为可写但你没有标记

**💊 解决方案：**
```rust
// ❌ 错误
AccountMeta::read_only(account_that_changes, false)

// ✅ 正确
AccountMeta::new(account_that_changes, false)  // 标记为可写！
```

### 🛠️ 调试技巧清单

```rust
// 🔍 调试CPI的黄金法则

// 1️⃣ 检查账户顺序
msg!("账户1: {}", account1.key);
msg!("账户2: {}", account2.key);
// 确保顺序与被调用程序期望的一致！

// 2️⃣ 验证PDA种子
msg!("种子: {:?}", seeds);
msg!("预期PDA: {}", expected_pda);
msg!("实际PDA: {}", actual_pda.key);

// 3️⃣ 检查账户权限
msg!("是签名者? {}", account.is_signer);
msg!("是可写? {}", account.is_writable);

// 4️⃣ 验证程序ID
msg!("目标程序: {}", target_program_id);
assert_eq!(target_program.key, &expected_program_id);
```

---

## 💎 高级技巧与最佳实践

### 🎯 技巧1：账户验证模板

```rust
// 🛡️ 创建一个可重用的验证函数
fn verify_cpi_accounts(
    expected_program: &Pubkey,
    actual_program: &AccountInfo,
    accounts: &[AccountInfo],
) -> ProgramResult {
    // ✅ 验证程序ID
    if actual_program.key != expected_program {
        msg!("❌ 程序ID不匹配");
        return Err(ProgramError::IncorrectProgramId);
    }

    // ✅ 验证账户所有者
    for account in accounts {
        if account.owner != expected_program && !account.is_signer {
            msg!("⚠️ 账户 {} 的所有者可能不正确", account.key);
        }
    }

    Ok(())
}
```

### 🎯 技巧2：CPI辅助函数

```rust
// 🔧 创建一个通用的CPI包装器
pub fn safe_cpi<'a>(
    instruction: Instruction,
    accounts: &[AccountInfo<'a>],
    signer_seeds: Option<&[&[&[u8]]]>,
) -> ProgramResult {
    msg!("🚀 执行CPI到程序: {}", instruction.program_id);

    match signer_seeds {
        Some(seeds) => {
            msg!("🔑 使用PDA签名");
            invoke_signed(&instruction, accounts, seeds)
        },
        None => {
            msg!("✍️ 使用常规签名");
            invoke(&instruction, accounts)
        }
    }?;

    msg!("✅ CPI执行成功");
    Ok(())
}
```

### 🎯 技巧3：批量CPI操作

```rust
// 🎪 执行多个CPI调用
pub fn batch_cpi_calls(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    operations: Vec<Operation>,
) -> ProgramResult {
    msg!("🎯 开始批量CPI操作");

    for (index, operation) in operations.iter().enumerate() {
        msg!("📍 执行操作 {}/{}", index + 1, operations.len());

        match operation {
            Operation::Transfer { amount, to } => {
                // 执行转账CPI
                transfer_cpi(accounts, *amount, to)?;
            },
            Operation::Mint { amount } => {
                // 执行铸造CPI
                mint_cpi(accounts, *amount)?;
            },
            Operation::Burn { amount } => {
                // 执行销毁CPI
                burn_cpi(accounts, *amount)?;
            },
        }
    }

    msg!("🎉 所有CPI操作完成！");
    Ok(())
}
```

---

## 🏗️ 实战项目：构建一个DeFi聚合器

让我们用CPI构建一个**迷你DeFi聚合器**！

```rust
// 🏦 DeFi聚合器 - 组合多个协议
pub fn defi_aggregator_swap(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount_in: u64,
) -> ProgramResult {
    msg!("🏦 DeFi聚合器启动！");

    // 📊 Step 1: 调用预言机获取价格
    let price = get_price_from_oracle(accounts)?;
    msg!("💹 当前价格: {}", price);

    // 💱 Step 2: 调用DEX进行交换
    let swapped_amount = swap_on_dex(
        accounts,
        amount_in,
        price
    )?;
    msg!("💱 交换完成: {} -> {}", amount_in, swapped_amount);

    // 🌾 Step 3: 将结果存入收益农场
    let staked_amount = stake_in_farm(
        accounts,
        swapped_amount
    )?;
    msg!("🌾 已质押到农场: {}", staked_amount);

    // 🎁 Step 4: 铸造奖励代币
    mint_rewards(accounts, staked_amount)?;
    msg!("🎁 奖励已发放！");

    msg!("✨ DeFi操作链完成！");
    Ok(())
}
```

---

## 🎓 知识总结

### 📚 CPI核心概念回顾

```
┌────────────────────────────────────────┐
│         🎯 CPI 知识地图                 │
├────────────────────────────────────────┤
│                                        │
│  invoke 📞                             │
│    ├── 简单调用                        │
│    ├── 传递用户签名                    │
│    └── 不需要PDA                       │
│                                        │
│  invoke_signed ⚡                      │
│    ├── PDA签名                         │
│    ├── 需要种子                        │
│    └── 程序控制账户                    │
│                                        │
│  最佳实践 💎                           │
│    ├── 验证所有账户                    │
│    ├── 正确设置权限                    │
│    ├── 处理错误情况                    │
│    └── 优化gas消耗                     │
│                                        │
└────────────────────────────────────────┘
```

### 🌟 你已经掌握的技能

- ✅ 理解CPI的工作原理
- ✅ 区分 `invoke` 和 `invoke_signed`
- ✅ 构建跨程序调用
- ✅ 处理PDA签名
- ✅ 调试常见错误
- ✅ 实现复杂的DeFi操作

---

## 🚀 下一步

恭喜你掌握了CPI！🎉 你现在可以：

1. **构建DeFi乐高** - 组合现有协议
2. **创建聚合器** - 整合多个服务
3. **开发复杂DApp** - 利用生态系统的力量

> 💬 **记住：** 在Solana上，你不是一个人在战斗。整个生态系统都是你的武器库！

---

**准备好成为CPI大师了吗？让我们一起征服Solana的世界！** 🚀⚔️✨
