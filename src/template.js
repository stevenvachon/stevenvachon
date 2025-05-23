import dedent from 'dedent';

const date = (d) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeZone: 'UTC',
  }).format(d);

const number = (n) => new Intl.NumberFormat('en-US').format(n);

export default ({
  accountCreationYear,
  numIssues,
  numPullRequests,
  packages,
  repositories,
}) =>
  dedent(`
    - **${numPullRequests}** public **pull requests merged** since *${accountCreationYear}*.
    - **${numIssues}** public **issues reported** since *${accountCreationYear}*.
    
    ## Top 10 Most Popular [npm](https://npmjs.com) Packages (authored by me)

    | Name | Monthly Downloads ⬇ | Weekly Downloads |
    | ---- | -------------------: | ---------------: |
    ${packages
      .map(
        ({ name, downloads: { monthly, weekly }, url }) =>
          `| [${name}](${url}) | ${number(monthly)} | ${number(weekly)} |`
      )
      .join('\n')}

    ## Top 10 Most Popular [GitHub](https://github.com) Repositories (authored by me)

    | Name | Stars ⬇ |
    | ---- | -------: |
    ${repositories
      .map(({ name, stars, url }) => `| [${name}](${url}) | ${number(stars)} |`)
      .join('\n')}

    ---
    File generated on: ${date(new Date())}
  `);
