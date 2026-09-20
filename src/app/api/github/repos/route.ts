import { NextResponse } from 'next/server';
import { db } from '@/lib/store/db-adapter';
import { DEMO_USER_ID } from '@/lib/store/seed-data';
import { GitHubRepository } from '@/lib/types/database';

async function fetchLiveGitHubRepos(): Promise<GitHubRepository[]> {
  const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  const headers: Record<string, string> = {
    'User-Agent': 'CIRE-App',
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`GitHub API responded with status ${res.status}: ${res.statusText}`);
  }

  const rawRepos = await res.json();
  if (!Array.isArray(rawRepos)) {
    return [];
  }

  return rawRepos.map((r: any) => ({
    id: `gh-${r.id}`,
    user_id: DEMO_USER_ID,
    repo_name: r.name,
    repo_full_name: r.full_name,
    html_url: r.html_url,
    description: r.description || null,
    primary_language: r.language || null,
    detected_languages: r.language ? { [r.language]: 100 } : {},
    manifest_hash: null,
    detected_skills: [r.language, ...(r.topics || [])].filter(Boolean),
    demonstrated_features: r.description ? [r.description] : [],
    selected_for_analysis: true,
    last_analyzed_at: null,
    created_at: r.created_at || new Date().toISOString(),
    updated_at: r.updated_at || new Date().toISOString(),
  }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceSync = searchParams.get('sync') === 'true';

    let repos = await db.getRepositories(DEMO_USER_ID);

    // If empty or explicitly syncing or only demo repos (< 5), fetch real repos from GitHub
    if (forceSync || repos.length <= 4) {
      try {
        const liveRepos = await fetchLiveGitHubRepos();
        if (liveRepos.length > 0) {
          await db.saveRepositories(DEMO_USER_ID, liveRepos);
          repos = liveRepos;
        }
      } catch (err) {
        console.warn('Could not sync live GitHub repos, returning stored:', err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      repositories: repos,
      count: repos.length,
      syncedWithGitHub: Boolean(process.env.GITHUB_PERSONAL_ACCESS_TOKEN),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repoId, selected, action } = body;

    if (action === 'sync') {
      const liveRepos = await fetchLiveGitHubRepos();
      await db.saveRepositories(DEMO_USER_ID, liveRepos);
      return NextResponse.json({ success: true, count: liveRepos.length, repositories: liveRepos });
    }

    if (!repoId) {
      return NextResponse.json({ success: false, error: 'Repository ID is required' }, { status: 400 });
    }

    const updated = await db.updateRepository(DEMO_USER_ID, repoId, {
      selected_for_analysis: Boolean(selected),
    });
    return NextResponse.json({ success: true, repository: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
