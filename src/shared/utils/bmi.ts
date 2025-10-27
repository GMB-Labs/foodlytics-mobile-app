export type BmiLabel = 'Bajo peso' | 'Normal' | 'Sobrepeso' | 'Obesidad';

export function calcBMI(heightCm: number, weightKg: number): { bmi: number; label: BmiLabel } {
	const h = heightCm / 100;
	const bmi = Number((weightKg / (h * h)).toFixed(1));
	let label: BmiLabel;
	if (bmi < 18.5) label = 'Bajo peso';
	else if (bmi < 25) label = 'Normal';
	else if (bmi < 30) label = 'Sobrepeso';
	else label = 'Obesidad';
	return { bmi, label };
}
