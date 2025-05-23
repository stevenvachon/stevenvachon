export class NpmApiError extends Error {
  constructor(message) {
    super(`NPM API error: ${message}`);
    this.name = 'NpmApiError';
  }
}

export default async (maintainer, maxResults = 10) => {
  const response = await fetch(
    `https://registry.npmjs.org/-/v1/search?text=maintainer:${maintainer}`
  );

  if (!response.ok) {
    throw new NpmApiError(response.statusText);
  }

  return (await response.json()).objects
    .sort(
      ({ downloads: { monthly: a } }, { downloads: { monthly: b } }) => b - a
    )
    .slice(0, maxResults)
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
