import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  message = 'Nothing here yet.',
  action,
}: {
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#689F38]/10 text-[#2D5A27]">
        <Inbox className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <p className="text-base font-medium text-[#273C46]/80">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
