import { ReactNode, useState } from 'react';

interface TabDef {
  key: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabDef[];
  defaultTab?: string;
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--space-5)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-5)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: active === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
              padding: '0 0 var(--space-3) 0',
              marginBottom: -1,
              fontSize: 14,
              fontWeight: 600,
              color: active === tab.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{activeTab?.content}</div>
    </div>
  );
}
