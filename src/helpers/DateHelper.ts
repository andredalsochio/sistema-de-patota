export class DateHelper {
  static FormatDateToUTC(datestr: string): string {
    const [year, month, day] = datestr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toISOString();
  }
}
