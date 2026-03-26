/**
 * Shared list of user-agent substrings that are allowed to view restricted content.
 * Add or remove entries here to control access across the entire app.
 */
export const ALLOWED_USER_AGENTS = [
  'Macintosh; Intel Mac OS X 10_15_7',
  'iPhone; CPU iPhone OS 18_6_2',
  'iPhone; CPU iPhone OS 26_3_1',
]

/**
 * Returns true if the current browser's user agent matches any allowed substring.
 */
export function isAllowedAgent() {
  const ua = navigator.userAgent
  return ALLOWED_USER_AGENTS.some((fragment) => ua.includes(fragment))
}
