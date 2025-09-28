const fs = require("fs");
const path = require("path");
const glob = require("glob");

// 查找所有有问题的 md 文件
const problemFiles = [
  "docs/cookbook-zh/references/**/*.md",
  "docs/solana-development-course/**/*.md",
];

function fixMdxFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // 查找未包装在代码块中的函数声明
  const lines = content.split("\n");
  let inCodeBlock = false;
  let newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检查代码块标记
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      newLines.push(line);
      continue;
    }

    // 如果不在代码块中，检查是否是函数声明
    if (
      !inCodeBlock &&
      (line.startsWith("function ") ||
        line.startsWith("const ") ||
        line.startsWith("let ") ||
        line.startsWith("var ") ||
        line.startsWith("async function"))
    ) {
      // 开始一个新的代码块
      newLines.push("```javascript");
      newLines.push(line);

      // 继续读取直到函数结束
      let braceCount = 0;
      let foundStart = false;

      for (let j = i; j < lines.length; j++) {
        const checkLine = lines[j];
        if (checkLine.includes("{")) {
          foundStart = true;
          braceCount += (checkLine.match(/\{/g) || []).length;
        }
        if (checkLine.includes("}")) {
          braceCount -= (checkLine.match(/\}/g) || []).length;
        }

        if (j > i) {
          newLines.push(lines[j]);
        }

        if (foundStart && braceCount === 0) {
          newLines.push("```");
          i = j;
          modified = true;
          break;
        }
      }
    } else {
      newLines.push(line);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, newLines.join("\n"));
    console.log(`Fixed: ${filePath}`);
  }
}

// 处理所有文件
problemFiles.forEach((pattern) => {
  const files = glob.sync(pattern);
  files.forEach(fixMdxFile);
});
