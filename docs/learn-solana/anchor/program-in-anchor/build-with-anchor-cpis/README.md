---
sidebar_position: 86
sidebar_label: 🚀 使用Anchor CPIs构建
sidebar_class_name: green
---

# 🎬 使用Anchor CPIs构建电影评论系统

> 🍿 **回归未来！** 让我们用一个超酷的电影评论系统来为 `CPIs`（跨程序调用）画上完美的句号！

## 🎯 本章目标

在这个激动人心的章节中，我们将打造一个功能齐全的电影评论奖励系统：

- 🪙 **创建代币铸造** - 带有炫酷元数据的奖励代币
- 📝 **添加电影评论** - 用户可以评价他们喜爱的电影
- 💰 **铸造奖励代币** - 评论者获得代币奖励！
- 💬 **评论功能** - 为评论添加评论，并获得额外奖励

## 🛠️ 开发环境准备

### 📦 初始代码
- 🔗 **起始代码链接**：[点击这里开始你的冒险](https://beta.solpg.io/63184c17bb7e0b5f4ca6dfa5?utm_source=buildspace.so&utm_medium=buildspace_project)
- 🏗️ **基础架构**：我们将在之前的 `PDA` 演示基础上进行扩展

> 💡 **小贴士**: 建议先熟悉一下起始代码，这样后续开发会更顺畅！

---

## 🪙 步骤 1：创建奖励代币铸造

让我们首先创建一个超酷的奖励代币系统！🎉

```rust
pub fn create_reward_mint(
    ctx: Context<CreateTokenReward>,
    uri: String,        // 🖼️ 代币的元数据URI（比如图片链接）
    name: String,       // 📛 代币名称（比如"MovieCoin"）
    symbol: String,     // 💱 代币符号（比如"MVC"）
) -> Result<()> {
    // 📢 打印日志，方便调试
    msg!("🎨 创建奖励代币中...");

    // 🔑 生成PDA种子 - "mint"字符串 + bump种子
    // 这确保了我们的铸造账户地址是唯一且可预测的
    let seeds = &["mint".as_bytes(), &[*ctx.bumps.get("reward_mint").unwrap()]];
    let signer = [&seeds[..]];

    // 📋 准备CPI所需的账户列表
    // 就像准备派对嘉宾名单一样！
    let account_info = vec![
        ctx.accounts.metadata.to_account_info(),           // 元数据账户
        ctx.accounts.reward_mint.to_account_info(),        // 铸造账户
        ctx.accounts.user.to_account_info(),               // 用户账户
        ctx.accounts.token_metadata_program.to_account_info(), // 元数据程序
        ctx.accounts.token_program.to_account_info(),      // 代币程序
        ctx.accounts.system_program.to_account_info(),     // 系统程序
        ctx.accounts.rent.to_account_info(),               // 租金账户
    ];

    // 🚀 执行跨程序调用（CPI）
    // 调用Token Metadata程序创建元数据账户
    invoke_signed(
        &create_metadata_accounts_v2(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.reward_mint.key(),
            ctx.accounts.reward_mint.key(),  // 铸造权限
            ctx.accounts.user.key(),         // 更新权限
            ctx.accounts.user.key(),         // 支付者
            name,                             // 代币名称
            symbol,                           // 代币符号
            uri,                              // 元数据URI
            None,                             // 创建者（可选）
            0,                                // 卖方费用基点
            true,                             // 更新权限是否为签名者
            true,                             // 是否可变
            None,                             // 集合（可选）
            None,                             // 使用（可选）
        ),
        account_info.as_slice(),
        &signer,  // 🔐 使用PDA签名
    )?;

    msg!("✅ 奖励代币创建成功！");
    Ok(())
}
```

### 📝 定义上下文结构体

```rust
#[derive(Accounts)]
pub struct CreateTokenReward<'info> {
    // 🪙 初始化铸造账户（PDA）
    #[account(
        init,                           // 初始化新账户
        seeds = ["mint".as_bytes()],    // PDA种子
        bump,                           // 自动计算bump
        payer = user,                   // 用户支付费用
        mint::decimals = 6,             // 6位小数（类似USDC）
        mint::authority = reward_mint,  // 铸造权限设为自己（PDA）
    )]
    pub reward_mint: Account<'info, Mint>,

    // 👤 支付交易费用的用户
    #[account(mut)]
    pub user: Signer<'info>,

    // 🏛️ 必需的系统程序
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,

    // ⚠️ CHECK: 这些账户由Token Metadata程序验证
    // Anchor不知道这些账户的结构，所以我们使用AccountInfo
    /// CHECK: Token元数据账户
    #[account(mut)]
    pub metadata: AccountInfo<'info>,

    /// CHECK: Token元数据程序
    pub token_metadata_program: AccountInfo<'info>,
}
```

> 🔍 **深入理解 `/// CHECK`**:
> - 当使用 `AccountInfo` 而不是具体类型时需要添加
> - 告诉Anchor我们知道自己在做什么
> - 详细文档：[Anchor安全检查](https://book.anchor-lang.com/anchor_in_depth/the_accounts_struct.html#safety-checks)

---

## ⚠️ 步骤 2：创建错误处理

优雅的错误处理让你的程序更专业！🎯

```rust
#[error_code]
pub enum ErrorCode {
    #[msg("⚠️ 评分必须在1-5之间！")]
    InvalidRating,

    // 💡 提示：可以添加更多错误类型
    // #[msg("📝 标题太长了！")]
    // TitleTooLong,
    // #[msg("💬 评论不能为空！")]
    // EmptyComment,
}
```

> 🎨 **最佳实践**: 使用清晰、友好的错误信息，帮助用户理解问题所在！

---

## 🎬 步骤 3：升级添加电影评论功能

让我们给评论功能加点料！🚀

```rust
pub fn add_movie_review(
    ctx: Context<AddMovieReview>,
    title: String,
    description: String,
    rating: u8,
) -> Result<()> {
    // 🎬 开始记录这个重要时刻
    msg!("🎬 正在创建电影评论...");
    msg!("📽️ 电影：{}", title);
    msg!("📝 评价：{}", description);
    msg!("⭐ 评分：{}/5", rating);

    // 🔍 验证评分范围（1-5星）
    if rating > 5 || rating < 1 {
        msg!("❌ 评分 {} 无效！必须在1-5之间", rating);
        return err!(ErrorCode::InvalidRating);
    }

    // 📝 保存评论信息
    let movie_review = &mut ctx.accounts.movie_review;
    movie_review.reviewer = ctx.accounts.initializer.key();
    movie_review.title = title;
    movie_review.rating = rating;
    movie_review.description = description;
    msg!("✅ 评论信息已保存！");

    // 🔢 初始化评论计数器
    msg!("📊 初始化评论计数器...");
    let movie_comment_counter = &mut ctx.accounts.movie_comment_counter;
    movie_comment_counter.counter = 0;
    msg!("📊 当前评论数：{}", movie_comment_counter.counter);

    // 🎁 准备发放奖励代币！
    // 构建PDA签名种子
    let seeds = &["mint".as_bytes(), &[*ctx.bumps.get("reward_mint").unwrap()]];
    let signer = [&seeds[..]];

    // 🚀 创建CPI上下文来铸造代币
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        token::MintTo {
            mint: ctx.accounts.reward_mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.reward_mint.to_account_info(),
        },
        &signer,
    );

    // 💰 铸造10个代币作为奖励（记住：6位小数）
    // 10000000 = 10.000000 代币
    token::mint_to(cpi_ctx, 10_000_000)?;
    msg!("🎉 恭喜！你获得了10个电影代币！");

    Ok(())
}
```

### 📋 更新上下文结构体

```rust
#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct AddMovieReview<'info> {
    // 📽️ 电影评论账户（PDA）
    #[account(
        init,
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        payer = initializer,
        space = 8 + 32 + 1 + 4 + title.len() + 4 + description.len()
        // 空间计算：
        // 8 - 账户鉴别器
        // 32 - 公钥（reviewer）
        // 1 - u8（rating）
        // 4 + title.len() - 字符串（title）
        // 4 + description.len() - 字符串（description）
    )]
    pub movie_review: Account<'info, MovieAccountState>,

    // 💬 评论计数器（PDA）
    #[account(
        init,
        seeds = ["counter".as_bytes(), movie_review.key().as_ref()],
        bump,
        payer = initializer,
        space = 8 + 8  // 鉴别器 + u64计数器
    )]
    pub movie_comment_counter: Account<'info, MovieCommentCounter>,

    // 🪙 奖励代币铸造账户
    #[account(
        mut,
        seeds = ["mint".as_bytes()],
        bump
    )]
    pub reward_mint: Account<'info, Mint>,

    // 💳 用户的代币账户（如果不存在则创建）
    #[account(
        init_if_needed,  // 🔥 超方便！自动检查并创建
        payer = initializer,
        associated_token::mint = reward_mint,
        associated_token::authority = initializer
    )]
    pub token_account: Account<'info, TokenAccount>,

    // 👤 交易发起者
    #[account(mut)]
    pub initializer: Signer<'info>,

    // 🏛️ 必需的程序
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}
```

> 💡 **专业提示**: `init_if_needed` 是Anchor的魔法功能之一！它会自动检查账户是否存在，不存在就创建，存在就直接使用！

---

## ✏️ 步骤 4：更新电影评论功能

```rust
pub fn update_movie_review(
    ctx: Context<UpdateMovieReview>,
    title: String,
    description: String,
    rating: u8,
) -> Result<()> {
    msg!("📝 正在更新电影评论...");
    msg!("🎬 电影：{}", title);
    msg!("💭 新评价：{}", description);
    msg!("⭐ 新评分：{}/5", rating);

    // 🔍 验证评分
    if rating > 5 || rating < 1 {
        msg!("❌ 无效评分：{}", rating);
        return err!(ErrorCode::InvalidRating);
    }

    // 📝 更新评论内容
    let movie_review = &mut ctx.accounts.movie_review;
    movie_review.rating = rating;
    movie_review.description = description;

    msg!("✅ 评论更新成功！");
    Ok(())
}
```

---

## 💬 步骤 5：添加评论功能

现在让我们添加最酷的功能 - 评论系统！

```rust
pub fn add_comment(ctx: Context<AddComment>, comment: String) -> Result<()> {
    msg!("💬 有人发表了新评论！");
    msg!("📝 内容：{}", comment);

    // 💾 保存评论数据
    let movie_comment = &mut ctx.accounts.movie_comment;
    let movie_comment_counter = &mut ctx.accounts.movie_comment_counter;

    // 设置评论信息
    movie_comment.review = ctx.accounts.movie_review.key();
    movie_comment.commenter = ctx.accounts.initializer.key();
    movie_comment.comment = comment;
    movie_comment.count = movie_comment_counter.counter;

    // 🔢 增加评论计数
    movie_comment_counter.counter += 1;
    msg!("📊 这是第 {} 条评论！", movie_comment_counter.counter);

    // 🎁 准备发放评论奖励（5个代币）
    let seeds = &["mint".as_bytes(), &[*ctx.bumps.get("reward_mint").unwrap()]];
    let signer = [&seeds[..]];

    // 🚀 执行CPI铸造代币
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        token::MintTo {
            mint: ctx.accounts.reward_mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.reward_mint.to_account_info(),
        },
        &signer,
    );

    // 💰 铸造5个代币作为评论奖励
    token::mint_to(cpi_ctx, 5_000_000)?;
    msg!("🎉 感谢评论！你获得了5个电影代币！");

    Ok(())
}
```

### 📋 评论上下文结构体

```rust
#[derive(Accounts)]
#[instruction(comment: String)]
pub struct AddComment<'info> {
    // 💬 新的评论账户（PDA）
    #[account(
        init,
        // 使用评论ID和计数器作为种子，确保唯一性
        seeds = [
            movie_review.key().as_ref(),
            &movie_comment_counter.counter.to_le_bytes()
        ],
        bump,
        payer = initializer,
        space = 8 + 32 + 32 + 4 + comment.len() + 8
        // 空间计算：
        // 8 - 鉴别器
        // 32 - 评论的公钥
        // 32 - 评论者的公钥
        // 4 + comment.len() - 评论内容
        // 8 - 评论编号
    )]
    pub movie_comment: Account<'info, MovieComment>,

    // 🎬 关联的电影评论
    pub movie_review: Account<'info, MovieAccountState>,

    // 🔢 评论计数器
    #[account(
        mut,
        seeds = ["counter".as_bytes(), movie_review.key().as_ref()],
        bump,
    )]
    pub movie_comment_counter: Account<'info, MovieCommentCounter>,

    // 🪙 奖励代币相关账户
    #[account(
        mut,
        seeds = ["mint".as_bytes()],
        bump
    )]
    pub reward_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,  // 自动创建代币账户
        payer = initializer,
        associated_token::mint = reward_mint,
        associated_token::authority = initializer
    )]
    pub token_account: Account<'info, TokenAccount>,

    // 👤 评论者
    #[account(mut)]
    pub initializer: Signer<'info>,

    // 🏛️ 系统程序
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}
```

---

## 🚀 步骤 6：构建、部署和测试

### 📦 重要配置

> ⚠️ **关键提示**: 如果你在本地编辑器中开发，必须在 `Cargo.toml` 中添加以下配置：

```toml
[dependencies]
mpl-token-metadata = { version = "1.3.3", features = ["no-entrypoint"] }
```

否则会遇到这个错误：
```
❌ the #[global_allocator] in this crate conflicts with global allocator in: mpl_token_metadata
```

### 🛠️ 构建和部署步骤

1. **🔨 构建程序**
   ```bash
   anchor build
   ```

2. **🚀 部署到Devnet**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

3. **🧪 运行测试**
   ```bash
   anchor test
   ```

### 🎯 完整解决方案

📌 **完整代码**: [查看完整解决方案](https://beta.solpg.io/6319c7bf77ea7f12846aee87)

---

## 💡 实用技巧和最佳实践

### 🏆 专业建议

1. **📊 监控Gas费用**
   - CPI调用会消耗更多计算单元
   - 考虑使用 `compute_budget` 指令增加限制

2. **🔒 安全第一**
   - 始终验证输入参数
   - 使用PDA作为程序权限
   - 仔细检查账户所有权

3. **📝 日志记录**
   - 使用描述性的 `msg!` 语句
   - 在生产环境中考虑减少日志以节省计算单元

4. **🎨 用户体验**
   - 提供清晰的错误信息
   - 考虑添加事件发射功能
   - 实现批量操作以提高效率

### 🚧 常见问题解决

| 问题 | 解决方案 |
|------|---------|
| 🔴 "账户不存在" | 确保使用正确的种子创建PDA |
| 🟡 "计算单元超限" | 增加计算预算或优化代码 |
| 🔵 "签名验证失败" | 检查PDA bump和种子是否正确 |

---

## 🎊 总结

恭喜你！🎉 你已经成功构建了一个功能完整的电影评论奖励系统！

### ✅ 你学到了什么

- 🔗 如何执行跨程序调用（CPI）
- 🪙 创建和管理SPL代币
- 📝 使用Token Metadata程序
- 🎁 实现代币奖励机制
- 🏗️ 构建复杂的PDA结构

### 🚀 下一步

- 添加更多功能（点赞、收藏等）
- 实现NFT奖励系统
- 创建前端界面
- 部署到主网！

---

> 🌟 **记住**: 编程就像拍电影，需要创意、耐心和不断的迭代。继续构建，继续学习！

Happy Coding! 🚀✨
