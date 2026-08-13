import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  X, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Building2, 
  Globe, 
  CheckCircle2, 
  Clock,
  UserX,
  FileCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CheckCheck,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { RestrictionRecord, ReasonCode, SeverityLevel, RestrictionStatus, ApprovalRequest } from '../types';

interface RestrictionDirectoryProps {
  restrictions: RestrictionRecord[];
  approvals?: ApprovalRequest[];
  onOpenNewModal: () => void;
  onEditRestriction: (record: RestrictionRecord) => void;
  onDeactivateRestriction?: (id: string) => void;
  onDeleteRestriction?: (id: string) => void;
  selectedRecordForDetail: RestrictionRecord | null;
  setSelectedRecordForDetail: (record: RestrictionRecord | null) => void;
  onNavigateToApprovals?: () => void;
}

export const RestrictionDirectory: React.FC<RestrictionDirectoryProps> = ({
  restrictions,
  approvals = [],
  onOpenNewModal,
  onEditRestriction,
  onDeactivateRestriction,
  onDeleteRestriction,
  selectedRecordForDetail,
  setSelectedRecordForDetail,
  onNavigateToApprovals,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>('ALL');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedApprovalFilter, setSelectedApprovalFilter] = useState<string>('ALL');
  const [recordToDelete, setRecordToDelete] = useState<RestrictionRecord | null>(null);

  const handleDeleteConfirm = () => {
    if (!recordToDelete) return;
    const deleteFn = onDeleteRestriction || onDeactivateRestriction;
    if (deleteFn) {
      deleteFn(recordToDelete.id);
    }
    if (selectedRecordForDetail?.id === recordToDelete.id) {
      setSelectedRecordForDetail(null);
    }
    setRecordToDelete(null);
  };

  // Helper to get approvals for a client record
  const getRecordApprovals = (record: RestrictionRecord) => {
    return approvals.filter(
      (a) => a.clientDocId === record.clientDocId || a.restrictionId === record.id
    );
  };

  // Filtered List
  const filteredRestrictions = restrictions.filter((r) => {
    const matchesSearch =
      r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.clientDocId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.expedienteNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesReason = selectedReasonFilter === 'ALL' || r.reasonCode === selectedReasonFilter;
    const matchesSeverity = selectedSeverityFilter === 'ALL' || r.severity === selectedSeverityFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || r.status === selectedStatusFilter;

    // Approval filter
    const recordApprovals = getRecordApprovals(r);
    const hasApproved = recordApprovals.some((a) => a.status === 'Aprobado') || r.approvalStatus === 'Aprobada Excepción';
    const hasPending = recordApprovals.some((a) => a.status === 'Pendiente') || r.approvalStatus === 'Pendiente';
    const hasRejected = recordApprovals.some((a) => a.status === 'Rechazado') || r.approvalStatus === 'Rechazada Excepción';

    let matchesApproval = true;
    if (selectedApprovalFilter === 'APPROVED') {
      matchesApproval = hasApproved;
    } else if (selectedApprovalFilter === 'PENDING') {
      matchesApproval = hasPending;
    } else if (selectedApprovalFilter === 'REJECTED') {
      matchesApproval = hasRejected;
    } else if (selectedApprovalFilter === 'NONE') {
      matchesApproval = recordApprovals.length === 0 && !r.approvalStatus;
    }

    return matchesSearch && matchesReason && matchesSeverity && matchesStatus && matchesApproval;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Cliente', 'Documento', 'Motivo', 'Tipo', 'Gravedad', 'Estatus', 'Excepción Aprobada', 'Expediente', 'Fecha Inicio'];
    const rows = filteredRestrictions.map((r) => {
      const recordApprovals = getRecordApprovals(r);
      const approved = recordApprovals.find((a) => a.status === 'Aprobado');
      return [
        r.id,
        `"${r.clientName}"`,
        r.clientDocId,
        r.reasonCode,
        `"${r.types.join('; ')}"`,
        r.severity,
        r.status,
        approved ? `"${approved.requestedProduct} (${approved.businessUnit})"` : 'No',
        r.expedienteNumber,
        r.startDate,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Registro_Restricciones_Corporativas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedRecordApprovals = selectedRecordForDetail 
    ? getRecordApprovals(selectedRecordForDetail)
    : [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-700" />
            <span>Registro Central de Clientes y Restricciones</span>
          </h2>
          <p className="text-xs text-slate-500">
            Directorio corporativo de inhabilitaciones comerciales, límites de suscripción y excepciones aprobadas.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={onOpenNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-xs transition cursor-pointer"
          >
            <span>+ Registrar Restricción</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Nombre, DNI/RNC o Expediente..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Reason Code Filter */}
        <div>
          <select
            value={selectedReasonFilter}
            onChange={(e) => setSelectedReasonFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="ALL">Todos los Motivos</option>
            <option value="FRD">FRD - Fraude confirmado</option>
            <option value="ALT_SIN">ALT_SIN - Alta siniestralidad</option>
            <option value="INC_PAG">INC_PAG - Incumplimiento de pago</option>
            <option value="LEGAL">LEGAL - Restricción legal</option>
            <option value="COMP">COMP - Cumplimiento / AML</option>
            <option value="COM">COM - Decisión comercial</option>
            <option value="OTRO">OTRO - Otro autorizado</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <select
            value={selectedSeverityFilter}
            onChange={(e) => setSelectedSeverityFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="ALL">Todas las Gravedades</option>
            <option value="Crítica">Crítica</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="ALL">Todos los Estatus</option>
            <option value="Activa">Activa</option>
            <option value="En Revisión">En Revisión</option>
            <option value="Inactiva">Inactiva</option>
          </select>
        </div>

        {/* Approval Filter */}
        <div>
          <select
            value={selectedApprovalFilter}
            onChange={(e) => setSelectedApprovalFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
          >
            <option value="ALL">Todas las Excepciones</option>
            <option value="APPROVED">✓ Con Excepción Aprobada</option>
            <option value="PENDING">⏳ Con Solicitud Pendiente</option>
            <option value="REJECTED">✕ Con Excepción Rechazada</option>
            <option value="NONE">Sin Excepciones</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Cliente / Sujeto</th>
                <th className="px-4 py-3.5">Motivo & Código</th>
                <th className="px-4 py-3.5">Alcance / Modelo</th>
                <th className="px-4 py-3.5">Afectación</th>
                <th className="px-4 py-3.5">Nivel Gravedad</th>
                <th className="px-4 py-3.5">Estatus & Excepciones</th>
                <th className="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRestrictions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron registros de restricciones con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredRestrictions.map((record) => {
                  const recordApprovals = getRecordApprovals(record);
                  const approvedExceptions = recordApprovals.filter((a) => a.status === 'Aprobado');
                  const pendingExceptions = recordApprovals.filter((a) => a.status === 'Pendiente');

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() => setSelectedRecordForDetail(record)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">{record.clientName}</div>
                        <div className="font-mono text-[11px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-[10px] text-slate-700">
                            {record.documentType || (record.clientType === 'Persona Jurídica' ? 'RNC' : 'Cédula')}
                          </span>
                          <span>{record.clientDocId}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-sans">{record.clientType}</span>
                        </div>
                        {(record.phone || record.email) && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                            {record.phone && <span>📞 {record.phone}</span>}
                            {record.email && <span>✉️ {record.email}</span>}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {record.reasonCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {record.reasonDetail}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {record.types.map((t) => (
                            <span
                              key={t}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                t === 'Total'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : t === 'Condicionada'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-700">
                        {record.types.includes('Total') ? (
                          <span className="text-red-700 font-bold">Bloqueo Total</span>
                        ) : (
                          <div className="text-[11px]">
                            {record.businessUnitsAffected.length > 0 && (
                              <div>
                                <span className="text-slate-400 font-medium">UN:</span> {record.businessUnitsAffected.join(', ')}
                              </div>
                            )}
                            {record.channelsAffected.length > 0 && (
                              <div>
                                <span className="text-slate-400 font-medium">Canal:</span> {record.channelsAffected.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                            record.severity === 'Crítica'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : record.severity === 'Alta'
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : record.severity === 'Media'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {record.severity}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-1.5">
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                record.status === 'Activa'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  record.status === 'Activa' ? 'bg-emerald-600' : 'bg-slate-400'
                                }`}
                              />
                              {record.status}
                            </span>
                          </div>

                          {/* Approved Exceptions Tag */}
                          {approvedExceptions.length > 0 && (
                            <div className="space-y-1">
                              {approvedExceptions.map((app) => (
                                <div
                                  key={app.id}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs"
                                  title={`Excepción aprobada por ${app.reviewedBy || 'Comité'} el ${app.reviewDate || ''}`}
                                >
                                  <CheckCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>Excepción Aprobada: {app.requestedProduct}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Pending Exceptions Tag */}
                          {pendingExceptions.length > 0 && approvedExceptions.length === 0 && (
                            <div className="space-y-1">
                              {pendingExceptions.map((app) => (
                                <div
                                  key={app.id}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300"
                                >
                                  <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>Excepción Pendiente: {app.requestedProduct}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedRecordForDetail(record)}
                          title="Ver Expediente"
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditRestriction(record)}
                          title="Editar Restricción"
                          className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-700 rounded-lg transition cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRecordToDelete(record)}
                          title="Eliminar Restricción Definitivamente"
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Detail Drawer / Modal */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 text-slate-800 shadow-xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRecordForDetail(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-200">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Expediente de Restricción #{selectedRecordForDetail.expedienteNumber}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  ID Interno: {selectedRecordForDetail.id} • Sujeto: {selectedRecordForDetail.clientName}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              {/* Client Master Data Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[11px] uppercase font-bold text-blue-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-700" />
                    <span>Datos del Cliente / Asegurado</span>
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedRecordForDetail.clientType}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Tipo & Identificación</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {selectedRecordForDetail.documentType || 'Doc'}: {selectedRecordForDetail.clientDocId}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Nacionalidad</span>
                    <span className="text-slate-800 font-medium">
                      {selectedRecordForDetail.nationality || 'Dominicana'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Teléfono / Celular</span>
                    <span className="text-slate-800 font-medium">
                      {selectedRecordForDetail.phone || 'No registrado'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Correo Electrónico</span>
                    <span className="text-slate-800 font-medium truncate block">
                      {selectedRecordForDetail.email || 'No registrado'}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Actividad Económica</span>
                    <span className="text-slate-800 font-medium">
                      {selectedRecordForDetail.economicActivity || 'No especificada'}
                    </span>
                  </div>

                  {selectedRecordForDetail.address && (
                    <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Domicilio Principal</span>
                      <span className="text-slate-800 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{selectedRecordForDetail.address}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason & Code */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Código de Motivo</span>
                  <div className="text-sm font-bold text-blue-700 font-mono flex items-center gap-2 mt-0.5">
                    {selectedRecordForDetail.reasonCode}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Nivel de Gravedad</span>
                  <div className="mt-0.5">
                    <span className="font-extrabold px-2.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                      {selectedRecordForDetail.severity}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Detalle / Justificación Técnica:</span>
                  <p className="text-slate-800 mt-1 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                    {selectedRecordForDetail.reasonDetail}
                  </p>
                </div>
              </div>

              {/* Approvals & Exceptions Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[11px] uppercase font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>Excepciones y Aprobaciones del Cliente</span>
                  </span>
                  {selectedRecordApprovals.length > 0 && (
                    <span className="text-[10px] font-semibold text-slate-500">
                      {selectedRecordApprovals.length} solicitud(es)
                    </span>
                  )}
                </div>

                {selectedRecordApprovals.length === 0 ? (
                  <p className="text-slate-500 italic text-xs py-1">
                    No se registran solicitudes de excepción comercial para este cliente.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedRecordApprovals.map((app) => (
                      <div
                        key={app.id}
                        className={`p-3 rounded-xl border ${
                          app.status === 'Aprobado'
                            ? 'bg-emerald-50/70 border-emerald-200'
                            : app.status === 'Rechazado'
                            ? 'bg-red-50/70 border-red-200'
                            : 'bg-amber-50/70 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs font-mono">
                              {app.id}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-semibold text-slate-800">
                              {app.requestedProduct} ({app.businessUnit})
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              app.status === 'Aprobado'
                                ? 'bg-emerald-600 text-white'
                                : app.status === 'Rechazado'
                                ? 'bg-red-600 text-white'
                                : 'bg-amber-600 text-white'
                            }`}
                          >
                            {app.status === 'Aprobado' && <CheckCircle2 className="w-3 h-3" />}
                            {app.status === 'Rechazado' && <XCircle className="w-3 h-3" />}
                            {app.status === 'Pendiente' && <Clock className="w-3 h-3" />}
                            <span>{app.status}</span>
                          </span>
                        </div>

                        <div className="mt-2 text-[11px] space-y-1 text-slate-700">
                          <div>
                            <span className="font-semibold text-slate-600">Justificación del Solicitante:</span>{' '}
                            <span>{app.justification}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Solicitado por: <span className="font-medium text-slate-700">{app.requestedBy}</span> el {app.requestDate}
                          </div>

                          {app.status !== 'Pendiente' && (
                            <div className="mt-2 pt-2 border-t border-slate-200/80">
                              <div className="text-xs font-semibold text-slate-800">
                                Resolución del Comité de Riesgos:
                              </div>
                              <div className="text-slate-700 italic bg-white/80 p-2 rounded border border-slate-200 mt-1">
                                "{app.comments || 'Sin comentarios registrados'}"
                              </div>
                              <div className="text-[10px] text-slate-500 mt-1">
                                Dictaminado por: <span className="font-medium text-slate-700">{app.reviewedBy || 'Comité'}</span> el {app.reviewDate}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Types & Affected Scopes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                    Tipos de Restricción Aplicados
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRecordForDetail.types.map((t) => (
                      <span key={t} className="px-2 py-1 rounded bg-white text-slate-800 border border-slate-200 font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                    Vigencia y Control
                  </span>
                  <div className="space-y-1">
                    <div><span className="text-slate-500">Fecha Inicio:</span> {selectedRecordForDetail.startDate}</div>
                    <div>
                      <span className="text-slate-500">Expiración:</span>{' '}
                      {selectedRecordForDetail.expirationDate || 'Sin Expiración (Permanente)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Units and Channels */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Unidades de Negocio Afectadas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecordForDetail.businessUnitsAffected.length === 0 ? (
                    <span className="text-red-700 font-bold">Todas las Unidades de Negocio (Bloqueo Total)</span>
                  ) : (
                    selectedRecordForDetail.businessUnitsAffected.map((bu) => (
                      <span key={bu} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {bu}
                      </span>
                    ))
                  )}
                </div>

                {selectedRecordForDetail.channelsAffected.length > 0 && (
                  <>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block pt-2">
                      Canales Afectados
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRecordForDetail.channelsAffected.map((ch) => (
                        <span key={ch} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Active Policies Treatment */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Tratamiento de Pólizas Existentes
                </span>
                {selectedRecordForDetail.activePolicies.length === 0 ? (
                  <p className="text-slate-500 italic">El cliente no posee pólizas activas registradas actualmente.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedRecordForDetail.activePolicies.map((p) => (
                      <div key={p.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{p.policyNumber} - {p.productName}</div>
                          <div className="text-[10px] text-slate-500">{p.businessUnit} • Vence: {p.endDate}</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.treatment}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Observations & Created By */}
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 flex justify-between">
                <div>Registrado por: <span className="text-slate-800 font-semibold">{selectedRecordForDetail.createdBy}</span></div>
                <div>Fecha Registro: <span className="text-slate-800 font-semibold">{selectedRecordForDetail.createdDate}</span></div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRecordToDelete(selectedRecordForDetail)}
                className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Registro</span>
              </button>

              <div className="flex items-center space-x-2">
                {onNavigateToApprovals && selectedRecordApprovals.some(a => a.status === 'Pendiente') && (
                  <button
                    onClick={() => {
                      setSelectedRecordForDetail(null);
                      onNavigateToApprovals();
                    }}
                    className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Gestionar Aprobación</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onEditRestriction(selectedRecordForDetail);
                    setSelectedRecordForDetail(null);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl transition cursor-pointer"
                >
                  Editar Expediente
                </button>
                <button
                  onClick={() => setSelectedRecordForDetail(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ¿Eliminar Restricción?
                </h3>
                <p className="text-xs text-slate-500">
                  Esta acción eliminará el registro del directorio y registrará un evento de auditoría.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 mb-5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Cliente:</span>
                <span className="font-bold text-slate-900">{recordToDelete.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Documento:</span>
                <span className="font-mono font-bold text-slate-800">{recordToDelete.clientDocId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Expediente:</span>
                <span className="font-mono text-slate-700">{recordToDelete.expedienteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Motivo:</span>
                <span className="font-semibold text-rose-700">{recordToDelete.reasonCode} - {recordToDelete.reasonDetail}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
