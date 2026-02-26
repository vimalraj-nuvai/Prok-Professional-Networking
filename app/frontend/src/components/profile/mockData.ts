import type { Profile, Experience, Education } from '../../types';

export interface MockUser {
  id: number;
  name: string;
  email: string;
  title: string;
  location: string;
  avatar: string;
  connections: number;
  mutualConnections: number;
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  profile: Profile;
  recentActivity: MockActivity[];
}

export interface MockActivity {
  id: number;
  type: 'post' | 'comment' | 'like' | 'connection';
  description: string;
  timestamp: string;
}

export const mockUser: MockUser = {
  id: 1,
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  title: 'Senior Full Stack Developer',
  location: 'San Francisco, CA',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  connections: 487,
  mutualConnections: 12,
  socialLinks: {
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    twitter: 'https://twitter.com',
    website: 'https://alexjohnson.dev',
  },
  profile: {
    id: 1,
    user_id: 1,
    bio: 'Passionate full-stack developer with 8+ years of experience building scalable web applications. I love working at the intersection of design and engineering to create impactful user experiences. Open source contributor and tech community mentor.',
    location: 'San Francisco, CA',
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'Redis', 'Kubernetes'],
    experience: [
      {
        id: 1,
        title: 'Senior Full Stack Developer',
        company: 'TechCorp Inc.',
        start_date: '2021-03',
        end_date: '',
        description: 'Leading a team of 5 engineers building a SaaS platform serving 50k+ users. Architected the migration from monolith to microservices, reducing deployment time by 70%.',
      },
      {
        id: 2,
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        start_date: '2018-06',
        end_date: '2021-02',
        description: 'Built and launched three core product features from scratch. Improved site performance by 40% through optimization and caching strategies.',
      },
      {
        id: 3,
        title: 'Junior Developer',
        company: 'WebAgency',
        start_date: '2016-01',
        end_date: '2018-05',
        description: 'Developed client websites and web applications using React and PHP. Collaborated with design team to implement pixel-perfect UIs.',
      },
    ] as Experience[],
    education: [
      {
        id: 1,
        school: 'University of California, Berkeley',
        degree: "Bachelor's",
        field: 'Computer Science',
        start_date: '2012-09',
        end_date: '2016-05',
      },
    ] as Education[],
  },
  recentActivity: [
    {
      id: 1,
      type: 'post',
      description: 'Published an article: "Why TypeScript is a Game Changer for Large Teams"',
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      type: 'comment',
      description: 'Commented on "Best practices for microservices architecture"',
      timestamp: '1 day ago',
    },
    {
      id: 3,
      type: 'connection',
      description: 'Connected with Sarah Chen, Product Manager at Google',
      timestamp: '3 days ago',
    },
    {
      id: 4,
      type: 'like',
      description: 'Liked "The future of AI in software development"',
      timestamp: '5 days ago',
    },
  ],
};

export const mockValidationRules = {
  name: { required: true, minLength: 2, maxLength: 50 },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  bio: { maxLength: 500 },
  location: { maxLength: 100 },
  skills: { maxItems: 20 },
};
