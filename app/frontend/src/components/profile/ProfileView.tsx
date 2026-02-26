import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockUser } from './mockData';
import type { MockUser, MockActivity } from './mockData';

// ── Activity Icon ──────────────────────────────────────────────────────────────
const ActivityIcon: React.FC<{ type: MockActivity['type'] }> = ({ type }) => {
  const icons: Record<MockActivity['type'], string> = {
    post: '📝',
    comment: '💬',
    like: '👍',
    connection: '🤝',
  };
  return <span className="text-lg">{icons[type]}</span>;
};

// ── Skill Badge ────────────────────────────────────────────────────────────────
const SkillBadge: React.FC<{ skill: string }> = ({ skill }) => (
  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
    {skill}
  </span>
);

// ── Section with collapsible mobile support ────────────────────────────────────
const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setOpen(!open)}
      >
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <span className="text-gray-400 text-xl md:hidden">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
};

// ── Main ProfileView ───────────────────────────────────────────────────────────
const ProfileView: React.FC = () => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data from backend (Day 4 will replace this with real API)
  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 mb-4">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 pb-16">

      {/* ── Profile Header ── */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
        {/* Cover banner */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-12">
            {/* Avatar */}
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gray-100"
            />

            {/* Name + title */}
            <div className="flex-1 sm:pb-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.title}</p>
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <span>📍</span> {user.location}
              </p>
            </div>

            {/* Edit button */}
            <Link
              to="/profile/edit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Edit Profile
            </Link>
          </div>

          {/* Connections */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{user.connections.toLocaleString()}</span> connections
            <span className="text-gray-300">|</span>
            <span>{user.mutualConnections} mutual connections</span>
          </div>

          {/* Social links */}
          <div className="mt-3 flex flex-wrap gap-3">
            {user.socialLinks.linkedin && (
              <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                <span>💼</span> LinkedIn
              </a>
            )}
            {user.socialLinks.github && (
              <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer"
                className="text-gray-700 hover:underline text-sm flex items-center gap-1">
                <span>💻</span> GitHub
              </a>
            )}
            {user.socialLinks.twitter && (
              <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                className="text-sky-500 hover:underline text-sm flex items-center gap-1">
                <span>🐦</span> Twitter
              </a>
            )}
            {user.socialLinks.website && (
              <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer"
                className="text-green-600 hover:underline text-sm flex items-center gap-1">
                <span>🌐</span> Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── About / Bio ── */}
      <CollapsibleSection title="About">
        <p className="text-gray-700 leading-relaxed">{user.profile.bio}</p>
      </CollapsibleSection>

      {/* ── Skills ── */}
      <CollapsibleSection title="Skills">
        <div className="flex flex-wrap gap-2">
          {user.profile.skills.map((skill) => (
            <SkillBadge key={skill} skill={skill} />
          ))}
        </div>
      </CollapsibleSection>

      {/* ── Experience ── */}
      <CollapsibleSection title="Experience">
        <div className="space-y-6">
          {user.profile.experience.map((exp, idx) => (
            <div key={exp.id} className={idx > 0 ? 'pt-6 border-t border-gray-100' : ''}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                  <p className="text-blue-600">{exp.company}</p>
                </div>
                <span className="text-sm text-gray-500 text-right ml-4">
                  {exp.start_date} — {exp.end_date || 'Present'}
                </span>
              </div>
              {exp.description && (
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ── Education ── */}
      <CollapsibleSection title="Education">
        <div className="space-y-4">
          {user.profile.education.map((edu) => (
            <div key={edu.id}>
              <h3 className="font-semibold text-gray-900">{edu.school}</h3>
              <p className="text-gray-600">
                {edu.degree} · {edu.field}
              </p>
              <p className="text-sm text-gray-500">
                {edu.start_date} — {edu.end_date}
              </p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ── Recent Activity ── */}
      <CollapsibleSection title="Recent Activity">
        <div className="space-y-4">
          {user.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ActivityIcon type={activity.type} />
              </div>
              <div>
                <p className="text-gray-700 text-sm">{activity.description}</p>
                <p className="text-gray-400 text-xs mt-0.5">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

    </div>
  );
};

export default ProfileView;
