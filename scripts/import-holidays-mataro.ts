import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Configuración
const SUPABASE_URL = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY']!;
const MATARO_HOLIDAYS_URL =
  'https://www.mataro.cat/ca/la-ciutat/festius-locals';

// Cliente Supabase con service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface HolidayData {
  day: number;
  month: number;
  year: number;
  name: string;
  type: 'national' | 'regional' | 'local';
}

/**
 * Determina el tipo de festivo basándose en el nombre
 */
function determineHolidayType(name: string): 'national' | 'regional' | 'local' {
  const nationalHolidays = [
    "Cap d'Any",
    'Reis',
    'Divendres Sant',
    'Dilluns de Pasqua Florida',
    'Festa del Treball',
    'Sant Joan',
    "L'Assumpció",
    'Diada Nacional de Catalunya',
    'Tots Sants',
    'Dia de la Constitució',
    'La Immaculada',
    'Nadal',
    'Sant Esteve',
  ];

  const localHolidays = ['Fira a Mataró', 'Festa major de Les Santes'];

  if (nationalHolidays.includes(name)) {
    return 'national';
  } else if (localHolidays.includes(name)) {
    return 'local';
  } else {
    return 'regional';
  }
}

/**
 * Extrae los festivos de la tabla HTML del Ayuntamiento
 */
async function scrapeHolidaysFromMataroWebsite(
  year: number
): Promise<HolidayData[]> {
  try {
    console.log(
      `🔄 Descargando festivos de ${year} desde ${MATARO_HOLIDAYS_URL}...`
    );

    const response = await fetch(MATARO_HOLIDAYS_URL);
    const html = await response.text();

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Buscar la tabla de festivos (ajustar selector según la estructura real)
    const table = document.querySelector('table');
    if (!table) {
      throw new Error('No se encontró la tabla de festivos en la página');
    }

    const rows = table.querySelectorAll('tr');
    const holidays: HolidayData[] = [];

    // Procesar cada fila (saltar la primera si es header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const cells = row.querySelectorAll('td');

      if (cells.length >= 2) {
        const dateCell = cells[0]?.textContent?.trim();
        const nameCell = cells[1]?.textContent?.trim();

        if (dateCell && nameCell) {
          // Parsear fecha (formato: "1 de gener", "15 d'agost", etc.)
          const dateMatch = dateCell.match(/(\d+)\s+de\s+(\w+)/);
          if (dateMatch) {
            const day = parseInt(dateMatch[1] || '0');
            const monthName = (dateMatch[2] || '').toLowerCase();

            // Mapear nombres de meses catalanes a números
            const monthMap: { [key: string]: number } = {
              gener: 1,
              febrer: 2,
              març: 3,
              abril: 4,
              maig: 5,
              juny: 6,
              juliol: 7,
              agost: 8,
              setembre: 9,
              octubre: 10,
              novembre: 11,
              desembre: 12,
            };

            const month = monthMap[monthName];
            if (month) {
              const type = determineHolidayType(nameCell);

              holidays.push({
                day,
                month,
                year,
                name: nameCell,
                type,
              });
            }
          }
        }
      }
    }

    console.log(`✅ Se extrajeron ${holidays.length} festivos para ${year}`);
    return holidays;
  } catch (error) {
    console.error('❌ Error al extraer festivos:', error);
    throw error;
  }
}

/**
 * Importa los festivos a Supabase
 */
async function importHolidaysToSupabase(
  holidays: HolidayData[]
): Promise<void> {
  try {
    console.log('🔄 Importando festivos a Supabase...');

    // Eliminar festivos existentes del año
    const year = holidays[0]?.year;
    if (year) {
      const { error: deleteError } = await supabase
        .from('holidays')
        .delete()
        .eq('year', year);

      if (deleteError) {
        console.warn('⚠️ Error al eliminar festivos existentes:', deleteError);
      } else {
        console.log(`🗑️ Festivos existentes de ${year} eliminados`);
      }
    }

    // Insertar nuevos festivos
    const { data, error } = await supabase
      .from('holidays')
      .insert(holidays)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ ${data?.length || 0} festivos importados exitosamente`);
  } catch (error) {
    console.error('❌ Error al importar festivos:', error);
    throw error;
  }
}

/**
 * Valida que los festivos importados sean correctos
 */
function validateHolidays(holidays: HolidayData[], year: number): void {
  console.log('🔍 Validando festivos importados...');

  // Validaciones básicas
  if (holidays.length === 0) {
    throw new Error('No se encontraron festivos para validar');
  }

  // Verificar que todos los festivos son del año correcto
  const wrongYear = holidays.some((h) => h.year !== year);
  if (wrongYear) {
    throw new Error('Algunos festivos no corresponden al año especificado');
  }

  // Verificar fechas válidas
  const invalidDates = holidays.some(
    (h) => h.day < 1 || h.day > 31 || h.month < 1 || h.month > 12
  );
  if (invalidDates) {
    throw new Error('Algunos festivos tienen fechas inválidas');
  }

  // Verificar festivos específicos de Mataró
  const expectedHolidays = [
    { day: 1, month: 1, name: "Cap d'Any" },
    { day: 6, month: 1, name: 'Reis' },
    { day: 9, month: 6, name: 'Fira a Mataró' },
    { day: 28, month: 7, name: 'Festa major de Les Santes' },
    { day: 15, month: 8, name: "L'Assumpció" },
    { day: 25, month: 12, name: 'Nadal' },
  ];

  for (const expected of expectedHolidays) {
    const found = holidays.find(
      (h) => h.day === expected.day && h.month === expected.month
    );
    if (!found) {
      console.warn(
        `⚠️ Festivo esperado no encontrado: ${expected.name} (${expected.day}/${expected.month})`
      );
    }
  }

  console.log('✅ Validación completada');
}

/**
 * Función principal
 */
async function importMataroHolidays(
  year: number = new Date().getFullYear()
): Promise<void> {
  try {
    console.log(`🚀 Iniciando importación de festivos de Mataró para ${year}`);

    // 1. Extraer festivos de la web
    const holidays = await scrapeHolidaysFromMataroWebsite(year);

    // 2. Validar festivos
    validateHolidays(holidays, year);

    // 3. Importar a Supabase
    await importHolidaysToSupabase(holidays);

    console.log(`🎉 Importación completada exitosamente para ${year}`);
  } catch (error) {
    console.error('💥 Error en la importación:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const year = parseInt(process.argv[2] || '') || new Date().getFullYear();
  importMataroHolidays(year);
}

export { importMataroHolidays, scrapeHolidaysFromMataroWebsite };
