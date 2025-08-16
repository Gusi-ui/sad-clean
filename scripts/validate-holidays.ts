import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Configuración
const SUPABASE_URL = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

// Cliente Supabase con service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface Holiday {
  id: string;
  day: number;
  month: number;
  year: number;
  name: string;
  type: 'national' | 'regional' | 'local';
  created_at: string;
  updated_at: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalHolidays: number;
    nationalHolidays: number;
    regionalHolidays: number;
    localHolidays: number;
    monthsWithHolidays: number[];
  };
}

/**
 * Obtiene todos los festivos de un año específico
 */
async function getHolidaysForYear(year: number): Promise<Holiday[]> {
  const { data, error } = await supabase
    .from('holidays')
    .select('*')
    .eq('year', year)
    .order('month', { ascending: true })
    .order('day', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener festivos: ${error.message}`);
  }

  return data || [];
}

/**
 * Valida la integridad de los festivos
 */
function validateHolidaysIntegrity(
  holidays: Holiday[],
  year: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Contadores
  const summary = {
    totalHolidays: holidays.length,
    nationalHolidays: 0,
    regionalHolidays: 0,
    localHolidays: 0,
    monthsWithHolidays: [] as number[],
  };

  // Validaciones básicas
  if (holidays.length === 0) {
    errors.push(`No hay festivos registrados para el año ${year}`);
    return { isValid: false, errors, warnings, summary };
  }

  // Verificar duplicados
  const dateKeys = new Set<string>();
  for (const holiday of holidays) {
    const dateKey = `${holiday.year}-${holiday.month}-${holiday.day}`;
    if (dateKeys.has(dateKey)) {
      errors.push(
        `Festivo duplicado: ${holiday.name} (${holiday.day}/${holiday.month}/${holiday.year})`
      );
    }
    dateKeys.add(dateKey);

    // Contar por tipo
    switch (holiday.type) {
      case 'national':
        summary.nationalHolidays++;
        break;
      case 'regional':
        summary.regionalHolidays++;
        break;
      case 'local':
        summary.localHolidays++;
        break;
      default:
        errors.push(
          `Tipo de festivo inválido: ${holiday.type} para ${holiday.name}`
        );
    }

    // Verificar fechas válidas
    if (holiday.day < 1 || holiday.day > 31) {
      errors.push(`Día inválido: ${holiday.day} para ${holiday.name}`);
    }
    if (holiday.month < 1 || holiday.month > 12) {
      errors.push(`Mes inválido: ${holiday.month} para ${holiday.name}`);
    }
    if (holiday.year !== year) {
      errors.push(
        `Año incorrecto: ${holiday.year} para ${holiday.name} (esperado: ${year})`
      );
    }

    // Verificar que el nombre no esté vacío
    if (!holiday.name.trim()) {
      errors.push(
        `Nombre de festivo vacío para ${holiday.day}/${holiday.month}/${holiday.year}`
      );
    }

    // Añadir mes a la lista si no está
    if (!summary.monthsWithHolidays.includes(holiday.month)) {
      summary.monthsWithHolidays.push(holiday.month);
    }
  }

  // Validar festivos específicos de Mataró
  const expectedHolidays = [
    { day: 1, month: 1, name: "Cap d'Any", type: 'national' },
    { day: 6, month: 1, name: 'Reis', type: 'national' },
    { day: 9, month: 6, name: 'Fira a Mataró', type: 'local' },
    { day: 28, month: 7, name: 'Festa major de Les Santes', type: 'local' },
    { day: 15, month: 8, name: "L'Assumpció", type: 'national' },
    { day: 25, month: 12, name: 'Nadal', type: 'national' },
  ];

  for (const expected of expectedHolidays) {
    const found = holidays.find(
      (h) => h.day === expected.day && h.month === expected.month
    );
    if (!found) {
      warnings.push(
        `Festivo esperado no encontrado: ${expected.name} (${expected.day}/${expected.month})`
      );
    } else if (found.type !== expected.type) {
      warnings.push(
        `Tipo incorrecto para ${expected.name}: esperado ${expected.type}, encontrado ${found.type}`
      );
    }
  }

  // Verificar distribución por meses
  if (summary.monthsWithHolidays.length < 6) {
    warnings.push(
      `Pocos meses con festivos: ${summary.monthsWithHolidays.length} (esperado al menos 6)`
    );
  }

  // Verificar que hay festivos nacionales
  if (summary.nationalHolidays < 8) {
    warnings.push(
      `Pocos festivos nacionales: ${summary.nationalHolidays} (esperado al menos 8)`
    );
  }

  // Verificar que hay festivos locales de Mataró
  if (summary.localHolidays < 2) {
    warnings.push(
      `Pocos festivos locales: ${summary.localHolidays} (esperado al menos 2: Fira a Mataró y Les Santes)`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary,
  };
}

/**
 * Test unitario para verificar el conteo de festivos
 */
async function testHolidayCount(
  year: number,
  month: number,
  expectedCount: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from('holidays')
    .select('*')
    .eq('year', year)
    .eq('month', month);

  if (error) {
    console.error(`❌ Error en test de conteo: ${error.message}`);
    return false;
  }

  const actualCount = data?.length || 0;
  const isValid = actualCount === expectedCount;

  if (isValid) {
    console.log(
      `✅ Test de conteo pasado: ${month}/${year} = ${actualCount} festivos`
    );
  } else {
    console.error(
      `❌ Test de conteo fallido: ${month}/${year} = ${actualCount} festivos (esperado: ${expectedCount})`
    );
  }

  return isValid;
}

/**
 * Función principal de validación
 */
async function validateHolidaysForYear(year: number): Promise<void> {
  try {
    console.log(`🔍 Validando festivos para el año ${year}...`);

    // 1. Obtener festivos
    const holidays = await getHolidaysForYear(year);

    // 2. Validar integridad
    const validation = validateHolidaysIntegrity(holidays, year);

    // 3. Mostrar resultados
    console.log('\n📊 RESUMEN DE VALIDACIÓN');
    console.log('='.repeat(50));
    console.log(`Total de festivos: ${validation.summary.totalHolidays}`);
    console.log(`Festivos nacionales: ${validation.summary.nationalHolidays}`);
    console.log(`Festivos regionales: ${validation.summary.regionalHolidays}`);
    console.log(`Festivos locales: ${validation.summary.localHolidays}`);
    console.log(
      `Meses con festivos: ${validation.summary.monthsWithHolidays.sort((a, b) => a - b).join(', ')}`
    );

    if (validation.errors.length > 0) {
      console.log('\n❌ ERRORES ENCONTRADOS:');
      validation.errors.forEach((error) => console.log(`  - ${error}`));
    }

    if (validation.warnings.length > 0) {
      console.log('\n⚠️ ADVERTENCIAS:');
      validation.warnings.forEach((warning) => console.log(`  - ${warning}`));
    }

    if (validation.isValid && validation.warnings.length === 0) {
      console.log(
        '\n✅ VALIDACIÓN EXITOSA: Todos los festivos están correctos'
      );
    } else if (validation.isValid) {
      console.log(
        '\n⚠️ VALIDACIÓN PARCIAL: Hay advertencias pero no errores críticos'
      );
    } else {
      console.log('\n❌ VALIDACIÓN FALLIDA: Se encontraron errores críticos');
    }

    // 4. Ejecutar tests de conteo específicos
    console.log('\n🧪 EJECUTANDO TESTS DE CONTEO...');
    const tests = [
      { month: 8, expected: 1 }, // Agosto 2025: 15 de agosto
      { month: 12, expected: 3 }, // Diciembre: 6, 8, 25
      { month: 1, expected: 2 }, // Enero: 1, 6
    ];

    let testsPassed = 0;
    for (const test of tests) {
      if (await testHolidayCount(year, test.month, test.expected)) {
        testsPassed++;
      }
    }

    console.log(
      `\n📈 RESULTADO DE TESTS: ${testsPassed}/${tests.length} tests pasados`
    );
  } catch (error) {
    console.error('💥 Error en la validación:', error);
    process.exit(1);
  }
}

/**
 * Función para verificar festivos faltantes
 */
async function checkMissingHolidays(year: number): Promise<void> {
  console.log(`🔍 Verificando festivos faltantes para ${year}...`);

  const holidays = await getHolidaysForYear(year);
  const holidayDates = new Set(holidays.map((h) => `${h.month}-${h.day}`));

  // Festivos que deberían estar siempre
  const requiredHolidays = [
    { month: 1, day: 1, name: "Cap d'Any" },
    { month: 1, day: 6, name: 'Reis' },
    { month: 5, day: 1, name: 'Festa del Treball' },
    { month: 6, day: 24, name: 'Sant Joan' },
    { month: 8, day: 15, name: "L'Assumpció" },
    { month: 9, day: 11, name: 'Diada Nacional de Catalunya' },
    { month: 12, day: 25, name: 'Nadal' },
  ];

  const missing = requiredHolidays.filter(
    (h) => !holidayDates.has(`${h.month}-${h.day}`)
  );

  if (missing.length > 0) {
    console.log('❌ FESTIVOS FALTANTES:');
    missing.forEach((h) => console.log(`  - ${h.name} (${h.day}/${h.month})`));
  } else {
    console.log('✅ Todos los festivos requeridos están presentes');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const year = parseInt(process.argv[2] || '') || new Date().getFullYear();
  const command = process.argv[3] || 'validate';

  switch (command) {
    case 'validate':
      validateHolidaysForYear(year);
      break;
    case 'missing':
      checkMissingHolidays(year);
      break;
    default:
      console.log('Comandos disponibles: validate, missing');
      process.exit(1);
  }
}

export { checkMissingHolidays, testHolidayCount, validateHolidaysForYear };
