// Types for the AI Progress Tracker

export interface WeekData {
  id: number;
  title: string;
  description: string;
  objectives: string[];
}

export interface WeekProgress {
  id: string;
  weekId: number;
  userId: string;
  completed: boolean;
  notes: string;
  attachments: Attachment[];
  timeSpent: number; // in seconds
  timerStartedAt: number | null; // timestamp when timer was started
  completedAt: number | null;
  updatedAt: number;
  createdAt: number;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name: string;
  uploadedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  shareProgress: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  completedWeeks: number;
  totalTimeSpent: number;
  lastActivityAt: number;
}

// The 10 weeks of the AI New Year program
export const WEEKS_DATA: WeekData[] = [
  {
    id: 1,
    title: "AI Foundations & Setup",
    description: "Set up your AI toolkit and learn the fundamentals of working with AI assistants.",
    objectives: [
      "Set up key AI tools (ChatGPT, Claude, etc.)",
      "Learn effective prompting techniques",
      "Create your first AI-assisted project"
    ]
  },
  {
    id: 2,
    title: "AI for Productivity",
    description: "Learn to use AI to supercharge your daily productivity and workflow.",
    objectives: [
      "Automate repetitive tasks with AI",
      "Use AI for email and communication",
      "Build an AI-powered personal assistant workflow"
    ]
  },
  {
    id: 3,
    title: "AI for Content Creation",
    description: "Master AI-assisted content creation for writing, social media, and more.",
    objectives: [
      "Generate high-quality written content",
      "Create social media strategies with AI",
      "Develop your unique AI content workflow"
    ]
  },
  {
    id: 4,
    title: "AI for Visual Content",
    description: "Explore AI image generation and visual content creation tools.",
    objectives: [
      "Master image generation prompts",
      "Create consistent visual branding",
      "Build a visual content pipeline"
    ]
  },
  {
    id: 5,
    title: "AI for Data & Analysis",
    description: "Use AI to analyze data, generate insights, and make better decisions.",
    objectives: [
      "Analyze datasets with AI assistance",
      "Generate reports and visualizations",
      "Build data-driven decision workflows"
    ]
  },
  {
    id: 6,
    title: "AI for Coding & Development",
    description: "Learn to code faster and better with AI coding assistants.",
    objectives: [
      "Use AI for code generation and review",
      "Debug and optimize with AI help",
      "Build a complete project with AI assistance"
    ]
  },
  {
    id: 7,
    title: "AI for Business & Strategy",
    description: "Apply AI to business planning, strategy, and growth initiatives.",
    objectives: [
      "Develop business strategies with AI",
      "Create market analysis and research",
      "Build competitive advantage frameworks"
    ]
  },
  {
    id: 8,
    title: "AI for Learning & Education",
    description: "Accelerate your learning with AI tutors and educational tools.",
    objectives: [
      "Create personalized learning paths",
      "Use AI for skill development",
      "Build knowledge management systems"
    ]
  },
  {
    id: 9,
    title: "AI Integration & Automation",
    description: "Connect AI tools together for powerful automated workflows.",
    objectives: [
      "Build multi-tool AI workflows",
      "Create automation pipelines",
      "Integrate AI into existing systems"
    ]
  },
  {
    id: 10,
    title: "AI Mastery & Future",
    description: "Consolidate your skills and prepare for the future of AI.",
    objectives: [
      "Review and refine your AI toolkit",
      "Build your AI portfolio project",
      "Plan your continued AI journey"
    ]
  }
];
