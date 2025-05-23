import GithubApiError from './util/GithubApiError.js';

export default async (user) => {
  const response = await fetch(`https://api.github.com/users/${user}`);

  if (!response.ok) {
    throw new GithubApiError(response.statusText);
  }

  return new Date((await response.json()).created_at).getUTCFullYear();
};
