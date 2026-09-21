import { Construction } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';

export function ComingSoon({ title }: { title: string }) {
  return (
    <AppShell title={title}>
      <Card>
        <EmptyState
          icon={<Construction size={22} strokeWidth={1.5} />}
          title={`${title} isn't part of this design pass`}
          message="This screen follows the same design system as the rest of the console and will reuse the shared components already built here."
        />
      </Card>
    </AppShell>
  );
}
