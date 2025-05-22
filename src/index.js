import { dirname, resolve } from 'node:path';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import template from './template.js';

class GithubApiError extends Error {
  constructor(message) {
    super(`GitHub API error: ${message}`);
    this.name = 'GithubApiError';
  }
}

class NpmApiError extends Error {
  constructor(message) {
    super(`NPM API error: ${message}`);
    this.name = 'NpmApiError';
  }
}

const fetchPackages = async () => {
  const response = await fetch(
    'https://registry.npmjs.org/-/v1/search?text=maintainer:stevenvachon'
  );

  if (!response.ok) {
    throw new NpmApiError(response.statusText);
  }

  return (await response.json()).objects
    .sort(
      ({ downloads: { monthly: a } }, { downloads: { monthly: b } }) => b - a
    )
    .slice(0, 10)
    .map(
      ({
        downloads,
        package: {
          links: { npm /*, repository*/ },
          name,
        },
      }) => ({ downloads, name, url: npm })
    );
};

const fetchRepositories = async (token) => {
  const result = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://api.github.com/users/stevenvachon/repos?per_page=100&page=${page}`
    );

    if (!response.ok) {
      throw new GithubApiError(response.statusText);
    }

    const repos = await response.json();

    if (repos.length > 0) {
      result.push(...repos);
      page++;
    } else {
      break;
    }
  }

  return result
    .sort(({ stargazers_count: a }, { stargazers_count: b }) => b - a)
    .slice(0, 10)
    .map(({ html_url, name, stargazers_count }) => ({
      name,
      stars: stargazers_count,
      url: html_url,
    }));
};

try {
  const [packages, repositories] = await Promise.all([
    fetchPackages(),
    fetchRepositories(),
  ]);
  const dir = resolve(
    dirname(import.meta.url.replace('file://', '')),
    '../generated'
  );
  await rm(dir, { force: true, recursive: true });
  await mkdir(dir);
  await writeFile(`${dir}/README.md`, template({ packages, repositories }));
} catch (error) {
  if (error instanceof NpmApiError || error instanceof GithubApiError) {
    console.error(error.message);
  } else {
    throw error;
  }
}
