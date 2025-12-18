'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
  fetchGitHubRepos,
  fetchGitHubUser,
  fetchRepoContents,
  fetchRepoReadme,
  fetchFileContent,
  type GitHubRepo,
  type GitHubUser,
} from '@/lib/github';

export function useGitHubToken() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['github-token'],
    queryFn: async (): Promise<string | null> => {
      const { data: { session } } = await supabase.auth.getSession();

      // First try to get from session (available right after OAuth)
      if (session?.provider_token) {
        return session.provider_token;
      }

      // If not in session, try to get from profile
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('github_token')
          .eq('id', session.user.id)
          .single();

        if (profile?.github_token) {
          return profile.github_token;
        }
      }

      return null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

export function useGitHubUser() {
  const { data: token } = useGitHubToken();

  return useQuery({
    queryKey: ['github-user', token],
    queryFn: async (): Promise<GitHubUser | null> => {
      if (!token) return null;
      return fetchGitHubUser(token);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useGitHubRepos() {
  const { data: token, isLoading: tokenLoading } = useGitHubToken();

  return useQuery({
    queryKey: ['github-repos', token],
    queryFn: async (): Promise<GitHubRepo[]> => {
      if (!token) return [];
      return fetchGitHubRepos(token);
    },
    enabled: !!token && !tokenLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGitHubRepo(fullName: string) {
  const { data: repos } = useGitHubRepos();

  return useQuery({
    queryKey: ['github-repo', fullName],
    queryFn: async (): Promise<GitHubRepo | null> => {
      return repos?.find((r) => r.full_name === fullName) || null;
    },
    enabled: !!repos && !!fullName,
  });
}

export function useRepoContents(owner: string, repo: string, path: string = '') {
  const { data: token } = useGitHubToken();

  return useQuery({
    queryKey: ['repo-contents', owner, repo, path, token],
    queryFn: async () => {
      if (!token) return [];
      return fetchRepoContents(token, owner, repo, path);
    },
    enabled: !!token && !!owner && !!repo,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useRepoReadme(owner: string, repo: string) {
  const { data: token } = useGitHubToken();

  return useQuery({
    queryKey: ['repo-readme', owner, repo, token],
    queryFn: async (): Promise<string | null> => {
      if (!token) return null;
      return fetchRepoReadme(token, owner, repo);
    },
    enabled: !!token && !!owner && !!repo,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFileContent(owner: string, repo: string, path: string) {
  const { data: token } = useGitHubToken();

  return useQuery({
    queryKey: ['file-content', owner, repo, path, token],
    queryFn: async (): Promise<string | null> => {
      if (!token) return null;
      return fetchFileContent(token, owner, repo, path);
    },
    enabled: !!token && !!owner && !!repo && !!path,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
