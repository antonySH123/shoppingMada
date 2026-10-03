import { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}

function PageHeader({ title, description, eyebrow, action }: PageHeaderProps) {
  return (
    <header className="admin-design-page-header">
      <div className="min-w-0">
        {eyebrow && <p className="admin-design-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}

export default PageHeader;
