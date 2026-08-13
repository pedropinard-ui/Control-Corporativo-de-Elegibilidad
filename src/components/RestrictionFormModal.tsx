import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Save, 
  Building2, 
  Calendar, 
  AlertTriangle, 
  Layers, 
  FileText,
  UserCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Globe,
  CreditCard
} from 'lucide-react';
import { 
  RestrictionRecord, 
  ReasonCode, 
  RestrictionType, 
  BusinessUnit, 
  SalesChannel, 
  SeverityLevel,
  ReasonCatalogItem
} from '../types';
import { 
  BUSINESS_UNITS_LIST, 
  ALL_PRODUCTS_LIST, 
  PRODUCTS_BY_BU 
} from '../data/initialData';

interface RestrictionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<RestrictionRecord>) => void;
  editingRecord: RestrictionRecord | null;
  reasonsCatalog: ReasonCatalogItem[];
}

const ALL_BUSINESS_UNITS: BusinessUnit[] = BUSINESS_UNITS_LIST;

const ALL_CHANNELS: SalesChannel[] = [
  'Web / Digital',
  'Call Center',
  'Corredor / Broker',
  'Agente Directo',
  'Oficina Comercial',
];

const RESTRICTION_TYPE_OPTIONS: { type: RestrictionType; label: string; desc: string }[] = [
  { type: 'Total', label: 'Total Corporativa', desc: 'No puede contratar ningún producto' },
  { type: 'Por Unidad de Negocio', label: 'Por Unidad de Negocio', desc: 'Solo afecta unidades específicas' },
  { type: 'Por Producto', label: 'Por Producto', desc: 'Solo afecta productos determinados' },
  { type: 'Por Canal', label: 'Por Canal', desc: 'Solo afecta Web, Call Center, Corredor, etc.' },
  { type: 'Temporal', label: 'Temporal', desc: 'Restricción con fecha de vencimiento' },
  { type: 'Permanente', label: 'Permanente', desc: 'Sin fecha de expiración' },
  { type: 'Condicionada', label: 'Condicionada', desc: 'Requiere aprobación especial o condición de pago' },
];

export const RestrictionFormModal: React.FC<RestrictionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecord,
  reasonsCatalog,
}) => {
  const [documentType, setDocumentType] = useState<'Cédula' | 'RNC' | 'Pasaporte' | 'Extranjero'>('Cédula');
  const [clientDocId, setClientDocId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientType, setClientType] = useState<'Persona Física' | 'Persona Jurídica'>('Persona Física');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('Dominicana');
  const [economicActivity, setEconomicActivity] = useState('');
  const [address, setAddress] = useState('');

  const [reasonCode, setReasonCode] = useState<ReasonCode>('FRD');
  const [reasonDetail, setReasonDetail] = useState('');
  const [types, setTypes] = useState<RestrictionType[]>(['Por Unidad de Negocio', 'Permanente']);
  const [businessUnitsAffected, setBusinessUnitsAffected] = useState<BusinessUnit[]>(['SEGUROS XYZ']);
  const [productsAffectedInput, setProductsAffectedInput] = useState('');
  const [channelsAffected, setChannelsAffected] = useState<SalesChannel[]>([]);
  const [severity, setSeverity] = useState<SeverityLevel>('Crítica');
  const [expedienteNumber, setExpedienteNumber] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [expirationDate, setExpirationDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingRecord) {
      setDocumentType(editingRecord.documentType || 'Cédula');
      setClientDocId(editingRecord.clientDocId || '');
      setClientName(editingRecord.clientName || '');
      setClientType(editingRecord.clientType || 'Persona Física');
      setEmail(editingRecord.email || '');
      setPhone(editingRecord.phone || '');
      setNationality(editingRecord.nationality || 'Dominicana');
      setEconomicActivity(editingRecord.economicActivity || '');
      setAddress(editingRecord.address || '');

      setReasonCode(editingRecord.reasonCode);
      setReasonDetail(editingRecord.reasonDetail);
      setTypes(editingRecord.types);
      setBusinessUnitsAffected(editingRecord.businessUnitsAffected);
      setProductsAffectedInput(editingRecord.productsAffected.join(', '));
      setChannelsAffected(editingRecord.channelsAffected);
      setSeverity(editingRecord.severity);
      setExpedienteNumber(editingRecord.expedienteNumber);
      setStartDate(editingRecord.startDate);
      setExpirationDate(editingRecord.expirationDate || '');
      setNotes(editingRecord.notes || '');
    } else {
      // Defaults for new record
      setDocumentType('Cédula');
      setClientDocId('');
      setClientName('');
      setClientType('Persona Física');
      setEmail('');
      setPhone('');
      setNationality('Dominicana');
      setEconomicActivity('');
      setAddress('');

      setReasonCode('FRD');
      setReasonDetail('');
      setTypes(['Por Unidad de Negocio', 'Permanente']);
      setBusinessUnitsAffected(['SEGUROS XYZ']);
      setProductsAffectedInput('');
      setChannelsAffected([]);
      setSeverity('Crítica');
      setExpedienteNumber(`EXP-RST-2026-${Math.floor(100 + Math.random() * 900)}`);
      setStartDate(new Date().toISOString().slice(0, 10));
      setExpirationDate('');
      setNotes('');
    }
  }, [editingRecord, isOpen]);

  if (!isOpen) return null;

  const handleReasonCodeChange = (code: ReasonCode) => {
    setReasonCode(code);
    const catalogItem = reasonsCatalog.find((c) => c.code === code);
    if (catalogItem) {
      setSeverity(catalogItem.defaultSeverity);
      if (catalogItem.requiresSpecialApproval) {
        if (!types.includes('Condicionada')) {
          setTypes((prev) => [...prev, 'Condicionada']);
        }
      }
    }
  };

  const handleToggleType = (type: RestrictionType) => {
    if (types.includes(type)) {
      setTypes(types.filter((t) => t !== type));
    } else {
      let updated = [...types, type];
      // If Total selected, clear BU/Product specifics logically
      if (type === 'Total') {
        updated = updated.filter((t) => t !== 'Por Unidad de Negocio' && t !== 'Por Producto' && t !== 'Por Canal');
        setBusinessUnitsAffected([]);
        setChannelsAffected([]);
      }
      setTypes(updated);
    }
  };

  const handleToggleBU = (bu: BusinessUnit) => {
    if (businessUnitsAffected.includes(bu)) {
      setBusinessUnitsAffected(businessUnitsAffected.filter((b) => b !== bu));
    } else {
      setBusinessUnitsAffected([...businessUnitsAffected, bu]);
    }
  };

  const handleToggleChannel = (ch: SalesChannel) => {
    if (channelsAffected.includes(ch)) {
      setChannelsAffected(channelsAffected.filter((c) => c !== ch));
    } else {
      setChannelsAffected([...channelsAffected, ch]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productsArray = productsAffectedInput
      ? productsAffectedInput.split(',').map((p) => p.trim()).filter(Boolean)
      : [];

    onSave({
      id: editingRecord?.id,
      documentType,
      clientDocId,
      clientName,
      clientType,
      email,
      phone,
      nationality,
      economicActivity,
      address,
      reasonCode,
      reasonDetail,
      types,
      businessUnitsAffected: types.includes('Total') ? [] : businessUnitsAffected,
      productsAffected: productsArray,
      channelsAffected,
      severity,
      expedienteNumber,
      startDate,
      expirationDate: types.includes('Temporal') ? expirationDate : undefined,
      notes,
      requiresApproval: types.includes('Condicionada'),
      status: 'Activa',
      createdBy: editingRecord?.createdBy || 'Comité de Riesgos Corporativos',
      createdDate: editingRecord?.createdDate || new Date().toISOString().slice(0, 10),
      activePolicies: editingRecord?.activePolicies || [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 text-slate-700 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-slate-200 pb-4 mb-4 shrink-0">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-sans">
              {editingRecord ? 'Modificar Expediente de Restricción' : 'Registrar Nueva Restricción Comercial'}
            </h3>
            <p className="text-xs text-slate-500">
              Formulario oficial de inhabilitación y límites de suscripción corporativos
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs overflow-y-auto pr-1">
          {/* Section 1: Client Identifiers */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-700" />
                <span>1. Datos Completos del Cliente / Asegurado</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-medium">* Campos obligatorios</span>
            </div>

            {/* Row 1: Document Type, Document Number, Client Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                  Tipo de Documento *
                </label>
                <select
                  value={documentType}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setDocumentType(val);
                    if (val === 'RNC') {
                      setClientType('Persona Jurídica');
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="Cédula">Cédula de Identidad</option>
                  <option value="RNC">RNC (Registro Nacional)</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Extranjero">Identificación Extranjera</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                  Número de Identificación ({documentType}) *
                </label>
                <input
                  type="text"
                  value={clientDocId}
                  onChange={(e) => setClientDocId(e.target.value)}
                  placeholder={
                    documentType === 'Cédula' 
                      ? 'Ej: 001-1829304-2' 
                      : documentType === 'RNC'
                      ? 'Ej: 130-998123-1'
                      : 'Ej: RD-9821738'
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                  Tipo de Persona *
                </label>
                <select
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="Persona Física">Persona Física</option>
                  <option value="Persona Jurídica">Persona Jurídica</option>
                </select>
              </div>
            </div>

            {/* Row 2: Full Name / Business Name */}
            <div>
              <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                {clientType === 'Persona Jurídica' ? 'Razón Social / Nombre de Empresa *' : 'Nombre Completo del Cliente *'}
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={clientType === 'Persona Jurídica' ? 'Ej: Transportes Hispania S.A.' : 'Ej: Juan Carlos Pérez Gómez'}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            {/* Row 3: Email, Phone, Nationality */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>Correo Electrónico</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>Teléfono / Celular</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 809 555 0192"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span>Nacionalidad / Origen</span>
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="Ej: Dominicana"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Row 4: Economic Activity & Legal Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  <span>Actividad Económica / Ocupación</span>
                </label>
                <input
                  type="text"
                  value={economicActivity}
                  onChange={(e) => setEconomicActivity(e.target.value)}
                  placeholder="Ej: Transporte de Carga, Comercio, Profesional..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>Dirección / Domicilio Principal</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Av. Winston Churchill #45, Santo Domingo"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Catálogo de Motivos */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
              2. Catálogo Oficial de Motivos (Normalizado)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                  Código de Motivo *
                </label>
                <select
                  value={reasonCode}
                  onChange={(e) => handleReasonCodeChange(e.target.value as ReasonCode)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                >
                  {reasonsCatalog.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                  Nivel de Gravedad Base
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Crítica">Crítica (Bloqueo prioritario)</option>
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                Detalle y Sustento Operativo de la Restricción *
              </label>
              <textarea
                rows={2}
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                placeholder="Describa el antecedente o dictamen del comité de riesgos..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          {/* Section 3: Modelo de Restricciones (Configurativo) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
              3. Modelo Configurativo (Tipos de Restricción)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RESTRICTION_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.type}
                  className={`p-2.5 rounded-lg border flex items-start space-x-2.5 cursor-pointer transition ${
                    types.includes(opt.type)
                      ? 'bg-blue-50 border-blue-300 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={types.includes(opt.type)}
                    onChange={() => handleToggleType(opt.type)}
                    className="mt-0.5 rounded text-blue-700 focus:ring-0"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-800">{opt.label}</div>
                    <div className="text-[10px] text-slate-500">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* If Business Unit check */}
            {!types.includes('Total') && (
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Unidades de Negocio Afectadas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_BUSINESS_UNITS.map((bu) => (
                      <button
                        key={bu}
                        type="button"
                        onClick={() => handleToggleBU(bu)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          businessUnitsAffected.includes(bu)
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {bu}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific Products */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Productos Específicos (Separados por coma o selección rápida)
                  </label>
                  <input
                    type="text"
                    value={productsAffectedInput}
                    onChange={(e) => setProductsAffectedInput(e.target.value)}
                    placeholder="Ej: Automóvil, Salud Internacional, Fondo Flexible"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {ALL_PRODUCTS_LIST.map((prod) => {
                      const currentList = productsAffectedInput
                        .split(',')
                        .map((p) => p.trim())
                        .filter(Boolean);
                      const isSelected = currentList.includes(prod);
                      return (
                        <button
                          key={prod}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setProductsAffectedInput(
                                currentList.filter((p) => p !== prod).join(', ')
                              );
                            } else {
                              setProductsAffectedInput(
                                [...currentList, prod].join(', ')
                              );
                            }
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded border transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-700 font-semibold'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {prod}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Channels */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Canales de Venta Afectados (Si aplica)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_CHANNELS.map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => handleToggleChannel(ch)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          channelsAffected.includes(ch)
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Dates & Expediente */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Número de Expediente
                </label>
                <input
                  type="text"
                  value={expedienteNumber}
                  onChange={(e) => setExpedienteNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              {types.includes('Temporal') && (
                <div>
                  <label className="block text-[11px] font-semibold text-blue-800 mb-1">
                    Fecha de Vencimiento *
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full bg-white border border-blue-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Restricción</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
