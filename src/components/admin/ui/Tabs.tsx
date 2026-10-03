import { KeyboardEvent, ReactNode, useRef } from "react";

export interface AdminTabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface AdminTabsProps {
  tabs: AdminTabItem[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

function AdminTabs({ tabs, value, onChange, label }: AdminTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedTab = tabs.find((tab) => tab.id === value) ?? tabs[0];

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const enabledTabs = tabs
      .map((tab, tabIndex) => ({ tab, tabIndex }))
      .filter(({ tab }) => !tab.disabled);
    const enabledIndex = enabledTabs.findIndex(
      ({ tabIndex }) => tabIndex === index,
    );
    const nextEnabledIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? enabledTabs.length - 1
          : (enabledIndex +
              (event.key === "ArrowRight" ? 1 : -1) +
              enabledTabs.length) %
            enabledTabs.length;
    const next = enabledTabs[nextEnabledIndex];
    if (next) {
      onChange(next.tab.id);
      tabRefs.current[next.tabIndex]?.focus();
    }
  };

  return (
    <div className="admin-tabs-root">
      <div className="admin-tabs" role="tablist" aria-label={label}>
        {tabs.map((tab, index) => (
          <button
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            key={tab.id}
            type="button"
            role="tab"
            id={`admin-tab-${tab.id}`}
            aria-selected={value === tab.id}
            aria-controls={`admin-panel-${tab.id}`}
            tabIndex={value === tab.id ? 0 : -1}
            disabled={tab.disabled}
            className="admin-tabs__tab"
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {selectedTab && (
        <section
          id={`admin-panel-${selectedTab.id}`}
          role="tabpanel"
          aria-labelledby={`admin-tab-${selectedTab.id}`}
          tabIndex={0}
          className="admin-tabs__panel"
        >
          {selectedTab.content}
        </section>
      )}
    </div>
  );
}

export default AdminTabs;
