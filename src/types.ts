export type ReasonCode = 'FRD' | 'ALT_SIN' | 'INC_PAG' | 'LEGAL' | 'COMP' | 'COM' | 'OTRO';

export type RestrictionType = 
  | 'Total' 
  | 'Por Unidad de Negocio' 
  | 'Por Producto' 
  | 'Por Canal' 
  | 'Temporal' 
  | 'Permanente' 
  | 'Condicionada';

export type BusinessUnit = 
  | 'SEGUROS XYZ' 
  | 'ARS XYZ' 
  | 'FIDUCIARIA XYZ' 
  | 'AFI XYZ' 
  | 'INSURTECH XYZ' 
  | 'ADMINISTRADORA XYZ';

export type SalesChannel = 'Web / Digital' | 'Call Center' | 'Corredor / Broker' | 'Agente Directo' | 'Oficina Comercial';

export type SeverityLevel = 'Alta' | 'Media' | 'Baja' | 'Crítica';

export type RestrictionStatus = 'Activa' | 'En Revisión' | 'Inactiva' | 'Expirada';

export interface ReasonCatalogItem {
  code: ReasonCode;
  name: string;
  description: string;
  defaultSeverity: SeverityLevel;
  requiresSpecialApproval: boolean;
}

export interface ActivePolicy {
  id: string;
  policyNumber: string;
  businessUnit: BusinessUnit;
  productName: string;
  startDate: string;
  endDate: string;
  status: 'Vigente' | 'Próximo a Vencer' | 'Cancelada';
  treatment: 'Mantener hasta vencimiento' | 'No renovar' | 'Cancelación inmediata';
}

export interface RestrictionRecord {
  id: string;
  clientDocId: string; // DNI, RNC, Pasaporte
  documentType?: 'Cédula' | 'RNC' | 'Pasaporte' | 'Extranjero';
  clientName: string;
  clientType: 'Persona Física' | 'Persona Jurídica';
  email?: string;
  phone?: string;
  address?: string;
  nationality?: string;
  economicActivity?: string;
  reasonCode: ReasonCode;
  reasonDetail: string;
  types: RestrictionType[]; // Multiple type flags can apply (e.g., ['Por Producto', 'Temporal'])
  businessUnitsAffected: BusinessUnit[]; // Empty if 'Total'
  productsAffected: string[]; // Specific product names if 'Por Producto'
  channelsAffected: SalesChannel[]; // Specific channels if 'Por Canal'
  severity: SeverityLevel;
  status: RestrictionStatus;
  startDate: string;
  expirationDate?: string; // If 'Temporal'
  createdDate: string;
  createdBy: string;
  expedienteNumber: string;
  requiresApproval: boolean; // If 'Condicionada'
  approvalStatus?: 'Pendiente' | 'Aprobada Excepción' | 'Rechazada Excepción';
  notes?: string;
  activePolicies: ActivePolicy[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'Creación' | 'Modificación' | 'Eliminación' | 'Evaluación de Elegibilidad' | 'Solicitud Excepción' | 'Aprobación' | 'Rechazo';
  clientDocId: string;
  clientName: string;
  details: string;
  ipAddress: string;
}

export interface ApprovalRequest {
  id: string;
  restrictionId: string;
  clientDocId: string;
  clientName: string;
  requestedBy: string;
  requestDate: string;
  businessUnit: BusinessUnit;
  requestedProduct: string;
  justification: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  reviewedBy?: string;
  reviewDate?: string;
  comments?: string;
}

export interface EvaluationQuery {
  clientDocId: string;
  businessUnit: BusinessUnit;
  productName: string;
  channel: SalesChannel;
}

export interface EvaluationResult {
  allowed: boolean;
  decision: 'APROBADO' | 'BLOQUEADO_TOTAL' | 'BLOQUEADO_PARCIAL' | 'CONDICIONADO_APROBACION';
  clientName?: string;
  reasons: string[];
  appliedRestrictions: RestrictionRecord[];
  activePoliciesWarning?: string;
  requiresManagerApproval: boolean;
  recommendedAction: string;
  approvedExceptionDetails?: ApprovalRequest;
}
