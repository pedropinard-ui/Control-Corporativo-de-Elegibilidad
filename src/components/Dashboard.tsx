import React from 'react';
import { 
  ShieldAlert, 
  UserX, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Building2, 
  Search, 
  TrendingUp, 
  FileWarning, 
  Layers, 
  ChevronRight,
  ArrowRight,
  CheckCheck
} from 'lucide-react';
import { RestrictionRecord, ReasonCatalogItem, AuditLog, ApprovalRequest } from '../types';

interface DashboardProps {
  restrictions: RestrictionRecord[];
  reasonsCatalog: ReasonCatalogItem[];
  auditLogs: AuditLog[];
  approvals?: ApprovalRequest[];
  onNavigateTab: (tab: 'dashboard' | 'directory' | 'simulator' | 'catalog' | 'approvals' | 'audit') => void;
  onOpenNewRestriction: () => void;
  onSelectClientForDetail: (record: RestrictionRecord) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  restrictions,
  reasonsCatalog,
  auditLogs,
  approvals = [],
  onNavigateTab,
  onOpenNewRestriction,
  onSelectClientForDetail,
}) => {
  const activeRestrictions = restrictions.filter((r) => r.status === 'Activa');
  const criticalFraudCount = activeRestrictions.filter(
    (r) => r.reasonCode === 'FRD' || r.reasonCode === 'COMP' || r.reasonCode === 'LEGAL'
  ).length;
  const conditionalCount = activeRestrictions.filter(
    (r) => r.types.includes('Condicionada') || r.requiresApproval
  ).length;
  const approvedExceptionsCount = approvals.filter((a) => a.status === 'Aprobado').length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'Pendiente').length;

  // Breakdown by Reason Code
  const reasonBreakdown = reasonsCatalog.map((item) => {
    const count = activeRestrictions.filter((r) => r.reasonCode === item.code).length;
    return { ...item, count };
  });

  // Breakdown by Restriction Type
  const typeLabels = [
    { type: 'Total', label: 'Total Corporativa', desc: 'Ningún producto' },
    { type: 'Por Unidad de Negocio', label: 'Por Unidad de Negocio', desc: 'Unidad específica' },
    { type: 'Por Producto', label: 'Por Producto', desc: 'Productos determinados' },
    { type: 'Por Canal', label: 'Por Canal', desc: 'Web, Call Center, etc.' },
    { type: 'Temporal', label: 'Temporal', desc: 'Con vencimiento' },
    { type: 'Permanente', label: 'Permanente', desc: 'Sin expiración' },
    { type: 'Condicionada', label: 'Condicionada', desc: 'Aprobación especial' },
  ];

  const typeCounts = typeLabels.map((t) => {
    const count = activeRestrictions.filter((r) =>
      r.types.includes(t.type as any)
    ).length;
    return { ...t, count };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Intro */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 text-slate-900 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              Suscripción & Gobierno de Riesgo
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl font-sans">
              Control Corporativo de Elegibilidad Comercial
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Plataforma centralizada para gestionar inhabilitaciones, restricciones parciales, condicionales y excepciones aprobadas en todas las unidades de negocio (SEGUROS XYZ, ARS XYZ, FIDUCIARIA XYZ, AFI XYZ, INSURTECH XYZ, ADMINISTRADORA XYZ).
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('simulator')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition transform active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Simulador de Elegibilidad</span>
            </button>
            <button
              onClick={onOpenNewRestriction}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              <FileWarning className="w-4 h-4 text-blue-700" />
              <span>Registrar Restricción</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Restricciones Activas</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{activeRestrictions.length}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              100% Auditado
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Clientes o entidades con inhabilitación vigente</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bloqueo Total / Crítico</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-700">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-red-700">{criticalFraudCount}</span>
            <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Fraude / OFAC / Legal
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Bloqueo completo en todas las líneas de negocio</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Restricciones Condicionadas</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-700">{conditionalCount}</span>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              {pendingApprovalsCount} en revisión
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Requiere visto bueno comercial o de pago</p>
        </div>

        <div 
          onClick={() => onNavigateTab('approvals')}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-emerald-400 hover:bg-emerald-50/10 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Excepciones Aprobadas</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-700">{approvedExceptionsCount}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Dictaminadas
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Habilitadas por Comité de Riesgos</p>
        </div>
      </div>

      {/* Main Grid: Reasons Catalog & Architecture Types */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reasons Catalog Widget */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-700" />
                  <span>Catálogo de Motivos & Distribución Activa</span>
                </h3>
                <p className="text-xs text-slate-500">Codificación corporativa y volumen de casos activos</p>
              </div>
              <button
                onClick={() => onNavigateTab('catalog')}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Catálogo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {reasonBreakdown.map((item) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition border border-slate-100"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {item.code}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center justify-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
                      {item.count} casos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Gobierno de datos estandarizado</span>
            <span className="font-semibold text-blue-700">7 Códigos Homologados</span>
          </div>
        </div>

        {/* Restriction Types Architecture */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-700" />
                  <span>Alcances de Restricción</span>
                </h3>
                <p className="text-xs text-slate-500">Tipos de restricción definidos por política</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {typeCounts.map((item) => (
                <div
                  key={item.type}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{item.label}</span>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700">
                      {item.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-950">Tratamiento de Pólizas Vigentes:</span> Las restricciones impiden la adquisición de nuevos productos pero respetan los contratos vigentes hasta su fecha de vencimiento acordada, salvo por resoluciones legales de cancelación inmediata.
            </div>
          </div>
        </div>
      </div>

      {/* Real-World Use Cases Showcase */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Casos de Uso del Motor de Elegibilidad</span>
            </h3>
            <p className="text-xs text-slate-500">Ejemplos operativos pre-configurados en el sistema</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {restrictions.slice(0, 4).map((record) => (
            <div
              key={record.id}
              onClick={() => onSelectClientForDetail(record)}
              className="bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-xl p-4 transition cursor-pointer group flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {record.reasonCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      record.severity === 'Crítica'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : record.severity === 'Alta'
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {record.severity}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition line-clamp-1">
                  {record.clientName}
                </h4>
                <div className="text-[11px] font-mono text-slate-500 mb-2">{record.clientDocId}</div>

                <p className="text-[11px] text-slate-600 line-clamp-2 mb-3">
                  {record.reasonDetail}
                </p>

                <div className="flex flex-wrap gap-1 mb-2">
                  {record.types.map((t) => (
                    <span key={t} className="text-[9px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-blue-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Ver Expediente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
