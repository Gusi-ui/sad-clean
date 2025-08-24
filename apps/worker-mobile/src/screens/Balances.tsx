import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { computeWorkerUsersMonthlyBalances } from '../lib/user-calculations';

interface MonthlyBalance {
  id: string;
  year: number;
  month: number;
  total_hours: number;
  worked_hours: number;
  holiday_hours: number;
  balance: number;
}

interface Assignment {
  id: string;
  assignment_type: string;
  weekly_hours: number;
  start_date: string;
  end_date: string | null;
  user_name: string;
}

interface DetailedUserBalance {
  userId: string;
  userName: string;
  userSurname: string;
  assignedMonthlyHours: number;
  theoreticalMonthlyHours: number;
  laborablesMonthlyHours: number;
  holidaysMonthlyHours: number;
  difference: number;
}

interface DetailedBalance {
  assignedHours: number;
  laborablesHours: number;
  holidaysHours: number;
  totalTheoreticalHours: number;
  difference: number;
}

export default function BalancesScreen(): React.JSX.Element {
  const { user } = useAuth();
  const [balances, setBalances] = useState<MonthlyBalance[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [userBalances, setUserBalances] = useState<DetailedUserBalance[]>([]);
  const [detailedBalance, setDetailedBalance] =
    useState<DetailedBalance | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingDetailed, setLoadingDetailed] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [showUserDetails, setShowUserDetails] = useState<boolean>(false);
  const [debugMode, setDebugMode] = useState<boolean>(false);

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const email = user?.email ?? '';
      if (email.trim() === '') {
        setBalances([]);
        setAssignments([]);
        setUserBalances([]);
        setDetailedBalance(null);
        return;
      }

      // Buscar trabajadora por email
      const { data: workerData, error: workerError } = await supabase
        .from('workers')
        .select('id')
        .eq('email', email)
        .single();

      if (workerError !== null || workerData === null) {
        setBalances([]);
        setAssignments([]);
        setUserBalances([]);
        setDetailedBalance(null);
        return;
      }

      const workerId = workerData.id;

      // Cargar balances de horas
      const { data: balanceData, error: balanceError } = await supabase
        .from('hours_balances')
        .select('*')
        .eq('worker_id', workerId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (balanceError === null && balanceData !== null) {
        setBalances(balanceData);
      }

      // Cargar asignaciones activas para el mes seleccionado
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const endDate =
        selectedMonth === 12
          ? `${selectedYear + 1}-01-01`
          : `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;

      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .select(
          `
          id,
          assignment_type,
          weekly_hours,
          start_date,
          end_date,
          users!inner(name, surname)
        `
        )
        .eq('worker_id', workerId)
        .lte('start_date', endDate)
        .or(`end_date.is.null,end_date.gte.${startDate}`);

      if (assignmentError === null && assignmentData !== null) {
        const processedAssignments = assignmentData.map((item: any) => ({
          ...item,
          user_name:
            `${item.users?.name ?? ''} ${item.users?.surname ?? ''}`.trim(),
        }));
        setAssignments(processedAssignments);
      }

      // Cargar balances detallados por usuario usando cálculos avanzados
      console.log('🔍 Cargando balance detallado para trabajadora:', workerId);
      await loadDetailedBalances(workerId);
    } catch (error) {
      console.error('Error loading balances:', error);
      console.error('No se pudieron cargar los datos de balance');
    } finally {
      setLoading(false);
    }
  }, [user?.email, selectedYear, selectedMonth]);

  const loadDetailedBalances = async (workerId: string): Promise<void> => {
    setLoadingDetailed(true);
    try {
      console.log(
        '🔍 Usando computeWorkerUsersMonthlyBalances para trabajadora:',
        workerId
      );

      // Usar la función optimizada que tiene la lógica correcta
      const workerBalances = await computeWorkerUsersMonthlyBalances(
        workerId,
        selectedYear,
        selectedMonth
      );

      console.log(
        '✅ Balance por usuario calculado:',
        workerBalances.length,
        'usuarios'
      );
      console.log('🔍 Datos detallados:', workerBalances);

      // Convertir a formato DetailedUserBalance
      const detailedUserBalances: DetailedUserBalance[] = workerBalances.map(
        (balance) => ({
          userId: balance.userId,
          userName: balance.userName,
          userSurname: balance.userSurname,
          assignedMonthlyHours: balance.assignedMonthlyHours,
          theoreticalMonthlyHours: balance.totalHours, // laborables + holidays
          laborablesMonthlyHours: balance.laborablesHours,
          holidaysMonthlyHours: balance.holidaysHours,
          difference: balance.difference,
        })
      );

      setUserBalances(detailedUserBalances);

      // Calcular balance general sumando todos los balances individuales
      const finalBalance: DetailedBalance = detailedUserBalances.reduce(
        (sum: DetailedBalance, row: DetailedUserBalance) => ({
          assignedHours: sum.assignedHours + row.assignedMonthlyHours,
          laborablesHours: sum.laborablesHours + row.laborablesMonthlyHours,
          holidaysHours: sum.holidaysHours + row.holidaysMonthlyHours,
          totalTheoreticalHours:
            sum.totalTheoreticalHours + row.theoreticalMonthlyHours,
          difference: sum.difference + row.difference,
        }),
        {
          assignedHours: 0,
          laborablesHours: 0,
          holidaysHours: 0,
          totalTheoreticalHours: 0,
          difference: 0,
        }
      );

      console.log('📊 Balance general calculado:', finalBalance);
      setDetailedBalance(finalBalance);

      // Si está en modo debug, mostrar alert con datos
      if (debugMode) {
        Alert.alert(
          'Debug - Balance Calculado',
          `Usuarios: ${detailedUserBalances.length}\nAsignadas: ${finalBalance.assignedHours.toFixed(1)}h\nTeóricas: ${finalBalance.totalTheoreticalHours.toFixed(1)}h\nDiferencia: ${finalBalance.difference.toFixed(1)}h`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error loading detailed balances:', error);
    } finally {
      setLoadingDetailed(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => setLoading(false));
  }, [loadData]);

  const currentMonthBalance = useMemo(() => {
    return balances.find(
      (b) => b.year === selectedYear && b.month === selectedMonth
    );
  }, [balances, selectedYear, selectedMonth]);

  const getBalanceColor = (balance: number): string => {
    if (balance > 0) return '#22c55e'; // Verde para balance positivo
    if (balance < 0) return '#ef4444'; // Rojo para balance negativo
    return '#64748b'; // Gris para balance neutral
  };

  const getBalanceIcon = (balance: number): string => {
    if (balance > 0) return '📈';
    if (balance < 0) return '📉';
    return '📊';
  };

  const renderMonthSelector = () => (
    <View style={styles.selectorContainer}>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => {
          if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(selectedYear - 1);
          } else {
            setSelectedMonth(selectedMonth - 1);
          }
        }}
      >
        <Text style={styles.selectorButtonText}>‹ Anterior</Text>
      </TouchableOpacity>

      <View style={styles.currentMonthContainer}>
        <Text style={styles.currentMonthText}>
          {monthNames[selectedMonth - 1]} {selectedYear}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => {
          if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
          } else {
            setSelectedMonth(selectedMonth + 1);
          }
        }}
      >
        <Text style={styles.selectorButtonText}>Siguiente ›</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBalanceCard = () => {
    // Mostrar balance detallado si está disponible, sino el básico
    const useDetailedBalance = detailedBalance !== null;
    const balance = useDetailedBalance
      ? detailedBalance.difference
      : (currentMonthBalance?.balance ?? 0);
    const balanceColor = getBalanceColor(balance);
    const balanceIcon = getBalanceIcon(balance);

    if (!useDetailedBalance && !currentMonthBalance) {
      return (
        <View style={styles.balanceCard}>
          <Text style={styles.balanceCardTitle}>
            {getBalanceIcon(0)} Balance de {monthNames[selectedMonth - 1]}
          </Text>
          <Text style={styles.noDataText}>
            No hay datos de balance para este mes
          </Text>
          {loadingDetailed && (
            <ActivityIndicator
              size='small'
              color='#3b82f6'
              style={{ marginTop: 12 }}
            />
          )}
        </View>
      );
    }

    return (
      <View style={styles.balanceCard}>
        <Text style={styles.balanceCardTitle}>
          {balanceIcon} Balance de {monthNames[selectedMonth - 1]}
        </Text>

        {loadingDetailed ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#3b82f6' />
            <Text style={styles.loadingText}>
              Calculando balance detallado...
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.balanceStatsContainer}>
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatValue}>
                  {useDetailedBalance
                    ? detailedBalance.assignedHours.toFixed(1)
                    : currentMonthBalance!.total_hours.toFixed(1)}
                  h
                </Text>
                <Text style={styles.balanceStatLabel}>Horas Asignadas</Text>
              </View>

              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatValue}>
                  {useDetailedBalance
                    ? detailedBalance.laborablesHours.toFixed(1)
                    : currentMonthBalance!.worked_hours.toFixed(1)}
                  h
                </Text>
                <Text style={styles.balanceStatLabel}>
                  {useDetailedBalance ? 'Horas Laborables' : 'Horas Trabajadas'}
                </Text>
              </View>

              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatValue}>
                  {useDetailedBalance
                    ? detailedBalance.holidaysHours.toFixed(1)
                    : currentMonthBalance!.holiday_hours.toFixed(1)}
                  h
                </Text>
                <Text style={styles.balanceStatLabel}>Horas Festivos</Text>
              </View>
            </View>

            {useDetailedBalance && (
              <View style={styles.theoreticalHoursContainer}>
                <Text style={styles.theoreticalHoursLabel}>
                  Horas Teóricas Totales
                </Text>
                <Text style={styles.theoreticalHoursValue}>
                  {detailedBalance.totalTheoreticalHours.toFixed(1)}h
                </Text>
              </View>
            )}

            <View
              style={[
                styles.finalBalanceContainer,
                { borderColor: balanceColor },
              ]}
            >
              <Text style={[styles.finalBalanceLabel, { color: balanceColor }]}>
                Balance Final
              </Text>
              <Text style={[styles.finalBalanceValue, { color: balanceColor }]}>
                {balance > 0 ? '+' : ''}
                {balance.toFixed(1)}h
              </Text>
              <Text style={styles.finalBalanceDescription}>
                {balance > 0
                  ? 'Horas extras asignadas'
                  : balance < 0
                    ? 'Horas por debajo de asignación'
                    : 'Balance equilibrado'}
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderAssignmentsList = () => (
    <View style={styles.assignmentsContainer}>
      <Text style={styles.assignmentsTitle}>
        📋 Asignaciones de {monthNames[selectedMonth - 1]}
      </Text>

      {assignments.length > 0 ? (
        assignments.map((assignment) => (
          <View key={assignment.id} style={styles.assignmentCard}>
            <View style={styles.assignmentHeader}>
              <Text style={styles.assignmentType}>
                {assignment.assignment_type.toUpperCase()}
              </Text>
              <Text style={styles.assignmentHours}>
                {assignment.weekly_hours}h/semana
              </Text>
            </View>

            <Text style={styles.assignmentUser}>👤 {assignment.user_name}</Text>

            <Text style={styles.assignmentPeriod}>
              📅 {assignment.start_date} → {assignment.end_date ?? 'Indefinido'}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No hay asignaciones para este mes
          </Text>
        </View>
      )}
    </View>
  );

  const renderUserBalancesList = () => {
    if (!showUserDetails || userBalances.length === 0) {
      return null;
    }

    return (
      <View style={styles.userBalancesContainer}>
        <Text style={styles.userBalancesTitle}>
          👥 Balance por Usuario - {monthNames[selectedMonth - 1]}
        </Text>

        {userBalances.map((userBalance) => {
          const userBalanceColor = getBalanceColor(userBalance.difference);
          return (
            <View key={userBalance.userId} style={styles.userBalanceCard}>
              <View style={styles.userBalanceHeader}>
                <Text style={styles.userBalanceName}>
                  {userBalance.userName} {userBalance.userSurname}
                </Text>
                <Text
                  style={[
                    styles.userBalanceDifference,
                    { color: userBalanceColor },
                  ]}
                >
                  {userBalance.difference > 0 ? '+' : ''}
                  {userBalance.difference.toFixed(1)}h
                </Text>
              </View>

              <View style={styles.userBalanceStats}>
                <View style={styles.userBalanceStat}>
                  <Text style={styles.userBalanceStatLabel}>Asignadas</Text>
                  <Text style={styles.userBalanceStatValue}>
                    {userBalance.assignedMonthlyHours.toFixed(1)}h
                  </Text>
                </View>
                <View style={styles.userBalanceStat}>
                  <Text style={styles.userBalanceStatLabel}>Laborables</Text>
                  <Text style={styles.userBalanceStatValue}>
                    {userBalance.laborablesMonthlyHours.toFixed(1)}h
                  </Text>
                </View>
                <View style={styles.userBalanceStat}>
                  <Text style={styles.userBalanceStatLabel}>Festivos</Text>
                  <Text style={styles.userBalanceStatValue}>
                    {userBalance.holidaysMonthlyHours.toFixed(1)}h
                  </Text>
                </View>
                <View style={styles.userBalanceStat}>
                  <Text style={styles.userBalanceStatLabel}>Teóricas</Text>
                  <Text style={styles.userBalanceStatValue}>
                    {userBalance.theoreticalMonthlyHours.toFixed(1)}h
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderToggleButton = () => {
    if (userBalances.length === 0) return null;

    return (
      <View>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowUserDetails(!showUserDetails)}
        >
          <Text style={styles.toggleButtonText}>
            {showUserDetails
              ? '📊 Ocultar detalle por usuario'
              : '👥 Ver detalle por usuario'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: debugMode ? '#ef4444' : '#6b7280',
              marginTop: 8,
            },
          ]}
          onPress={() => setDebugMode(!debugMode)}
        >
          <Text style={styles.toggleButtonText}>
            {debugMode ? '🐛 Debug OFF' : '🐛 Debug ON'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHistoryList = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.historyTitle}>📊 Historial de Balances</Text>

      {balances.length > 0 ? (
        balances.slice(0, 6).map((balance) => {
          const balanceColor = getBalanceColor(balance.balance);
          const isCurrentMonth =
            balance.year === selectedYear && balance.month === selectedMonth;

          return (
            <TouchableOpacity
              key={`${balance.year}-${balance.month}`}
              style={[
                styles.historyCard,
                isCurrentMonth && styles.historyCardActive,
              ]}
              onPress={() => {
                setSelectedYear(balance.year);
                setSelectedMonth(balance.month);
              }}
            >
              <View style={styles.historyCardHeader}>
                <Text style={styles.historyCardMonth}>
                  {monthNames[balance.month - 1]} {balance.year}
                </Text>
                <Text
                  style={[styles.historyCardBalance, { color: balanceColor }]}
                >
                  {balance.balance > 0 ? '+' : ''}
                  {balance.balance.toFixed(1)}h
                </Text>
              </View>

              <View style={styles.historyCardStats}>
                <Text style={styles.historyCardStat}>
                  Trabajadas: {balance.worked_hours.toFixed(1)}h
                </Text>
                <Text style={styles.historyCardStat}>
                  Asignadas: {balance.total_hours.toFixed(1)}h
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No hay historial de balances disponible
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando balances...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderMonthSelector()}
      {renderBalanceCard()}
      {renderToggleButton()}
      {renderUserBalancesList()}
      {renderAssignmentsList()}
      {renderHistoryList()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#64748b',
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectorButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  selectorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  currentMonthContainer: {
    flex: 1,
    alignItems: 'center',
  },
  currentMonthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  balanceCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  balanceStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  balanceStat: {
    alignItems: 'center',
  },
  balanceStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 4,
  },
  balanceStatLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  finalBalanceContainer: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  finalBalanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  finalBalanceValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  finalBalanceDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  assignmentsContainer: {
    margin: 16,
    marginTop: 0,
  },
  assignmentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  assignmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  assignmentHours: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
  },
  assignmentUser: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  assignmentPeriod: {
    fontSize: 12,
    color: '#64748b',
  },
  historyContainer: {
    margin: 16,
    marginTop: 0,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyCardActive: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyCardMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  historyCardBalance: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyCardStat: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  theoreticalHoursContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  theoreticalHoursLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  theoreticalHoursValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  toggleButton: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  userBalancesContainer: {
    margin: 16,
    marginTop: 0,
  },
  userBalancesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  userBalanceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userBalanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userBalanceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  userBalanceDifference: {
    fontSize: 16,
    fontWeight: '700',
  },
  userBalanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userBalanceStat: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 2,
  },
  userBalanceStatLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
    textAlign: 'center',
  },
  userBalanceStatValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
});
