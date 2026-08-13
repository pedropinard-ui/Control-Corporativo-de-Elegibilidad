import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  HelpCircle, 
  Building2, 
  ShoppingBag, 
  Globe, 
  FileCheck, 
  Clock, 
  Send,
  AlertTriangle,
  RotateCcw,
  CheckCheck
} from 'lucide-react';
import { 
  BusinessUnit, 
  SalesChannel, 
  RestrictionRecord, 
  EvaluationResult,
  ApprovalRequest 
} from '../types';
import { 
  BUSINESS_UNITS_LIST, 
  PRODUCTS_BY_BU, 
  ALL_PRODUCTS_LIST 
} from '../data/initialData';
import { evaluateEligibility } from '../lib/eligibilityEngine';

interface EligibilityEngineViewProps {
  restrictions: RestrictionRecord[];
  approvals?: ApprovalRequest[];
  onLogQuery: (queryDetails: string, clientDocId: string, clientName: string) => void;
  onRequestApproval: (request: Omit<ApprovalRequest, 'id' | 'requestDate' | 'status'>) => void;
}

const BUSINESS_UNITS: BusinessUnit[] = BUSINESS_UNITS_LIST;

const SALES_CHANNELS: SalesChannel[] = [
  'Web / Digital',
  'Call Center',
  'Corredor / Broker',
  'Agente Directo',
  'Oficina Comercial',
];

const PRESET_PRODUCTS: Record<BusinessUnit, string[]> = PRODUCTS_BY_BU;

export const EligibilityEngineView: React.FC<EligibilityEngineViewProps> = ({
  restrictions,
  approvals = [],
  onLogQuery,
  onRequestApproval,
}) => {
  const [docInput, setDocInput] = useState<string>('001-1829304-2'); // Pre-fill with Case 1
  const [selectedBU, setSelectedBU] = useState<BusinessUnit>('SEGUROS XYZ');
  const [productInput, setProductInput] = useState<string>('Automóvil');
  const [selectedChannel, setSelectedChannel] = useState<SalesChannel>('Web / Digital');

  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [exceptionSubmitted, setExceptionSubmitted] = useState<boolean>(false);
  const [exceptionJustification, setExceptionJustification] = useState<string>('');

  const handleEvaluate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setExceptionSubmitted(false);

    const result = evaluateEligibility(
      {
        clientDocId: docInput,
        businessUnit: selectedBU,
        productName: productInput,
        channel: selectedChannel,
      },
      restrictions,
      approvals
    );

    setEvaluationResult(result);

    // Audit log entry
    onLogQuery(
      `Consulta de Elegibilidad: BU="${selectedBU}", Producto="${productInput}", Canal="${selectedChannel}". Decision=${result.decision}`,
      docInput,
      result.clientName || 'Cliente Evaluado'
    );
  };

  const handleBUChange = (bu: BusinessUnit) => {
    setSelectedBU(bu);
    setProductInput(PRESET_PRODUCTS[bu]?.[0] || '');
  };

  const handleQuickPreset = (doc: string, bu: BusinessUnit, prod: string, ch: SalesChannel) => {
    setDocInput(doc);
    setSelectedBU(bu);
    setProductInput(prod);
    setSelectedChannel(ch);
    setExceptionSubmitted(false);

    const result = evaluateEligibility(
      { clientDocId: doc, businessUnit: bu, productName: prod, channel: ch },
      restrictions,
      approvals
    );
    setEvaluationResult(result);

    onLogQuery(
      `Consulta Preset: BU="${bu}", Producto="${prod}", Canal="${ch}". Decision=${result.decision}`,
      doc,
      result.clientName || 'Cliente'
    );
  };

  const handleSubmitException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluationResult || !exceptionJustification.trim()) return;

    const matched = evaluationResult.appliedRestrictions[0];

    onRequestApproval({
      restrictionId: matched?.id || 'RST-GENERIC',
      clientDocId: docInput,
      clientName: evaluationResult.clientName || 'Cliente Condicionado',
      requestedBy: 'Agente Suscriptor (Evaluador)',
      businessUnit: selectedBU,
      requestedProduct: productInput,
      justification: exceptionJustification,
    });

    setExceptionSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-blue-700" />
              <span>Motor de Evaluación y Consulta de Restricciones en Tiempo Real</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Simulador interactivo del servicio centralizado de validación previa a cotización, emisión o desembolso.
            </p>
          </div>
        </div>

        {/* Quick Presets for demonstration */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Casos de Prueba Rápidos (Preconfigurados):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickPreset('001-1829304-2', 'SEGUROS XYZ', 'Automóvil', 'Web / Digital')}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-medium transition cursor-pointer"
            >
              🚗 Caso 1: Fraude Automóvil (Bloqueo Total)
            </button>
            <button
              onClick={() => handleQuickPreset('402-2345678-9', 'SEGUROS XYZ', 'Salud Local', 'Corredor / Broker')}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-medium transition cursor-pointer"
            >
              🏥 Caso 2: Alta Siniestralidad Salud (Bloqueo BU)
            </button>
            <button
              onClick={() => handleQuickPreset('402-2345678-9', 'ARS XYZ', 'Salud Local', 'Corredor / Broker')}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-medium transition cursor-pointer"
            >
              ✅ Caso 2b: Misma persona en ARS XYZ (Aprobado)
            </button>
            <button
              onClick={() => handleQuickPreset('131-9876543-1', 'SEGUROS XYZ', 'Hogar Seguro', 'Oficina Comercial')}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-medium transition cursor-pointer"
            >
              💳 Caso 3: Moroso Condicionado (Pago Anticipado)
            </button>
            <button
              onClick={() => handleQuickPreset('402-9999999-0', 'SEGUROS XYZ', 'Automóvil', 'Web / Digital')}
              className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium transition cursor-pointer"
            >
              🌟 Cliente Limpio (Sin Restricciones)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
            <span>Parámetros de Entrada</span>
            <span className="text-[10px] font-normal text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              API /evaluate-client
            </span>
          </h3>

          <form onSubmit={handleEvaluate} className="space-y-4">
            {/* Document ID */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-700" />
                <span>Documento de Identificación (Cédula / RNC / Pasaporte)</span>
              </label>
              <input
                type="text"
                value={docInput}
                onChange={(e) => setDocInput(e.target.value)}
                placeholder="Ej: 001-1829304-2 o 131-9876543-1"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
                required
              />
            </div>

            {/* Business Unit */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                <span>Unidad de Negocio Solicitada</span>
              </label>
              <select
                value={selectedBU}
                onChange={(e) => handleBUChange(e.target.value as BusinessUnit)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                {BUSINESS_UNITS.map((bu) => (
                  <option key={bu} value={bu}>
                    {bu}
                  </option>
                ))}
              </select>
            </div>

            {/* Specific Product */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-700" />
                <span>Producto Específico</span>
              </label>
              <input
                type="text"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                placeholder="Nombre del producto"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                required
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {PRESET_PRODUCTS[selectedBU].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProductInput(p)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Sales Channel */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-700" />
                <span>Canal de Venta</span>
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value as SalesChannel)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                {SALES_CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Ejecutar Evaluación de Elegibilidad</span>
            </button>
          </form>
        </div>

        {/* Evaluation Output Result */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          {!evaluationResult ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
              <Search className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Esperando Parámetros de Consulta</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Ingrese la identificación del cliente y detalles de la cotización, o seleccione un caso de prueba para ver el dictamen en tiempo real.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Decision Banner */}
              <div
                className={`p-5 rounded-2xl border shadow-xs ${
                  evaluationResult.decision === 'APROBADO'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : evaluationResult.decision === 'BLOQUEADO_TOTAL'
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : evaluationResult.decision === 'CONDICIONADO_APROBACION'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-orange-50 border-orange-300 text-orange-950'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {evaluationResult.decision === 'APROBADO' ? (
                      <div className="p-2 bg-emerald-600 text-white rounded-xl">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                    ) : evaluationResult.decision === 'BLOQUEADO_TOTAL' ? (
                      <div className="p-2 bg-red-600 text-white rounded-xl">
                        <XCircle className="w-7 h-7" />
                      </div>
                    ) : (
                      <div className="p-2 bg-amber-600 text-white rounded-xl">
                        <AlertOctagon className="w-7 h-7" />
                      </div>
                    )}

                    <div>
                      <div className="text-[11px] font-bold tracking-wider uppercase opacity-75">
                        Resultado de la Regla Corporativa
                      </div>
                      <h3 className="text-xl font-extrabold tracking-tight">
                        {evaluationResult.approvedExceptionDetails
                          ? 'EXCEPCIÓN COMERCIAL APROBADA'
                          : evaluationResult.decision === 'APROBADO'
                          ? 'APROBADO - CLIENTE ELEGIBLE'
                          : evaluationResult.decision === 'BLOQUEADO_TOTAL'
                          ? 'BLOQUEO TOTAL CORPORATIVO'
                          : evaluationResult.decision === 'CONDICIONADO_APROBACION'
                          ? 'RESTRICCIÓN CONDICIONADA'
                          : 'RESTRICCIÓN POR UNIDAD / CANAL'}
                      </h3>
                      {evaluationResult.clientName && (
                        <div className="text-xs font-semibold mt-0.5 opacity-90">
                          Sujeto: {evaluationResult.clientName} ({docInput})
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 shadow-2xs">
                    {selectedBU}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-black/5">
                  {evaluationResult.recommendedAction}
                </p>
              </div>

              {/* Special Exception Banner if Approved */}
              {evaluationResult.approvedExceptionDetails && (
                <div className="p-4 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-800">
                      <CheckCheck className="w-4 h-4 text-emerald-700" />
                      <span>Dictamen de Excepción Corporativa Registrado</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold bg-emerald-200 px-2 py-0.5 rounded text-emerald-900">
                      Folio: {evaluationResult.approvedExceptionDetails.id}
                    </span>
                  </div>

                  <div className="text-xs text-emerald-900 grid grid-cols-2 gap-2 bg-white/70 p-2.5 rounded-lg border border-emerald-200">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 block uppercase">Revisor / Comité:</span>
                      <span className="font-medium">{evaluationResult.approvedExceptionDetails.reviewedBy || 'Comité de Riesgos'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 block uppercase">Fecha Aprobación:</span>
                      <span className="font-medium">{evaluationResult.approvedExceptionDetails.reviewDate || 'Reciente'}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-700 block uppercase">Comentarios de Aprobación:</span>
                      <span className="italic">"{evaluationResult.approvedExceptionDetails.comments || 'Aprobado según políticas comerciales de excepción'}"</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Detail Reasons */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Fundamentos de la Decision:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {evaluationResult.reasons.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-700 font-bold mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Active Policies Treatment Warning if any */}
              {evaluationResult.activePoliciesWarning && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-700">
                    <FileCheck className="w-4 h-4" />
                    <span>Estado de Pólizas Existentes del Cliente</span>
                  </div>
                  <pre className="text-[11px] whitespace-pre-wrap font-sans text-slate-700">
                    {evaluationResult.activePoliciesWarning}
                  </pre>
                </div>
              )}

              {/* Exception Approval Form for Conditional Case */}
              {evaluationResult.decision === 'CONDICIONADO_APROBACION' && !evaluationResult.approvedExceptionDetails && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>Flujo de Solicitud de Excepción Comercial</span>
                    </h4>
                    {exceptionSubmitted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Enviado a Revisión
                      </span>
                    )}
                  </div>

                  {!exceptionSubmitted ? (
                    <form onSubmit={handleSubmitException} className="space-y-2.5">
                      <p className="text-xs text-slate-600">
                        Para habilitar este contrato condicionante (ej. pago 100% por adelantado o acuerdo de comité), envíe la justificación para aprobación especial:
                      </p>
                      <textarea
                        rows={2}
                        value={exceptionJustification}
                        onChange={(e) => setExceptionJustification(e.target.value)}
                        placeholder="Ej: Cliente acepta pago del 100% de la prima por adelantado vía transferencia..."
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-2 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar a Bandeja de Aprobaciones Especiales</span>
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>
                        Solicitud de excepción enviada al Comité de Riesgos. Puede seguir el estatus en el módulo "Aprobaciones Especiales".
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
