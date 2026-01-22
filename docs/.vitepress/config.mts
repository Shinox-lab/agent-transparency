import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Agent Transparency",
  description: "A comprehensive Python library for tracking AI agent behavior",

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'Links',
        items: [
          { text: 'PyPI', link: 'https://pypi.org/project/agent-transparency/' },
          { text: 'GitHub', link: 'https://github.com/Shinox-lab/agent-transparency' },
          { text: 'Changelog', link: 'https://github.com/Shinox-lab/agent-transparency/releases' },
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Agent Transparency?', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Comparison with Other Tools', link: '/guide/comparison' },
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Event Types', link: '/guide/event-types' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Context Management', link: '/guide/context-management' },
          ]
        },
        {
          text: 'Integrations',
          items: [
            { text: 'LangGraph', link: '/guide/langgraph-integration' },
            { text: 'LLM Tracking', link: '/guide/llm-tracking' },
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Real-time Viewer', link: '/guide/viewer' },
            { text: 'Kafka Streaming', link: '/guide/kafka-streaming' },
            { text: 'Synchronous Usage', link: '/guide/sync-usage' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'TransparencyManager', link: '/api/transparency-manager' },
            { text: 'SyncTransparencyManager', link: '/api/sync-transparency-manager' },
            { text: 'Configuration', link: '/api/configuration' },
          ]
        },
        {
          text: 'Types',
          items: [
            { text: 'Event Types', link: '/api/event-types' },
            { text: 'Data Classes', link: '/api/data-classes' },
            { text: 'Enums', link: '/api/enums' },
          ]
        },
        {
          text: 'Viewer',
          items: [
            { text: 'ViewerServer', link: '/api/viewer-server' },
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Usage', link: '/examples/basic-usage' },
            { text: 'LangGraph Integration', link: '/examples/langgraph' },
            { text: 'LLM Call Tracking', link: '/examples/llm-tracking' },
            { text: 'Error Handling', link: '/examples/error-handling' },
            { text: 'Custom Events', link: '/examples/custom-events' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Shinox-lab/agent-transparency' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Agent Squad'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/Shinox-lab/agent-transparency/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
