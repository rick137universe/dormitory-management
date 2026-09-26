import { demoAccounts, type DemoAccount, type RoleId } from './accounts';

export const SESSION_KEY = 'dorma-demo-session';

export function saveDemoSession(account: DemoAccount | null) {
  if (typeof window === 'undefined') return;
  if (account) window.sessionStorage.setItem(SESSION_KEY, account.role);
  else window.sessionStorage.removeItem(SESSION_KEY);
}

export function readDemoSession(): DemoAccount | null {
  if (typeof window === 'undefined') return null;
  const role = window.sessionStorage.getItem(SESSION_KEY) as RoleId | null;
  return demoAccounts.find(account => account.role === role) ?? null;
}
