// src/components/BottomNav.jsx — Firecrawl Design System
import React from 'react';

const LINKEDIN_URL = 'https://www.linkedin.com/in/abhishekguleria/';

export default function BottomNav({ activeType, onSelectType }) {
  return (
    <nav className="bnav" aria-label="Gallery navigation">
      <div className="bnav-bar">
        {/* Logo — only orange element (Orange Discipline) */}
        <div className="bnav-logo" title="PromptBoard">
          <span>W.</span>
        </div>

        {/* Tabs */}
        <div className="bnav-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeType === 'image'}
            className={`bnav-tab ${activeType === 'image' ? 'active' : ''}`}
            onClick={() => onSelectType('image')}
          >
            Image Gallery
          </button>
          <button
            role="tab"
            aria-selected={activeType === 'website'}
            className={`bnav-tab ${activeType === 'website' ? 'active' : ''}`}
            onClick={() => onSelectType('website')}
          >
            Website Gallery
          </button>
        </div>

        {/* CTA — #ff4d00 filled pill */}
        <button
          className="bnav-cta"
          onClick={() => window.open(LINKEDIN_URL, '_blank', 'noopener,noreferrer')}
          title="Send suggestions on LinkedIn"
        >
          Send Suggestion
        </button>
      </div>
    </nav>
  );
}
