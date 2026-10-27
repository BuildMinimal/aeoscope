import { defineConfig } from "vitepress";

export default defineConfig({
  title: "aeoscope",
  description:
    "Self-hosted AI visibility tracking (GEO/AEO). Find out whether AI engines mention and cite your brand.",
  base: "/aeoscope/",
  themeConfig: {
    siteTitle: "◐ aeoscope",
    nav: [
      { text: "Guide", link: "/getting-started" },
      { text: "Reference", link: "/reference/configuration" },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "What is aeoscope", link: "/" },
          { text: "Getting started", link: "/getting-started" },
        ],
      },
      {
        text: "Guides",
        items: [
          { text: "Local models", link: "/guides/local-models" },
          { text: "Scheduling", link: "/guides/scheduling" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Configuration", link: "/reference/configuration" },
          { text: "Engines", link: "/reference/engines" },
          { text: "HTTP API", link: "/reference/api" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/buildminimal/aeoscope" },
    ],
    search: {
      provider: "local",
    },
  },
});
