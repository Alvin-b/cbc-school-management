import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Users, DollarSign, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import type { AppCtx } from '../lib/context';
import { PageHeader, btnPrimary, btnGhost, inputCls, labelCls, ErrorNote } from '../components/ui';

interface FeeConfig {
  id: string;
  gradeLevel: string;
  feeAmount: number;
  boardingFee: number;
  dayFee: number;
  admissionFee: number;
}

const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];

export default function Settings({ ctx }: { ctx: AppCtx }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [fees, setFees] = useState<FeeConfig[]>([]);
  const [streams, setStreams] = useState<string[]>(ctx.session.streams || []);
  const [schoolType, setSchoolType] = useState<'boarding' | 'day' | 'both'>('both');

  useEffect(() => {
    loadFees();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get<any>('/api/settings');
      if (res.schoolType) setSchoolType(res.schoolType);
      if (res.streams) setStreams(res.streams);
    } catch (err) {
      // ignore
    }
  };

  const saveSettings = async () => {
    try {
      await api.post('/api/settings', { schoolType, streams });
      ctx.toast('Settings saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const loadFees = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/api/fees/config');
      const config = res.config || res.fees;
      if (config) {
        if (Array.isArray(config)) {
          setFees(config);
        } else {
          const feeList = GRADES.map(g => ({
            id: g,
            gradeLevel: g,
            feeAmount: config[g]?.feeAmount || 0,
            boardingFee: config[g]?.boardingFee || 0,
            dayFee: config[g]?.dayFee || 0,
            admissionFee: config[g]?.admissionFee || 0
          }));
          setFees(feeList);
        }
      } else {
        setFees(GRADES.map(g => ({
          id: g,
          gradeLevel: g,
          feeAmount: 0,
          boardingFee: 0,
          dayFee: 0,
          admissionFee: 0
        })));
      }
    } catch (err) {
      setFees(GRADES.map(g => ({
        id: g,
        gradeLevel: g,
        feeAmount: 0,
        boardingFee: 0,
        dayFee: 0,
        admissionFee: 0
      })));
    } finally {
      setLoading(false);
    }
  };

  const updateFee = (gradeLevel: string, field: keyof FeeConfig, value: number) => {
    setFees(prev => prev.map(f => 
      f.gradeLevel === gradeLevel ? { ...f, [field]: value } : f
    ));
  };

  const saveFees = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post('/api/fees/config', { configs: fees.map(f => ({
        gradeLevel: f.gradeLevel,
        feeAmount: f.feeAmount,
        boardingFee: f.boardingFee,
        dayFee: f.dayFee,
        admissionFee: f.admissionFee
      })) });
      await saveSettings();
      ctx.toast('Fee configuration saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fees');
    } finally {
      setSaving(false);
    }
  };

  const addStream = () => {
    const name = prompt('Enter stream name (e.g., Grade 1 Alpha)');
    if (name && !streams.includes(name)) {
      setStreams([...streams, name]);
    }
  };

  const removeStream = (stream: string) => {
    setStreams(streams.filter(s => s !== stream));
  };

  if (ctx.session.role !== 'admin') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <ErrorNote message="Only administrators can access settings" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Settings"
        sub="School configuration, streams and fee management"
        icon={<SettingsIcon className="w-5 h-5" />}
      />

      {error && <ErrorNote message={error} />}

      {/* School Type */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              School Type
            </h3>
          </div>
        </div>
        <div className="p-5">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={schoolType === 'both'} onChange={() => setSchoolType('both')} className="text-indigo-600" />
              <span className="text-sm text-slate-200">Both Boarding & Day Scholars</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={schoolType === 'boarding'} onChange={() => setSchoolType('boarding')} className="text-indigo-600" />
              <span className="text-sm text-slate-200">Boarding Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={schoolType === 'day'} onChange={() => setSchoolType('day')} className="text-indigo-600" />
              <span className="text-sm text-slate-200">Day Scholars Only</span>
            </label>
          </div>
          <p className="text-xs text-slate-500 mt-2">Choose whether your school supports boarding, day scholars, or both before setting fees.</p>
        </div>
      </div>

      {/* Streams Management */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Class Streams
            </h3>
          </div>
          <button className={btnPrimary} onClick={addStream}>
            <Plus className="w-4 h-4" /> Add Stream
          </button>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {streams.map(stream => (
              <div key={stream} className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                <span className="text-sm text-slate-200">{stream}</span>
                <button onClick={() => removeStream(stream)} className="text-rose-400 hover:text-rose-300">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {streams.length === 0 && (
              <p className="text-sm text-slate-500">No streams configured. Add streams for each class.</p>
            )}
          </div>
        </div>
      </div>

      {/* Fee Configuration */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              School Fees Configuration
            </h3>
          </div>
          <button className={btnPrimary} onClick={saveFees} disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Fees'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="p-4">Grade Level</th>
                {(schoolType === 'day' || schoolType === 'both') && <th className="p-4">Day Scholar Fee (KES)</th>}
                {(schoolType === 'boarding' || schoolType === 'both') && <th className="p-4">Boarding Fee (KES)</th>}
                <th className="p-4">Total Fee (KES)</th>
                <th className="p-4">Admission Fee (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {fees.map(fee => (
                <tr key={fee.gradeLevel} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-semibold text-slate-200">{fee.gradeLevel}</td>
                  {(schoolType === 'day' || schoolType === 'both') && (
                    <td className="p-4">
                      <input
                        type="number"
                        className={inputCls}
                        value={fee.dayFee}
                        onChange={(e) => updateFee(fee.gradeLevel, 'dayFee', Number(e.target.value))}
                      />
                    </td>
                  )}
                  {(schoolType === 'boarding' || schoolType === 'both') && (
                    <td className="p-4">
                      <input
                        type="number"
                        className={inputCls}
                        value={fee.boardingFee}
                        onChange={(e) => updateFee(fee.gradeLevel, 'boardingFee', Number(e.target.value))}
                      />
                    </td>
                  )}
                  <td className="p-4">
                    <input
                      type="number"
                      className={inputCls}
                      value={fee.feeAmount}
                      onChange={(e) => updateFee(fee.gradeLevel, 'feeAmount', Number(e.target.value))}
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      className={inputCls}
                      value={fee.admissionFee}
                      onChange={(e) => updateFee(fee.gradeLevel, 'admissionFee', Number(e.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 text-xs text-slate-500">
          Set different fees for day scholars and boarding students. The system will use these when generating fee records.
        </div>
      </div>
    </div>
  );
}
