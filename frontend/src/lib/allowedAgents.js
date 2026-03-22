/**
 * Shared list of user-agent substrings that are allowed to view restricted content.
 * Add or remove entries here to control access across the entire app.
 */
export const ALLOWED_USER_AGENTS = [
  'Macintosh; Intel Mac OS X 10_15_7',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/145.0.7632.108 Mobile/15E148 Safari/604.1',
]

/**
 * Returns true if the current browser's user agent matches any allowed substring.
 */
export function isAllowedAgent() {
  const ua = navigator.userAgent
  return ALLOWED_USER_AGENTS.some((fragment) => ua.includes(fragment))
}
