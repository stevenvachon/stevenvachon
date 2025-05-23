import { dirname, relative, resolve } from 'node:path';
import fetchGithubAccountCreationYear from './fetchGithubAccountCreationYear.js';
import fetchGithubIssuesCount from './fetchGithubIssuesCount.js';
import fetchGithubPullRequestsCount from './fetchGithubPullRequestsCount.js';
import fetchGithubRepositories from './fetchGithubRepositories.js';
import fetchNpmPackages, { NpmApiError } from './fetchNpmPackages.js';
import GithubApiError from './util/GithubApiError.js';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import template from './template.js';

const { GITHUB_TOKEN } = process.env;
const USERNAME = 'stevenvachon';

if (GITHUB_TOKEN) {
  console.log('Using GitHub token…');
}

try {
  const accountCreationYear = await fetchGithubAccountCreationYear(USERNAME);
  const [numIssues, numPullRequests, repositories, packages] =
    await Promise.all([
      fetchGithubIssuesCount(USERNAME, accountCreationYear, GITHUB_TOKEN),
      fetchGithubPullRequestsCount(USERNAME, GITHUB_TOKEN),
      fetchGithubRepositories(USERNAME),
      fetchNpmPackages(USERNAME),
    ]);
  const dir = resolve(
    dirname(import.meta.url.replace('file://', '')),
    '../generated'
  );
  const file = `${dir}/README.md`;
  await rm(dir, { force: true, recursive: true });
  await mkdir(dir);
  await writeFile(
    file,
    template({
      accountCreationYear,
      numIssues,
      numPullRequests,
      packages,
      repositories,
    })
  );
  console.log('File written:', relative(process.cwd(), file));
} catch (error) {
  if (error instanceof NpmApiError || error instanceof GithubApiError) {
    console.error(error.message);
  } else {
    throw error;
  }
}

// It often hangs for some reason
process.exit(0);
