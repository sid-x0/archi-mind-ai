import { useState } from 'react';
import { Settings, Bell, Search } from 'lucide-react';

export type Page = 'home' | 'models' | 'datasets' | 'simulations';

interface TopNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function TopNav({ currentPage, onNavigate }: TopNavProps) {
  const [searchVal, setSearchVal] = useState('');

  const navLinks: { label: string; page: Page }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Models', page: 'models' },
    { label: 'Datasets', page: 'datasets' },
    { label: 'Simulations', page: 'simulations' },
  ];

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      backgroundColor: '#0d0d14',
      borderBottom: '1px solid var(--border-subtle)',
      height: '60px',
      flexShrink: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <button
        onClick={() => onNavigate('home')}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          transform: 'none',
        }}
      >
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 800,
          fontSize: '1.15rem',
          letterSpacing: '0.04em',
          color: '#f1f5f9',
        }}>
          ARCHI-MIND{' '}
          <span style={{ color: '#06b6d4' }}>AI</span>
        </span>
      </button>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: '0.25rem' }}>
        {navLinks.map(({ label, page }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            style={{
              background: currentPage === page ? 'rgba(124,58,237,0.15)' : 'none',
              border: currentPage === page ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
              color: currentPage === page ? '#a78bfa' : 'var(--text-secondary)',
              padding: '0.4rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: 'none',
            }}
            onMouseEnter={e => {
              if (currentPage !== page) {
                (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
              }
            }}
            onMouseLeave={e => {
              if (currentPage !== page) {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                (e.currentTarget as HTMLButtonElement).style.background = 'none';
              }
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Search + Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.4rem 0.85rem',
          width: '260px',
        }}>
          <Search size={14} color="var(--text-tertiary)" />
          <input
            type="text"
            placeholder="Search architecture library..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <button style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.45rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'none',
          color: 'var(--text-secondary)',
        }}>
          <Settings size={16} />
        </button>

        <button style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.45rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'none',
          color: 'var(--text-secondary)',
          position: 'relative',
        }}>
          <Bell size={16} />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '6px',
            height: '6px',
            background: '#ef4444',
            borderRadius: '50%',
            border: '1px solid #0d0d14',
          }} />
        </button>

        {/* Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#fff',
          cursor: 'pointer',
          flexShrink: 0,
        }}>
          P
        </div>
      </div>
    </header>
  );
}
