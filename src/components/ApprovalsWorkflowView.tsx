import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  User, 
  FileText, 
  Building2, 
  MessageSquare
} from 'lucide-react';
import { ApprovalRequest } from '../types';

interface ApprovalsWorkflowViewProps {
  approvals: ApprovalRequest[];
  onApproveRequest: (id: string, comments: string) => void;
  onRejectRequest: (id: string, comments: string) => void;
}

export const ApprovalsWorkflowView: React.FC<ApprovalsWorkflowViewProps> = ({
  approvals,
  onApproveRequest,
  onRejectRequest,
}) => {
  const [activeTabFilter, setActiveTabFilter] = useState<'Pendiente' | 'Histórico'>('Pendiente');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const filtered = approvals.filter((a) =>
    activeTabFilter === 'Pendiente' ? a.status === 'Pendiente' : a.status !== 'Pendiente'
  );

  const handleCommentChange = (id: string, text: string) => {
    setCommentInputs((prev) => ({ ...prev, [id]: text }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Bandeja de Aprobaciones Especiales
            </h2>
            <p className="text-xs text-slate-500">
              Evaluación de excepciones para clientes con restricción condicionada (INC_PAG, Decisión Comercial, etc.).
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTabFilter('Pendiente')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTabFilter === 'Pendiente'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pendientes ({approvals.filter((a) => a.status === 'Pendiente').length})
          </button>
          <button
            onClick={() => setActiveTabFilter('Histórico')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTabFilter === 'Histórico'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Histórico Aprobados / Rechazados
          </button>
        </div>
      </div>

      {/* List of Requests */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">No hay solicitudes en esta sección</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Todas las excepciones condicionales están al día o han sido procesadas por el Comité.
            </p>
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {req.id}
                    </span>
                    <span className="text-xs text-slate-500">
                      Solicitado el {req.requestDate} por <span className="text-slate-800 font-semibold">{req.requestedBy}</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {req.clientName} <span className="text-xs font-mono text-slate-500">({req.clientDocId})</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                    UN: {req.businessUnit}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      req.status === 'Pendiente'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : req.status === 'Aprobado'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>

              {/* Justification Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Producto Solicitado & Justificación del Agente:
                </div>
                <div className="font-semibold text-blue-900">
                  Producto: {req.requestedProduct}
                </div>
                <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                  "{req.justification}"
                </p>
              </div>

              {/* Decision Section */}
              {req.status === 'Pendiente' ? (
                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Observación / Dictamen del Comité de Riesgos:
                    </label>
                    <input
                      type="text"
                      value={commentInputs[req.id] || ''}
                      onChange={(e) => handleCommentChange(req.id, e.target.value)}
                      placeholder="Ingrese notas de la aprobación o motivo de rechazo..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => onRejectRequest(req.id, commentInputs[req.id] || 'Rechazado por política de riesgo')}
                      className="px-4 py-2 text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Rechazar Excepción</span>
                    </button>

                    <button
                      onClick={() => onApproveRequest(req.id, commentInputs[req.id] || 'Aprobado con condición de pago verificado')}
                      className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprobar Excepción Comercial</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-200 flex justify-between">
                  <div>Dictaminado por: <span className="text-slate-800 font-bold">{req.reviewedBy}</span></div>
                  <div>Fecha: <span className="text-slate-800 font-bold">{req.reviewDate}</span></div>
                  {req.comments && <div className="italic text-slate-700">"{req.comments}"</div>}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
