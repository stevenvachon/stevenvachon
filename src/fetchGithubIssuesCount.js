import githubSearch from './util/githubSearch.js';

export default async (author, startingYear, token) =>
  (
    await githubSearch({
      object: 'issues',
      query: [`author:${author}`, 'type:issue'],
      startingYear,
      token,
    })
  ).length;
