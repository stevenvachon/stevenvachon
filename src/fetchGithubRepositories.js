import GithubApiError from './util/GithubApiError.js';

const PER_PAGE = 100;

export default async (user, maxResults = 10) => {
  const result = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://api.github.com/users/${user}/repos?per_page=${PER_PAGE}&page=${page}`
    );

    if (!response.ok) {
      throw new GithubApiError(response.statusText);
    }

    const repos = await response.json();

    if (repos.length > 0) {
      result.push(...repos);
    }

    if (repos.length === PER_PAGE) {
      page++;
    } else {
      break;
    }
  }

  return result
    .sort(({ stargazers_count: a }, { stargazers_count: b }) => b - a)
    .slice(0, maxResults)
    .map(({ html_url, name, stargazers_count }) => ({
      name,
      stars: stargazers_count,
      url: html_url,
    }));
};
