'use client';

import { TolgeeProvider as TolgeeReactProvider } from '@tolgee/react';
import { tolgee } from './tolgee-config';
import { ReactNode } from 'react';

export const TolgeeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <TolgeeReactProvider tolgee={tolgee} fallback="Loading translations...">
      {children}
    </TolgeeReactProvider>
  );
};
