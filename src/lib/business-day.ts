// Restaurant's local timezone - Africa/Addis_Ababa is a fixed UTC+3, no DST,
// so this can be a plain hour offset rather than full IANA timezone math.
const TZ_OFFSET_HOURS = 3;
const DAY_START_HOUR = 6;

/**
 * The start of the current "business day" - 6am local time. Before 6am, it's
 * still considered part of the previous calendar day's shift (so a waiter
 * working past midnight still sees last night's orders as "today" until 6am).
 */
export function getBusinessDayStart(now = new Date()): Date {
  const localNow = new Date(now.getTime() + TZ_OFFSET_HOURS * 3_600_000);
  const localHour = localNow.getUTCHours();
  const dayOffset = localHour < DAY_START_HOUR ? -1 : 0;

  const localDayStart = new Date(
    Date.UTC(
      localNow.getUTCFullYear(),
      localNow.getUTCMonth(),
      localNow.getUTCDate() + dayOffset,
      DAY_START_HOUR,
      0,
      0
    )
  );

  return new Date(localDayStart.getTime() - TZ_OFFSET_HOURS * 3_600_000);
}
