
import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className }) => {
  const LucideIcon = (Icons as any)[name] || Icons.HelpCircle;
  return <LucideIcon className={className} />;
};
