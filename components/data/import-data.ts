export const importFields = [
  ['externalId', '원료 ID'],
  ['name', '원료명'],
  ['casNumber', 'CAS 번호'],
  ['supplierName', '공급사'],
  ['pyramid', '향조'],
  ['pricePerKg', '가격 / kg'],
  ['priceCurrency', '통화'],
  ['safetyNotes', '안전 정보'],
  ['regulatoryNotes', '규제 정보'],
] as const;
export function parseImport(
  text: string,
  json: boolean,
): Record<string, string>[] {
  if (json) {
    const value: unknown = JSON.parse(text);
    if (
      !Array.isArray(value) ||
      value.some((row) => !row || typeof row !== 'object' || Array.isArray(row))
    )
      throw new Error('JSON은 객체 배열 형식이어야 합니다.');
    return value.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          value == null
            ? ''
            : typeof value === 'object'
              ? JSON.stringify(value)
              : typeof value === 'string'
                ? value
                : JSON.stringify(value),
        ]),
      ),
    );
  }
  const records: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const source = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (c === '"') {
      if (quoted && source[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && (c === ',' || c === '\n' || c === '\r')) {
      row.push(cell);
      cell = '';
      if (c !== ',') {
        if (row.some(Boolean)) records.push(row);
        row = [];
        if (c === '\r' && source[i + 1] === '\n') i++;
      }
    } else cell += c;
  }
  if (quoted) throw new Error('CSV 따옴표가 닫히지 않았습니다.');
  row.push(cell);
  if (row.some(Boolean)) records.push(row);
  const headers = records.shift()?.map((value) => value.trim()) ?? [];
  if (
    !headers.length ||
    headers.some((value) => !value) ||
    new Set(headers).size !== headers.length
  )
    throw new Error('파일의 열 이름을 확인해 주세요.');
  if (records.some((row) => row.length !== headers.length))
    throw new Error('CSV의 열 개수가 일치하지 않습니다.');
  return records.map((row) =>
    Object.fromEntries(headers.map((key, index) => [key, row[index]])),
  );
}
export function mappedRow(
  row: Record<string, string>,
  mapping: Record<string, string>,
) {
  return Object.fromEntries(
    Object.entries(mapping)
      .filter(([, target]) => target)
      .map(([source, target]) => [target, row[source]?.trim() ?? '']),
  );
}
export function rowError(row: Record<string, string>) {
  if (!row.externalId || !row.name) return '필수 필드 누락: 원료 ID / 원료명';
  if (row.externalId.length > 100 || row.name.length > 200)
    return '원료 ID 또는 원료명이 너무 깁니다.';
  if (
    row.pricePerKg &&
    (!Number.isFinite(Number(row.pricePerKg)) || Number(row.pricePerKg) < 0)
  )
    return '가격은 0 이상의 숫자로 입력하세요.';
  return '';
}
