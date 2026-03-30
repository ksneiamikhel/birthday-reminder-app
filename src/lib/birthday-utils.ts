/**
 * Calculate days until the next birthday
 * @param birthdayString - Birthday in YYYY-MM-DD format
 * @returns Number of days until next birthday (0 if today is the birthday)
 */
export function daysUntilNextBirthday(birthdayString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [, month, day] = birthdayString.split('-').map(Number);

  // Create a date for this year's birthday
  let nextBirthday = new Date(today.getFullYear(), month - 1, day);
  nextBirthday.setHours(0, 0, 0, 0);

  // If birthday has already passed this year, use next year's
  if (nextBirthday < today) {
    nextBirthday = new Date(today.getFullYear() + 1, month - 1, day);
    nextBirthday.setHours(0, 0, 0, 0);
  }

  const timeDiff = nextBirthday.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Get the age someone will turn on their next birthday
 * @param birthdayString - Birthday in YYYY-MM-DD format
 * @returns Age they will turn
 */
export function getNextAge(birthdayString: string): number {
  const today = new Date();
  const [year, month, day] = birthdayString.split('-').map(Number);

  let nextBirthdayYear = today.getFullYear();

  const thisYearBirthday = new Date(nextBirthdayYear, month - 1, day);
  if (thisYearBirthday < today) {
    nextBirthdayYear++;
  }

  return nextBirthdayYear - year;
}

/**
 * Format a birthday date string to a readable format
 * @param birthdayString - Birthday in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "March 15")
 */
export function formatBirthdayDate(birthdayString: string): string {
  const date = new Date(birthdayString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

/**
 * Check if birthday is today
 * @param birthdayString - Birthday in YYYY-MM-DD format
 * @returns true if birthday is today
 */
export function isBirthdayToday(birthdayString: string): boolean {
  return daysUntilNextBirthday(birthdayString) === 0;
}

/**
 * Sort people by days until next birthday
 * @param people - Array of people to sort
 * @returns Sorted array
 */
export function sortByUpcomingBirthday<T extends { birthday: string }>(people: T[]): T[] {
  return [...people].sort((a, b) => {
    const daysA = daysUntilNextBirthday(a.birthday);
    const daysB = daysUntilNextBirthday(b.birthday);
    return daysA - daysB;
  });
}
