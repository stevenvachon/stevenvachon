import GithubApiError from './GithubApiError.js';
import PQueue from 'p-queue';

const PER_PAGE = 100;

const queue = new PQueue({
  concurrency: 1,
  interval: 60_000,
  intervalCap: 30,
});

const fetchAllPages = async ({ object, query, token }) => {
  const results = [];
  let page = 1;

  while (true) {
    const response = await queue.add(() => {
      const url = `https://api.github.com/search/${object}?q=${query.join(
        '+'
      )}&per_page=${PER_PAGE}&page=${page}`;

      console.log('Fetching', url);

      return fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(token && { Authorization: `token ${token}` }),
        },
      }).then((res) => {
        if (!res.ok) {
          throw new GithubApiError(res.statusText);
        }
        return res;
      });
    });

    const { items } = await response.json();

    if (items.length > 0) {
      results.push(...items);
    }

    if (response.headers.get('X-RateLimit-Remaining') === '0') {
      // Can't use 'X-RateLimit-Reset' because GitHub lies with a +24 hours value
      console.log('Rate limit exceeded. Waiting 30 seconds before continuing…');
      await new Promise((resolve) => setTimeout(resolve, 30_000));
    }

    if (items.length === PER_PAGE) {
      page++;
    } else {
      break;
    }
  }

  return results;
};

export default async ({ object, query, startingYear, token }) => {
  if (startingYear) {
    const endingYear = new Date().getUTCFullYear();
    const results = [];
    for (let year = startingYear; year <= endingYear; year++) {
      results.push(
        ...(await fetchAllPages({
          object,
          query: [...query, `created:${year}-01-01..${year}-12-31`],
          token,
        }))
      );
    }
    return results;
  } else {
    return fetchAllPages({ object, query, token });
  }
};
