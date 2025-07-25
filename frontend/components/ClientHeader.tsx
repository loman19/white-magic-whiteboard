'use client';

import { usePathname } from 'next/navigation';
import { AuthButton } from './AuthButton';

export function ClientHeader() {
  const pathname = usePathname();
  const showAuthButton = !pathname.includes('/whiteboard/');
  return (
    <header className="flex justify-end p-4">
      {showAuthButton && <AuthButton />}
    </header>
  );
}