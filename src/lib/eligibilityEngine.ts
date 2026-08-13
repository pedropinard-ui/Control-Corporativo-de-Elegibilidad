import { RestrictionRecord, EvaluationQuery, EvaluationResult, ApprovalRequest } from '../types';

export function evaluateEligibility(
  query: EvaluationQuery,
  restrictions: RestrictionRecord[],
  approvals: ApprovalRequest[] = []
): EvaluationResult {
  const normalizedDoc = query.clientDocId.trim().toLowerCase();
  
  if (!normalizedDoc) {
    return {
      allowed: false,
      decision: 'BLOQUEADO_TOTAL',
      reasons: ['Debe ingresar un número de documento o identificación válido.'],
      appliedRestrictions: [],
      requiresManagerApproval: false,
      recommendedAction: 'Ingrese la identificación del cliente para consultar el motor.',
    };
  }

  // Find active restrictions for this client ID or document
  const clientRestrictions = restrictions.filter(
    (r) =>
      r.status === 'Activa' &&
      (r.clientDocId.toLowerCase().includes(normalizedDoc) ||
       r.clientName.toLowerCase().includes(normalizedDoc))
  );

  // Check if there is an approved exception for this client and product/businessUnit
  const approvedException = approvals.find(
    (a) =>
      a.status === 'Aprobado' &&
      (a.clientDocId.toLowerCase().includes(normalizedDoc) ||
       a.clientName.toLowerCase().includes(normalizedDoc)) &&
      (a.businessUnit === query.businessUnit) &&
      (!a.requestedProduct || 
       a.requestedProduct.toLowerCase() === query.productName.toLowerCase() ||
       query.productName.toLowerCase().includes(a.requestedProduct.toLowerCase()) ||
       a.requestedProduct.toLowerCase().includes(query.productName.toLowerCase()))
  );

  if (clientRestrictions.length === 0) {
    return {
      allowed: true,
      decision: 'APROBADO',
      clientName: 'Cliente Sin Restricciones Registradas',
      reasons: ['No se encontraron inhabilitaciones comerciales ni operativas en el Registro Corporativo de Elegibilidad.'],
      appliedRestrictions: [],
      requiresManagerApproval: false,
      recommendedAction: 'Proceder libremente con la cotización y emisión del producto.',
    };
  }

  const firstMatch = clientRestrictions[0];
  const clientName = firstMatch.clientName;
  const reasons: string[] = [];
  let isTotalBlocked = false;
  let isPartialBlocked = false;
  let isConditional = false;

  const relevantRestrictions: RestrictionRecord[] = [];

  for (const res of clientRestrictions) {
    // Check Total Restriction
    if (res.types.includes('Total') || res.reasonCode === 'COMP' || res.reasonCode === 'LEGAL') {
      isTotalBlocked = true;
      relevantRestrictions.push(res);
      reasons.push(`[${res.reasonCode}] Bloqueo TOTAL Corporativo: ${res.reasonDetail}`);
      continue;
    }

    // Check Business Unit Match
    const buMatch = res.businessUnitsAffected.length === 0 || res.businessUnitsAffected.includes(query.businessUnit);
    
    // Check Product Match
    const prodMatch =
      res.productsAffected.length === 0 ||
      res.productsAffected.some(p => p.toLowerCase().includes(query.productName.toLowerCase()) || query.productName.toLowerCase().includes(p.toLowerCase()));

    // Check Channel Match
    const channelMatch =
      res.channelsAffected.length === 0 ||
      res.channelsAffected.includes(query.channel);

    if (buMatch && prodMatch && channelMatch) {
      relevantRestrictions.push(res);
      
      if (res.types.includes('Condicionada') || res.requiresApproval) {
        isConditional = true;
        reasons.push(`[${res.reasonCode}] Restricción CONDICIONADA: ${res.reasonDetail}`);
      } else {
        isPartialBlocked = true;
        reasons.push(`[${res.reasonCode}] Restricción Específica (${res.types.join(', ')}): ${res.reasonDetail}`);
      }
    }
  }

  // Compile active policies warnings
  const activePolicies = clientRestrictions.flatMap(r => r.activePolicies || []);
  let activePoliciesWarning = undefined;
  if (activePolicies.length > 0) {
    const policyDetails = activePolicies
      .map(p => `• Póliza ${p.policyNumber} (${p.businessUnit} - ${p.productName}): Tratamiento "${p.treatment}" hasta ${p.endDate}`)
      .join('\n');
    activePoliciesWarning = `Información de Pólizas Actuales:\n${policyDetails}`;
  }

  // If there's an approved exception and not total blocked by AML/OFAC/LEGAL
  if (approvedException && !isTotalBlocked) {
    return {
      allowed: true,
      decision: 'APROBADO',
      clientName,
      reasons: [
        `EXCEPCIÓN COMERCIAL APROBADA (Ref: ${approvedException.id}): Aprobada por ${approvedException.reviewedBy || 'Comité de Riesgos'} el ${approvedException.reviewDate || 'recientemente'}.`,
        `Comentario de Aprobación: "${approvedException.comments || 'Aprobado según políticas comerciales'}"`,
        ...reasons.map(r => `[Condición Levantada por Excepción]: ${r}`)
      ],
      appliedRestrictions: relevantRestrictions,
      activePoliciesWarning,
      requiresManagerApproval: false,
      recommendedAction: `EMISIÓN PERMITIDA CON EXCEPCIÓN: La excepción #${approvedException.id} habilita la contratación de ${query.productName} en ${query.businessUnit}.`,
      approvedExceptionDetails: approvedException,
    };
  }

  if (isTotalBlocked) {
    return {
      allowed: false,
      decision: 'BLOQUEADO_TOTAL',
      clientName,
      reasons,
      appliedRestrictions: relevantRestrictions,
      activePoliciesWarning,
      requiresManagerApproval: false,
      recommendedAction: 'RECHAZO AUTOMÁTICO: Inhabilitación total corporativa por Sanciones / Fraude / Disposición Legal. No se permite ninguna contratación ni excepción.',
    };
  }

  if (isPartialBlocked) {
    return {
      allowed: false,
      decision: 'BLOQUEADO_PARCIAL',
      clientName,
      reasons,
      appliedRestrictions: relevantRestrictions,
      activePoliciesWarning,
      requiresManagerApproval: false,
      recommendedAction: `NO ELEGIBLE para el producto ${query.productName} en el canal ${query.channel}. Puede verificar alternativas en otras unidades de negocio no afectadas o solicitar una excepción.`,
    };
  }

  if (isConditional) {
    return {
      allowed: false,
      decision: 'CONDICIONADO_APROBACION',
      clientName,
      reasons,
      appliedRestrictions: relevantRestrictions,
      activePoliciesWarning,
      requiresManagerApproval: true,
      recommendedAction: 'REQUIERE APROBACIÓN ESPECIAL: Complete el formulario de Excepción Comercial para enviar el expediente al Comité de Riesgos o Gerencia Comercial.',
    };
  }

  // If client had restrictions, but none matched the current Query (e.g. restricted in Auto, but querying Salud)
  return {
    allowed: true,
    decision: 'APROBADO',
    clientName,
    reasons: [
      `El cliente registra restricciones activas en otras áreas (${clientRestrictions.map(r => r.reasonCode).join(', ')}), pero la combinación actual (${query.businessUnit} / ${query.productName} / ${query.channel}) está PERMITIDA.`
    ],
    appliedRestrictions: clientRestrictions,
    activePoliciesWarning,
    requiresManagerApproval: false,
    recommendedAction: 'Proceder con precaución y verificar el tratamiento de pólizas vigentes.',
  };
}
