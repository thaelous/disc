import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Campaign, Company } from '../../types';
import { X, UserPlus, User, Mail, Building2, Briefcase } from 'lucide-react';

import { JOB_BENCHMARKS } from '../../data/jobFitBenchmarks';

interface AddCollaboratorModalProps {
  campaign: Campaign;
  company: Company;
  isOpen: boolean;
  onClose: () => void;
}

export const AddCollaboratorModal: React.FC<AddCollaboratorModalProps> = ({
  campaign,
  company,
  isOpen,
  onClose
}) => {
  const { addCollaborators, showToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Ventas y Comercial');
  const [role, setRole] = useState('Colaborador');
  const [benchmarkId, setBenchmarkId] = useState('comercial');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      alert('Nombre y Correo Electrónico son obligatorios.');
      return;
    }

    addCollaborators([
      {
        campaignId: campaign.id,
        companyId: company.id,
        fullName: fullName.trim(),
        email: email.trim(),
        department: department.trim(),
        role: role.trim(),
        benchmarkId
      }
    ]);

    showToast(`Colaborador ${fullName} registrado en la campaña`);
    onClose();
    setFullName('');
    setEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Registrar Colaborador</h2>
              <p className="text-[11px] text-slate-500">{campaign.accessCode} · {company.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ej. Roberto Morales Sánchez"
                className="w-full bg-white border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="colaborador@empresa.com"
                className="w-full bg-white border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Departamento
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={department}
                  onChange={e => {
                    const newDept = e.target.value;
                    setDepartment(newDept);
                  }}
                  className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 outline-none"
                >
                  <option value="Ventas y Comercial">Ventas y Comercial</option>
                  <option value="TI & Desarrollo">TI & Desarrollo</option>
                  <option value="Operaciones">Operaciones</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Finanzas">Finanzas</option>
                  <option value="Dirección General">Dirección General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Puesto / Rol
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="Ej. Gerente de Cuentas"
                  className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Perfil / Benchmark Conductual Objetivo
            </label>
            <select
              value={benchmarkId}
              onChange={e => setBenchmarkId(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none cursor-pointer"
            >
              {JOB_BENCHMARKS.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title} (D:{b.targetD}%, I:{b.targetI}%, S:{b.targetS}%, C:{b.targetC}%)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Permite calcular el Job-Fit Score (%) y la brecha conductual esperada para la posición.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-sm text-xs transition-colors"
            >
              Guardar Colaborador
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
