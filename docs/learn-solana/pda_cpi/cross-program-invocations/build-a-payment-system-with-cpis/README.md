---
sidebar_position: 72
sidebar_label: 💸 使用CPI构建支付系统
sidebar_class_name: green
---

# 💸 使用CPI构建支付系统 - 让评论变成金矿！

## 🎪 欢迎来到代币经济的核心！

热身结束了，朋友们！🔥 上节课我们建好了**代币工厂**，现在是时候让它**开足马力运转**了！想象一下：

- 📝 写影评 = 💰 获得10个代币
- 💬 发评论 = 🪙 获得5个代币
- 🚀 用户活跃 = 💎 财富积累

这就像是**Play-to-Earn遇见了社交媒体**！每个互动都有价值！

> 🎯 **今日任务：** 在评论和留言功能中集成代币铸造，让用户的每个贡献都能获得奖励！

---

## 🏗️ 系统架构总览

### 🎨 代币流程图

```
┌─────────────────────────────────────────┐
│         💰 代币奖励系统                   │
├─────────────────────────────────────────┤
│                                          │
│  用户操作          奖励                   │
│  ─────────        ─────                  │
│  📝 发布影评  ──→  🪙 10个代币            │
│  💬 发表评论  ──→  🪙 5个代币             │
│  🔄 更新影评  ──→  🪙 2个代币（未来）      │
│                                          │
│  流程：                                   │
│  1. 用户提交内容 ✍️                      │
│  2. 程序验证 ✅                          │
│  3. 调用Token程序 📞                     │
│  4. 铸造代币到用户钱包 💰                 │
│                                          │
└─────────────────────────────────────────┘
```

---

## 📝 Step 1: 升级影评功能

### 🎯 更新add_movie_review函数

首先，让我们给影评功能加入**代币超能力**！打开 `processor.rs`：

```rust
// 🎬 在 add_movie_review 函数中
pub fn add_movie_review(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    title: String,
    rating: u8,
    description: String,
) -> ProgramResult {
    msg!("🎬 添加电影评论...");
    msg!("📝 标题: {}", title);
    msg!("⭐ 评分: {}", rating);
    msg!("💭 描述: {}", description);

    // 📋 解析账户列表 - 注意新增的账户！
    let account_info_iter = &mut accounts.iter();

    // 👤 原有账户
    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    let pda_counter = next_account_info(account_info_iter)?;

    // 🆕 新增的代币相关账户！
    let token_mint = next_account_info(account_info_iter)?;      // 🪙 代币铸造账户
    let mint_auth = next_account_info(account_info_iter)?;       // 🔑 铸造权限
    let user_ata = next_account_info(account_info_iter)?;        // 💳 用户代币钱包

    // ⚙️ 系统账户
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;   // 🎯 Token程序

    msg!("✅ 账户解析完成！");

    // ... 原有的验证逻辑 ...
}
```

### 🔐 添加账户验证

> 💡 **黄金法则：** 永远不要相信用户输入！验证一切！

```rust
// 🔍 验证所有代币相关账户
msg!("🔐 开始验证代币账户...");

// 🎯 Step 1: 派生预期的PDA地址
let (mint_pda, _mint_bump) = Pubkey::find_program_address(
    &[b"token_mint"],  // 🌱 铸造账户种子
    program_id
);

let (mint_auth_pda, mint_auth_bump) = Pubkey::find_program_address(
    &[b"token_auth"],  // 🌱 权限账户种子
    program_id
);

// ✅ Step 2: 验证代币铸造账户
if *token_mint.key != mint_pda {
    msg!("❌ 错误：代币铸造账户不匹配！");
    msg!("   期望: {}", mint_pda);
    msg!("   实际: {}", token_mint.key);
    return Err(ReviewError::IncorrectAccountError.into());
}

// ✅ Step 3: 验证铸造权限账户
if *mint_auth.key != mint_auth_pda {
    msg!("❌ 错误：铸造权限不匹配！");
    return Err(ReviewError::InvalidPDA.into());
}

// ✅ Step 4: 验证用户的关联代币账户（ATA）
// get_associated_token_address 计算用户应该拥有的代币账户地址
let expected_ata = get_associated_token_address(
    initializer.key,  // 用户地址
    token_mint.key    // 代币类型
);

if *user_ata.key != expected_ata {
    msg!("❌ 错误：用户代币账户不正确！");
    msg!("   期望: {}", expected_ata);
    msg!("   实际: {}", user_ata.key);
    return Err(ReviewError::IncorrectAccountError.into());
}

// ✅ Step 5: 验证Token程序
if *token_program.key != TOKEN_PROGRAM_ID {
    msg!("❌ 错误：Token程序ID不正确！");
    return Err(ReviewError::IncorrectAccountError.into());
}

msg!("✅ 所有账户验证通过！");
```

### 💰 实现代币铸造

在函数末尾，`Ok(())` 之前添加：

```rust
// 🎉 铸造奖励代币！
msg!("💰 准备铸造10个代币给用户...");
msg!("   用户: {}", initializer.key);
msg!("   代币账户: {}", user_ata.key);

// 🪄 使用CPI调用Token程序的mint_to指令
invoke_signed(
    // 📜 指令：铸造代币
    &spl_token::instruction::mint_to(
        token_program.key,     // Token程序ID
        token_mint.key,        // 从哪个mint铸造
        user_ata.key,          // 铸造到哪个账户
        mint_auth.key,         // 谁有权限铸造
        &[],                   // 额外签名者（无）
        10 * LAMPORTS_PER_SOL, // 💰 数量：10个代币
    )?,

    // 📦 涉及的账户
    &[
        token_mint.clone(),    // Mint账户
        user_ata.clone(),      // 目标账户
        mint_auth.clone(),     // 权限账户
    ],

    // 🔑 PDA签名种子 - 让程序代表PDA签名！
    &[&[b"token_auth", &[mint_auth_bump]]],
)?;

msg!("🎊 成功铸造10个代币！");
msg!("💎 用户因发布影评获得奖励！");

Ok(())
```

### 📦 更新导入

在文件顶部更新导入：

```rust
// 🆕 添加 mint_to 导入
use spl_token::{
    instruction::{initialize_mint, mint_to},  // 添加了mint_to！
    ID as TOKEN_PROGRAM_ID
};
```

---

## 💬 Step 2: 升级评论功能

### 🎯 更新add_comment函数

现在让我们给评论功能也加上代币奖励！代码结构类似，但奖励数量不同：

```rust
// 💬 在 add_comment 函数中
pub fn add_comment(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    comment: String,
) -> ProgramResult {
    msg!("💬 添加评论...");
    msg!("📝 内容: {}", comment);

    // 📋 解析账户列表
    let account_info_iter = &mut accounts.iter();

    // 👤 基础账户
    let commenter = next_account_info(account_info_iter)?;
    let pda_review = next_account_info(account_info_iter)?;
    let pda_counter = next_account_info(account_info_iter)?;
    let pda_comment = next_account_info(account_info_iter)?;

    // 🆕 代币相关账户
    let token_mint = next_account_info(account_info_iter)?;
    let mint_auth = next_account_info(account_info_iter)?;
    let user_ata = next_account_info(account_info_iter)?;

    // ⚙️ 程序账户
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;

    // ... 原有的评论创建逻辑 ...

    // 🔐 验证代币账户（与影评相同的验证逻辑）
    msg!("🔐 验证代币账户...");

    // 派生PDA
    let (mint_pda, _mint_bump) = Pubkey::find_program_address(
        &[b"token_mint"],
        program_id
    );
    let (mint_auth_pda, mint_auth_bump) = Pubkey::find_program_address(
        &[b"token_auth"],
        program_id
    );

    // 执行验证
    if *token_mint.key != mint_pda {
        msg!("❌ 代币铸造账户错误");
        return Err(ReviewError::IncorrectAccountError.into());
    }

    if *mint_auth.key != mint_auth_pda {
        msg!("❌ 铸造权限错误");
        return Err(ReviewError::InvalidPDA.into());
    }

    // 验证用户ATA
    if *user_ata.key != get_associated_token_address(
        commenter.key,
        token_mint.key
    ) {
        msg!("❌ 用户代币账户错误");
        return Err(ReviewError::IncorrectAccountError.into());
    }

    if *token_program.key != TOKEN_PROGRAM_ID {
        msg!("❌ Token程序错误");
        return Err(ReviewError::IncorrectAccountError.into());
    }

    // 💰 铸造评论奖励 - 5个代币！
    msg!("💰 铸造5个代币作为评论奖励...");

    invoke_signed(
        // 📜 铸造指令
        &spl_token::instruction::mint_to(
            token_program.key,
            token_mint.key,
            user_ata.key,
            mint_auth.key,
            &[],
            5 * LAMPORTS_PER_SOL,  // 💰 5个代币的奖励
        )?,
        // 📦 账户列表
        &[
            token_mint.clone(),
            user_ata.clone(),
            mint_auth.clone()
        ],
        // 🔑 PDA签名种子
        &[&[b"token_auth", &[mint_auth_bump]]],
    )?;

    msg!("🎊 成功奖励5个代币给评论者！");

    Ok(())  // ⚠️ 注意：不要重复Ok(())
}
```

> ⚠️ **常见错误：** 确保函数末尾只有一个 `Ok(())`！

---

## 🧪 测试你的代币系统

### 🔨 Step 1: 构建和部署

```bash
# 🏗️ 构建程序
cargo build-sbf

# 🚀 部署到本地网络
solana program deploy target/deploy/your_program.so

# 💡 提示：如果余额不足
solana airdrop 2
```

### 🎮 Step 2: 初始化Mint

```bash
# 📥 获取测试客户端
git clone https://github.com/buildspace/solana-movie-token-client
cd solana-movie-token-client
npm install
```

**配置客户端：**

```typescript
// 📝 更新 index.ts
const PROGRAM_ID = "你的程序ID";

// 🌐 第67行 - 使用本地网络
const connection = new web3.Connection("http://localhost:8899");
```

**运行初始化：**

```bash
# 🚀 初始化代币铸造
npm start

# 🎉 你应该看到：
# "Token mint initialized!"
```

### 🎨 Step 3: 使用前端测试

```bash
# 📥 克隆前端
git clone https://github.com/buildspace/solana-movie-frontend/
cd solana-movie-frontend

# 🎯 切换到正确的分支
git checkout solution-add-tokens

# 📦 安装依赖
npm install
```

**配置前端：**

1. 📝 更新程序ID
2. 🌐 设置本地网络连接
3. 👻 Phantom钱包切换到localhost
4. 💰 确保有测试SOL

**测试流程：**

```bash
# 🚀 启动前端
npm run dev

# 🎯 测试步骤：
# 1. 发布一个影评 → 获得10个代币 💰
# 2. 发表一条评论 → 获得5个代币 🪙
# 3. 检查Phantom钱包 → 看到你的代币！ 🎉
```

---

## 💡 实用技巧与最佳实践

### 🎯 技巧1：代币经济设计

```rust
// 💰 创建灵活的奖励系统
pub const REVIEW_REWARD: u64 = 10 * LAMPORTS_PER_SOL;
pub const COMMENT_REWARD: u64 = 5 * LAMPORTS_PER_SOL;
pub const UPDATE_REWARD: u64 = 2 * LAMPORTS_PER_SOL;

// 🎮 根据用户等级调整奖励
fn calculate_reward(user_level: u8, base_reward: u64) -> u64 {
    match user_level {
        1 => base_reward,
        2 => base_reward * 15 / 10,  // 1.5倍
        3 => base_reward * 2,         // 2倍
        _ => base_reward,
    }
}
```

### 🎯 技巧2：防止滥用

```rust
// ⏰ 添加时间限制
pub fn can_mint_reward(last_action_time: i64) -> bool {
    let current_time = Clock::get()?.unix_timestamp;
    let time_elapsed = current_time - last_action_time;

    // 每小时只能获得一次奖励
    time_elapsed >= 3600
}

// 📊 添加每日限额
pub struct UserRewardTracker {
    pub daily_minted: u64,
    pub last_reset: i64,
    pub daily_limit: u64,
}
```

### 🎯 技巧3：错误处理优化

```rust
// 🛡️ 创建辅助函数简化验证
fn verify_token_accounts(
    token_mint: &AccountInfo,
    mint_auth: &AccountInfo,
    user_ata: &AccountInfo,
    token_program: &AccountInfo,
    program_id: &Pubkey,
    user: &Pubkey,
) -> ProgramResult {
    // 批量验证所有账户
    let (mint_pda, _) = Pubkey::find_program_address(
        &[b"token_mint"],
        program_id
    );

    if *token_mint.key != mint_pda {
        return Err(ReviewError::IncorrectAccountError.into());
    }

    // ... 其他验证 ...

    Ok(())
}
```

---

## 🏆 挑战任务

### 🎯 基础挑战：学生介绍奖励

为学生介绍程序添加代币奖励：
- 🎓 自我介绍 = 20个代币
- 💬 回复他人 = 3个代币
- 👍 点赞（新功能）= 1个代币

### 🎯 进阶挑战：构建完整的代币经济

创建一个更复杂的系统：

```rust
// 🎮 多层次奖励系统
pub enum ActionType {
    CreateContent,    // 基础奖励
    QualityContent,   // 高质量内容额外奖励
    DailyActive,      // 每日活跃奖励
    Milestone,        // 里程碑奖励
}

// 💎 VIP系统
pub struct VipStatus {
    pub level: u8,
    pub multiplier: f32,
    pub special_perks: Vec<Perk>,
}

// 🏪 代币消费
pub enum TokenUse {
    UnlockFeature,    // 解锁功能
    PurchaseNFT,      // 购买NFT
    Governance,       // 治理投票
}
```

### 🔗 参考资源

- [示例脚本](https://github.com/buildspace/solana-movie-token-client)
- [完整解决方案](https://beta.solpg.io/631f631a77ea7f12846aee8d)

---

## 🎓 知识总结

### 📚 你掌握的技能

```
┌─────────────────────────────────────┐
│      🏆 成就解锁                     │
├─────────────────────────────────────┤
│ ✅ 实现代币奖励系统                  │
│ ✅ 掌握mint_to指令                   │
│ ✅ 管理关联代币账户(ATA)             │
│ ✅ 使用invoke_signed进行CPI          │
│ ✅ 构建完整的代币经济                │
└─────────────────────────────────────┘
```

### 🔮 未来展望

有了代币系统，你可以：
- 🏪 创建市场和交易系统
- 🗳️ 实现DAO治理
- 🎮 构建GameFi应用
- 💎 创建会员和VIP系统

---

## 🚀 总结

恭喜！🎉 你已经成功构建了一个**完整的代币奖励系统**！现在你的应用不仅仅是Web3的，更是一个**真正的代币经济体**！

> 💭 **思考：** 代币不仅是奖励，更是构建社区和激励的强大工具。你会如何设计你的代币经济？

---

**准备好创建下一个DeFi独角兽了吗？让代币飞起来吧！** 🚀💰🌟
