---
sidebar_position: 75
sidebar_label: 🧪 使用Rust编写测试
sidebar_class_name: green
---

# 🧪 使用Rust编写测试 - 成为测试忍者！

## 🎯 欢迎来到测试道场！

嘿，代码武士们！⚔️ 还记得那些让你抓狂的Bug吗？今天我们要学习**测试驱动开发（TDD）**的忍术，让Bug在诞生之前就被消灭！

想象一下：你的代码就像一个**精密的瑞士手表**⌚，每个齿轮（函数）都需要完美配合。测试就是确保每个齿轮都能正常工作的**质检员**！

> 🎯 **今日任务：** 为我们的电影评论程序编写完整的测试套件，让它坚不可摧！

---

## 🏗️ 准备你的测试实验室

### 📦 Step 1: 安装测试装备

首先，让我们给项目添加一些**超能力工具**！打开 `Cargo.toml`：

```toml
# 🧰 开发依赖 - 只在测试时使用的工具包
[dev-dependencies]
assert_matches = "1.4.0"        # 🎯 强大的断言匹配器
solana-program-test = "~1.10.29" # 🏗️ Solana程序测试框架
solana-sdk = "~1.10.29"          # 🛠️ Solana开发工具包
```

> 💡 **小知识：** `[dev-dependencies]` 只在开发和测试时编译，不会增加最终程序的大小！

### 🎬 Step 2: 获取起始代码

```bash
# 🚀 克隆起始代码
git clone https://github.com/buildspace/solana-movie-program
cd solana-movie-program
git checkout solution-add-tokens

# 📦 安装依赖
cargo build

# ✨ 准备完成！让测试开始吧！
```

---

## 🏗️ 构建测试框架

### 📝 初始化测试模块

在 `processor.rs` 文件的**最底部**添加我们的测试道场：

```rust
// 🧪 测试模块 - 我们的测试实验室！
#[cfg(test)]  // 🎯 这个魔法注解告诉Rust：只在运行测试时编译这部分代码
mod tests {
    // 📦 导入所需的所有工具
    use {
        super::*,  // 导入父模块的所有内容
        assert_matches::*,  // 🎯 断言匹配工具
        solana_program::{
            instruction::{AccountMeta, Instruction},
            system_program::ID as SYSTEM_PROGRAM_ID,  // 系统程序ID
        },
        solana_program_test::*,  // 测试框架
        solana_sdk::{
            signature::Signer,  // 签名工具
            transaction::Transaction,  // 交易构建器
            sysvar::rent::ID as SYSVAR_RENT_ID  // 租金系统变量
        },
        spl_associated_token_account::{
            get_associated_token_address,  // 获取关联代币地址
            instruction::create_associated_token_account,  // 创建ATA指令
        },
        spl_token::ID as TOKEN_PROGRAM_ID,  // SPL Token程序ID
    };

    // 🎪 测试将在这里进行！
}
```

> 🎨 **代码艺术：** 使用 `use {}` 块可以让导入更整洁，就像整理你的工具箱！

---

## 🛠️ 创建测试辅助函数

### 🎯 铸币初始化辅助函数

每个优秀的测试都需要一些**辅助函数**来减少重复代码。让我们创建一个！

```rust
// 🏭 辅助函数：创建初始化铸币指令
// 这个函数就像一个工厂，生产我们需要的铸币初始化指令
fn create_init_mint_ix(
    payer: Pubkey,      // 💰 付款人地址
    program_id: Pubkey  // 🎯 程序ID
) -> (Pubkey, Pubkey, Instruction) {
    // 🔮 Step 1: 派生铸币PDA
    // 使用 "token_mint" 作为种子
    let (mint, _bump_seed) = Pubkey::find_program_address(
        &[b"token_mint"],  // 🌱 种子
        &program_id
    );

    // 🔑 Step 2: 派生铸币权限PDA
    // 使用 "token_auth" 作为种子
    let (mint_auth, _bump_seed) = Pubkey::find_program_address(
        &[b"token_auth"],  // 🌱 种子
        &program_id
    );

    // 📋 打印调试信息（测试时很有用！）
    println!("🪙 Mint地址: {}", mint);
    println!("🔑 权限地址: {}", mint_auth);

    // 🏗️ Step 3: 构建初始化指令
    let init_mint_ix = Instruction {
        program_id: program_id,

        // 📦 账户列表 - 顺序很重要！
        accounts: vec![
            AccountMeta::new_readonly(payer, true),         // 👤 付款人（只读+签名）
            AccountMeta::new(mint, false),                  // 🪙 铸币账户（可写）
            AccountMeta::new(mint_auth, false),             // 🔑 权限账户（可写）
            AccountMeta::new_readonly(SYSTEM_PROGRAM_ID, false),  // ⚙️ 系统程序
            AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),   // 🎯 Token程序
            AccountMeta::new_readonly(SYSVAR_RENT_ID, false)     // 💰 租金系统变量
        ],

        // 📊 指令数据 - 3 表示 InitializeMint 指令
        data: vec![3]
    };

    // 🎁 返回三元组：铸币地址、权限地址、指令
    (mint, mint_auth, init_mint_ix)
}
```

> 💡 **Pro Tip:** 辅助函数让测试更干净、更易读。DRY原则（Don't Repeat Yourself）在测试中同样重要！

---

## 🧪 编写第一个测试 - 初始化铸币

### 🎯 测试初始化铸币功能

```rust
// 🚀 测试1：初始化代币铸币
#[tokio::test]  // 🌟 异步测试标记 - 告诉tokio这是一个异步测试
async fn test_initialize_mint_instruction() {
    println!("🧪 开始测试：初始化铸币...");

    // 🎭 Step 1: 设置测试环境
    let program_id = Pubkey::new_unique();  // 生成唯一的程序ID
    println!("📍 程序ID: {}", program_id);

    // 🏗️ Step 2: 创建测试环境
    // ProgramTest 是我们的虚拟Solana环境
    let (mut banks_client, payer, recent_blockhash) = ProgramTest::new(
        "pda_local",                    // 程序名称
        program_id,                     // 程序ID
        processor!(process_instruction), // 处理器函数
    )
    .start()  // 🚀 启动测试环境
    .await;

    println!("✅ 测试环境准备完成");
    println!("💰 付款人: {}", payer.pubkey());
    println!("📦 最新区块哈希: {}", recent_blockhash);

    // 🔧 Step 3: 调用辅助函数创建指令
    let (_mint, _mint_auth, init_mint_ix) = create_init_mint_ix(
        payer.pubkey(),
        program_id
    );

    // 🏗️ Step 4: 构建交易
    let mut transaction = Transaction::new_with_payer(
        &[init_mint_ix],         // 指令数组
        Some(&payer.pubkey()),   // 付款人
    );

    // ✍️ Step 5: 签名交易
    transaction.sign(&[&payer], recent_blockhash);
    println!("✍️ 交易已签名");

    // 🚀 Step 6: 发送交易并验证结果
    println!("📤 发送交易...");

    // 使用 assert_matches! 宏验证交易成功
    assert_matches!(
        banks_client.process_transaction(transaction).await,
        Ok(_),
        "❌ 初始化铸币失败！"
    );

    println!("🎉 测试通过！铸币初始化成功！");
}
```

---

## 🎬 编写第二个测试 - 添加电影评论

### 🎯 测试完整的评论流程

```rust
// 🎬 测试2：添加电影评论（带代币奖励）
#[tokio::test]
async fn test_add_movie_review_instruction() {
    println!("🎬 开始测试：添加电影评论...");

    // 🏗️ Step 1: 设置测试环境（和第一个测试相同）
    let program_id = Pubkey::new_unique();
    let (mut banks_client, payer, recent_blockhash) = ProgramTest::new(
        "pda_local",
        program_id,
        processor!(process_instruction),
    )
    .start()
    .await;

    // 🪙 Step 2: 初始化铸币（必须先有铸币才能发放奖励！）
    let (mint, mint_auth, init_mint_ix) = create_init_mint_ix(
        payer.pubkey(),
        program_id
    );

    // 📝 Step 3: 准备电影评论数据
    let title: String = "Captain America".to_owned();  // 🦸 电影标题
    const RATING: u8 = 3;                             // ⭐ 评分（1-5）
    let review: String = "Liked the movie".to_owned(); // 💭 评论内容

    println!("📝 评论数据:");
    println!("  🎬 电影: {}", title);
    println!("  ⭐ 评分: {}/5", RATING);
    println!("  💭 评论: {}", review);

    // 🔮 Step 4: 派生所需的PDA地址

    // 4.1 - 评论PDA（存储评论数据）
    let (review_pda, _bump_seed) = Pubkey::find_program_address(
        &[
            payer.pubkey().as_ref(),  // 用户公钥
            title.as_bytes()           // 电影标题
        ],
        &program_id
    );
    println!("📍 评论PDA: {}", review_pda);

    // 4.2 - 评论计数器PDA（跟踪评论数量）
    let (comment_pda, _bump_seed) = Pubkey::find_program_address(
        &[
            review_pda.as_ref(),  // 评论账户
            b"comment"            // 固定种子
        ],
        &program_id
    );
    println!("🔢 计数器PDA: {}", comment_pda);

    // 💳 Step 5: 创建用户的关联代币账户（ATA）
    // 用户需要一个账户来接收代币奖励
    let init_ata_ix: Instruction = create_associated_token_account(
        &payer.pubkey(),  // 付款人
        &payer.pubkey(),  // 所有者
        &mint,            // 代币类型
    );

    // 获取ATA地址
    let user_ata: Pubkey = get_associated_token_address(
        &payer.pubkey(),
        &mint
    );
    println!("💳 用户ATA: {}", user_ata);

    // 📦 Step 6: 序列化指令数据
    // Borsh序列化格式：[指令类型][标题长度][标题][评分][评论长度][评论]
    let mut data_vec = vec![0];  // 0 = AddMovieReview指令

    // 添加标题（长度+内容）
    data_vec.append(&mut (title.len() as u32).to_le_bytes().to_vec());
    data_vec.append(&mut title.into_bytes());

    // 添加评分
    data_vec.push(RATING);

    // 添加评论（长度+内容）
    data_vec.append(&mut (review.len() as u32).to_le_bytes().to_vec());
    data_vec.append(&mut review.into_bytes());

    println!("📊 数据大小: {} 字节", data_vec.len());

    // 🏗️ Step 7: 构建完整交易
    let mut transaction = Transaction::new_with_payer(
        &[
            init_mint_ix,  // 1️⃣ 初始化铸币
            init_ata_ix,   // 2️⃣ 创建用户ATA
            Instruction {  // 3️⃣ 添加电影评论
                program_id: program_id,
                accounts: vec![
                    // 账户列表 - 顺序必须与程序期望的一致！
                    AccountMeta::new_readonly(payer.pubkey(), true),  // 👤 付款人
                    AccountMeta::new(review_pda, false),              // 📝 评论账户
                    AccountMeta::new(comment_pda, false),             // 🔢 计数器
                    AccountMeta::new(mint, false),                    // 🪙 铸币
                    AccountMeta::new_readonly(mint_auth, false),      // 🔑 权限
                    AccountMeta::new(user_ata, false),                // 💳 用户ATA
                    AccountMeta::new_readonly(SYSTEM_PROGRAM_ID, false), // ⚙️ 系统
                    AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),  // 🎯 Token程序
                ],
                data: data_vec,  // 指令数据
            },
        ],
        Some(&payer.pubkey()),  // 付款人
    );

    // ✍️ Step 8: 签名并发送
    transaction.sign(&[&payer], recent_blockhash);
    println!("✍️ 交易已签名，准备发送...");

    // 🚀 Step 9: 执行并验证
    assert_matches!(
        banks_client.process_transaction(transaction).await,
        Ok(_),
        "❌ 添加电影评论失败！"
    );

    println!("🎉 测试通过！电影评论添加成功！");
    println!("💰 用户应该获得了10个代币奖励！");
}
```

---

## 🚀 运行测试

### 🎯 执行测试命令

```bash
# 🧪 运行所有测试
cargo test-sbf

# 🎯 运行特定测试
cargo test-sbf test_initialize_mint_instruction

# 📝 显示详细输出（看到所有println!）
cargo test-sbf -- --nocapture

# ⚡ 并行运行（更快！）
cargo test-sbf -- --test-threads=4

# 🔍 只运行失败的测试
cargo test-sbf -- --failed
```

### 📊 理解测试输出

```bash
# 🎉 成功的输出看起来像这样：
running 2 tests
test tests::test_initialize_mint_instruction ... ok ✅
test tests::test_add_movie_review_instruction ... ok ✅

test result: ok. 2 passed; 0 failed; 0 ignored
```

---

## 💡 测试最佳实践

### 🎯 专业技巧

```rust
// 🏆 技巧1：使用描述性的测试名称
#[test]
fn test_should_fail_when_rating_exceeds_5() {
    // 测试名称就是文档！
}

// 🏆 技巧2：测试边界条件
#[test]
fn test_minimum_rating() {
    test_rating(1);  // 最小值
}

#[test]
fn test_maximum_rating() {
    test_rating(5);  // 最大值
}

// 🏆 技巧3：测试错误情况
#[test]
#[should_panic(expected = "InvalidRating")]
fn test_invalid_rating_should_panic() {
    test_rating(10);  // 应该失败！
}

// 🏆 技巧4：使用测试fixture
struct TestFixture {
    program_id: Pubkey,
    payer: Keypair,
    banks_client: BanksClient,
}

impl TestFixture {
    async fn new() -> Self {
        // 设置通用测试环境
    }
}
```

### 🎨 测试组织结构

```rust
#[cfg(test)]
mod tests {
    // 🏗️ 辅助函数区
    mod helpers {
        pub fn create_test_account() { /* ... */ }
        pub fn create_test_transaction() { /* ... */ }
    }

    // ✅ 成功路径测试
    mod success_tests {
        #[test]
        fn test_happy_path() { /* ... */ }
    }

    // ❌ 失败路径测试
    mod failure_tests {
        #[test]
        fn test_error_handling() { /* ... */ }
    }

    // 🔍 边界测试
    mod edge_cases {
        #[test]
        fn test_boundary_conditions() { /* ... */ }
    }
}
```

---

## 🚢 挑战任务

### 🎯 基础挑战：添加更多测试

为电影评论程序添加以下测试：

```rust
// 💬 挑战1：测试添加评论功能
#[tokio::test]
async fn test_add_comment() {
    // 实现添加评论的测试
    // 提示：需要先创建一个评论，然后添加评论
}

// ✏️ 挑战2：测试更新评论功能
#[tokio::test]
async fn test_update_review() {
    // 实现更新评论的测试
    // 提示：先创建，再更新，验证数据变化
}

// 🚫 挑战3：测试错误处理
#[tokio::test]
async fn test_invalid_inputs() {
    // 测试各种无效输入
    // - 评分 > 5
    // - 空标题
    // - 超长描述
}
```

### 🎯 进阶挑战：集成测试

创建TypeScript集成测试：

```typescript
// 📦 tests/integration.test.ts
import { expect } from 'chai';
import * as anchor from '@project-serum/anchor';

describe('Movie Review Integration Tests', () => {
    it('完整用户流程测试', async () => {
        // 1. 初始化铸币
        // 2. 创建评论
        // 3. 验证代币奖励
        // 4. 添加评论
        // 5. 再次验证代币
    });
});
```

### 🎯 终极挑战：性能测试

```rust
// ⚡ 性能测试
#[test]
fn benchmark_add_review() {
    let start = std::time::Instant::now();

    // 执行1000次添加评论
    for i in 0..1000 {
        // ... 测试代码 ...
    }

    let duration = start.elapsed();
    println!("⏱️ 1000次操作耗时: {:?}", duration);
    assert!(duration.as_secs() < 10, "性能太慢！");
}
```

---

## 🎓 知识总结

### 📚 你掌握的技能

```
┌────────────────────────────────────┐
│      🏆 测试大师成就解锁             │
├────────────────────────────────────┤
│ ✅ 编写Rust单元测试                  │
│ ✅ 使用solana-program-test           │
│ ✅ 创建测试辅助函数                  │
│ ✅ 测试异步代码                      │
│ ✅ 模拟Solana环境                    │
│ ✅ 验证交易结果                      │
└────────────────────────────────────┘
```

### 🎯 记住这些要点

1. **测试是保险** 🛡️ - 投入时间写测试，节省调试时间
2. **测试即文档** 📖 - 好的测试展示了如何使用代码
3. **先写测试** 🎯 - TDD让你的设计更好
4. **测试覆盖率** 📊 - 目标80%以上
5. **持续测试** 🔄 - 每次修改都要运行测试

---

## 🚀 下一步

恭喜你成为**测试忍者**！🥷 现在你可以：
- 为任何Solana程序编写测试
- 快速定位和修复Bug
- 自信地重构代码
- 构建可靠的生产级程序

> 💬 **终极智慧：** "没有测试的代码就是技术债务！每个测试都是对未来的投资。"

---

**继续前进，让你的代码坚不可摧！** 🚀🧪⚡
