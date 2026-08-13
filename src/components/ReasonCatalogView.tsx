import React from 'react';
import { BookOpen, ShieldAlert, CheckCircle2, AlertTriangle, Plus, FileText } from 'lucide-react';
import { ReasonCatalogItem, RestrictionRecord } from '../types';

interface ReasonCatalogViewProps {
  catalog: ReasonCatalogItem[];
  restrictions: RestrictionRecord[];
}

export const ReasonCatalogView: React.FC<ReasonCatalogViewProps> = ({
  catalog,
  restrictions,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Catálogo de Motivos (Normalizado)
            </h2>
            <p className="text-xs text-slate-500">
              Estructura corporativa obligatoria de tipificación para evitar ingresos de textos libres o discrecionales.
            </p>
          </div>
        </div>
      </div>

      {/* Official Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900">Catálogo de Motivos</h3>
          <p className="text-xs text-slate-500">Para evitar textos libres.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 w-32">Código</th>
                <th className="px-4 py-3.5">Motivo Oficial</th>
                <th className="px-4 py-3.5">Descripción y Alcance</th>
                <th className="px-4 py-3.5">Gravedad Base</th>
                <th className="px-4 py-3.5">Aprobación Especial</th>
                <th className="px-4 py-3.5 text-right">Casos Activos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {catalog.map((item) => {
                const activeCount = restrictions.filter(
                  (r) => r.status === 'Activa' && r.reasonCode === item.code
                ).length;

                return (
                  <tr key={item.code} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-4 font-mono font-bold text-blue-700 text-sm">
                      <span className="px-2.5 py-1 bg-blue-50 rounded border border-blue-200">
                        {item.code}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-900 text-sm">
                      {item.name}
                    </td>

                    <td className="px-4 py-4 text-slate-600 max-w-md">
                      {item.description}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          item.defaultSeverity === 'Crítica'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : item.defaultSeverity === 'Alta'
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : item.defaultSeverity === 'Media'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {item.defaultSeverity}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {item.requiresSpecialApproval ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Requerida</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Estándar</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                        {activeCount}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
