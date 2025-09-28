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
      breadcrumbs: false,
      sidebarPath: require.resolve("./sidebars.cjs"),
      editUrl: "https://github.com/CreatorsDAO/solana-co-learn/tree/main",
      // Equivalent to `enableUpdateBy`.
      showLastUpdateAuthor: true,
      // Equivalent to `enableUpdateTime`.
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
  tagline: "By Davirain",
  url: "https://www.all-in-one-blockchain.xyz/",
  baseUrl: "/",
  onBrokenLinks: "throw",
  favicon: "img/favicon.ico",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "DaviRain-Su", // Usually your GitHub org/user name.
  projectName: "Learn solana", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "@docusaurus/preset-classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: null,
        blog: {
          //onUntruncatedBlogPosts: "ignore", // 忽略博客截断警告
          showReadingTime: true,
          editUrl: "https://github.com/DaviRain-Su/learn-solana/tree/main/blog",
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

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "All In One Solana",
        logo: {
          alt: "Logo",
          src: "img/my_logo.svg",
        },
        items: [
          {
            href: "/awesome-solana-zh",
            position: "left",
            label: "Awesome Solana Zh",
          },
          {
            href: "/learn-solana",
            position: "left",
            label: "Learn Solana",
          },
          {
            href: "/solana-development-course",
            position: "left",
            label: "Solana Development Course",
          },
          {
            href: "/cookbook-zh",
            position: "left",
            label: "Solana Cookbook Zh",
          },
          { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/DaviRain-Su/learn-solana",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Products",
            items: [
              {
                label: "Forum",
                href: "https://github.com/DaviRain-Su/learn-solana/discussions",
              },
            ],
          },
          {
            title: "Community",
            items: [],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/DaviRain-Su",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} All in One Solana site, Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        // Additional languages can be added here.
        additionalLanguages: ["powershell", "rust", "toml", "yaml", "c", "cpp"],
      },
      algolia: {
        appId: "WQYN7PW5BU",
        apiKey: "a5cb50a59eda17448ce987f18a90aea8",
        indexName: "solana-documents",
      },
    }),
};

module.exports = config;
