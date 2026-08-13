import React, { useState } from 'react';
import { 
  FileText, 
  Shield, 
  User, 
  Clock, 
  Search, 
  Filter, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditTrailViewProps {
  logs: AuditLog[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.clientDocId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">
                Bitácora Inmutable de Auditoría & Consultas
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Registro cronológico y trazable de todas las evaluaciones, altas, modificaciones, eliminaciones y excepciones dictaminadas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              Total de Registros: <span className="font-bold text-slate-900">{logs.length}</span>
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, cédula/RNC, folio de log o detalle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="w-full md:w-56">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-blue-600"
            >
              <option value="ALL">Todas las Acciones ({logs.length})</option>
              <option value="Eliminación">Eliminación</option>
              <option value="Creación">Creación</option>
              <option value="Modificación">Modificación</option>
              <option value="Evaluación de Elegibilidad">Evaluación de Elegibilidad</option>
              <option value="Solicitud Excepción">Solicitud Excepción</option>
              <option value="Aprobación">Aprobación</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">ID / Fecha Hora</th>
                <th className="px-4 py-3.5">Usuario & IP</th>
                <th className="px-4 py-3.5">Acción</th>
                <th className="px-4 py-3.5">Sujeto / Cliente</th>
                <th className="px-4 py-3.5">Detalle Operacional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron registros de auditoría que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-blue-700">{log.id}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.userName}</div>
                      <div className="text-[10px] font-mono text-slate-500">IP: {log.ipAddress}</div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-md ${
                          log.action === 'Eliminación'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : log.action === 'Creación'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : log.action === 'Evaluación de Elegibilidad'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : log.action === 'Aprobación'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {log.action === 'Eliminación' && <Trash2 className="w-3 h-3 text-rose-600" />}
                        {log.action === 'Creación' && <PlusCircle className="w-3 h-3 text-red-600" />}
                        {log.action === 'Aprobación' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        <span>{log.action}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{log.clientName}</div>
                      <div className="font-mono text-[10px] text-slate-500">{log.clientDocId}</div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700 max-w-md leading-relaxed font-medium">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
