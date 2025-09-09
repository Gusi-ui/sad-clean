// Sistema de Backup Automático para prevenir pérdida de datos
// Ejecutar periódicamente en producción

class DataBackupSystem {
  constructor() {
    this.backupInterval = null;
    this.backupFrequency = 1000 * 60 * 30; // 30 minutos
  }

  // Iniciar backup automático
  startAutoBackup() {
    console.log('🔄 Iniciando sistema de backup automático...');
    console.log(
      `📅 Frecuencia: cada ${this.backupFrequency / 1000 / 60} minutos`
    );

    this.backupInterval = setInterval(() => {
      this.createBackup();
    }, this.backupFrequency);

    // Primer backup inmediato
    this.createBackup();
  }

  // Detener backup automático
  stopAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      console.log('⏹️ Sistema de backup automático detenido');
    }
  }

  // Crear backup completo
  async createBackup() {
    const timestamp = new Date().toISOString();
    console.log(`\n💾 Creando backup: ${timestamp}`);

    try {
      const backup = {
        timestamp,
        data: {},
      };

      // Backup de usuarios
      try {
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          backup.data.users = usersData.users || [];
          console.log(`👤 Usuarios respaldados: ${backup.data.users.length}`);
        }
      } catch (error) {
        console.warn('⚠️ Error respaldando usuarios:', error.message);
      }

      // Backup de workers
      try {
        const workersResponse = await fetch('/api/workers');
        if (workersResponse.ok) {
          const workersData = await workersResponse.json();
          backup.data.workers = workersData.workers || [];
          console.log(`👥 Workers respaldados: ${backup.data.workers.length}`);
        }
      } catch (error) {
        console.warn('⚠️ Error respaldando workers:', error.message);
      }

      // Backup de asignaciones
      try {
        const assignmentsResponse = await fetch('/api/assignments');
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          backup.data.assignments = assignmentsData.assignments || [];
          console.log(
            `📋 Asignaciones respaldadas: ${backup.data.assignments.length}`
          );
        } else {
          console.warn('⚠️ Endpoint de assignments no disponible');
        }
      } catch (error) {
        console.warn('⚠️ Error respaldando assignments:', error.message);
      }

      // Guardar backup en localStorage
      const backupKey = `backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));

      // Mantener solo los últimos 10 backups
      this.cleanupOldBackups();

      console.log(`✅ Backup guardado: ${backupKey}`);
      console.log(
        `📊 Total registros: ${
          (backup.data.users?.length || 0) +
          (backup.data.workers?.length || 0) +
          (backup.data.assignments?.length || 0)
        }`
      );

      return backup;
    } catch (error) {
      console.error('❌ Error creando backup:', error);
      return null;
    }
  }

  // Limpiar backups antiguos
  cleanupOldBackups() {
    const backupKeys = Object.keys(localStorage)
      .filter((key) => key.startsWith('backup_'))
      .sort()
      .reverse();

    // Mantener solo los últimos 10
    if (backupKeys.length > 10) {
      const keysToRemove = backupKeys.slice(10);
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });
      console.log(`🗑️ Backups antiguos eliminados: ${keysToRemove.length}`);
    }
  }

  // Listar backups disponibles
  listBackups() {
    const backupKeys = Object.keys(localStorage)
      .filter((key) => key.startsWith('backup_'))
      .sort()
      .reverse();

    console.log('\n📋 BACKUPS DISPONIBLES:');
    console.log('=======================');

    backupKeys.forEach((key, index) => {
      try {
        const backup = JSON.parse(localStorage.getItem(key));
        const date = new Date(backup.timestamp).toLocaleString();
        const totalRecords =
          (backup.data.users?.length || 0) +
          (backup.data.workers?.length || 0) +
          (backup.data.assignments?.length || 0);

        console.log(`${index + 1}. ${key}`);
        console.log(`   📅 Fecha: ${date}`);
        console.log(`   📊 Registros: ${totalRecords}`);
        console.log(`   👤 Usuarios: ${backup.data.users?.length || 0}`);
        console.log(`   👥 Workers: ${backup.data.workers?.length || 0}`);
        console.log(
          `   📋 Asignaciones: ${backup.data.assignments?.length || 0}`
        );
        console.log('');
      } catch (error) {
        console.warn(`❌ Error leyendo backup ${key}:`, error.message);
      }
    });

    return backupKeys;
  }

  // Restaurar desde backup
  async restoreBackup(backupKey) {
    try {
      console.log(`🔄 Restaurando desde backup: ${backupKey}`);

      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        console.error('❌ Backup no encontrado');
        return false;
      }

      const backup = JSON.parse(backupData);
      console.log(
        `📅 Fecha del backup: ${new Date(backup.timestamp).toLocaleString()}`
      );

      let restoredCount = 0;

      // Restaurar usuarios
      if (backup.data.users && backup.data.users.length > 0) {
        console.log(`👤 Restaurando ${backup.data.users.length} usuarios...`);
        for (const user of backup.data.users) {
          try {
            const response = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(user),
            });
            if (response.ok) restoredCount++;
          } catch (error) {
            console.warn(
              `⚠️ Error restaurando usuario ${user.name}:`,
              error.message
            );
          }
        }
      }

      // Nota: Para workers y assignments necesitarías los endpoints correspondientes
      console.log(
        `✅ Restauración completada: ${restoredCount} registros restaurados`
      );
      return true;
    } catch (error) {
      console.error('❌ Error en restauración:', error);
      return false;
    }
  }

  // Verificar integridad de backups
  verifyBackups() {
    const backupKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith('backup_')
    );

    console.log('\n🔍 VERIFICACIÓN DE BACKUPS:');
    console.log('===========================');

    let validBackups = 0;
    let corruptedBackups = 0;

    backupKeys.forEach((key) => {
      try {
        const backup = JSON.parse(localStorage.getItem(key));
        if (backup.timestamp && backup.data) {
          validBackups++;
          console.log(`✅ ${key}: Válido`);
        } else {
          corruptedBackups++;
          console.log(`❌ ${key}: Estructura inválida`);
        }
      } catch (error) {
        corruptedBackups++;
        console.log(`❌ ${key}: Corrupto (${error.message})`);
      }
    });

    console.log('\n📊 RESUMEN:');
    console.log(`✅ Backups válidos: ${validBackups}`);
    console.log(`❌ Backups corruptos: ${corruptedBackups}`);
    console.log(`📦 Total: ${backupKeys.length}`);
  }
}

// Crear instancia global
const backupSystem = new DataBackupSystem();

// Funciones helper para consola
function startBackupSystem() {
  backupSystem.startAutoBackup();
}

function stopBackupSystem() {
  backupSystem.stopAutoBackup();
}

function createManualBackup() {
  return backupSystem.createBackup();
}

function listAvailableBackups() {
  return backupSystem.listBackups();
}

function verifyBackupIntegrity() {
  backupSystem.verifyBackups();
}

function restoreFromBackup(backupKey) {
  return backupSystem.restoreBackup(backupKey);
}

// Exponer funciones globales
window.backupSystem = backupSystem;
window.startBackupSystem = startBackupSystem;
window.stopBackupSystem = stopBackupSystem;
window.createManualBackup = createManualBackup;
window.listAvailableBackups = listAvailableBackups;
window.verifyBackupIntegrity = verifyBackupIntegrity;
window.restoreFromBackup = restoreFromBackup;

console.log('💾 SISTEMA DE BACKUP AUTOMÁTICO CARGADO');
console.log('======================================');
console.log('');
console.log('🚀 FUNCIONES DISPONIBLES:');
console.log('startBackupSystem()     - Iniciar backup automático');
console.log('stopBackupSystem()      - Detener backup automático');
console.log('createManualBackup()    - Crear backup manual');
console.log('listAvailableBackups()  - Listar backups disponibles');
console.log('verifyBackupIntegrity() - Verificar integridad de backups');
console.log('restoreFromBackup(key)  - Restaurar desde backup específico');
console.log('');
console.log(
  '💡 RECOMENDACIÓN: Ejecuta startBackupSystem() para protección automática'
);
console.log('💡 Los backups se guardan en localStorage del navegador');
