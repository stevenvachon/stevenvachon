import githubSearch from './util/githubSearch.js';

export default async (author, token) =>
  (
    await githubSearch({
      object: 'issues',
      query: [`author:${author}`, 'is:merged', 'is:pr'],
      token,
    })
  ).length;
