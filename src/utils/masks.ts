function digitsOnly(value: string, maxLength: number) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

export function formatPhone(value: string) {
  const digits = digitsOnly(value, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCpf(value: string) {
  const digits = digitsOnly(value, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

export function formatCep(value: string) {
  return digitsOnly(value, 8).replace(/^(\d{5})(\d)/, '$1-$2');
}

export function formatCardNumber(value: string) {
  return digitsOnly(value, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatCardExpiry(value: string) {
  const digits = digitsOnly(value, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function formatCvv(value: string) {
  return digitsOnly(value, 4);
}
