import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';

export const PlaceholderPage: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  return (
    <PageContainer title={title} description={description}>
      <Card level={1} className="h-[400px] flex items-center justify-center border-dashed border-white/20 bg-transparent">
        <div className="flex flex-col items-center gap-2 opacity-40">
          <span className="font-bold tracking-widest uppercase text-xs">Module Under Construction</span>
        </div>
      </Card>
    </PageContainer>
  );
};
