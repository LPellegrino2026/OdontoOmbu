// Íconos por nombre de tratamiento: son solo presentación, no viven en la
// base de datos. Si un tratamiento nuevo no está acá, usa DEFAULT_ICON.
export const DEFAULT_ICON = "M12 3c2.5 0 3.3 1 4.5 1S19 3.6 19 6c0 4-1.2 9-2.8 11-.9 1.1-1.9.4-2.3-1.2l-.6-2.3c-.3-1-1.3-1-1.6 0l-.6 2.3C10.7 17.4 9.7 18.1 8.8 17 7.2 15 6 10 6 6c0-2.4 1.3-2 2.5-2S9.5 3 12 3Z";

export const ICONS_BY_TRATAMIENTO = {
  "Limpieza Dental": DEFAULT_ICON,
  Ortodoncia: "M4 9h16M4 9v3a8 8 0 0 0 16 0V9M8 9v5M12 9v6M16 9v5",
  Implantes: "M12 3c3 0 5 2 5 5 0 3-1 4-1.5 7l-.5 3c-.2 1.3-1.8 1.3-2 0l-.5-3c-.2-1-.8-1-1 0l-.5 3c-.2 1.3-1.8 1.3-2 0L8.5 15C8 12 7 11 7 8c0-3 2-5 5-5Z",
  "Estética Dental": "M5 12a7 7 0 0 0 14 0M5 12h14M8 12v3M12 12v4M16 12v3",
};

export const CTA_BY_TRATAMIENTO = {
  "Limpieza Dental": "Reservar limpieza →",
  Ortodoncia: "Evaluar mi caso →",
  Implantes: "Consultar implante →",
  "Estética Dental": "Diseñar mi sonrisa →",
};
export const DEFAULT_CTA = "Reservar →";

export const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export const WEEKDAY_LETTERS = ["L", "M", "M", "J", "V", "S", "D"];
