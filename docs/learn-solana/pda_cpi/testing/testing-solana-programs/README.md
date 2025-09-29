---
sidebar_position: 74
sidebar_label: 🧪 测试 Solana 程序
sidebar_class_name: green
---

# 🧪 测试 Solana 程序 - 让Bug无处藏身！

## 🎯 欢迎来到测试的世界！

嘿，Solana开发者们！👋 还记得那些让你半夜惊醒的Bug吗？今天我们要学习如何**在Bug出现之前就消灭它们**！

测试就像是你代码的**健身教练**💪 —— 它让你的程序更强壮、更可靠！让我们一起构建一个**铜墙铁壁**的测试体系！

> 🎯 **今日任务：** 掌握单元测试和集成测试，成为Bug终结者！

---

## 🏗️ 测试架构总览

### 🎨 测试金字塔

```
         🏔️ 测试金字塔
         ═══════════════

           ╱     ╲
          ╱  E2E  ╲    ← 🌐 端到端测试（最少但最重要）
         ╱  测试   ╲
        ╱───────────╲
       ╱  集成测试   ╲  ← 🔗 集成测试（中等数量）
      ╱               ╲
     ╱─────────────────╲
    ╱    单元测试       ╲ ← 🧩 单元测试（最多最快）
   ╱___________________╲

   快速 ←─────────────→ 慢速
   便宜 ←─────────────→ 昂贵
   隔离 ←─────────────→ 真实
```

### 📊 两种测试类型对比

```
┌──────────────┬─────────────────┬──────────────────┐
│   特性       │   单元测试 🧩    │   集成测试 🔗     │
├──────────────┼─────────────────┼──────────────────┤
│ 测试范围     │   单个函数       │   多个模块        │
│ 速度        │   极快 ⚡        │   较慢 🐢        │
│ 隔离性      │   完全隔离       │   部分隔离        │
│ 复杂度      │   简单 📗        │   复杂 📕        │
│ 反馈速度    │   即时 ⏱️        │   延迟 ⏳        │
└──────────────┴─────────────────┴──────────────────┘
```

---

## 🧩 单元测试 - 代码的体检

### 🎯 什么是单元测试？

单元测试就像给你的每个函数做**体检**🏥！它们：
- 🔍 **检查单个功能** - 一次只测试一个函数
- ⚡ **运行超快** - 毫秒级响应
- 🎯 **精准定位** - 立即找到问题所在
- 🔒 **测试私有接口** - 能访问内部实现

### 📝 创建你的第一个单元测试

```rust
// 🏠 在 processor.rs 文件底部添加测试模块
#[cfg(test)]  // 🎯 只在测试时编译这段代码
mod tests {
    use super::*;  // 导入父模块的所有内容

    // 🧪 测试属性 - 标记这是一个测试函数
    #[test]
    fn test_basic_math() {
        // 📝 准备测试数据
        let a = 2;
        let b = 2;

        // 🎯 执行被测试的操作
        let result = a + b;

        // ✅ 断言结果
        assert_eq!(result, 4, "2 + 2 应该等于 4！");

        // 🎉 如果到这里没报错，测试通过！
    }

    // 🔧 辅助函数（不是测试）
    fn helper_setup() -> TestAccount {
        // 准备测试环境的辅助函数
        TestAccount::new()
    }

    // 😱 测试预期的panic
    #[test]
    #[should_panic(expected = "除零错误")]
    fn test_division_by_zero() {
        let result = divide(10, 0);  // 这应该panic！
    }
}
```

> 💡 **Pro Tip:** `#[cfg(test)]` 确保测试代码不会被包含在最终的程序中，节省空间！

---

## 🚀 编写Solana程序单元测试

### 🛠️ 设置测试环境

```rust
// 🧪 完整的Solana程序单元测试示例
#[cfg(test)]
mod tests {
    use {
        super::*,
        assert_matches::*,  // 🎯 强大的断言匹配库
        solana_program::instruction::{AccountMeta, Instruction},
        solana_program_test::*,  // 🏗️ Solana测试框架
        solana_sdk::{
            signature::Signer,
            transaction::Transaction,
            signer::keypair::Keypair
        },
    };

    // 🌟 使用tokio进行异步测试
    #[tokio::test]
    async fn test_initialize_movie_review() {
        // 🎭 Step 1: 设置测试环境
        println!("🚀 开始测试初始化电影评论...");

        // 创建唯一的程序ID
        let program_id = Pubkey::new_unique();

        // 🏗️ Step 2: 初始化测试环境
        // ProgramTest创建一个模拟的Solana运行时
        let (mut banks_client, payer, recent_blockhash) = ProgramTest::new(
            "movie_review_program",  // 程序名称
            program_id,              // 程序ID
            processor!(process_instruction),  // 处理器函数
        )
        .start()  // 启动测试环境
        .await;

        println!("✅ 测试环境准备完成！");

        // 👤 Step 3: 创建测试账户
        let reviewer = Keypair::new();
        let pda_account = Keypair::new();

        // 📝 Step 4: 准备指令数据
        let title = "Inception";
        let rating = 5u8;
        let description = "Mind-bending masterpiece!";

        // 序列化指令数据
        let mut instruction_data = vec![0];  // 0 = AddMovieReview指令
        instruction_data.extend_from_slice(title.as_bytes());
        instruction_data.push(rating);
        instruction_data.extend_from_slice(description.as_bytes());

        // 🔨 Step 5: 创建交易
        let mut transaction = Transaction::new_with_payer(
            &[Instruction {
                program_id,
                accounts: vec![
                    AccountMeta::new(payer.pubkey(), true),     // 付款人
                    AccountMeta::new(pda_account.pubkey(), false), // PDA账户
                    AccountMeta::new_readonly(system_program::id(), false), // 系统程序
                ],
                data: instruction_data,
            }],
            Some(&payer.pubkey()),  // 设置付款人
        );

        // ✍️ Step 6: 签名交易
        transaction.sign(&[&payer], recent_blockhash);

        // 🚀 Step 7: 发送并验证交易
        let result = banks_client.process_transaction(transaction).await;

        // ✅ Step 8: 断言结果
        assert_matches!(result, Ok(()), "交易应该成功！");
        println!("🎉 测试通过！电影评论创建成功！");
    }

    // 🧪 测试错误场景
    #[tokio::test]
    async fn test_invalid_rating() {
        let program_id = Pubkey::new_unique();

        // ... 设置代码 ...

        // 🚫 使用无效评分（大于5）
        let invalid_rating = 10u8;

        // ... 创建交易 ...

        // 期望交易失败
        let result = banks_client.process_transaction(transaction).await;
        assert!(result.is_err(), "无效评分应该导致错误！");
        println!("✅ 正确拒绝了无效评分！");
    }
}
```

### 🎯 运行单元测试

```bash
# 🧪 运行所有测试
cargo test-sbf

# 🎯 运行特定测试
cargo test-sbf test_initialize_movie_review

# 📝 显示打印输出
cargo test-sbf -- --nocapture

# ⚡ 并行运行测试
cargo test-sbf -- --test-threads=4
```

---

## 🔗 集成测试 - 系统的全面体检

### 🏗️ 设置集成测试

集成测试确保你的程序各个部分能够**协同工作**！

#### 📁 创建测试目录结构

```
📦 your-project/
├── 📂 src/
│   └── 📜 lib.rs
├── 📂 tests/           # 🆕 集成测试目录
│   ├── 📜 integration_test.rs
│   └── 📜 e2e_test.rs
└── 📜 Cargo.toml
```

#### 📝 编写集成测试

```rust
// 🧪 tests/integration_test.rs
use movie_review_program;  // 导入你的程序库
use solana_program_test::*;
use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::Transaction,
};

// 🌟 集成测试 - 测试完整的工作流程
#[tokio::test]
async fn test_complete_review_workflow() {
    println!("🎬 开始完整工作流程测试...");

    // 🏗️ Step 1: 设置测试环境
    let program_id = Pubkey::new_unique();
    let mut program_test = ProgramTest::new(
        "movie_review_program",
        program_id,
        processor!(movie_review_program::process_instruction),
    );

    // 💰 添加一些测试账户
    program_test.add_account(
        test_account_pubkey,
        Account {
            lamports: 1_000_000_000,  // 1 SOL
            ..Account::default()
        },
    );

    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;

    // 📝 Step 2: 创建电影评论
    println!("📝 创建电影评论...");
    let review_result = create_movie_review(
        &mut banks_client,
        &payer,
        "The Matrix",
        5,
        "Revolutionary sci-fi!",
    ).await;
    assert!(review_result.is_ok(), "创建评论失败！");

    // 💬 Step 3: 添加评论
    println!("💬 添加评论...");
    let comment_result = add_comment(
        &mut banks_client,
        &payer,
        review_pda,
        "Totally agree! Best movie ever!",
    ).await;
    assert!(comment_result.is_ok(), "添加评论失败！");

    // ✏️ Step 4: 更新评论
    println!("✏️ 更新评论...");
    let update_result = update_movie_review(
        &mut banks_client,
        &payer,
        "The Matrix",
        5,
        "Revolutionary sci-fi masterpiece!",
    ).await;
    assert!(update_result.is_ok(), "更新评论失败！");

    println!("🎉 完整工作流程测试通过！");
}

// 🔧 辅助函数
async fn create_movie_review(
    banks_client: &mut BanksClient,
    payer: &Keypair,
    title: &str,
    rating: u8,
    description: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    // 实现创建评论的逻辑
    Ok(())
}
```

---

## 🧪 TypeScript集成测试

### 🎯 设置TypeScript测试环境

```bash
# 📦 安装测试依赖
npm install --save-dev mocha chai @types/mocha @types/chai ts-node

# 🎨 安装Solana相关包
npm install @solana/web3.js @solana/spl-token
```

### 📝 配置package.json

```json
{
  "name": "movie-review-tests",
  "scripts": {
    "test": "mocha -r ts-node/register './test/**/*.test.ts' --timeout 10000",
    "test:watch": "npm run test -- --watch"
  }
}
```

### 🚀 编写TypeScript测试

```typescript
// 🧪 test/movie-review.test.ts
import { expect } from 'chai';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    SystemProgram
} from '@solana/web3.js';

describe('🎬 Movie Review Program Tests', () => {
    // 🌐 设置连接和程序
    const connection = new Connection('http://localhost:8899', 'confirmed');
    let program: Program;
    let payer: Keypair;

    // 🏗️ 测试前准备
    before(async () => {
        console.log('🚀 初始化测试环境...');

        // 创建付款账户
        payer = Keypair.generate();

        // 空投一些SOL
        const airdropSig = await connection.requestAirdrop(
            payer.publicKey,
            2 * anchor.web3.LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(airdropSig);

        console.log('✅ 测试环境准备完成！');
    });

    // 🧪 测试：创建电影评论
    it('应该成功创建电影评论', async () => {
        console.log('📝 测试创建电影评论...');

        // 准备测试数据
        const title = "Inception";
        const rating = 5;
        const description = "Mind-bending masterpiece!";

        // 创建PDA
        const [reviewPda, bump] = await PublicKey.findProgramAddress(
            [
                Buffer.from("review"),
                payer.publicKey.toBuffer(),
                Buffer.from(title)
            ],
            program.programId
        );

        // 执行交易
        const tx = await program.methods
            .addMovieReview(title, rating, description)
            .accounts({
                reviewer: payer.publicKey,
                reviewAccount: reviewPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([payer])
            .rpc();

        console.log('📋 交易签名:', tx);

        // 获取并验证账户数据
        const reviewAccount = await program.account.movieReview.fetch(reviewPda);

        // 断言
        expect(reviewAccount.title).to.equal(title);
        expect(reviewAccount.rating).to.equal(rating);
        expect(reviewAccount.description).to.equal(description);

        console.log('✅ 电影评论创建成功！');
    });

    // 🧪 测试：添加评论
    it('应该成功添加评论', async () => {
        console.log('💬 测试添加评论...');

        const comment = "I totally agree! Amazing movie!";

        // ... 实现添加评论的测试逻辑 ...

        expect(commentAccount.comment).to.equal(comment);
        console.log('✅ 评论添加成功！');
    });

    // 🧪 测试：错误处理
    it('应该拒绝无效的评分', async () => {
        console.log('🚫 测试无效评分处理...');

        const invalidRating = 10; // 超过5的评分

        try {
            await program.methods
                .addMovieReview("Test Movie", invalidRating, "Test")
                .accounts({/* ... */})
                .rpc();

            // 如果没有抛出错误，测试失败
            expect.fail('应该抛出错误！');
        } catch (error) {
            // 验证错误消息
            expect(error.message).to.include('InvalidRating');
            console.log('✅ 正确拒绝了无效评分！');
        }
    });

    // 🧹 测试后清理
    after(async () => {
        console.log('🧹 清理测试环境...');
        // 清理代码
    });
});
```

### 🚀 运行TypeScript测试

```bash
# 🧪 运行所有测试
npm run test

# 👀 监视模式（自动重新运行）
npm run test:watch

# 🎯 运行特定测试文件
npm test -- test/movie-review.test.ts

# 📊 生成覆盖率报告
npm run test:coverage
```

---

## 🚨 错误处理与调试

### 🔍 理解错误代码

```rust
// 🎯 自定义错误枚举
#[derive(Debug, Error)]
pub enum MovieReviewError {
    #[error("0x01 - 资金不足")]  // 错误代码 0x01
    InsufficientFunds,

    #[error("0x02 - 评分无效")]  // 错误代码 0x02
    InvalidRating,

    #[error("0x03 - 标题太长")]  // 错误代码 0x03
    TitleTooLong,
}

// 🔧 错误代码转换辅助函数
pub fn decode_error(error_code: u32) -> String {
    match error_code {
        0x01 => "资金不足 💸".to_string(),
        0x02 => "评分无效 ⭐".to_string(),
        0x03 => "标题太长 📏".to_string(),
        _ => format!("未知错误: 0x{:02X}", error_code),
    }
}
```

### 📜 程序日志最佳实践

```rust
use solana_program::msg;

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // 🎬 开始日志
    msg!("🚀 程序开始执行");
    msg!("📋 程序ID: {}", program_id);
    msg!("📊 账户数量: {}", accounts.len());
    msg!("📦 数据长度: {} 字节", instruction_data.len());

    // 🔍 详细日志
    #[cfg(feature = "debug")]
    {
        msg!("🔍 调试模式 - 详细信息:");
        for (i, account) in accounts.iter().enumerate() {
            msg!("  账户[{}]: {}", i, account.key);
            msg!("    可写: {}", account.is_writable);
            msg!("    签名: {}", account.is_signer);
        }
    }

    // ⚠️ 错误日志
    if instruction_data.is_empty() {
        msg!("❌ 错误：指令数据为空！");
        return Err(ProgramError::InvalidInstructionData);
    }

    // ✅ 成功日志
    msg!("✅ 处理完成！");
    Ok(())
}
```

> 💡 **Pro Tip:** 在测试中使用 `println!()` 而不是 `msg!()`！

---

## 💻 计算预算管理

### 📊 理解计算限制

```
┌──────────────────────────────────────┐
│      💻 Solana计算预算               │
├──────────────────────────────────────┤
│ 默认预算: 200K CU × 指令数            │
│ 最大预算: 1.4M CU                    │
│ 基础费用: 5,000 Lamports             │
│                                      │
│ 优先费用计算:                         │
│ 费用 = CU预算 × 微Lamports/CU         │
└──────────────────────────────────────┘
```

### 🎯 优化计算预算

```typescript
// 💰 设置自定义计算预算
import { ComputeBudgetProgram } from '@solana/web3.js';

// 🚀 创建优化的交易
async function createOptimizedTransaction() {
    // 📊 Step 1: 设置计算单元限制
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 300_000  // 设置为300K CU
    });

    // 💸 Step 2: 添加优先费用（可选）
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1000  // 每CU 0.001 Lamports
    });

    // 🔨 Step 3: 构建交易
    const transaction = new Transaction()
        .add(modifyComputeUnits)      // 必须在前3条指令内！
        .add(addPriorityFee)          // 优先费用
        .add(yourInstruction);         // 你的实际指令

    // 💡 计算总费用
    const baseFee = 5000;  // 基础费用
    const priorityFee = 300_000 * 0.001;  // 300 Lamports
    const totalFee = baseFee + priorityFee;

    console.log(`💰 预计总费用: ${totalFee} Lamports`);

    return transaction;
}
```

### 🔍 监控计算使用

```rust
use solana_program::log::sol_log_compute_units;

pub fn process_complex_calculation() -> ProgramResult {
    msg!("🚀 开始复杂计算...");
    sol_log_compute_units();  // 记录当前CU

    // 执行一些计算
    perform_heavy_computation()?;

    msg!("📊 计算后剩余CU:");
    sol_log_compute_units();  // 查看使用了多少

    Ok(())
}
```

---

## 📦 栈内存管理

### 🎯 避免栈溢出

```rust
// ❌ 错误：可能导致栈溢出
fn process_large_data() -> ProgramResult {
    let huge_array = [0u8; 5000];  // 5KB > 4KB栈限制！
    // 处理...
}

// ✅ 正确：使用堆分配
fn process_large_data_safely() -> ProgramResult {
    // 使用Box将数据放在堆上
    let huge_array = Box::new([0u8; 5000]);  // 现在在堆上！

    msg!("📦 数据大小: {} 字节", huge_array.len());

    // 使用解引用操作符访问数据
    let first_byte = (*huge_array)[0];

    Ok(())
}

// 🎯 更优雅的解决方案：使用Vec
fn process_dynamic_data() -> ProgramResult {
    // Vec自动在堆上分配
    let mut data = Vec::with_capacity(5000);
    data.resize(5000, 0);

    msg!("📊 动态数据准备完成");

    Ok(())
}
```

### 💡 内存优化技巧

```rust
// 🏗️ 智能内存管理示例
pub struct OptimizedStorage {
    // 小数据：直接存储
    pub id: u32,                    // 4字节，栈上
    pub status: u8,                  // 1字节，栈上

    // 大数据：使用Box
    pub large_data: Box<[u8; 1024]>, // 1KB，堆上

    // 动态数据：使用Vec
    pub comments: Vec<String>,       // 动态大小，堆上
}

impl OptimizedStorage {
    pub fn new() -> Self {
        Self {
            id: 0,
            status: 0,
            large_data: Box::new([0; 1024]),
            comments: Vec::new(),
        }
    }

    // 🔍 检查内存使用
    pub fn memory_usage(&self) -> usize {
        let stack_usage = std::mem::size_of::<u32>() +
                         std::mem::size_of::<u8>();
        let heap_usage = 1024 +
                        self.comments.capacity() * std::mem::size_of::<String>();

        msg!("📊 栈使用: {} 字节", stack_usage);
        msg!("📦 堆使用: {} 字节", heap_usage);

        stack_usage + heap_usage
    }
}
```

---

## 🎯 测试最佳实践

### 📋 测试清单

```rust
// 🏆 完美的测试结构
#[cfg(test)]
mod tests {
    use super::*;

    // 🏗️ 设置辅助函数
    fn setup() -> TestEnvironment {
        TestEnvironment::new()
    }

    // ✅ 测试正常路径
    #[test]
    fn test_happy_path() {
        // Given (准备)
        let env = setup();

        // When (执行)
        let result = perform_action(&env);

        // Then (验证)
        assert!(result.is_ok());
    }

    // 🚫 测试错误情况
    #[test]
    fn test_error_cases() {
        // 测试各种错误场景
    }

    // 🔍 测试边界条件
    #[test]
    fn test_edge_cases() {
        // 测试极限情况
    }

    // 🎭 测试状态转换
    #[test]
    fn test_state_transitions() {
        // 测试状态变化
    }
}
```

### 🚀 测试优化技巧

1. **并行测试** 🚄
   ```bash
   cargo test-sbf -- --test-threads=8
   ```

2. **只运行失败的测试** 🎯
   ```bash
   cargo test-sbf -- --failed
   ```

3. **测试覆盖率** 📊
   ```bash
   cargo tarpaulin --out Html
   ```

4. **性能测试** ⚡
   ```rust
   #[bench]
   fn bench_process_instruction(b: &mut Bencher) {
       b.iter(|| process_instruction(/*...*/));
   }
   ```

---

## 🎓 总结

### 📚 你学到的技能

```
┌────────────────────────────────────┐
│       🏆 测试大师技能                │
├────────────────────────────────────┤
│ ✅ 编写单元测试                      │
│ ✅ 创建集成测试                      │
│ ✅ TypeScript测试                   │
│ ✅ 错误处理和调试                    │
│ ✅ 计算预算优化                      │
│ ✅ 内存管理                         │
└────────────────────────────────────┘
```

### 💡 记住这些要点

- 🧪 **测试是投资** - 短期成本，长期收益
- 🎯 **早测试，常测试** - 越早发现Bug越便宜
- 📊 **覆盖率不是一切** - 质量比数量重要
- 🚀 **自动化一切** - CI/CD是你的朋友

---

## 🚀 下一步

恭喜你成为了**测试大师**！🎉 现在你可以：
- 构建可靠的Solana程序
- 快速定位和修复Bug
- 自信地部署到主网

> 💬 **终极智慧：** "未经测试的代码就是Bug！" - 每个经验丰富的开发者

---

**让我们一起构建更可靠的Web3世界！** 🚀🧪✨
