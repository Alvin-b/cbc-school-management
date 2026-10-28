import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  TrendingUp,
  Award,
  Calendar,
  DollarSign,
  Send,
  Download,
  Printer,
  ChevronRight,
  Sparkles,
  Building,
  Check,
  MessageSquare,
  PieChart as PieChartIcon,
  BarChart2,
  CalendarCheck,
  CreditCard,
  UserPlus,
  Eye,
  Shuffle,
  ArrowUpRight,
  LayoutDashboard,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

// --- CURRICULUM DEFINITIONS ---
const PRIMARY_SUBJECTS = [
  { id: 'math_p', name: 'Mathematics', code: 'MAT001', level: 'Primary' },
  { id: 'eng_p', name: 'English Language', code: 'ENG002', level: 'Primary' },
  { id: 'kis_p', name: 'Kiswahili / KSL', code: 'KIS003', level: 'Primary' },
  { id: 'env_p', name: 'Environmental Activities', code: 'ENV004', level: 'Primary' },
  { id: 'rel_p', name: 'Religious Education', code: 'CRE005', level: 'Primary' },
  { id: 'crt_p', name: 'Creative Arts & Movement', code: 'CAM006', level: 'Primary' }
];

const JSS_SUBJECTS = [
  { id: 'eng', name: 'English Language', code: 'ENG101', level: 'JSS' },
  { id: 'kis', name: 'Kiswahili', code: 'KIS102', level: 'JSS' },
  { id: 'math', name: 'Mathematics', code: 'MAT103', level: 'JSS' },
  { id: 'isci', name: 'Integrated Science', code: 'SCI104', level: 'JSS' },
  { id: 'sost', name: 'Social Studies', code: 'SST105', level: 'JSS' },
  { id: 'agri', name: 'Agriculture & Nutrition', code: 'AGN106', level: 'JSS' },
  { id: 'ptech', name: 'Pre-Technical Studies', code: 'PTS107', level: 'JSS' },
  { id: 'arts', name: 'Creative Arts & Sports', code: 'CAS108', level: 'JSS' },
  { id: 'reled', name: 'Religious Education (CRE)', code: 'CRE109', level: 'JSS' }
];

const GRADE_MILESTONES = {
  'Grade 1': { stage: 'Lower Primary', assessment: 'Formative Qualitative Assessment', focus: 'Foundational Literacy, Numeracy & Social Skills' },
  'Grade 2': { stage: 'Lower Primary', assessment: 'Internal School-Based Assessment', focus: 'Consolidation of Basic Literacy & Numeracy' },
  'Grade 3': { stage: 'Lower Primary', assessment: 'KEYA Early Years Progress Monitoring', focus: 'Early Years Foundation & Environment Literacy' },
  'Grade 4': { stage: 'Upper Primary', assessment: 'SBA Portfolio & Project Rubrics', focus: 'Introduction to Agriculture, Science & Digital Literacy' },
  'Grade 5': { stage: 'Upper Primary', assessment: 'Continuous Assessment Tests (CATs)', focus: 'Problem Solving, Crafts & Practical Projects' },
  'Grade 6': { stage: 'Upper Primary', assessment: 'KPSEA National & School Evaluation', focus: 'Primary Level Summary & Practical Inquiry' },
  'Grade 7': { stage: 'Junior Secondary', assessment: 'JSS School-Based Assessment', focus: 'Pre-Technical Studies & Integrated Sciences' },
  'Grade 8': { stage: 'Junior Secondary', assessment: 'JSS Formative Continuous Assessment', focus: 'Career Exploration, STEM & Creative Arts' },
  'Grade 9': { stage: 'Junior Secondary', assessment: 'KJSEA Comprehensive Assessment', focus: 'Senior High Pathway Selection & Career Profiling' }
};

// --- DATA GENERATOR (50 unique students per grade) ---
const generateSampleStudents = () => {
  const firstNames = ['Amina', 'Brian', 'Chloe', 'David', 'Emmanuel', 'Faith', 'Gideon', 'Hassan', 'Irene', 'Joseph', 'Kevin', 'Lucy', 'Mercy', 'Nathan', 'Olivia', 'Peter', 'Queenie', 'Rashid', 'Sarah', 'Thomas', 'Valarie', 'William', 'Zipporah', 'Baraka', 'Cynthia'];
  const middleNames = ['Wanjiku', 'Kipruto', 'Mwende', 'Ochieng', 'Achieng', 'Kipkorir', 'Njeri', 'Omondi', 'Chebet', 'Kamau', 'Mutua', 'Atieno', 'Kigen', 'Nyambura', 'Odhiambo'];
  const lastNames = ['Mohamed', 'Bett', 'Muthoni', 'Otieno', 'Kariuki', 'Oduor', 'Ndirangu', 'Koech', 'Simiyu', 'Musyoka', 'Maina', 'Chepkorir', 'Juma', 'Wekesa', 'Ndwiga'];

  const gradeConfigs = [
    { name: 'Grade 1 Alpha', level: 'Grade 1', prefix: 1000 },
    { name: 'Grade 2 Beta', level: 'Grade 2', prefix: 2000 },
    { name: 'Grade 3 Gamma', level: 'Grade 3', prefix: 3000 },
    { name: 'Grade 4 Delta', level: 'Grade 4', prefix: 4000 },
    { name: 'Grade 5 Epsilon', level: 'Grade 5', prefix: 5000 },
    { name: 'Grade 6 Zeta', level: 'Grade 6', prefix: 6000 },
    { name: 'Grade 7 Eta', level: 'Grade 7', prefix: 7000 },
    { name: 'Grade 8 Theta', level: 'Grade 8', prefix: 8000 },
    { name: 'Grade 9 Iota', level: 'Grade 9', prefix: 9000 }
  ];

  const students = [];
  let globalIndex = 1;

  gradeConfigs.forEach((stream) => {
    for (let i = 1; i <= 50; i++) {
      const fName = firstNames[(i - 1) % firstNames.length];
      const mName = middleNames[(i + globalIndex) % middleNames.length];
      const lName = lastNames[(i * 3 + globalIndex) % lastNames.length];
      const gender = (i % 2 === 0) ? 'Female' : 'Male';
      const admNo = `${stream.prefix + i}`;
      const idStr = `STU${String(globalIndex).padStart(4, '0')}`;
      
      const isPrimary = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].includes(stream.level);
      const activeSubjects = isPrimary ? PRIMARY_SUBJECTS : JSS_SUBJECTS;

      const marks = {};
      activeSubjects.forEach(s => {
        const val = 48 + ((i * 17 + globalIndex * 11) % 51);
        let sbaRubric = 'ME';
        let points = 3;
        
        if (val >= 80) { sbaRubric = 'EE'; points = 4; }
        else if (val >= 60) { sbaRubric = 'ME'; points = 3; }
        else if (val >= 40) { sbaRubric = 'AE'; points = 2; }
        else { sbaRubric = 'BE'; points = 1; }

        marks[s.id] = { internal: val, sbaRubric, points };
      });

      const totalFee = isPrimary ? 32000 : 45000;
      const feePaid = 15000 + ((i * 700) % 25000);
      const feeBalance = Math.max(0, totalFee - feePaid);

      students.push({
        id: idStr,
        name: `${fName} ${mName} ${lName}`,
        gender,
        stream: stream.name,
        gradeLevel: stream.level,
        admissionNo: admNo,
        nemisUpi: `NEM-${stream.prefix + 1000 + i}`,
        knecNo: `KNC-2026-${String(globalIndex).padStart(4, '0')}`,
        guardianPhone: `+2547${String(10000000 + globalIndex * 13579).slice(0, 8)}`,
        feeBalance,
        feePaid,
        totalFee,
        attendancePct: 88 + (i % 12),
        marks
      });

      globalIndex++;
    }
  });

  return students;
};

const INITIAL_STUDENTS = generateSampleStudents();
const DAYS_OF_TERM = ['Mon 01', 'Tue 02', 'Wed 03', 'Thu 04', 'Fri 05', 'Mon 08', 'Tue 09', 'Wed 10', 'Thu 11', 'Fri 12'];

export default function App() {
  const [role, setRole] = useState('teacher');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [selectedStream, setSelectedStream] = useState('Grade 7 Eta');
  const [selectedStudentId, setSelectedStudentId] = useState('STU0301');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    gender: 'Male',
    stream: 'Grade 7 Eta',
    gradeLevel: 'Grade 7',
    admissionNo: '',
    nemisUpi: '',
    knecNo: '',
    guardianPhone: '',
    totalFee: 45000
  });

  const [selectedSubjectId, setSelectedSubjectId] = useState('eng');
  const [editingMarks, setEditingMarks] = useState({});
  const [assessmentType, setAssessmentType] = useState('internal');
  
  const [attendanceDate, setAttendanceDate] = useState('Mon 01');
  const [attendanceRecords, setAttendanceRecords] = useState({});

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');

  const [smsRecipient, setSmsRecipient] = useState('STU0301');
  const [smsCustomMsg, setSmsCustomMsg] = useState('Dear Parent, continuous assessment results are now published on ElimuTrack.');
  const [smsLog, setSmsLog] = useState([]);

  const [sampledStudents, setSampledStudents] = useState([]);
  const [observationNotes, setObservationNotes] = useState({});
  const [observationDate, setObservationDate] = useState(new Date().toISOString().split('T')[0]);
  const [observationHistory, setObservationHistory] = useState([
    {
      id: 'OBS-001',
      studentId: 'STU0301',
      studentName: 'Amina Wanjiku Mohamed',
      stream: 'Grade 7 Eta',
      date: '2026-10-20',
      observation: 'Exhibited exceptional critical reasoning during Integrated Science laboratory work.'
    }
  ]);

  const filteredStudents = useMemo(() => {
    let result = students;
    if (selectedStream !== 'All Streams') {
      result = result.filter(s => s.stream === selectedStream);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.nemisUpi.toLowerCase().includes(q) ||
        s.knecNo.toLowerCase().includes(q)
      );
    }
    return result;
  }, [students, selectedStream, searchQuery]);

  const activeStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const activeGradeLevel = useMemo(() => {
    return activeStudent?.gradeLevel || 'Grade 7';
  }, [activeStudent]);

  const availableSubjects = useMemo(() => {
    const isPrimary = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].includes(activeGradeLevel);
    return isPrimary ? PRIMARY_SUBJECTS : JSS_SUBJECTS;
  }, [activeGradeLevel]);

  const currentSubject = useMemo(() => {
    return availableSubjects.find(s => s.id === selectedSubjectId) || availableSubjects[0];
  }, [selectedSubjectId, availableSubjects]);

  const handleGenerateSample = () => {
    const candidates = filteredStudents.length > 0 ? filteredStudents : students;
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    const selectedSample = shuffled.slice(0, Math.min(5, shuffled.length));
    setSampledStudents(selectedSample);
    const initialNotes = {};
    selectedSample.forEach(s => { initialNotes[s.id] = ''; });
    setObservationNotes(initialNotes);
  };

  const handleSaveObservations = () => {
    const newLogs = [];
    sampledStudents.forEach(stu => {
      const note = observationNotes[stu.id]?.trim();
      if (note) {
        newLogs.push({
          id: `OBS-${Date.now()}-${stu.id}`,
          studentId: stu.id,
          studentName: stu.name,
          stream: stu.stream,
          date: observationDate,
          observation: note
        });
      }
    });

    if (newLogs.length === 0) return;
    setObservationHistory(prev => [...newLogs, ...prev]);
    setSampledStudents([]);
    setObservationNotes({});
  };

  const handleSaveMarks = () => {
    setStudents(prev => prev.map(stu => {
      if (editingMarks[stu.id] !== undefined) {
        const val = Number(editingMarks[stu.id]);
        let rub = 'ME';
        let pts = 3;

        if (val >= 80) { rub = 'EE'; pts = 4; }
        else if (val >= 60) { rub = 'ME'; pts = 3; }
        else if (val >= 40) { rub = 'AE'; pts = 2; }
        else { rub = 'BE'; pts = 1; }

        return {
          ...stu,
          marks: {
            ...stu.marks,
            [selectedSubjectId]: { internal: val, sbaRubric: rub, points: pts }
          }
        };
      }
      return stu;
    }));
  };

  const toggleAttendance = (studentId) => {
    setAttendanceRecords(prev => {
      const currentDay = prev[attendanceDate] || {};
      const currentVal = currentDay[studentId] !== false;
      return {
        ...prev,
        [attendanceDate]: {
          ...currentDay,
          [studentId]: !currentVal
        }
      };
    });
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) return;

    const amt = Number(paymentAmount);
    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudentId) {
        const updatedPaid = s.feePaid + amt;
        const updatedBal = Math.max(0, s.totalFee - updatedPaid);
        return { ...s, feePaid: updatedPaid, feeBalance: updatedBal };
      }
      return s;
    }));

    setPaymentAmount('');
  };

  const handleSendSMS = () => {
    const targetStudent = students.find(s => s.id === smsRecipient);
    if (!targetStudent) return;

    const newLogEntry = {
      id: `SMS-${Date.now()}`,
      recipientName: targetStudent.name,
      phone: targetStudent.guardianPhone,
      message: smsCustomMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'DELIVERED'
    };

    setSmsLog(prev => [newLogEntry, ...prev]);
  };

  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.admissionNo) return;

    const newId = `STU${String(students.length + 1).padStart(4, '0')}`;
    const isPrimary = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].includes(newStudent.gradeLevel);
    const activeSubjs = isPrimary ? PRIMARY_SUBJECTS : JSS_SUBJECTS;

    const marks = {};
    activeSubjs.forEach(s => {
      marks[s.id] = { internal: 72, sbaRubric: 'ME', points: 3 };
    });

    const createdStudent = {
      ...newStudent,
      id: newId,
      feePaid: 0,
      feeBalance: newStudent.totalFee,
      attendancePct: 100,
      marks
    };

    setStudents([createdStudent, ...students]);
    setShowAddStudentModal(false);
    setNewStudent({
      name: '',
      gender: 'Male',
      stream: 'Grade 7 Eta',
      gradeLevel: 'Grade 7',
      admissionNo: '',
      nemisUpi: '',
      knecNo: '',
      guardianPhone: '',
      totalFee: 45000
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'marksbook', label: 'Marksbook', icon: ClipboardCheck },
    { id: 'observations', label: 'Observations', icon: Eye },
    { id: 'register', label: 'Attendance', icon: CalendarCheck },
    { id: 'broadsheet', label: 'Broadsheet', icon: FileSpreadsheet },
    { id: 'students', label: 'Learners', icon: Users },
    { id: 'reportcard', label: 'Report Cards', icon: Award },
    { id: 'pathways', label: 'Pathways', icon: GraduationCap },
    { id: 'fees', label: 'Fee Payments', icon: CreditCard },
    { id: 'sms', label: 'SMS Dispatcher', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* TOP HEADER */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between gap-6 shadow-sm">
        
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold tracking-tight text-white">ElimuTrack Enterprise</h1>
              <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                CBC ERP 2026
              </span>
            </div>
            <p className="text-xs text-slate-400">Integrated Competency & School Management Suite</p>
          </div>
        </div>

        {/* Global Search & Filters */}
        <div className="flex items-center gap-4 flex-1 max-w-xl justify-end">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search learner, Adm No, NEMIS UPI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 text-xs text-slate-100 pl-9 pr-3 py-2 rounded-xl focus:border-indigo-500/60 focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="bg-transparent font-semibold text-indigo-300 focus:outline-none cursor-pointer"
            >
              <option value="All Streams" className="bg-slate-900">All Streams (Grades 1-9)</option>
              {['Grade 1 Alpha', 'Grade 2 Beta', 'Grade 3 Gamma', 'Grade 4 Delta', 'Grade 5 Epsilon', 'Grade 6 Zeta', 'Grade 7 Eta', 'Grade 8 Theta', 'Grade 9 Iota'].map(st => (
                <option key={st} value={st} className="bg-slate-900">{st}</option>
              ))}
            </select>
          </div>

          <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex text-xs font-semibold">
            {['teacher', 'admin', 'parent'].map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  role === r 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

      </header>

      {/* MAIN APPLICATION CONTAINER */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto p-6 gap-6">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-3 sticky top-24 space-y-1.5 shadow-xl">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Navigation Menu
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* STATS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 space-y-3 shadow-xl">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Enrolled</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{students.length}</div>
                  <div className="text-[11px] text-indigo-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Grades 1 to 9 Active (450 Learners)
                  </div>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 space-y-3 shadow-xl">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Filtered Cohort</span>
                    <Building className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{filteredStudents.length}</div>
                  <div className="text-[11px] text-slate-400">
                    Active Stream: <span className="text-indigo-400 font-semibold">{selectedStream}</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 space-y-3 shadow-xl">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Term Attendance</span>
                    <CalendarCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">93.4%</div>
                  <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> 1.8% higher than last term
                  </div>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 space-y-3 shadow-xl">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Outstanding Fees</span>
                    <DollarSign className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-bold text-amber-400">
                    KES {(filteredStudents.reduce((acc, s) => acc + s.feeBalance, 0)).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    M-PESA Express Reconciliation
                  </div>
                </div>
              </div>

              {/* ANALYTICS CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800/80 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-indigo-400" /> Subject Mean Performance
                    </h3>
                    <span className="text-xs text-slate-400">{selectedStream}</span>
                  </div>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={availableSubjects.map(s => {
                        const total = filteredStudents.reduce((acc, st) => acc + (st.marks[s.id]?.internal || 70), 0);
                        const avg = Math.round(total / (filteredStudents.length || 1));
                        return { name: s.code, score: avg };
                      })}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                        />
                        <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800/80 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4 text-indigo-400" /> Competency Rubric Distribution
                    </h3>
                    <span className="text-xs text-slate-400">Rubric Level Analysis</span>
                  </div>

                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        { subject: 'EE (Exceeding)', value: 42 },
                        { subject: 'ME (Meeting)', value: 45 },
                        { subject: 'AE (Approaching)', value: 10 },
                        { subject: 'BE (Below)', value: 3 }
                      ]}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                        <PolarRadiusAxis stroke="#475569" />
                        <Radar name="Learners" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB: MARKSBOOK */}
          {activeTab === 'marksbook' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 flex flex-wrap justify-between items-center gap-4 shadow-xl">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-2xl text-xs">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-400">Subject:</span>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="bg-transparent text-indigo-300 font-semibold focus:outline-none cursor-pointer"
                    >
                      {availableSubjects.map(s => (
                        <option key={s.id} value={s.id} className="bg-slate-900">{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-2xl text-xs">
                    <span className="text-slate-400">Type:</span>
                    <select
                      value={assessmentType}
                      onChange={(e) => setAssessmentType(e.target.value)}
                      className="bg-transparent text-indigo-300 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="internal" className="bg-slate-900">Internal School Examination</option>
                      <option value="knec" className="bg-slate-900">National KNEC Assessment</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveMarks}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
                >
                  <Check className="w-4 h-4" /> Save Continuous Scores
                </button>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800/80 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Marks Entry: {currentSubject?.name} — {selectedStream}
                    </h3>
                  </div>
                  <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20">
                    {filteredStudents.length} Learners
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800/80">
                      <tr>
                        <th className="p-4">Adm No</th>
                        <th className="p-4">Learner Name</th>
                        <th className="p-4">Grade Level</th>
                        <th className="p-4 w-36">Score (0-100)</th>
                        <th className="p-4">Rubric Band</th>
                        <th className="p-4">Level Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredStudents.map(student => {
                        const currentVal = editingMarks[student.id] !== undefined 
                          ? editingMarks[student.id] 
                          : (student.marks[selectedSubjectId]?.internal || 70);

                        let rub = 'ME';
                        let pts = 3;

                        if (currentVal >= 80) { rub = 'EE'; pts = 4; }
                        else if (currentVal >= 60) { rub = 'ME'; pts = 3; }
                        else if (currentVal >= 40) { rub = 'AE'; pts = 2; }
                        else { rub = 'BE'; pts = 1; }

                        return (
                          <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 font-mono font-medium text-slate-400">{student.admissionNo}</td>
                            <td className="p-4 font-semibold text-slate-100">{student.name}</td>
                            <td className="p-4 text-indigo-400 font-medium">{student.gradeLevel}</td>
                            <td className="p-4">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={currentVal}
                                onChange={(e) => setEditingMarks({ ...editingMarks, [student.id]: e.target.value })}
                                className="w-24 bg-slate-950 border border-slate-800 text-indigo-300 font-semibold px-3 py-1.5 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-4">
                              <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-semibold text-[11px]">
                                {rub}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-slate-300">{pts} / 4</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: OBSERVATIONS */}
          {activeTab === 'observations' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800/80 flex flex-wrap justify-between items-center gap-4 shadow-xl">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-400" /> Qualitative Observation Sampler
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Stream: <span className="text-indigo-400 font-semibold">{selectedStream}</span></p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={observationDate}
                    onChange={(e) => setObservationDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-indigo-300 px-3.5 py-2 rounded-2xl text-xs font-semibold focus:outline-none cursor-pointer"
                  />
                  <button
                    onClick={handleGenerateSample}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
                  >
                    <Shuffle className="w-4 h-4" /> Pick 5 Random Learners
                  </button>
                </div>
              </div>

              {sampledStudents.length > 0 && (
                <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-indigo-500/30 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Sampled Observation Queue ({sampledStudents.length})
                    </h3>
                    <button
                      onClick={handleSaveObservations}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
                    >
                      <Check className="w-4 h-4" /> Save All Observations
                    </button>
                  </div>

                  <div className="space-y-3">
                    {sampledStudents.map((student) => (
                      <div key={student.id} className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-100">{student.name} (Adm: {student.admissionNo})</span>
                          <span className="text-[10px] bg-slate-800 text-indigo-300 font-semibold px-2.5 py-1 rounded-lg">
                            {student.stream}
                          </span>
                        </div>
                        <textarea
                          rows="2"
                          placeholder={`Record formative behavior or competency observations for ${student.name}...`}
                          value={observationNotes[student.id] || ''}
                          onChange={(e) => setObservationNotes({ ...observationNotes, [student.id]: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl p-3 text-xs focus:border-indigo-500 focus:outline-none"
                        ></textarea>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800/80 p-6 space-y-4 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Recorded Observations History Log</h3>
                <div className="divide-y divide-slate-800/60">
                  {observationHistory.map((log) => (
                    <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 text-xs">
                          <span className="font-semibold text-slate-100">{log.studentName}</span>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{log.stream}</span>
                        </div>
                        <p className="text-xs text-slate-300 italic">"{log.observation}"</p>
                      </div>
                      <span className="text-xs font-mono text-indigo-400 shrink-0 bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20">{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: ATTENDANCE */}
          {activeTab === 'register' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-indigo-400" /> Daily Attendance Register
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Stream: <span className="text-indigo-400 font-semibold">{selectedStream}</span></p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-indigo-300 px-4 py-2 rounded-2xl text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {DAYS_OF_TERM.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800/80 overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800/80">
                    <tr>
                      <th className="p-4">Learner Name</th>
                      <th className="p-4">Adm No</th>
                      {DAYS_OF_TERM.map(day => (
                        <th key={day} className="p-4 text-center">{day}</th>
                      ))}
                      <th className="p-4 text-right">Term Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.map(student => {
                      const dayLog = attendanceRecords[attendanceDate] || {};
                      const isPresentToday = dayLog[student.id] !== false;

                      return (
                        <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-semibold text-slate-100">{student.name}</td>
                          <td className="p-4 font-mono text-slate-400">{student.admissionNo}</td>
                          {DAYS_OF_TERM.map(day => {
                            const dayRecord = attendanceRecords[day] || {};
                            const present = dayRecord[student.id] !== false;
                            const isSelectedDay = day === attendanceDate;

                            return (
                              <td key={day} className="p-4 text-center">
                                {isSelectedDay ? (
                                  <button
                                    onClick={() => toggleAttendance(student.id)}
                                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs mx-auto transition-transform active:scale-95 ${
                                      isPresentToday
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                                    }`}
                                  >
                                    {isPresentToday ? '✓' : '✗'}
                                  </button>
                                ) : (
                                  <span className={`font-semibold ${present ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {present ? '✓' : '✗'}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td className="p-4 text-right font-bold text-indigo-400">{student.attendancePct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: BROADSHEET */}
          {activeTab === 'broadsheet' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 flex flex-wrap justify-between items-center gap-4 shadow-xl">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Continuous Assessment Broadsheet Matrix</h3>
                  <p className="text-xs text-slate-400 mt-1">Stream: <span className="text-indigo-400 font-semibold">{selectedStream}</span></p>
                </div>
                <button
                  onClick={() => alert('Exporting Broadsheet CSV for KNEC Portal...')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/25"
                >
                  <Download className="w-4 h-4" /> Export KNEC CSV
                </button>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800/80 overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800/80">
                    <tr>
                      <th className="p-4">Rank</th>
                      <th className="p-4">Learner Name</th>
                      <th className="p-4">Adm No</th>
                      {availableSubjects.map(subj => (
                        <th key={subj.id} className="p-4 text-center">{subj.code}</th>
                      ))}
                      <th className="p-4 text-center">Mean Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.map((student, idx) => {
                      const totalInternal = availableSubjects.reduce((acc, subj) => {
                        return acc + (student.marks[subj.id]?.internal || 70);
                      }, 0);
                      const meanScore = Math.round(totalInternal / (availableSubjects.length || 1));

                      return (
                        <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-semibold text-slate-400">#{idx + 1}</td>
                          <td className="p-4 font-semibold text-slate-100">{student.name}</td>
                          <td className="p-4 text-slate-400 font-mono">{student.admissionNo}</td>
                          {availableSubjects.map(subj => {
                            const markObj = student.marks[subj.id] || { internal: 70, sbaRubric: 'ME' };
                            return (
                              <td key={subj.id} className="p-4 text-center font-semibold text-slate-200">
                                {markObj.internal}
                              </td>
                            );
                          })}
                          <td className="p-4 text-center font-bold text-indigo-400 bg-slate-950/60">{meanScore}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: LEARNERS */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 shadow-xl">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Learner Directory ({filteredStudents.length} Profiles)
                  </h3>
                </div>
                {role === 'admin' && (
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/25"
                  >
                    <UserPlus className="w-4 h-4" /> Enrol New Learner
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredStudents.map(stu => (
                  <div key={stu.id} className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 space-y-4 hover:border-indigo-500/50 transition-all shadow-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20">
                          {stu.stream}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-100 mt-2.5">{stu.name}</h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">Adm: {stu.admissionNo}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedStudentId(stu.id);
                          setActiveTab('reportcard');
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 shrink-0 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800"
                      >
                        Profile <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">NEMIS UPI</span>
                        <span className="font-mono text-slate-200">{stu.nemisUpi}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Fee Balance</span>
                        <span className={`font-semibold ${stu.feeBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          KES {stu.feeBalance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: REPORT CARDS */}
          {activeTab === 'reportcard' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800/80 flex flex-wrap justify-between items-center gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-400 font-semibold">Select Profile:</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-indigo-300 font-semibold px-4 py-2 rounded-2xl text-xs focus:outline-none max-w-xs cursor-pointer"
                  >
                    {filteredStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.stream})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/25"
                >
                  <Printer className="w-4 h-4" /> Print Official Report Card
                </button>
              </div>

              <div id="printable-report" className="bg-slate-900/95 p-8 rounded-3xl border border-slate-800 text-slate-100 max-w-4xl mx-auto space-y-6 shadow-2xl">
                <div className="border-b border-slate-800 pb-6 text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xl rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
                    ET
                  </div>
                  <h1 className="text-lg font-bold text-white uppercase tracking-wider">ElimuTrack Academy Primary & Junior Secondary</h1>
                  <p className="text-xs text-slate-400">OFFICIAL COMPETENCY EVALUATION REPORT CARD — {activeStudent.gradeLevel}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Learner Name</span>
                    <span className="font-semibold text-white">{activeStudent.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Stream</span>
                    <span className="font-semibold text-indigo-400">{activeStudent.stream}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">NEMIS UPI</span>
                    <span className="font-mono text-slate-300">{activeStudent.nemisUpi}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">KNEC Assessment No</span>
                    <span className="font-mono text-slate-300">{activeStudent.knecNo}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Continuous Competency & Subject Performance</h3>
                  <table className="w-full text-left text-xs border border-slate-800 rounded-2xl overflow-hidden">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="p-3">Learning Area</th>
                        <th className="p-3 text-center">Score (100)</th>
                        <th className="p-3 text-center">Rubric Band</th>
                        <th className="p-3 text-center">Points Awarded</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {availableSubjects.map(subj => {
                        const mark = activeStudent.marks[subj.id] || { internal: 70, sbaRubric: 'ME', points: 3 };
                        return (
                          <tr key={subj.id} className="hover:bg-slate-800/30">
                            <td className="p-3 font-semibold text-slate-200">{subj.name}</td>
                            <td className="p-3 text-center font-semibold text-indigo-400">{mark.internal}%</td>
                            <td className="p-3 text-center">
                              <span className="bg-indigo-500/10 text-indigo-300 font-semibold px-2.5 py-1 rounded-lg text-[11px] border border-indigo-500/20">
                                {mark.sbaRubric}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono font-semibold text-slate-300">{mark.points} / 4</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 block">Class Teacher Remarks:</span>
                    <span className="text-slate-200 italic font-medium">"Demonstrates great mastery of core competencies and actively leads group projects."</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Principal Signature:</span>
                    <span className="text-indigo-400 font-semibold">APPROVED & SEALED</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: PATHWAYS */}
          {activeTab === 'pathways' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800/80 space-y-4 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-400" /> Grade 9 Senior High Pathway Recommendation Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Calculates learner aptitude for Senior Secondary Pathways based on Continuous Assessment scores in Junior Secondary.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-500/30 space-y-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">STEM Pathway</span>
                    <p className="text-2xl font-bold text-white">88.4% Match</p>
                    <p className="text-[11px] text-slate-400">Recommended based on strong performance in Mathematics, Integrated Science, and Agriculture.</p>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Social Sciences</span>
                    <p className="text-2xl font-bold text-slate-300">76.2% Match</p>
                    <p className="text-[11px] text-slate-400">Solid aptitude in Social Studies, Languages, and Religious Education.</p>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Arts & Sports Science</span>
                    <p className="text-2xl font-bold text-slate-300">69.8% Match</p>
                    <p className="text-[11px] text-slate-400">Good creativity in Creative Arts and Sports activities.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FEES */}
          {activeTab === 'fees' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800/80 space-y-5 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">M-PESA Fee Payment Portal</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Post instantaneous fee collections to learner ledgers.</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                    Selected Balance: KES {activeStudent.feeBalance.toLocaleString()}
                  </span>
                </div>

                <form onSubmit={handleProcessPayment} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Learner Profile</label>
                    <input
                      type="text"
                      disabled
                      value={`${activeStudent.name} (${activeStudent.admissionNo})`}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-2.5 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Payment Amount (KES)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/25"
                    >
                      Post M-PESA Receipt
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: SMS */}
          {activeTab === 'sms' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800/80 space-y-5 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" /> Africa's Talking Guardian SMS Dispatcher
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Target Learner Guardian</label>
                    <select
                      value={smsRecipient}
                      onChange={(e) => setSmsRecipient(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-indigo-300 p-2.5 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} — Phone: {s.guardianPhone}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">SMS Notification Text</label>
                    <textarea
                      rows="3"
                      value={smsCustomMsg}
                      onChange={(e) => setSmsCustomMsg(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-3 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    onClick={handleSendSMS}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
                  >
                    <Send className="w-4 h-4" /> Dispatch Broadcast SMS
                  </button>
                </div>

                {smsLog.length > 0 && (
                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Dispatched SMS Outbox Log</h4>
                    <div className="space-y-2">
                      {smsLog.map(log => (
                        <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-white">{log.recipientName} ({log.phone})</span>
                            <p className="text-slate-400 text-[11px] mt-0.5">{log.message}</p>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            {log.status} ({log.timestamp})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ENROL NEW LEARNER MODAL */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Enrol New CBC Learner</h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Full Official Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Mutua Kamau"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Admission No</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7051"
                    value={newStudent.admissionNo}
                    onChange={(e) => setNewStudent({ ...newStudent, admissionNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Target Stream</label>
                  <select
                    value={newStudent.stream}
                    onChange={(e) => {
                      const st = e.target.value;
                      const lvl = st.split(' ')[0] + ' ' + st.split(' ')[1];
                      setNewStudent({ ...newStudent, stream: st, gradeLevel: lvl });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-indigo-300 p-2.5 rounded-xl font-semibold focus:outline-none cursor-pointer"
                  >
                    {['Grade 1 Alpha', 'Grade 2 Beta', 'Grade 3 Gamma', 'Grade 4 Delta', 'Grade 5 Epsilon', 'Grade 6 Zeta', 'Grade 7 Eta', 'Grade 8 Theta', 'Grade 9 Iota'].map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">NEMIS UPI</label>
                  <input
                    type="text"
                    placeholder="e.g. NEM-8051"
                    value={newStudent.nemisUpi}
                    onChange={(e) => setNewStudent({ ...newStudent, nemisUpi: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Guardian Phone</label>
                  <input
                    type="text"
                    placeholder="+254712345678"
                    value={newStudent.guardianPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2 rounded-xl shadow-lg shadow-indigo-600/25"
                >
                  Complete Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}