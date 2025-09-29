---
sidebar_position: 77
sidebar_label: 🎮 构建质押界面
sidebar_class_name: green
---

# 🎮 构建NFT质押用户界面 - 让你的Buildoor开始工作！

## 🎯 欢迎来到前端战场！

嘿，建设者们！👋 准备好给你的**Buildoor NFT**项目加上一个**超炫的质押界面**了吗？今天我们要把那些静态的NFT变成**赚钱机器**！💰

想象一下：你的NFT不再只是躺在钱包里的图片，而是能够**24/7为你工作**的数字员工！让我们一起打造这个神奇的界面吧！

> 🎯 **今日三大任务：**
> 1. 🎨 构建一个让用户惊叹的质押界面
> 2. ⚙️ 完善质押程序的核心功能
> 3. 🔗 连接前端与合约，让一切运转起来！

---

## 🏗️ 项目准备 - 搭建你的工作台

### 📁 Step 1: 创建项目结构

```bash
# 🏗️ 创建必要的文件夹结构
your-project/
├── 📁 pages/           # 页面文件
│   ├── 📜 _app.tsx     # 应用主文件
│   ├── 📜 newMint.tsx  # NFT铸造页
│   └── 📜 stake.tsx    # 质押页面（新建）
├── 📁 components/      # 组件文件夹
│   ├── 📜 StakeOptionsDisplay.tsx  # 质押选项展示
│   └── 📜 ItemBox.tsx             # 物品盒子组件
├── 📁 utils/           # 工具文件夹（新建）
│   └── 📜 instructions.ts         # 指令文件
└── 📜 .env.local       # 环境变量
```

### 🎨 Step 2: 添加主题配色

让我们给应用添加一些**赛博朋克**风格的颜色！打开 `pages/_app.tsx`：

```tsx
// 🎨 赛博朋克配色方案 - 让你的应用看起来超酷！
const colors = {
  background: "#1F1F1F",      // 🌑 深邃的背景色
  accent: "#833BBE",          // 💜 紫色强调色
  bodyText: "rgba(255, 255, 255, 0.75)",  // 📝 柔和的文字
  secondaryPurple: "#CB8CFF",  // 🔮 次要紫色
  containerBg: "rgba(255, 255, 255, 0.1)",  // 📦 容器背景
  containerBgSecondary: "rgba(255, 255, 255, 0.05)",  // 📦 次要容器
  buttonGreen: "#7EFFA7",     // 💚 醒目的绿色按钮
}

// 💡 Pro Tip: 使用rgba可以创建半透明效果，让界面更有层次感！
```

---

## 🎯 目标界面预览

让我先展示一下我们要构建的界面：

```
┌─────────────────────────────────────────────┐
│         🎮 NFT质押界面布局                   │
├─────────────────────────────────────────────┤
│                                             │
│  左侧区域                右侧区域            │
│  ┌────────┐           ┌──────────┐         │
│  │  NFT   │           │ 质押状态  │         │
│  │  图片  │           │          │         │
│  │        │           │ STAKING  │         │
│  │ 🖼️     │           │ 4 DAYS   │         │
│  └────────┘           │          │         │
│                       │ 100 $BLD │         │
│   等级: 1             │          │         │
│   装备: 🗡️            │ [申领]   │         │
│   战利品: 📦          └──────────┘         │
│                                             │
└─────────────────────────────────────────────┘
```

> 💡 **设计理念：** "STAKING 4 DAYS" 和 "READY TO STAKE" 不会同时显示，系统会根据NFT状态智能切换！

---

## 🚀 Step 1: 设置Instructions文件

### 📝 复制核心指令文件

```typescript
// 📁 utils/instructions.ts
// 这个文件包含了与质押合约交互的所有指令
// 由于代码超过200行，这里展示关键部分

// 🎯 导入必要的依赖
import {
    Connection,
    PublicKey,
    SystemProgram,
    Transaction,
    // ... 更多导入
} from '@solana/web3.js';

// 🏭 质押相关的核心函数
export const stakeNft = async (/* 参数 */) => {
    // 质押NFT的逻辑
}

export const unstakeNft = async (/* 参数 */) => {
    // 解除质押的逻辑
}

export const claimRewards = async (/* 参数 */) => {
    // 申领奖励的逻辑
}
```

> 😬 **提醒：** 完整的instructions.ts文件有200+行，请从NFT质押项目仓库复制完整版本！

---

## 🎬 Step 2: 实现NFT点击跳转

### 🔗 在newMint.tsx中添加路由

```tsx
// 📁 pages/newMint.tsx
import { useRouter } from 'next/router';
import { MouseEventHandler, useCallback } from 'react';

const NewMint = () => {
    // 🚀 初始化路由器 - 用于页面跳转
    const router = useRouter();

    // 🎯 处理NFT卡片点击事件
    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        async (event) => {
            // 📍 跳转到质押页面，并传递必要参数
            // mint: NFT的地址
            // imageSrc: NFT图片URL（避免重复加载）
            router.push(`/stake?mint=${mint}&imageSrc=${metadata?.image}`);

            // 💡 使用查询参数传递数据，这样用户可以分享链接！
        },
        [router, mint, metadata]  // 依赖项数组
    );

    // ... 其余代码
}
```

> 💡 **Pro Tip:** 通过URL传递图片源可以避免重复的API调用，提升用户体验！

---

## 🎨 Step 3: 创建质押页面

### 📄 创建stake.tsx文件

```tsx
// 📁 pages/stake.tsx
import { NextPage } from 'next';
import { PublicKey } from '@solana/web3.js';
import { useState } from 'react';

// 🎯 定义页面属性接口
interface StakeProps {
    mint: PublicKey;      // NFT的铸造地址
    imageSrc: string;     // NFT图片URL
}

// 🎮 质押页面组件
const Stake: NextPage<StakeProps> = ({ mint, imageSrc }) => {
    // 🔄 状态管理
    const [isStaking, setIsStaking] = useState(false);  // 是否正在质押
    const [level, setLevel] = useState(1);              // NFT等级

    return (
        <div>
            {/* 🎨 页面内容将在这里构建 */}
        </div>
    );
};

// 🎯 获取初始属性 - 从URL解析参数
Stake.getInitialProps = async ({ query }: any) => {
    const { mint, imageSrc } = query;

    // 🚨 错误处理 - 确保必要参数存在
    if (!mint || !imageSrc) {
        throw { error: "缺少必要参数：mint或imageSrc" };
    }

    try {
        // 🔑 将字符串转换为PublicKey对象
        const mintPubkey = new PublicKey(mint);
        return { mint: mintPubkey, imageSrc: imageSrc };
    } catch {
        // ❌ 无效的mint地址
        throw { error: "无效的NFT地址" };
    }
};

export default Stake;
```

---

## 🌟 Step 4: 使用环境变量（最佳实践）

### 🔐 创建.env.local文件

```bash
# 📁 .env.local
# ⚠️ 记得将此文件添加到.gitignore！

# 🔑 公开的环境变量（会暴露给浏览器）
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=你的程序ID
NEXT_PUBLIC_CANDY_MACHINE_ID=你的糖果机ID

# 🔒 私密的环境变量（仅服务器端可用）
SECRET_API_KEY=你的秘密API密钥
```

### 📝 在代码中使用环境变量

```typescript
// ✅ 好的做法 - 使用环境变量
const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);

// ❌ 不好的做法 - 硬编码
// const programId = new PublicKey("DezXAZ8z7PnrnRJjz3wXBoR...");
```

> 🔥 **安全提示：** 永远不要将私钥或敏感信息放在前端代码中！

---

## 🎨 Step 5: 构建质押页面UI

### 🖼️ 左侧区域 - NFT展示

```tsx
// 📁 pages/stake.tsx - 左侧部分
import { VStack, HStack, Text, Image, Container } from '@chakra-ui/react';

const Stake: NextPage<StakeProps> = ({ mint, imageSrc }) => {
    // ... 状态管理代码 ...

    return (
        <Container maxW="1200px">
            <HStack spacing={8} align="start">
                {/* 🎨 左侧：NFT展示区 */}
                <VStack spacing={4}>
                    {/* 🖼️ NFT图片 */}
                    <Image
                        src={imageSrc}
                        alt="Your NFT"
                        borderRadius="20px"
                        boxSize="300px"
                        objectFit="cover"
                        boxShadow="xl"
                    />

                    {/* 📊 NFT信息 */}
                    <VStack spacing={2} align="start" w="full">
                        <Text fontSize="xl" fontWeight="bold">
                            🎮 等级: {level}
                        </Text>
                        <Text>🗡️ 装备: 传奇之剑</Text>
                        <Text>📦 战利品箱: 3个可用</Text>
                    </VStack>
                </VStack>

                {/* 右侧组件将在这里 */}
            </HStack>
        </Container>
    );
};
```

---

## 🎯 Step 6: 创建质押选项组件

### 📦 StakeOptionsDisplay组件

```tsx
// 📁 components/StakeOptionsDisplay.tsx
import { VStack, Text, Button } from '@chakra-ui/react';

// 🎯 组件属性接口
interface StakeOptionsProps {
    isStaking: boolean;        // 是否正在质押
    daysStaked: number;        // 质押天数
    totalEarned: number;       // 总收益
    claimable: number;         // 可申领数量
    handleStake: () => void;   // 质押处理函数
    handleClaim: () => void;   // 申领处理函数
    handleUnstake: () => void; // 解除质押处理函数
}

export const StakeOptionsDisplay = ({
    isStaking,
    daysStaked = 0,
    totalEarned = 0,
    claimable = 0,
    handleStake,
    handleClaim,
    handleUnstake
}: StakeOptionsProps) => {
    return (
        <VStack
            bgColor="containerBg"        // 🎨 半透明背景
            borderRadius="20px"           // 🎯 圆角边框
            padding="20px 40px"           // 📐 内边距
            spacing={5}                   // 📏 元素间距
            boxShadow="xl"               // 🌟 阴影效果
        >
            {/* 🏷️ 状态标签 */}
            <Text
                bgColor="containerBgSecondary"
                padding="4px 8px"
                borderRadius="20px"
                color="bodyText"
                fontWeight="bold"
                fontSize="sm"
            >
                {isStaking
                    ? `⚡ 正在质押 ${daysStaked} 天${daysStaked > 1 ? '' : ''}`
                    : "🎯 准备质押"}
            </Text>

            {/* 💰 收益显示 */}
            <VStack spacing={-1}>
                <Text color="white" fontWeight="bold" fontSize="4xl">
                    {isStaking ? `${totalEarned} $BLD` : "0 $BLD"}
                </Text>
                <Text color="bodyText" fontSize="sm">
                    {isStaking
                        ? `💎 ${claimable} $BLD 可申领`
                        : "🚀 通过质押赚取 $BLD"}
                </Text>
            </VStack>

            {/* 🎮 操作按钮 */}
            <Button
                onClick={isStaking ? handleClaim : handleStake}
                bgColor="buttonGreen"
                width="200px"
                _hover={{
                    transform: 'scale(1.05)',  // 悬停放大效果
                    boxShadow: 'lg'
                }}
                transition="all 0.2s"
            >
                <Text fontWeight="bold">
                    {isStaking ? "💰 申领 $BLD" : "🚀 质押 Buildoor"}
                </Text>
            </Button>

            {/* 🔓 解除质押按钮（仅在质押时显示） */}
            {isStaking && (
                <Button
                    onClick={handleUnstake}
                    variant="ghost"
                    _hover={{ bgColor: 'rgba(255,255,255,0.1)' }}
                >
                    🔓 解除质押
                </Button>
            )}
        </VStack>
    );
};
```

### 🔧 在主页面中使用组件

```tsx
// 📁 pages/stake.tsx
import { StakeOptionsDisplay } from '../components/StakeOptionsDisplay';

const Stake: NextPage<StakeProps> = ({ mint, imageSrc }) => {
    // ... 状态管理 ...

    // 🎮 处理函数（稍后实现）
    const handleStake = async () => {
        console.log("🚀 开始质押...");
        // TODO: 调用质押合约
    };

    const handleClaim = async () => {
        console.log("💰 申领奖励...");
        // TODO: 调用申领合约
    };

    const handleUnstake = async () => {
        console.log("🔓 解除质押...");
        // TODO: 调用解除质押合约
    };

    return (
        <Container>
            <HStack>
                {/* 左侧NFT展示 */}
                {/* ... */}

                {/* 右侧质押选项 */}
                <StakeOptionsDisplay
                    isStaking={isStaking}
                    daysStaked={4}
                    totalEarned={100}
                    claimable={25}
                    handleStake={handleStake}
                    handleClaim={handleClaim}
                    handleUnstake={handleUnstake}
                />
            </HStack>
        </Container>
    );
};
```

---

## 📦 Step 7: 创建ItemBox组件

### 🎁 通用物品盒子组件

```tsx
// 📁 components/ItemBox.tsx
import { Center } from "@chakra-ui/react";
import { ReactNode } from "react";

// 🎯 组件属性接口
interface ItemBoxProps {
    children: ReactNode;      // 子元素
    bgColor?: string;         // 背景颜色（可选）
    size?: string;           // 盒子大小（可选）
    isGlowing?: boolean;     // 是否发光（可选）
}

// 📦 物品盒子组件 - 用于展示装备、战利品等
export const ItemBox = ({
    children,
    bgColor,
    size = "120px",
    isGlowing = false
}: ItemBoxProps) => {
    return (
        <Center
            height={size}
            width={size}
            bgColor={bgColor || "containerBg"}
            borderRadius="10px"
            position="relative"
            transition="all 0.3s"
            cursor="pointer"
            _hover={{
                transform: "scale(1.05)",  // 悬停放大
                boxShadow: "lg"
            }}
            // 🌟 发光效果
            boxShadow={isGlowing ? "0 0 20px rgba(126, 255, 167, 0.5)" : "md"}
        >
            {/* 🎯 内容居中显示 */}
            {children}

            {/* ✨ 可选的闪光效果 */}
            {isGlowing && (
                <Box
                    position="absolute"
                    top="-5px"
                    right="-5px"
                    bg="buttonGreen"
                    borderRadius="full"
                    w="10px"
                    h="10px"
                    animation="pulse 2s infinite"
                />
            )}
        </Center>
    );
};
```

### 🎮 使用ItemBox展示装备

```tsx
// 在stake.tsx中使用
import { ItemBox } from '../components/ItemBox';

// 装备展示区
<HStack spacing={4}>
    <VStack>
        <Text fontSize="sm" color="bodyText">装备</Text>
        <ItemBox bgColor="containerBgSecondary">
            <Text fontSize="2xl">🗡️</Text>
        </ItemBox>
    </VStack>

    <VStack>
        <Text fontSize="sm" color="bodyText">战利品箱</Text>
        <ItemBox isGlowing={true}>
            <Text fontSize="2xl">📦</Text>
        </ItemBox>
    </VStack>
</HStack>
```

---

## 💡 实用技巧与最佳实践

### 🎯 技巧1：响应式设计

```tsx
// 🎨 使用Chakra的响应式属性
<Container
    maxW={{ base: "100%", md: "768px", lg: "1200px" }}
    px={{ base: 4, md: 8 }}
>
    {/* 内容自动适应不同屏幕尺寸 */}
</Container>
```

### 🎯 技巧2：加载状态管理

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleStake = async () => {
    setIsLoading(true);
    try {
        // 执行质押操作
        await stakeNft(/* 参数 */);
    } catch (error) {
        console.error("质押失败:", error);
    } finally {
        setIsLoading(false);
    }
};

// 在按钮中显示加载状态
<Button isLoading={isLoading} loadingText="质押中...">
    质押
</Button>
```

### 🎯 技巧3：错误处理

```tsx
// 🚨 优雅的错误处理
const [error, setError] = useState<string | null>(null);

const safeExecute = async (fn: () => Promise<void>) => {
    try {
        setError(null);
        await fn();
    } catch (err) {
        setError(err.message || "操作失败");
        // 可以添加toast通知
    }
};
```

---

## 🎓 知识总结

### 📚 你学到的技能

```
┌────────────────────────────────────┐
│      🏆 前端开发成就解锁             │
├────────────────────────────────────┤
│ ✅ Next.js路由和参数传递             │
│ ✅ Chakra UI组件设计                │
│ ✅ 环境变量管理                     │
│ ✅ 组件化开发思想                   │
│ ✅ 状态管理和事件处理                │
│ ✅ 响应式设计原则                   │
└────────────────────────────────────┘
```

### 🚀 下一步计划

1. **完善合约交互** - 实现真正的质押功能
2. **添加动画效果** - 让界面更生动
3. **集成钱包** - 连接用户钱包
4. **实时数据更新** - 显示实时质押信息

---

## 🎉 总结

恭喜你！🎊 你已经成功构建了一个**专业级的NFT质押界面**！现在你的Buildoor NFT不仅好看，还能为用户创造价值！

> 💬 **记住：** 优秀的UI不仅要好看，更要好用。始终站在用户角度思考！

如果遇到问题，记得在**Discord**上找我们，我们随时准备帮助你！

---

**继续加油，让我们一起构建Web3的未来！** 🚀🎮✨
