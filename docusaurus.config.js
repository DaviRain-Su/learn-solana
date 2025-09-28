// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

const path = require("path");

/**
 * Defines a section with overridable defaults
 * @param {string} section
 * @param {import('@docusaurus/plugin-content-docs').Options} options
 */
function defineSection(section, version = {}, options = {}) {
  return [
    "@docusaurus/plugin-content-docs",
    /** @type {import('@docusaurus/plugin-content-docs').Options} */
    ({
      id: section,
      path: `docs/${section}`,
      routeBasePath: section,
      include: ["**/*.md", "**/*.mdx"],
      exclude: [
        "**/_*.{js,jsx,ts,tsx,md,mdx}",
        "**/_*/**",
        "**/*.test.{js,jsx,ts,tsx}",
        "**/__tests__/**",
      ],
      breadcrumbs: true,
      sidebarPath: require.resolve("./sidebars.cjs"),
      editUrl: "https://github.com/DaviRain-Su/learn-solana/tree/main",
      showLastUpdateAuthor: true,
      showLastUpdateTime: true,
      versions: version && {
        current: {
          label: version.label,
        },
      },
      ...options,
    }),
  ];
}

const SECTIONS = [
  defineSection("awesome-solana-zh"),
  defineSection("learn-solana"),
  defineSection("cookbook-zh"),
  defineSection("solana-development-course"),
];

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Learn Solana",
  tagline: "Master Solana Development - Your Complete Learning Journey",
  url: "https://www.all-in-one-blockchain.xyz/",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenAnchors: "warn",
  favicon: "img/favicon.ico",

  // GitHub pages deployment config.
  organizationName: "DaviRain-Su",
  projectName: "Learn solana",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "@docusaurus/preset-classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
          onUntruncatedBlogPosts: "ignore",
          showReadingTime: true,
          editUrl: "https://github.com/DaviRain-Su/learn-solana/tree/main/blog",
          blogSidebarCount: 10,
          blogSidebarTitle: "Recent Posts",
          postsPerPage: 10,
          feedOptions: {
            type: "all",
            title: "Learn Solana Blog",
            description: "Stay updated with the latest in Solana development",
          },
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  plugins: [
    ...SECTIONS,
    path.resolve(__dirname, "./plugins/webpack-plugin.cjs"),
    path.resolve(__dirname, "./plugins/tailwind-loader.cjs"),
  ],

  clientModules: [require.resolve("./src/client/readingProgress.js")],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // 网站元数据
      metadata: [
        {
          name: "keywords",
          content:
            "solana, blockchain, web3, cryptocurrency, development, tutorial",
        },
        {
          name: "description",
          content: "Comprehensive Solana development resources and tutorials",
        },
      ],

      // 图片优化
      image: "img/social-card.jpg",

      // 导航栏配置
      navbar: {
        title: "Learn Solana",
        logo: {
          alt: "Learn Solana Logo",
          src: "img/my_logo.svg",
          srcDark: "img/my_logo.svg",
          width: 32,
          height: 32,
        },
        hideOnScroll: false,
        style: "primary",
        items: [
          {
            href: "/awesome-solana-zh",
            position: "left",
            label: "🌟 Awesome Solana",
            className: "navbar__item--awesome",
          },
          {
            href: "/learn-solana",
            position: "left",
            label: "📚 Learn Solana",
            className: "navbar__item--learn",
          },
          {
            href: "/solana-development-course",
            position: "left",
            label: "🎓 Dev Course",
            className: "navbar__item--course",
          },
          {
            href: "/cookbook-zh",
            position: "left",
            label: "👨‍🍳 Cookbook",
            className: "navbar__item--cookbook",
          },
          {
            to: "/blog",
            label: "✍️ Blog",
            position: "left",
            className: "navbar__item--blog",
          },
          // 右侧导航项
          {
            href: "https://github.com/DaviRain-Su/learn-solana",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub repository",
          },
        ],
      },

      // 页脚配置
      footer: {
        style: "dark",
        links: [
          {
            title: "📖 Documentation",
            items: [
              {
                label: "Getting Started",
                href: "/learn-solana",
              },
              {
                label: "Cookbook",
                href: "/cookbook-zh",
              },
              {
                label: "Development Course",
                href: "/solana-development-course",
              },
            ],
          },
          {
            title: "💬 Community",
            items: [
              {
                label: "GitHub Discussions",
                href: "https://github.com/DaviRain-Su/learn-solana/discussions",
              },
              {
                label: "Discord",
                href: "#",
              },
              {
                label: "Twitter",
                href: "#",
              },
            ],
          },
          {
            title: "🔗 Resources",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/DaviRain-Su",
              },
              {
                label: "Solana Official",
                href: "https://solana.com",
              },
            ],
          },
          {
            title: "🛠 Tools",
            items: [
              {
                label: "Solana Explorer",
                href: "https://explorer.solana.com",
              },
              {
                label: "Solana Playground",
                href: "https://beta.solpg.io",
              },
              {
                label: "Anchor Docs",
                href: "https://www.anchor-lang.com",
              },
            ],
          },
        ],
        copyright: `
          <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="margin: 0; opacity: 0.8;">
              Copyright © ${new Date().getFullYear()} Learn Solana. Built with ❤️ by DaviRain
            </p>
            <p style="margin: 0.5rem 0 0 0; opacity: 0.6; font-size: 0.9rem;">
              Empowering developers to build on Solana
            </p>
          </div>
        `,
      },

      // 代码高亮主题
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: [
          "powershell",
          "rust",
          "toml",
          "yaml",
          "c",
          "cpp",
          "solidity",
          "json",
          "bash",
        ],
        magicComments: [
          {
            className: "theme-code-block-highlighted-line",
            line: "highlight-next-line",
            block: { start: "highlight-start", end: "highlight-end" },
          },
        ],
      },

      // Algolia 搜索配置
      algolia: {
        appId: "WQYN7PW5BU",
        apiKey: "a5cb50a59eda17448ce987f18a90aea8",
        indexName: "solana-documents",
        contextualSearch: true,
        searchParameters: {},
        searchPagePath: "search",
      },

      // 颜色模式配置
      colorMode: {
        defaultMode: "light",
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },

      // 文档配置
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },

      // 目录配置
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },

      // 公告栏（可选）
      announcementBar: {
        id: "announcement",
        content:
          '🚀 <b>New:</b> Solana Development Course Module 6 is now available! <a href="/solana-development-course">Start Learning →</a>',
        backgroundColor: "#6366f1",
        textColor: "#ffffff",
        isCloseable: true,
      },
    }),

  // 移除了 webpack 配置部分

  // 静态目录
  staticDirectories: ["static"],

  // 自定义脚本（可选，如果不需要分析可以注释掉）
  // scripts: [
  //   {
  //     src: 'https://plausible.io/js/script.js',
  //     defer: true,
  //     'data-domain': 'all-in-one-blockchain.xyz',
  //   },
  // ],

  // 自定义样式表
  stylesheets: [
    {
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
      type: "text/css",
    },
    {
      href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap",
      type: "text/css",
    },
    {
      href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap",
      type: "text/css",
    },
  ],
};

module.exports = config;
