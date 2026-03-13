export const categories = [
  { name: "Text Generation", icon: "✏️", count: 0 },
  { name: "Image Generation", icon: "🖼️", count: 0 },
  { name: "Video & Animation", icon: "🎥", count: 0 },
  { name: "Audio & Music", icon: "🎵", count: 0 },
  { name: "Developer Tools", icon: "⚙️", count: 0 },
  { name: "Marketing", icon: "📈", count: 0 },
  { name: "Data Analytics", icon: "📊", count: 0 },
  { name: "Productivity", icon: "⚡", count: 0 },
  { name: "Design", icon: "🎯", count: 0 },
  { name: "Education", icon: "📚", count: 0 },
  { name: "Healthcare", icon: "🏥", count: 0 },
  { name: "Customer Support", icon: "💬", count: 0 },
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

// These are still needed by some components that might filter but not fetch yet
export const trendingTools = [];
export const recentTools = [];
export const comparisonTools = [];