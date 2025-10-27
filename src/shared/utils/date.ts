// Simple date utilities for onboarding

export function isValidISODate(iso: string): boolean {
	// expects YYYY-MM-DD
	const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!m) return false;
	const y = Number(m[1]);
	const mo = Number(m[2]);
	const d = Number(m[3]);
	if (mo < 1 || mo > 12) return false;
	if (d < 1 || d > 31) return false;
	const dt = new Date(Date.UTC(y, mo - 1, d));
	return (
		dt.getUTCFullYear() === y &&
		dt.getUTCMonth() === mo - 1 &&
		dt.getUTCDate() === d
	);
}

export function ageFromISO(iso: string): number | undefined {
	if (!isValidISODate(iso)) return undefined;
	const [y, m, d] = iso.split('-').map((n) => Number(n));
	const today = new Date();
	let age = today.getFullYear() - y;
	const hasHadBirthdayThisYear =
		today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d);
	if (!hasHadBirthdayThisYear) age -= 1;
	return age;
}

export function toISOFromParts(day?: number, month?: number, year?: number): string | undefined {
	if (!day || !month || !year) return undefined;
	const dd = String(day).padStart(2, '0');
	const mm = String(month).padStart(2, '0');
	const yyyy = String(year).padStart(4, '0');
	const iso = `${yyyy}-${mm}-${dd}`;
	return isValidISODate(iso) ? iso : undefined;
}
