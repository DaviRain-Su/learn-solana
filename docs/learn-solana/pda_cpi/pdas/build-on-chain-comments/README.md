---
sidebar_position: 68
sidebar_label: 💬 链上评论功能的构建
sidebar_class_name: green
---

# 💬 链上评论功能的构建 - 打造Web3版的豆瓣影评！

## 🎬 欢迎来到链上社交的世界！

嘿，Solana建设者们！👋 还记得我们之前构建的电影评论程序吗？今天我们要给它加上**超能力** —— 让用户可以对评论进行评论！就像给你的程序装上了**社交引擎**！🚀

> 🎯 **今日任务：** 利用PDA的魔力，构建一个完整的链上评论系统！

想象一下：
- 👨‍💻 小明发了一条影评："这部电影太棒了！"
- 👩‍💻 小红回复："我也这么认为！特效超赞！"
- 🧑‍💻 小李加入讨论："配乐也很棒！"

这一切都将发生在**区块链上**！是不是很酷？😎

---

## 🏗️ 项目初始化 - 搭建你的工作台

### 📦 第一步：创建新项目

```bash
# 🎪 创建一个全新的Rust库项目
cargo new --lib movie-review-comments

# 📁 进入项目目录
cd movie-review-comments

# 🎉 恭喜！你的项目骨架已经准备好了！
```

### 🔧 第二步：配置Cargo.toml

打开 `Cargo.toml`，让我们配置项目的**超能力**：

```toml
[package]
name = "movie-review-comments"
version = "0.1.0"
edition = "2021"

# 🎯 特性标志 - 告诉编译器一些特殊设置
[features]
no-entrypoint = []  # 用于测试时不需要入口点

# 📚 依赖项 - 我们的工具箱
[dependencies]
solana-program = "1.10.29"  # Solana核心库
borsh = "0.9.3"             # 序列化神器
thiserror = "1.0.31"        # 错误处理助手

# 🏭 库配置
[lib]
crate-type = ["cdylib", "lib"]  # 编译为动态库和静态库
```

> ⚠️ **版本提醒：** 如果这些版本太旧了，使用 `cargo add <包名>` 来安装最新版本！

### 📥 第三步：导入之前的代码

从我们[上次的电影评论程序](https://beta.solpg.io/6312eaf988a7fca897ad7d15)复制所有文件：

```
📦 src/
 ├── 📜 lib.rs         # 模块注册中心
 ├── 📜 entrypoint.rs  # 程序入口
 ├── 📜 error.rs       # 错误定义
 ├── 📜 instruction.rs # 指令处理
 ├── 📜 processor.rs   # 业务逻辑
 └── 📜 state.rs       # 状态管理
```

### ✅ 第四步：验证构建

```bash
# 🔨 构建程序（第一次可能需要几分钟）
cargo build-sbf

# 🎉 看到绿色的"Finished"了吗？太棒了！
```

---

## 🧩 数据架构设计 - 构建评论帝国

### 🤔 思考时间：如何组织链上数据？

想象你在设计一个**图书馆**📚：
- 📖 每本书（电影评论）放在特定的书架上
- 📝 每本书可以有很多便签（评论）
- 🔢 需要一个目录系统来追踪所有内容

### 🎨 数据结构图解

```
🎬 电影评论系统架构
┌────────────────────────────────────────┐
│          🎬 电影评论 PDA                │
│   种子: [用户公钥, 电影标题]             │
│   数据: {标题, 评分, 描述}               │
└────────────────────────────────────────┘
           ↓                    ↓
    ┌──────────────┐     ┌──────────────┐
    │ 📊 计数器PDA  │     │ 💬 评论PDAs  │
    │ 种子:[评论PDA,│     │ 种子:[评论PDA,│
    │      "comment"]│     │      序号]    │
    │ 数据:{count:5}│     │ 数据:{text...}│
    └──────────────┘     └──────────────┘
                              ↓ ↓ ↓
                         [评论1][评论2][评论3]...
```

> 💡 **核心理念：** 每个电影评论都有一个计数器（记录评论数量）和多个评论账户（存储实际评论）

---

## 📦 构建数据模型 - 定义我们的积木

### 🏗️ 更新state.rs - 创建数据蓝图

```rust
use borsh::{BorshSerialize, BorshDeserialize};
use solana_program::{
    pubkey::Pubkey,
    program_pack::{IsInitialized, Sealed},
};

// 🎬 电影评论账户状态
#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieAccountState {
    // 🏷️ 鉴别器 - 用于识别账户类型的标签
    pub discriminator: String,  // "review" - 标记这是个评论账户

    // ✅ 初始化标志 - 账户是否已经设置好了？
    pub is_initialized: bool,

    // 👤 评论者 - 谁写的这个评论？
    pub reviewer: Pubkey,

    // ⭐ 评分 - 1到5星
    pub rating: u8,

    // 📝 标题和描述
    pub title: String,
    pub description: String,
}

// 📊 评论计数器 - 记录有多少条评论
#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieCommentCounter {
    // 🏷️ 标识符 - "counter"
    pub discriminator: String,

    // ✅ 是否已初始化
    pub is_initialized: bool,

    // 🔢 评论总数
    pub counter: u64,  // u64可以存储很大的数字！
}

// 💬 单条评论
#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieComment {
    // 🏷️ 标识符 - "comment"
    pub discriminator: String,

    // ✅ 初始化标志
    pub is_initialized: bool,

    // 🎬 关联的电影评论
    pub review: Pubkey,

    // 👤 评论者
    pub commenter: Pubkey,

    // 💭 评论内容
    pub comment: String,

    // 🔢 这是第几条评论
    pub count: u64,
}

// 🔐 实现必要的trait
impl Sealed for MovieAccountState {}

impl IsInitialized for MovieAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl IsInitialized for MovieCommentCounter {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl IsInitialized for MovieComment {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
```

### 📏 计算账户大小 - 精确到每个字节！

```rust
impl MovieAccountState {
    // 🏷️ 静态鉴别器 - 用于过滤账户
    pub const DISCRIMINATOR: &'static str = "review";

    // 📐 动态计算账户大小
    pub fn get_account_size(title: String, description: String) -> usize {
        // 🧮 让我们算算需要多少空间：
        (4 + MovieAccountState::DISCRIMINATOR.len())  // 鉴别器
            + 1   // is_initialized (bool = 1字节)
            + 32  // reviewer (Pubkey = 32字节)
            + 1   // rating (u8 = 1字节)
            + (4 + title.len())       // 标题（4字节长度 + 内容）
            + (4 + description.len())  // 描述（4字节长度 + 内容）
    }
}

impl MovieComment {
    pub const DISCRIMINATOR: &'static str = "comment";

    // 📐 评论账户大小计算
    pub fn get_account_size(comment: String) -> usize {
        (4 + MovieComment::DISCRIMINATOR.len())  // 鉴别器
            + 1   // is_initialized
            + 32  // review账户地址
            + 32  // 评论者地址
            + (4 + comment.len())  // 评论内容
            + 8   // count (u64 = 8字节)
    }
}

impl MovieCommentCounter {
    pub const DISCRIMINATOR: &'static str = "counter";

    // 📏 计数器大小是固定的！
    pub const SIZE: usize = (4 + MovieCommentCounter::DISCRIMINATOR.len())
        + 1   // is_initialized
        + 8;  // counter
}

// 🔒 Sealed trait - 告诉编译器大小是已知的
impl Sealed for MovieCommentCounter{}
```

> 💡 **Pro Tip:** 为什么要精确计算大小？因为在Solana上，每个字节都要付租金！💰

---

## 🎮 更新指令系统 - 添加评论功能

### 📝 更新instruction.rs

```rust
// 🎯 指令枚举 - 定义所有可能的操作
pub enum MovieInstruction {
    // 🎬 添加电影评论
    AddMovieReview {
        title: String,
        rating: u8,
        description: String
    },

    // ✏️ 更新电影评论
    UpdateMovieReview {
        title: String,
        rating: u8,
        description: String
    },

    // 💬 新增：添加评论！
    AddComment {
        comment: String
    }
}

// 📦 评论数据载体
#[derive(BorshDeserialize)]
struct CommentPayload {
    comment: String  // 简单明了！
}

impl MovieInstruction {
    // 📨 解包函数 - 将字节转换为指令
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // 🎲 获取第一个字节作为指令类型
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        // 🎭 根据类型解析不同的数据
        Ok(match variant {
            0 => {
                // 🎬 解析电影评论数据
                let payload = MovieReviewPayload::try_from_slice(rest)
                    .map_err(|_| ProgramError::from(Error::ParseMovieReviewPayloadFailed))?;

                Self::AddMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description,
                }
            }
            1 => {
                // ✏️ 解析更新数据（格式相同）
                let payload = MovieReviewPayload::try_from_slice(rest)
                    .map_err(|_| ProgramError::from(Error::ParseMovieReviewPayloadFailed))?;

                Self::UpdateMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description,
                }
            }
            2 => {
                // 💬 解析评论数据（新！）
                let payload = CommentPayload::try_from_slice(rest)
                    .map_err(|_| ProgramError::from(Error::ParseMovieCommentPayloadFailed))?;

                Self::AddComment {
                    comment: payload.comment,
                }
            }
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}
```

### 🎮 更新处理器路由

```rust
// processor.rs
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    // 📦 解包指令
    let instruction = MovieInstruction::unpack(instruction_data)?;

    // 🚦 路由到正确的处理函数
    match instruction {
        MovieInstruction::AddMovieReview { title, rating, description } => {
            msg!("🎬 处理添加电影评论...");
            add_movie_review(program_id, accounts, title, rating, description)
        },

        MovieInstruction::UpdateMovieReview { title, rating, description } => {
            msg!("✏️ 处理更新电影评论...");
            update_movie_review(program_id, accounts, title, rating, description)
        },

        MovieInstruction::AddComment { comment } => {
            msg!("💬 处理添加评论...");
            add_comment(program_id, accounts, comment)
        }
    }
}

// 🏗️ 临时的空函数（稍后实现）
pub fn add_comment(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    comment: String
) -> ProgramResult {
    msg!("🚧 评论功能开发中...");
    Ok(())
}
```

---

## 🎬 升级add_movie_review - 创建计数器

### 🔧 添加评论计数器逻辑

```rust
fn add_movie_review(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    title: String,
    rating: u8,
    description: String
) -> ProgramResult {
    msg!("🎬 添加电影评论: {}", title);

    // 📝 解析账户列表
    let account_info_iter = &mut accounts.iter();
    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // 🆕 新增：评论计数器账户！
    let pda_counter = next_account_info(account_info_iter)?;

    // ... 验证PDA的代码 ...

    // 🔐 验证计数器PDA
    let (counter_pda, counter_bump_seed) = Pubkey::find_program_address(
        &[pda.as_ref(), "comment".as_ref()],  // 使用评论PDA + "comment"作为种子
        program_id
    );

    if counter_pda != *pda_counter.key {
        msg!("❌ 计数器PDA验证失败！");
        return Err(ProgramError::InvalidArgument)
    }

    // 📏 计算账户大小
    let account_len: usize = 1000;  // 固定大小，简化处理

    if MovieAccountState::get_account_size(title.clone(), description.clone()) > account_len {
        msg!("❌ 数据太长了！最多1000字节");
        return Err(ReviewError::InvalidDataLength.into());
    }

    // ... 创建电影评论账户的代码 ...

    // 📝 设置电影评论数据
    account_data.discriminator = MovieAccountState::DISCRIMINATOR.to_string();
    account_data.reviewer = *initializer.key;
    account_data.title = title;
    account_data.rating = rating;
    account_data.description = description;
    account_data.is_initialized = true;

    // 🎯 创建评论计数器账户
    msg!("📊 创建评论计数器...");

    // 💰 计算租金
    let rent = Rent::get()?;
    let counter_rent_lamports = rent.minimum_balance(MovieCommentCounter::SIZE);

    // 🏗️ 调用系统程序创建账户
    invoke_signed(
        &system_instruction::create_account(
            initializer.key,        // 付款人
            pda_counter.key,       // 新账户地址
            counter_rent_lamports,  // 租金
            MovieCommentCounter::SIZE.try_into().unwrap(),  // 大小
            program_id,            // 所有者
        ),
        &[
            initializer.clone(),
            pda_counter.clone(),
            system_program.clone(),
        ],
        // 🔑 PDA签名种子
        &[&[pda.as_ref(), "comment".as_ref(), &[counter_bump]]],
    )?;

    msg!("✅ 计数器账户已创建");

    // 📦 初始化计数器数据
    let mut counter_data = try_from_slice_unchecked::<MovieCommentCounter>(
        &pda_counter.data.borrow()
    ).unwrap();

    // 🔍 检查是否已初始化
    if counter_data.is_initialized() {
        msg!("⚠️ 账户已经初始化了！");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    // 📝 设置初始值
    counter_data.discriminator = MovieCommentCounter::DISCRIMINATOR.to_string();
    counter_data.counter = 0;  // 从0开始计数
    counter_data.is_initialized = true;

    // 💾 序列化并保存
    counter_data.serialize(&mut &mut pda_counter.data.borrow_mut()[..])?;

    msg!("🎉 评论计数器初始化完成！当前评论数: {}", counter_data.counter);

    Ok(())
}
```

---

## 💬 实现评论功能 - 最激动人心的部分！

### 🚀 完整的add_comment实现

```rust
pub fn add_comment(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    comment: String
) -> ProgramResult {
    msg!("💬 添加新评论...");
    msg!("📝 评论内容: {}", comment);

    // 📋 Step 1: 解析账户
    let account_info_iter = &mut accounts.iter();

    let commenter = next_account_info(account_info_iter)?;     // 👤 评论者
    let pda_review = next_account_info(account_info_iter)?;    // 🎬 电影评论
    let pda_counter = next_account_info(account_info_iter)?;   // 📊 计数器
    let pda_comment = next_account_info(account_info_iter)?;   // 💬 新评论账户
    let system_program = next_account_info(account_info_iter)?; // ⚙️ 系统程序

    // 📊 Step 2: 读取当前计数
    let mut counter_data = try_from_slice_unchecked::<MovieCommentCounter>(
        &pda_counter.data.borrow()
    ).unwrap();

    msg!("📈 当前评论数: {}", counter_data.counter);

    // 📏 Step 3: 计算账户大小
    let account_len = MovieComment::get_account_size(comment.clone());

    // 💰 Step 4: 计算租金
    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    // 🔐 Step 5: 生成并验证PDA
    // 使用评论地址 + 当前计数作为种子
    let (pda, bump_seed) = Pubkey::find_program_address(
        &[
            pda_review.key.as_ref(),
            counter_data.counter.to_be_bytes().as_ref(),  // 将计数转为字节
        ],
        program_id
    );

    if pda != *pda_comment.key {
        msg!("❌ PDA验证失败！");
        return Err(ReviewError::InvalidPDA.into())
    }

    // 🏗️ Step 6: 创建评论账户
    msg!("🔨 创建评论账户 #{}", counter_data.counter);

    invoke_signed(
        &system_instruction::create_account(
            commenter.key,       // 付款人
            pda_comment.key,     // 新账户
            rent_lamports,       // 租金
            account_len.try_into().unwrap(),  // 大小
            program_id,          // 所有者
        ),
        &[
            commenter.clone(),
            pda_comment.clone(),
            system_program.clone()
        ],
        // 🔑 签名种子
        &[&[
            pda_review.key.as_ref(),
            counter_data.counter.to_be_bytes().as_ref(),
            &[bump_seed]
        ]],
    )?;

    msg!("✅ 评论账户创建成功！");

    // 📝 Step 7: 初始化评论数据
    let mut comment_data = try_from_slice_unchecked::<MovieComment>(
        &pda_comment.data.borrow()
    ).unwrap();

    // 🔍 检查初始化状态
    if comment_data.is_initialized() {
        msg!("⚠️ 账户已初始化！");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    // 📋 设置评论数据
    comment_data.discriminator = MovieComment::DISCRIMINATOR.to_string();
    comment_data.review = *pda_review.key;      // 关联到哪个评论
    comment_data.commenter = *commenter.key;    // 谁写的
    comment_data.comment = comment;             // 评论内容
    comment_data.count = counter_data.counter;  // 这是第几条
    comment_data.is_initialized = true;

    // 💾 序列化保存
    comment_data.serialize(&mut &mut pda_comment.data.borrow_mut()[..])?;

    // 🔢 Step 8: 更新计数器
    msg!("📈 更新评论计数: {} -> {}", counter_data.counter, counter_data.counter + 1);
    counter_data.counter += 1;
    counter_data.serialize(&mut &mut pda_counter.data.borrow_mut()[..])?;

    msg!("🎉 评论添加成功！总评论数: {}", counter_data.counter);

    Ok(())
}
```

---

## 🚀 部署和测试 - 让代码飞起来！

### 📦 构建程序

```bash
# 🔨 构建Solana程序
cargo build-sbf

# 🎉 看到 "Build successful" 了吗？太棒了！
```

### 🚀 部署到本地网络

```bash
# 🌐 部署程序（替换<PATH>为你的实际路径）
solana program deploy target/deploy/movie_review_comments.so

# 📋 记下程序ID，你会需要它的！
```

### 🎨 设置前端测试

```bash
# 📥 克隆前端项目
git clone https://github.com/buildspace/solana-movie-frontend/
cd solana-movie-frontend

# 🎯 切换到评论功能分支
git checkout solution-add-comments

# 📦 安装依赖
npm install
```

### ⚙️ 配置前端

1. **更新程序地址** 📝
   ```javascript
   // utils/constants.ts
   export const MOVIE_REVIEW_PROGRAM_ID = '你的程序ID';
   ```

2. **设置本地端点** 🌐
   ```javascript
   // WalletContextProvider.tsx
   const endpoint = 'http://127.0.0.1:8899';
   ```

3. **配置Phantom钱包** 👻
   - 网络切换到 `localhost`

4. **获取测试代币** 💰
   ```bash
   solana airdrop 2 你的钱包地址
   ```

5. **启动前端** 🎮
   ```bash
   npm run dev
   # 访问 http://localhost:3000
   ```

### 🔍 调试技巧

```bash
# 👀 查看程序日志（超级有用！）
solana logs 你的程序ID

# 📊 查看账户信息
solana account 账户地址

# 💰 查看余额
solana balance
```

---

## 🏆 终极挑战 - 构建学生介绍回复系统

### 🎯 挑战任务

扩展之前的学生介绍程序，添加**回复功能**！让其他用户可以对学生的自我介绍进行评论和互动。

### 📋 需求清单

- [ ] 为每个介绍创建回复计数器
- [ ] 实现添加回复的指令
- [ ] 使用PDA管理回复账户
- [ ] 支持无限数量的回复

### 🛠️ 起始代码

如果你需要起始代码，可以使用[这个仓库](https://github.com/buildspace/solana-student-intro-program)的 `starter` 分支。

### 💡 实现提示

1. **数据结构设计** 📊
   ```rust
   // 回复计数器
   pub struct ReplyCounter {
       pub discriminator: String,
       pub is_initialized: bool,
       pub counter: u64,
   }

   // 单条回复
   pub struct Reply {
       pub discriminator: String,
       pub is_initialized: bool,
       pub intro_account: Pubkey,
       pub replier: Pubkey,
       pub reply: String,
       pub count: u64,
   }
   ```

2. **PDA种子策略** 🌱
   - 计数器: `[intro_pda, "reply"]`
   - 回复: `[intro_pda, counter.to_bytes()]`

3. **前端集成** 🎨
   - 显示回复列表
   - 添加回复表单
   - 实时更新计数

### 🎯 解决方案

如果你遇到困难，可以查看 `solution-add-replies` 分支。但先尝试自己解决！💪

---

## 🎓 知识总结

### 📚 你学到了什么？

- 🏗️ **复杂数据结构设计** - 如何在链上组织关联数据
- 🔐 **PDA嵌套使用** - 使用PDA创建层次化的账户结构
- 📊 **计数器模式** - 追踪动态数量的账户
- 💾 **账户大小计算** - 精确管理链上存储
- 🎮 **指令扩展** - 为现有程序添加新功能

### 🌟 最佳实践回顾

1. **始终验证PDA** ✅
2. **检查账户初始化状态** 🔍
3. **精确计算账户大小** 📏
4. **使用有意义的鉴别器** 🏷️
5. **保持代码模块化** 🧩

---

## 🚀 下一步

恭喜你完成了链上评论系统！🎉 你现在已经掌握了构建复杂Solana程序的核心技能。

下一课我们将学习**Anchor框架**，它将让这一切变得更简单！准备好让你的开发效率提升10倍了吗？🚀

> 💬 **有问题？** 加入我们的Discord社区，大家都在那里互相帮助！

---

**Happy Coding! 继续在Solana的世界中探索！** 🌟👨‍💻👩‍💻
