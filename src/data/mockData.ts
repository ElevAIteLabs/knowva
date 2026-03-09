export const trendingTools = [
  { name: "ChatGPT", description: "Advanced conversational AI for text generation, coding, and creative writing.", category: "Text Generation", rating: 4.8, pricing: "Premium", icon: "🤖" },
  { name: "Midjourney", description: "AI-powered image generation creating stunning artwork from text prompts.", category: "Image Generation", rating: 4.7, pricing: "Paid", icon: "🎨" },
  { name: "Claude", description: "Helpful, harmless, and honest AI assistant for analysis and writing.", category: "Text Generation", rating: 4.6, pricing: "Premium", icon: "🧠" },
  { name: "Runway", description: "AI-powered video editing and generation for creative professionals.", category: "Video", rating: 4.5, pricing: "Premium", icon: "🎬" },
  { name: "Jasper AI", description: "AI content creation tool for marketing teams and copywriters.", category: "Marketing", rating: 4.4, pricing: "Paid", icon: "✍️" },
  { name: "Cursor", description: "AI-first code editor that helps you build software faster.", category: "Developer Tools", rating: 4.7, pricing: "Premium", icon: "💻" },
  { name: "ElevenLabs", description: "AI voice synthesis and cloning for realistic speech generation.", category: "Audio", rating: 4.5, pricing: "Premium", icon: "🔊" },
  { name: "Perplexity", description: "AI-powered search engine providing accurate, sourced answers.", category: "Search", rating: 4.6, pricing: "Premium", icon: "🔍" },
];

export const categories = [
  { name: "Text Generation", icon: "✏️", count: 142 },
  { name: "Image Generation", icon: "🖼️", count: 89 },
  { name: "Video & Animation", icon: "🎥", count: 56 },
  { name: "Audio & Music", icon: "🎵", count: 43 },
  { name: "Developer Tools", icon: "⚙️", count: 118 },
  { name: "Marketing", icon: "📈", count: 76 },
  { name: "Data Analytics", icon: "📊", count: 64 },
  { name: "Productivity", icon: "⚡", count: 91 },
  { name: "Design", icon: "🎯", count: 52 },
  { name: "Education", icon: "📚", count: 38 },
  { name: "Healthcare", icon: "🏥", count: 29 },
  { name: "Customer Support", icon: "💬", count: 47 },
];

export const recentTools = [
  { name: "Sora", description: "OpenAI's text-to-video model creating realistic scenes from prompts.", category: "Video", rating: 4.3, pricing: "Paid", icon: "📹" },
  { name: "Devin", description: "Autonomous AI software engineer that plans and executes tasks.", category: "Developer Tools", rating: 4.2, pricing: "Paid", icon: "🛠️" },
  { name: "Gemini Ultra", description: "Google's most capable AI model for multimodal reasoning.", category: "Text Generation", rating: 4.5, pricing: "Premium", icon: "💎" },
  { name: "Udio", description: "AI music generation creating full songs from text descriptions.", category: "Audio", rating: 4.1, pricing: "Premium", icon: "🎶" },
];

export const comparisonTools = [
  {
    name: "ChatGPT",
    icon: "🤖",
    pricing: "$20/mo",
    apiAccess: true,
    freeTrial: true,
    bestFor: "General purpose",
    rating: 4.8,
    contextWindow: "128K",
    speed: "Fast",
    codeGen: true,
    imageGen: true,
  },
  {
    name: "Claude",
    icon: "🧠",
    pricing: "$20/mo",
    apiAccess: true,
    freeTrial: true,
    bestFor: "Analysis & Writing",
    rating: 4.6,
    contextWindow: "200K",
    speed: "Fast",
    codeGen: true,
    imageGen: false,
  },
  {
    name: "Gemini",
    icon: "💎",
    pricing: "$19.99/mo",
    apiAccess: true,
    freeTrial: true,
    bestFor: "Multimodal",
    rating: 4.5,
    contextWindow: "1M",
    speed: "Medium",
    codeGen: true,
    imageGen: true,
  },
];

export const consultingServices = [
  {
    title: "AI Strategy Session",
    description: "1-on-1 consultation to define your AI roadmap and identify the right tools for your business.",
    price: "Free",
    duration: "15 min",
    features: ["Use case analysis", "Tool recommendations", "Quick roadmap"],
  },
  {
    title: "AI Stack Audit",
    description: "Comprehensive review of your current AI tools and recommendations for optimization.",
    price: "$199",
    duration: "60 min",
    features: ["Full stack review", "Cost optimization", "Integration plan", "Written report"],
    popular: true,
  },
  {
    title: "Custom AI Solution",
    description: "End-to-end advisory for building custom AI workflows and selecting enterprise tools.",
    price: "$499",
    duration: "2 hours",
    features: ["Custom solution design", "Vendor evaluation", "Implementation plan", "30-day support", "Priority access"],
  },
];

export const providerPlans = [
  {
    name: "Basic Listing",
    price: "Free",
    features: ["Tool profile page", "Basic analytics", "Category listing", "User reviews"],
  },
  {
    name: "Featured",
    price: "$99/mo",
    features: ["Everything in Basic", "Featured badge", "Priority placement", "Advanced analytics", "Newsletter feature"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$399/mo",
    features: ["Everything in Featured", "Sponsored placement", "Custom landing page", "Dedicated support", "API access", "White-label reviews"],
  },
];