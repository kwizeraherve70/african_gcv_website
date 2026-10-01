import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { getTeam, getTeamPerson } from '../api/team';
import { TEAM_LOCALES, type PublicTeamPerson, type PublicTeamSnapshot, type TeamLocale } from '../types/team';

interface TeamResource<T> {
  key: string;
  status: 'loading' | 'ready' | 'hidden' | 'error';
  data: T | null;
}

function useTeamLocale(): TeamLocale {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  return TEAM_LOCALES.includes(language as TeamLocale) ? language as TeamLocale : 'en';
}

function useTeamResource<T>(key: string, fetcher: () => Promise<T>, allowHidden = false) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<TeamResource<T>>({ key, status: 'loading', data: null });

  useEffect(() => {
    let cancelled = false;
    setState({ key, status: 'loading', data: null });
    fetcher().then(data => {
      if (!cancelled) setState({ key, status: 'ready', data });
    }).catch(error => {
      if (!cancelled) {
        setState({
          key,
          status: allowHidden && error instanceof ApiError && error.status === 404 ? 'hidden' : 'error',
          data: null,
        });
      }
    });
    return () => { cancelled = true; };
  }, [key, revision, fetcher, allowHidden]);

  // Never render a previous locale/person while the new effect is starting.
  const current: TeamResource<T> = state.key === key ? state : { key, status: 'loading', data: null };
  return { ...current, retry: () => setRevision(value => value + 1) };
}

export function useTeamPage() {
  const locale = useTeamLocale();
  const fetcher = useCallback(() => getTeam(locale), [locale]);
  return useTeamResource<PublicTeamSnapshot>(`team:${locale}`, fetcher);
}

export function useTeamPerson(slug: string) {
  const locale = useTeamLocale();
  const fetcher = useCallback(() => getTeamPerson(slug, locale), [slug, locale]);
  return useTeamResource<PublicTeamPerson>(`person:${slug}:${locale}`, fetcher, true);
}
