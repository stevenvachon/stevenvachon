export default class extends Error {
  constructor(message) {
    super(`GitHub API error: ${message}`);
    this.name = 'GithubApiError';
  }
}
