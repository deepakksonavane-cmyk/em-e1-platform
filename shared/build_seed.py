import csv, json

MODULE_TO_SUBJECT = {
    "Module 1": "E1-S1", "Module 2": "E1-S2", "Module 3": "E1-S3",
    "Module 4": "E1-S4", "Module 5": "E1-S4",
    "Module 6": "E1-S5", "Module 7": "E1-S5",
    "Module 8": "E1-S6", "Module 9": "E1-S6", "Module 10": "E1-S6",
}
SUBJECTS = {
    "E1-S1": {"code":"E1-S1","name":"Foundations of Event Management & Leadership","lecturer":"Lecturer 1","sessions":8,"hours":16,"weeks":"2-3"},
    "E1-S2": {"code":"E1-S2","name":"Event Planning & Budgeting","lecturer":"Lecturer 2","sessions":6,"hours":12,"weeks":"3-4"},
    "E1-S3": {"code":"E1-S3","name":"Marketing & Branding for Events","lecturer":"Lecturer 3","sessions":6,"hours":12,"weeks":"5-6"},
    "E1-S4": {"code":"E1-S4","name":"Event Production, Operations & Logistics","lecturer":"Lecturer 4","sessions":14,"hours":28,"weeks":"6-9"},
    "E1-S5": {"code":"E1-S5","name":"Team Leadership & Digital Events","lecturer":"Lecturer 5","sessions":16,"hours":32,"weeks":"10-11,13-14"},
    "E1-S6": {"code":"E1-S6","name":"Business, Entrepreneurship & Career Development","lecturer":"Lecturer 6","sessions":24,"hours":48,"weeks":"15-20"},
}

sessions = []
with open("/home/claude/em_e1_platform/docs_extracted/weekly_sessions_topics.csv") as f:
    r = csv.reader(f)
    rows = list(r)
    for row in rows[1:]:
        if not row or not row[0]: continue
        # positional: 0 Session,1 Week,2 Day,3 Date(empty),4 DayAbbrev,5 Module,6 ModuleName,
        # 7 Topic,8 Hours,9 LearningObjectives(empty),10 KeyTopics,11 TeachingMethod,12 Assessment,13 Resources,14 Instructor
        snum = int(row[0].replace("Session","").strip())
        mod = row[5].strip()
        subj = MODULE_TO_SUBJECT.get(mod)
        sessions.append({
            "sessionNumber": snum,
            "code": f"S{snum:02d}",
            "week": int(row[1].replace("Week","").strip()),
            "day": row[2].strip(),
            "module": mod,
            "moduleName": row[6].strip(),
            "subjectCode": subj,
            "topic": row[7].strip(),
            "hours": int(row[8]) if row[8].strip() else 2,
            "keyTopics": [t.strip() for t in row[10].split(",") if t.strip()],
            "teachingMethod": row[11].strip(),
            "assessment": row[12].strip(),
            "resources": row[13].strip(),
        })

weekends = [
    {"code":"W1","name":"Weekend 1 (Start)","week":1,"focus":"Foundations & Team Building",
     "days":[{"day":"Friday","hours":8},{"day":"Saturday","hours":8},{"day":"Sunday","hours":5}],
     "totalHours":21,
     "activities":["Introduction & Ice-breaking","Event Concepts & Idea Generation","Team Building Activities","Site Visit","Client Pitching Role-play","Networking Dinner"]},
    {"code":"W2","name":"Weekend 2 (Mid)","week":12,"focus":"Mid-Point Review & Execution",
     "days":[{"day":"Friday","hours":8},{"day":"Saturday","hours":8},{"day":"Sunday","hours":5}],
     "totalHours":21,
     "activities":["Full-Scale Event Simulation","Crisis Management Drill","Live Mock Event Execution","Peer Review & Feedback","Group Discussion & Debrief"]},
    {"code":"W3","name":"Weekend 3 (End)","week":24,"focus":"Graduation & Finale",
     "days":[{"day":"Friday","hours":8},{"day":"Saturday","hours":8},{"day":"Sunday","hours":5}],
     "totalHours":21,
     "activities":["Capstone Presentations (Panel of Experts)","Live Mini-Event Execution","Final Feedback Session","Career Guidance","Graduation Ceremony"]},
]

assessments = {
    "weeklyAssignments": {"count":6, "hoursEach":3, "weightage":20, "description":"Practical tasks after online sessions"},
    "caseStudies": {"count":8, "hoursEach":4, "weightage":20, "description":"Analysis of real-world event case studies"},
    "internshipReport": {"weightage":20, "minHours":30, "description":"Real-world event experience and report"},
    "capstoneProject": {"weightage":25, "description":"Full event proposal and pitch deck presentation to panel"},
    "classParticipation": {"weightage":10, "description":"Active engagement in online sessions"},
    "finalEvaluation": {"weightage":5, "description":"Peer review and self-assessment"},
}

program = {
    "programName": "Event Management & Team Leadership E1",
    "programCode": "E1",
    "durationWeeks": 24,
    "durationMonths": 6,
    "totalHours": 420,
    "totalSessions": 74,
    "totalSubjects": 6,
    "totalLecturers": 6,
    "mode": "Blended Learning (Online + In-Person + Practical)",
    "level": "Diploma / Professional Certificate",
    "attendancePolicy": "Minimum 80% attendance required for online and in-person sessions",
    "gradingScale": [
        {"grade":"A","range":"90-100%"},{"grade":"B","range":"80-89%"},
        {"grade":"C","range":"70-79%"},{"grade":"D","range":"60-69%"},{"grade":"F","range":"<60%"}
    ],
    "keyDates": [
        {"event":"Course Start - Weekend 1 (In-Person)","week":1},
        {"event":"Online Sessions Begin","week":2},
        {"event":"Mid-Term Weekend 2 (In-Person)","week":12},
        {"event":"All Online Sessions Complete","week":20},
        {"event":"Internship Period","week":"21-23"},
        {"event":"Final Weekend 3 (In-Person - Graduation)","week":24},
    ],
}

out = {
    "program": program,
    "subjects": list(SUBJECTS.values()),
    "sessions": sessions,
    "weekends": weekends,
    "assessments": assessments,
}
with open("/home/claude/em_e1_platform/shared/seed-data.json","w") as f:
    json.dump(out, f, indent=2)
print("sessions:", len(sessions), "total hours:", sum(s["hours"] for s in sessions))
