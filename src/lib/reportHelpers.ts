export function reportNameToSymbol(report: string | undefined) {
	if (report == undefined) {
		return '?';
	} else {
		const re = report.toLowerCase();
		return re == 'excellent' ? '++' : re == 'good' ? '+' : re == 'bad' ? '-' : '?';
	}
}

export function reportNameToData(report: string | undefined) {
	if (report == undefined) {
		return undefined;
	} else {
		const re = report.toLowerCase();
		return re == 'excellent' ? '++' : re == 'good' ? '+' : re == 'bad' ? '-' : undefined;
	}
}
