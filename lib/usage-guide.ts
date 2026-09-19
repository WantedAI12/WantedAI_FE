const DISMISSED_KEY = 'perfumery:usage-guide:dismissed:v1';
const SEEN_KEY = 'perfumery:usage-guide:seen:v1';

export function shouldShowUsageGuide(guest: boolean, persistent: Pick<Storage, 'getItem'>, session: Pick<Storage, 'getItem'>) {
  if (!guest) return false;
  try {
    return persistent.getItem(DISMISSED_KEY) !== 'true' && session.getItem(SEEN_KEY) !== 'true';
  } catch {
    return true;
  }
}

export function dismissUsageGuide(permanent: boolean, persistent: Pick<Storage, 'setItem'>, session: Pick<Storage, 'setItem'>) {
  try {
    session.setItem(SEEN_KEY, 'true');
    if (permanent) persistent.setItem(DISMISSED_KEY, 'true');
    return true;
  } catch {
    return false;
  }
}
