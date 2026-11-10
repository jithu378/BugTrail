import { useEffect } from 'react';

const BASE_TITLE = 'BugTrail · Developer Bug Tracker';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · BugTrail` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
