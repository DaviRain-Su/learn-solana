---
sidebar_position: 84
sidebar_label: 🎸 使用Anchor PDA构建
sidebar_class_name: green
---

# 🎸 使用Anchor PDA构建 - 打造你的链上电影评论帝国！

## 🎯 欢迎来到PDA实战训练营！

嘿，Solana电影爱好者们！👋 准备好用**Anchor的魔法**打造一个超酷的电影评论平台了吗？今天我们要用**PDA（程序派生地址）**构建一个真正的链上应用！

想象一下：
- 🎬 **传统评论** = 中心化数据库，可能被删除
- ⛓️ **链上评论** = 永久存在，无法篡改的真实评价！

> 🎯 **今日任务：** 构建一个完整的电影评论系统，包含创建、更新和删除功能！

### 🗺️ 我们要构建什么？

```
┌──────────────────────────────────────┐
│       🎬 电影评论系统功能             │
├──────────────────────────────────────┤
│                                       │
│  1️⃣ 添加评论 ✍️                      │
│    └─ 使用PDA存储评论数据              │
│                                       │
│  2️⃣ 更新评论 ✏️                      │
│    └─ 动态调整存储空间                 │
│                                       │
│  3️⃣ 删除评论 🗑️                      │
│    └─ 关闭账户并退还租金               │
│                                       │
└──────────────────────────────────────┘
```

---

## 🚀 项目设置

### 🎯 Step 1: 准备开发环境

```bash
# 🌐 打开Solana Playground
# 访问: https://beta.solpg.io/

# 🆕 创建新项目
# 1. 点击 "Create a new project"
# 2. 选择 "Anchor (Rust)"
# 3. 命名为 "movie-review"
```

### 📝 Step 2: 初始化项目框架

替换 `lib.rs` 中的默认代码：

```rust
// 🎬 电影评论程序 - Anchor版本
// 让我们用Anchor的力量重新打造电影评论系统！

use anchor_lang::prelude::*;

// 🆔 声明程序ID（这是程序的唯一标识）
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// 🎮 主程序模块
#[program]
pub mod movie_review {
    use super::*;

    // 指令将在这里定义...
}
```

> 💡 **小知识：** 程序ID就像是你程序的身份证号码，每个程序都有唯一的ID！

---

## 📊 定义数据结构

### 🎯 创建电影评论账户结构

```rust
/// 🎬 电影评论账户状态
/// 存储每个评论的所有信息
#[account]
pub struct MovieAccountState {
    /// 👤 评论者的公钥地址
    pub reviewer: Pubkey,

    /// ⭐ 电影评分 (1-5星)
    pub rating: u8,

    /// 🎞️ 电影标题
    pub title: String,

    /// 📝 详细评论内容
    pub description: String,
}

// 🧮 空间计算说明：
// Discriminator: 8字节（Anchor自动添加）
// Pubkey: 32字节
// u8: 1字节
// String: 4字节（长度）+ 实际内容
```

### 📐 空间计算图解

```
账户空间布局：
┌──────────────────────────────────────┐
│  Discriminator  │  8 bytes           │
├─────────────────┼────────────────────┤
│  reviewer       │  32 bytes          │
├─────────────────┼────────────────────┤
│  rating         │  1 byte            │
├─────────────────┼────────────────────┤
│  title          │  4 + len bytes     │
├─────────────────┼────────────────────┤
│  description    │  4 + len bytes     │
└──────────────────────────────────────┘
```

---

## ✍️ 实现添加评论功能

### 🎯 Step 1: 创建add_movie_review指令

```rust
#[program]
pub mod movie_review {
    use super::*;

    /// 🎬 添加电影评论
    /// 创建一个新的PDA账户来存储评论数据
    pub fn add_movie_review(
        ctx: Context<AddMovieReview>,
        title: String,           // 🎞️ 电影标题
        description: String,      // 📝 评论内容
        rating: u8,              // ⭐ 评分（1-5）
    ) -> Result<()> {
        // 📢 记录操作日志
        msg!("🎬 创建电影评论账户");
        msg!("  📽️ 电影：{}", title);
        msg!("  ⭐ 评分：{}/5", rating);
        msg!("  📝 评论：{}", description);

        // 🔒 验证评分范围
        require!(
            rating >= 1 && rating <= 5,
            MovieReviewError::InvalidRating
        );

        // 📦 获取账户的可变引用
        let movie_review = &mut ctx.accounts.movie_review;

        // 💾 保存数据到账户
        movie_review.reviewer = ctx.accounts.initializer.key();
        movie_review.title = title;
        movie_review.rating = rating;
        movie_review.description = description;

        msg!("✅ 评论创建成功！");
        Ok(())
    }
}
```

### 📦 Step 2: 定义AddMovieReview上下文

```rust
/// 📦 添加评论所需的账户
#[derive(Accounts)]
#[instruction(title: String, description: String)]  // 🎯 访问指令参数
pub struct AddMovieReview<'info> {
    /// 🎬 电影评论PDA账户
    #[account(
        init,  // 🆕 初始化新账户
        seeds = [
            title.as_bytes(),              // 🌱 种子1：电影标题
            initializer.key().as_ref()     // 🌱 种子2：用户公钥
        ],
        bump,  // 🎲 自动计算bump值
        payer = initializer,  // 💰 谁付租金
        space = 8 +          // Discriminator
               32 +          // reviewer (Pubkey)
               1 +           // rating (u8)
               4 + title.len() +      // title (String)
               4 + description.len()   // description (String)
    )]
    pub movie_review: Account<'info, MovieAccountState>,

    /// 👤 初始化者（付款人+签名者）
    #[account(mut)]
    pub initializer: Signer<'info>,

    /// ⚙️ 系统程序
    pub system_program: Program<'info, System>,
}
```

> 💡 **Pro Tip：** PDA种子的选择很重要！使用`[标题, 用户]`的组合确保每个用户对每部电影只能有一个评论！

---

## ✏️ 实现更新评论功能

### 🎯 Step 1: 创建update_movie_review指令

```rust
/// 📝 更新已存在的电影评论
pub fn update_movie_review(
    ctx: Context<UpdateMovieReview>,
    title: String,
    description: String,
    rating: u8,
) -> Result<()> {
    msg!("✏️ 更新电影评论");
    msg!("  🎬 电影：{}", title);
    msg!("  ⭐ 新评分：{}/5", rating);
    msg!("  📝 新评论：{}", description);

    // 🔒 验证评分
    require!(
        rating >= 1 && rating <= 5,
        MovieReviewError::InvalidRating
    );

    // 📦 获取账户引用
    let movie_review = &mut ctx.accounts.movie_review;

    // 🔐 验证是否是原作者
    require_keys_eq!(
        movie_review.reviewer,
        ctx.accounts.initializer.key(),
        MovieReviewError::Unauthorized
    );

    // 💾 更新数据（标题不能改，因为它是PDA种子的一部分）
    movie_review.rating = rating;
    movie_review.description = description;

    msg!("✅ 评论更新成功！");
    Ok(())
}
```

### 📦 Step 2: 定义UpdateMovieReview上下文

```rust
/// 📦 更新评论所需的账户
#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct UpdateMovieReview<'info> {
    /// 📝 要更新的评论账户
    #[account(
        mut,  // 🔧 需要修改
        seeds = [
            title.as_bytes(),
            initializer.key().as_ref()
        ],
        bump,  // 🎲 验证PDA
        realloc = 8 + 32 + 1 + 4 + title.len() + 4 + description.len(),  // 📐 新大小
        realloc::payer = initializer,  // 💰 谁付差价
        realloc::zero = true,  // 🧹 清零新空间
    )]
    pub movie_review: Account<'info, MovieAccountState>,

    /// 👤 必须是原评论者
    #[account(mut)]
    pub initializer: Signer<'info>,

    /// ⚙️ 系统程序（realloc需要）
    pub system_program: Program<'info, System>,
}
```

> 🎨 **Realloc魔法解析：**
> - 描述变长 → 账户扩大 → 付更多租金 💰
> - 描述变短 → 账户缩小 → 退还租金 💸
> - `zero = true` → 防止脏数据 🧹

---

## 🗑️ 实现删除评论功能

### 🎯 创建close指令

```rust
/// 🗑️ 关闭评论账户
/// 删除评论并退还租金
pub fn close(_ctx: Context<Close>) -> Result<()> {
    msg!("🗑️ 关闭评论账户");
    msg!("💰 租金已退还给评论者");
    Ok(())  // Anchor自动处理关闭逻辑！
}
```

### 📦 定义Close上下文

```rust
/// 📦 关闭账户所需的账户
#[derive(Accounts)]
pub struct Close<'info> {
    /// 🎬 要关闭的评论账户
    #[account(
        mut,
        close = reviewer,      // 🔒 关闭并退款给reviewer
        has_one = reviewer     // 🔐 验证reviewer字段匹配
    )]
    movie_review: Account<'info, MovieAccountState>,

    /// 👤 必须是原评论者
    #[account(mut)]
    reviewer: Signer<'info>,
}
```

> 💡 **安全提示：** `has_one`约束确保只有原作者能删除自己的评论！

---

## 🚨 错误处理

### 🎯 定义自定义错误

```rust
/// 🚨 自定义错误枚举
#[error_code]
pub enum MovieReviewError {
    /// ⭐ 评分必须在1-5之间
    #[msg("评分必须在1到5之间！")]
    InvalidRating,

    /// 🔒 只有原作者能修改评论
    #[msg("你没有权限修改这个评论！")]
    Unauthorized,

    /// 📏 标题太长
    #[msg("标题不能超过50个字符！")]
    TitleTooLong,

    /// 📝 描述太长
    #[msg("评论不能超过500个字符！")]
    DescriptionTooLong,
}
```

---

## 💻 完整代码

<details>
<summary>🎯 点击查看完整代码</summary>

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod movie_review {
    use super::*;

    /// 🎬 添加电影评论
    pub fn add_movie_review(
        ctx: Context<AddMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()> {
        msg!("🎬 创建电影评论账户");

        require!(
            rating >= 1 && rating <= 5,
            MovieReviewError::InvalidRating
        );

        require!(
            title.len() <= 50,
            MovieReviewError::TitleTooLong
        );

        require!(
            description.len() <= 500,
            MovieReviewError::DescriptionTooLong
        );

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.reviewer = ctx.accounts.initializer.key();
        movie_review.title = title;
        movie_review.rating = rating;
        movie_review.description = description;

        msg!("✅ 评论创建成功！");
        Ok(())
    }

    /// ✏️ 更新电影评论
    pub fn update_movie_review(
        ctx: Context<UpdateMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()> {
        msg!("✏️ 更新电影评论");

        require!(
            rating >= 1 && rating <= 5,
            MovieReviewError::InvalidRating
        );

        require!(
            description.len() <= 500,
            MovieReviewError::DescriptionTooLong
        );

        let movie_review = &mut ctx.accounts.movie_review;

        require_keys_eq!(
            movie_review.reviewer,
            ctx.accounts.initializer.key(),
            MovieReviewError::Unauthorized
        );

        movie_review.rating = rating;
        movie_review.description = description;

        msg!("✅ 评论更新成功！");
        Ok(())
    }

    /// 🗑️ 关闭评论
    pub fn close(_ctx: Context<Close>) -> Result<()> {
        msg!("🗑️ 关闭评论账户");
        Ok(())
    }
}

// 账户结构定义...
// 上下文定义...
// 错误定义...
```

</details>

---

## 🧪 测试程序

### 📝 创建测试脚本

```javascript
// 🧪 测试脚本
describe("电影评论测试", () => {
    it("✅ 创建评论", async () => {
        // 测试创建功能
        await program.methods
            .addMovieReview("阿凡达", "视觉效果震撼！", 5)
            .accounts({
                movieReview: movieReviewPda,
                initializer: user.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([user])
            .rpc();

        console.log("🎉 评论创建成功！");
    });

    it("✏️ 更新评论", async () => {
        // 测试更新功能
    });

    it("🗑️ 删除评论", async () => {
        // 测试删除功能
    });
});
```

---

## 💡 实用技巧与最佳实践

### 🎯 技巧1：PDA种子设计

```rust
// ✅ 好的种子设计
seeds = [
    b"movie-review",           // 固定前缀
    title.as_bytes(),          // 唯一标识1
    reviewer.key().as_ref()    // 唯一标识2
]

// ❌ 不好的设计
seeds = [title.as_bytes()]  // 太简单，容易冲突
```

### 🎯 技巧2：空间优化

```rust
// 💡 为未来预留空间
const EXTRA_SPACE: usize = 100;  // 预留100字节
space = calculated_space + EXTRA_SPACE;
```

### 🎯 技巧3：批量操作

```rust
// 🚀 一次更新多个字段
movie_review.set_inner(MovieAccountState {
    reviewer: ctx.accounts.initializer.key(),
    title,
    rating,
    description,
});
```

---

## 🏆 挑战任务

### 🎯 基础挑战：计数器程序

创建一个计数器程序，包含：

1. **初始化** - 创建计数器账户
2. **递增** - 计数+1
3. **递减** - 计数-1
4. **重置** - 重置为初始值

### 🎯 进阶挑战：投票系统

扩展电影评论程序，添加：

1. **点赞功能** - 其他用户可以点赞评论
2. **评论排序** - 按点赞数排序
3. **徽章系统** - 高质量评论者获得徽章

### 🔗 参考资源

- 📖 [Anchor官方文档](https://www.anchor-lang.com/)
- 💻 [完整代码示例](https://beta.solpg.io/631b39c677ea7f12846aee8c)
- 🎓 [解决方案仓库](https://github.com/Unboxed-Software/anchor-counter-program)

---

## 🎓 知识总结

### 📚 你学到了什么

```
┌────────────────────────────────────┐
│      🏆 Anchor PDA技能解锁           │
├────────────────────────────────────┤
│ ✅ 使用PDA创建账户                   │
│ ✅ 实现CRUD操作                     │
│ ✅ 动态调整账户空间                  │
│ ✅ 安全关闭账户                     │
│ ✅ 自定义错误处理                    │
└────────────────────────────────────┘
```

### 🎯 记忆要点

> 🎵 **"PDA用种子，空间要计算，**
> **更新用realloc，关闭退租金"** 🎵

---

## 🚀 恭喜完成！

你已经成功构建了一个**完整的链上电影评论系统**！🎉 现在你可以：

- 🎬 创建永久的电影评论
- ✏️ 更新你的观点
- 🗑️ 删除不需要的内容
- 💰 高效管理链上资源

> 💬 **记住：** 每个伟大的DApp都从简单的CRUD开始！继续构建，继续创新！

---

**准备好构建下一个爆款DApp了吗？让我们继续前进！** 🚀🎸✨
