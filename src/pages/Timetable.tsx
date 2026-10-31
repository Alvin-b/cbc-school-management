import { useCallback, useEffect, useState } from 'react';
import { Layout, Plus, Printer, Save, Edit } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { AppCtx } from '../lib/context';
import type { TimetableEntry } from '../lib/types';
import { btnPrimary, btnGhost, PageHeader, ErrorNote } from '../components/ui';
import { subjectsForStream } from '../lib/curriculum';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_LABELS: Record<string, string> = {
  'Monday': 'MON',
  'Tuesday': 'TUE',
  'Wednesday': 'WED',
  'Thursday': 'THU',
  'Friday': 'FRI'
};

export default function Timetable({ ctx }: { ctx: AppCtx }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const allGradeOptions = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
  const availableStreams = ctx.session.role === 'admin' 
    ? Array.from(new Set([...(ctx.session.streams || []), ...allGradeOptions]))
    : (ctx.session.streams && ctx.session.streams.length > 0 ? ctx.session.streams : allGradeOptions);
  const [selectedStream, setSelectedStream] = useState(
    availableStreams[0] || 'Grade 4'
  );
  const [schoolName, setSchoolName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<any>('/api/timetable');
      setEntries(res.entries || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const saveEntry = async (day: string, period: number, subjectId: string) => {
    try {
      // Remove existing entry for this slot
      const existing = entries.find(e => e.day === day && e.period === period && e.stream === selectedStream);
      if (existing) {
        await api.del('/api/timetable/entry', { id: existing.id });
      }
      if (subjectId) {
        await api.post('/api/timetable/entry', {
          day,
          period: Number(period),
          stream: selectedStream,
          subjectId,
          staffId: ctx.session.staff?.id || ctx.session.user?.sub || '',
          room: ''
        });
      }
      await load();
      if (subjectId) {
        ctx.toast('Timetable updated');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await load();
      ctx.toast('Timetable saved successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const getEntry = (day: string, period: number) => {
    return entries.find(e => e.day === day && e.period === period && e.stream === selectedStream);
  };

  const gradeNum = parseInt(selectedStream.match(/\d+/)?.[0] || '1');
  const isLowerPrimary = gradeNum >= 1 && gradeNum <= 3;
  const isUpperPrimary = gradeNum >= 4 && gradeNum <= 6;
  const isJSS = gradeNum >= 7 && gradeNum <= 9;
  const subjects = subjectsForStream(selectedStream);

  const handlePrint = () => {
    window.print();
  };

  // Upper Primary timetable structure
  if (isUpperPrimary || isJSS) {
    const periods = [
      { time: '8:20 AM / 8:55 AM', num: 1 },
      { time: '8:55 AM / 9:30 AM', num: 2 },
      { time: '9:30 AM / 9:50 AM', break: true, letter: 'B' },
      { time: '9:50 AM / 10:25 AM', num: 3 },
      { time: '10:25 AM / 11:00 AM', num: 4 },
      { time: '11:00 AM / 11:25 AM', break: true, letter: 'R' },
      { time: '11:25 AM / 12:00 PM', num: 5 },      { time: '12:00 PM / 12:35 PM', num: 6 },
      { time: '12:35 PM / 2:00 PM', lunch: true },
      { time: '2:00 PM / 2:35 PM', num: 7 },
      { time: '2:35 PM / 4:00 PM', num: 8 },
    ];

    const breakLetters = ['B', 'R', 'E', 'A', 'K'];
    const lunchLetters = ['L', 'U', 'N', 'C', 'H'];

    return (
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title="Timetable"
          sub={isUpperPrimary ? "CBE Upper Primary Timetable" : isJSS ? "CBE Junior Secondary School Timetable" : isLowerPrimary ? "CBE Lower Primary Timetable" : "CBE Timetable"}
          icon={<Layout className="w-5 h-5" />}
          actions={
            <div className="flex gap-2 flex-wrap">
              <select 
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={selectedStream}
                onChange={(e) => { setSelectedStream(e.target.value); setIsEditing(false); }}
              >
                {availableStreams.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {ctx.session.role === 'admin' && (
                <>
                  {!isEditing ? (
                    <button className={btnGhost} onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4" /> Edit Timetable
                    </button>
                  ) : (
                    <button className={btnPrimary} onClick={saveAll} disabled={saving}>
                      <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Timetable'}
                    </button>
                  )}
                </>
              )}
              <button className={btnGhost} onClick={handlePrint}>
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          }
        />

        {error && <ErrorNote message={error} />}

        <div className="bg-slate-100 rounded-lg overflow-hidden shadow-xl border-2 border-slate-400">
          {/* Header */}
          <div className="bg-teal-700 text-white py-2 px-4 text-center">
            <h2 className="text-lg font-bold">{isJSS ? 'CBC JUNIOR SECONDARY SCHOOL TIMETABLE' : 'CBC UPPER PRIMARY TIMETABLE'}</h2>
          </div>
          
          {/* School Info */}
          <div className="bg-slate-50 px-6 py-2 flex gap-6 border-b border-slate-400">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">SCHOOL:</span>
              <input 
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="flex-1 border-b border-slate-600 outline-none text-xs bg-transparent text-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">CLASS:</span>
              <span className="text-xs font-semibold text-slate-900">{selectedStream}</span>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">TEACHER:</span>
              <input 
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="flex-1 border-b border-slate-600 outline-none text-xs bg-transparent text-slate-900"
              />
            </div>
          </div>

          {/* Timetable Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-slate-700 p-1 w-12 bg-slate-300"></th>
                  {periods.map((p, i) => (
                    <th key={i} className={`border border-slate-700 p-1 text-[9px] text-slate-900 ${p.break || p.lunch ? 'bg-slate-300' : 'bg-blue-200'}`}>
                      <div className="font-semibold">{p.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, dayIdx) => (
                  <tr key={day}>
                    <td className="border border-slate-700 p-1 text-center font-bold bg-blue-200 text-slate-900 text-xs">{DAY_LABELS[day]}</td>
                    {periods.map((period, pIdx) => {
                    if (period.break) {
                      return (
                        <td key={pIdx} className="border border-slate-700 p-1 text-center bg-slate-300 font-bold text-lg text-slate-900">
                          {breakLetters[dayIdx]}
                        </td>
                      );
                    }
                    if (period.lunch) {
                      if (dayIdx === 0) {
                        return (
                          <td key={pIdx} className="border border-slate-700 p-1 text-center bg-slate-300 font-bold text-sm text-slate-900" rowSpan={5}>
                            <div className="transform -rotate-90 whitespace-nowrap tracking-widest">{lunchLetters.join(' ')}</div>
                          </td>
                        );
                      }
                      return null;
                    }
                    const entry = getEntry(day, period.num!);
                    const subjectName = entry?.subjectId ? 
                      (subjects.find(s => s.id === entry.subjectId)?.name || 
                       entry.subjectId === 'PPI' ? 'PPI' :
                       entry.subjectId === 'GAMES' ? 'GAMES & SPORTS' :
                       entry.subjectId === 'GUIDANCE' ? 'GUIDANCE & COUNSELLING' :
                       entry.subjectId === 'CAREERS' ? 'CAREERS' :
                       entry.subjectId === 'CLUBS' ? 'CLUBS & SOCIETIES' :
                       entry.subjectId === 'CREATIVE_ARTS' ? 'CREATIVE ARTS' : entry.subjectId) : '';
                    return (
                      <td key={pIdx} className="border border-slate-700 p-0 h-14 bg-cyan-50">
                        {isEditing && ctx.session.role === 'admin' ? (
                          <select
                            value={entry?.subjectId || ''}
                            onChange={(e) => saveEntry(day, period.num!, e.target.value)}
                            className="w-full h-full text-[9px] text-center border-0 bg-cyan-50 text-slate-900 cursor-pointer font-semibold"
                          >
                            <option value=""></option>
                            {subjects.map(s => (
                              <option key={s.id} value={s.id}>{s.name.substring(0, 16)}</option>
                            ))}
                            <option value="PPI">PPI</option>
                            <option value="GAMES">GAMES & SPORTS</option>
                            <option value="GUIDANCE">GUIDANCE & COUNSELLING</option>
                            <option value="CAREERS">CAREERS</option>
                            <option value="CLUBS">CLUBS & SOCIETIES</option>
                            <option value="CREATIVE_ARTS">CREATIVE ARTS</option>
                          </select>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-center text-slate-900 font-semibold px-1 leading-tight bg-cyan-50">
                            {subjectName}
                          </div>
                        )}
                      </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Lower Primary
  const lowerPeriods = [
    { time: '8.20 / 9.00', num: 1 },
    { time: '9.00 / 9.40', num: 2 },
    { time: '9.40 / 10.00', break: true, letter: 'B' },
    { time: '10.00 / 10.40', num: 3 },
    { time: '10.40 / 11.20', num: 4 },
    { time: '11.20 / 11.40', break: true, letter: 'B' },
    { time: '11.40 / 12.20', num: 5 },
    { time: '12.20 / 1.00', num: 6 },
  ];

  const lowerBreakLetters = ['B', 'R', 'E', 'A', 'K'];
  const lowerLunchLetters = ['L', 'U', 'N', 'C', 'H'];

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Timetable"
        sub="CBE Lower Primary Timetable"
        icon={<Layout className="w-5 h-5" />}
        actions={
          <div className="flex gap-2 flex-wrap">
            <select 
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
              value={selectedStream}
              onChange={(e) => { setSelectedStream(e.target.value); setIsEditing(false); }}
            >
              {availableStreams.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {ctx.session.role === 'admin' && (
              <>
                {!isEditing ? (
                  <button className={btnGhost} onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4" /> Edit Timetable
                  </button>
                ) : (
                  <button className={btnPrimary} onClick={saveAll} disabled={saving}>
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Timetable'}
                  </button>
                )}
              </>
            )}
            <button className={btnGhost} onClick={handlePrint}>
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        }
      />

      {error && <ErrorNote message={error} />}

      <div className="bg-slate-100 rounded-lg overflow-hidden shadow-xl border-2 border-slate-400">
        <div className="text-center py-2 bg-orange-200">
          <h2 className="text-lg font-bold text-orange-900">LOWER CLASS TIMETABLE</h2>
        </div>
        
        <div className="bg-slate-50 px-6 py-2 flex gap-4 border-b border-slate-400">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-900">SCHOOL:</span>
            <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="flex-1 border-b border-slate-600 outline-none text-xs bg-transparent text-slate-900" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-900">GRADE:</span>
            <span className="text-xs font-semibold text-slate-900">{selectedStream}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-900">TERM:</span>
            <input className="w-16 border-b border-slate-600 outline-none text-xs bg-transparent text-slate-900" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-900">YEAR:</span>
            <input className="w-16 border-b border-slate-600 outline-none text-xs bg-transparent text-slate-900" defaultValue="2026" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-700 p-1 w-16 bg-blue-200"></th>
                {lowerPeriods.map((p, i) => (
                  <th key={i} className={`border border-slate-700 p-1 text-[8px] text-slate-900 ${p.break || p.lunch ? 'bg-slate-300' : 'bg-blue-200'}`}>
                    <div className="font-semibold">{p.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, dayIdx) => (
                <tr key={day}>
                  <td className="border border-slate-700 p-1 text-center font-bold text-red-700 bg-blue-100 text-xs">{DAY_LABELS[day]}</td>
                  {lowerPeriods.map((period, pIdx) => {
                    if (period.break) {
                      if (dayIdx === 0) {
                        return <td key={pIdx} className="border border-slate-700 p-1 text-center bg-slate-300 font-bold text-slate-900" rowSpan={5}>{lowerBreakLetters.join(' ')}</td>;
                      }
                      return null;
                    }
                    if (period.lunch) {
                      if (dayIdx === 0) {
                        return <td key={pIdx} className="border border-slate-700 p-1 text-center bg-slate-300 font-bold text-slate-900" rowSpan={5}>{lowerLunchLetters.join(' ')}</td>;
                      }
                      return null;
                    }
                    const entry = getEntry(day, period.num!);
                    const lowerSubjectMap: any = {
                      'LITERACY': 'LITERACY ACTIVITIES',
                      'INDIGENOUS': 'INDIGENOUS LANGUAGE',
                      'ENGLISH': 'ENGLISH LANGUAGE',
                      'KISWAHILI': 'KISWAHILI LANGUAGE',
                      'MATH': 'MATHEMATICAL ACTIVITIES',
                      'ENVIRONMENTAL': 'ENVIRONMENTAL ACTIVITIES',
                      'CREATIVE': 'CREATIVE ACTIVITIES',
                      'RELIGIOUS': 'RELIGIOUS ACTIVITIES',
                      'PPI': 'PPI'
                    };
                    const lowerSubjectName = entry?.subjectId ? lowerSubjectMap[entry.subjectId] || entry.subjectId : '';
                    return (
                      <td key={pIdx} className="border border-slate-700 p-0 h-14 bg-yellow-50">
                        {isEditing && ctx.session.role === 'admin' ? (
                          <select
                            value={entry?.subjectId || ''}
                            onChange={(e) => saveEntry(day, period.num!, e.target.value)}
                            className="w-full h-full text-[8px] text-center border-0 bg-yellow-50 text-slate-900 cursor-pointer font-semibold"
                          >
                            <option value=""></option>
                            <option value="LITERACY">LITERACY ACTIVITIES</option>
                            <option value="INDIGENOUS">INDIGENOUS LANGUAGE</option>
                            <option value="ENGLISH">ENGLISH LANGUAGE</option>
                            <option value="KISWAHILI">KISWAHILI LANGUAGE</option>
                            <option value="MATH">MATHEMATICAL ACTIVITIES</option>
                            <option value="ENVIRONMENTAL">ENVIRONMENTAL ACTIVITIES</option>
                            <option value="CREATIVE">CREATIVE ACTIVITIES</option>
                            <option value="RELIGIOUS">RELIGIOUS ACTIVITIES</option>
                            <option value="PPI">PPI</option>
                          </select>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-center text-slate-900 font-semibold px-1 leading-tight bg-yellow-50">
                            {lowerSubjectName}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 text-xs">
          <span className="font-semibold">CLASS TEACHER: </span>___________________________
        </div>
      </div>
    </div>
  );
}
