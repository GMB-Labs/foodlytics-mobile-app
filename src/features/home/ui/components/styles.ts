import { StyleSheet } from 'react-native';

const BG = '#F9FAFB';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },

  headerRow: {
    height: 132,
    paddingHorizontal: 24,
    paddingTop: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerAvatar: {
    width: 60, height: 60, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4
  },

  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E6EEF0', marginHorizontal: 6 },
  dotActive: { backgroundColor: '#FFFFFF' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricCol: { alignItems: 'center', width: 90 },
  metricIcon: { marginBottom: 6 },

  mealsWrapper: { paddingHorizontal: 20, marginTop: 16 },
  mealsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, elevation: 2 },
  mealsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  mealRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 20, paddingHorizontal: 16,
    backgroundColor: '#F8FAFC', borderRadius: 16, marginBottom: 12,
    height: 80,
  },
  mealChip: { width: 48, height: 48, borderRadius: 20, marginRight: 16, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2FCCAC', alignItems: 'center', justifyContent: 'center' },
  arrowContainer: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },

  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 28,
  },
  macroTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginTop: 8,
  },
  macroFill: {
    height: 8,
    borderRadius: 999,
  },

  imcBubble: { width: 80, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8FAF6' },
  imcPill: {  backgroundColor: '#D0F7DC', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, color: '#00C950' },
  imcGrid: { borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 16, paddingTop: 16, flexDirection: 'row', gap: 12 },
  imcCell: { flex: 1, alignItems: 'center' },

  muted: { color: '#6A7282' },
});

export default styles;
