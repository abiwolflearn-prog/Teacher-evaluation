import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAcademic } from '../../context/AcademicContext';
import { getCollegeById } from '../../constants/universityData';
import { getTeachers } from '../../services/teacherService';
import { getMyEvaluations } from '../../services/evaluationService';
import { Teacher, Evaluation } from '../../types';

export default function CoursesScreen() {
  const { theme, isDark } = useTheme();
  const { academicQuery } = useAcademic();
  const router = useRouter();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const college = academicQuery ? getCollegeById(academicQuery.collegeId) : null;
  const program = college?.programs.find(p => p.id === academicQuery?.programId);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [teachersData, myEvals] = await Promise.all([
        getTeachers({
          college: college?.name,
          program: program?.name,
          year: academicQuery?.year,
          semester: academicQuery?.semester
        }),
        getMyEvaluations()
      ]);
      setTeachers(teachersData);
      setEvaluations(myEvals);
    } catch (e) {
      console.error('Error fetching courses:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [academicQuery, college, program]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const isEvaluated = (teacherId: string) => {
    return evaluations.some(ev => ev.teacher?._id === teacherId);
  };

  const renderCourseItem = ({ item }: { item: Teacher }) => {
    const evaluated = isEvaluated(item._id);

    return (
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="book" size={24} color={theme.primary} />
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={[styles.courseTitle, { color: theme.text }]}>{item.courseName}</Text>
            <Text style={[styles.instructorName, { color: theme.textSecondary }]}>
              Instructor: <Text style={{ color: theme.text, fontWeight: '600' }}>{item.name}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: theme.border }]}>
            <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
              Year {item.year} • Sem {item.semester}
            </Text>
          </View>
          {evaluated ? (
            <View style={[styles.badge, { backgroundColor: theme.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={14} color={theme.success} />
              <Text style={[styles.badgeText, { color: theme.success, fontWeight: '700', marginLeft: 4 }]}>
                Evaluated
              </Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: theme.warning + '20' }]}>
              <Ionicons name="time" size={14} color={theme.warning} />
              <Text style={[styles.badgeText, { color: theme.warning, fontWeight: '700', marginLeft: 4 }]}>
                Pending
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
          <TouchableOpacity 
            style={styles.detailBtn}
            onPress={() => router.push(`/(student)/teachers/${item._id}`)}
          >
            <Text style={[styles.detailBtnText, { color: theme.textSecondary }]}>Teacher Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: evaluated ? theme.surface : theme.primary },
              evaluated && { borderWidth: 1, borderColor: theme.border }
            ]}
            onPress={() => router.push(`/(student)/evaluations/wizard/${item._id}`)}
          >
            <Text
              style={[
                styles.actionBtnText,
                { color: evaluated ? theme.text : '#fff' }
              ]}
            >
              {evaluated ? 'Edit Review' : 'Evaluate'}
            </Text>
            <Ionicons
              name={evaluated ? 'create-outline' : 'star'}
              size={14}
              color={evaluated ? theme.text : '#fff'}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>My Courses</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {program?.name || 'All Programs'} • Year {academicQuery?.year || 1} • Sem {academicQuery?.semester || 1}
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item) => item._id}
          renderItem={renderCourseItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="school-outline" size={64} color={theme.border} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Courses Listed</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                No courses or teachers have been assigned yet for your selected semester.
              </Text>
              <TouchableOpacity
                style={[styles.switchBtn, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/academic-selection')}
              >
                <Text style={styles.switchBtnText}>Change Academic Info</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardHeaderInfo: { flex: 1 },
  courseTitle: { fontSize: 17, fontWeight: '700' },
  instructorName: { fontSize: 13, marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  detailBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  detailBtnText: { fontSize: 13, fontWeight: '600' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  switchBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  switchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
