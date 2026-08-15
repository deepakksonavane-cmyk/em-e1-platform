export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type ScheduleStackParamList = {
  SessionList: undefined;
  SessionDetail: { sessionId: string };
};

export type AssignmentsStackParamList = {
  AssignmentList: undefined;
  AssignmentDetail: { assessmentId: string };
  Submit: { assessmentId: string };
  Grades: undefined;
};

export type WeekendsStackParamList = {
  WeekendList: undefined;
  WeekendDetail: { weekendId: string };
};

export type MessagesStackParamList = {
  ConversationList: undefined;
  Thread: { facultyId: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  AttendanceHistory: undefined;
  EditProfile: undefined;
};

export type InternshipStackParamList = {
  InternshipHome: undefined;
  AddLogEntry: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Schedule: undefined;
  Assignments: undefined;
  Internship: undefined;
  Weekends: undefined;
  Messages: undefined;
  Profile: undefined;
};
