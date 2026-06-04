import { MockAcademicSession, mockRooms } from './academicDemoData';

export interface ScheduleConflict {
  id: string;
  type: 'TEACHER_CONFLICT' | 'ROOM_CONFLICT' | 'CAPACITY_WARNING';
  severity: 'Chặn demo' | 'Cần xử lý' | 'Cảnh báo';
  title: string;
  description: string;
  involvedSessions: MockAcademicSession[];
  suggestedAction: string;
}

/**
 * Helper to convert HH:mm to minutes since midnight for easy comparison
 */
function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Checks if two sessions overlap in time on the same date.
 */
function isOverlapping(s1: MockAcademicSession, s2: MockAcademicSession): boolean {
  if (s1.date !== s2.date) return false;
  const start1 = timeToMinutes(s1.startTime);
  const end1 = timeToMinutes(s1.endTime);
  const start2 = timeToMinutes(s2.startTime);
  const end2 = timeToMinutes(s2.endTime);

  // Overlap condition: start1 < end2 && start2 < end1
  return start1 < end2 && start2 < end1;
}

/**
 * Deterministically detects all conflicts in the mock schedule array.
 * Uses a naive O(N^2) comparison since this is just demo data.
 */
export function detectScheduleConflicts(sessions: MockAcademicSession[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  let conflictCounter = 1;

  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      const s1 = sessions[i];
      const s2 = sessions[j];

      if (isOverlapping(s1, s2)) {
        // Teacher Conflict
        if (s1.teacherId === s2.teacherId) {
          conflicts.push({
            id: `conf-${conflictCounter++}`,
            type: 'TEACHER_CONFLICT',
            severity: 'Chặn demo',
            title: 'Trùng lịch giáo viên',
            description: `Giáo viên ${s1.teacherName} bị trùng lịch giữa 2 lớp ${s1.className} và ${s2.className} lúc ${s1.startTime} - ${Math.min(timeToMinutes(s1.endTime), timeToMinutes(s2.endTime))} phút.`,
            involvedSessions: [s1, s2],
            suggestedAction: 'Phân giáo viên khác demo'
          });
        }

        // Room Conflict
        if (s1.roomId === s2.roomId) {
          conflicts.push({
            id: `conf-${conflictCounter++}`,
            type: 'ROOM_CONFLICT',
            severity: 'Cần xử lý',
            title: 'Trùng phòng học',
            description: `${s1.roomName} bị xếp trùng cho ${s1.className} và ${s2.className}.`,
            involvedSessions: [s1, s2],
            suggestedAction: 'Đổi phòng demo'
          });
        }
      }
    }
  }

  // Capacity Warning
  sessions.forEach(s => {
    const room = mockRooms.find(r => r.id === s.roomId);
    if (room && s.studentCount > room.capacity) {
      conflicts.push({
        id: `conf-${conflictCounter++}`,
        type: 'CAPACITY_WARNING',
        severity: 'Cảnh báo',
        title: 'Quá tải phòng',
        description: `Lớp ${s.className} có ${s.studentCount} học viên nhưng ${room.name} chỉ chứa tối đa ${room.capacity} người.`,
        involvedSessions: [s],
        suggestedAction: 'Xem chi tiết'
      });
    }
  });

  return conflicts;
}
