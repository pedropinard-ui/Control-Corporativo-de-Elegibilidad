import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { EligibilityEngineView } from './components/EligibilityEngineView';
import { RestrictionDirectory } from './components/RestrictionDirectory';
import { ReasonCatalogView } from './components/ReasonCatalogView';
import { ApprovalsWorkflowView } from './components/ApprovalsWorkflowView';
import { AuditTrailView } from './components/AuditTrailView';
import { RestrictionFormModal } from './components/RestrictionFormModal';

import { 
  RestrictionRecord, 
  ReasonCatalogItem, 
  AuditLog, 
  ApprovalRequest 
} from './types';

import { 
  REASON_CATALOG, 
  INITIAL_RESTRICTIONS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_APPROVALS 
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'directory' | 'simulator' | 'catalog' | 'approvals' | 'audit'
  >('dashboard');

  const [restrictions, setRestrictions] = useState<RestrictionRecord[]>(INITIAL_RESTRICTIONS);
  const [reasonsCatalog] = useState<ReasonCatalogItem[]>(REASON_CATALOG);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<RestrictionRecord | null>(null);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<RestrictionRecord | null>(null);

  // Handlers
  const handleOpenNewModal = () => {
    setEditingRecord(null);
    setIsFormModalOpen(true);
  };

  const handleEditRecord = (record: RestrictionRecord) => {
    setEditingRecord(record);
    setIsFormModalOpen(true);
  };

  const handleSaveRestriction = (partialRecord: Partial<RestrictionRecord>) => {
    let updatedRecord: RestrictionRecord;

    if (partialRecord.id) {
      // Update
      setRestrictions((prev) =>
        prev.map((r) => {
          if (r.id === partialRecord.id) {
            updatedRecord = { ...r, ...partialRecord } as RestrictionRecord;
            return updatedRecord;
          }
          return r;
        })
      );

      // Audit Log
      const logEntry: AuditLog = {
        id: `LOG-${Math.floor(8800 + Math.random() * 1000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        userId: 'USR-901',
        userName: 'Oficial de Riesgos (E. Ramírez)',
        action: 'Modificación',
        clientDocId: partialRecord.clientDocId || '000',
        clientName: partialRecord.clientName || 'Cliente',
        details: `Actualización de expediente de restricción ${partialRecord.id} (${partialRecord.reasonCode}).`,
        ipAddress: '192.168.1.50',
      };
      setAuditLogs((prev) => [logEntry, ...prev]);
    } else {
      // Create new
      const newId = `RST-2026-${String(restrictions.length + 1).padStart(3, '0')}`;
      updatedRecord = {
        id: newId,
        clientDocId: partialRecord.clientDocId || '',
        documentType: partialRecord.documentType || 'Cédula',
        clientName: partialRecord.clientName || '',
        clientType: partialRecord.clientType || 'Persona Física',
        email: partialRecord.email || '',
        phone: partialRecord.phone || '',
        address: partialRecord.address || '',
        nationality: partialRecord.nationality || 'Dominicana',
        economicActivity: partialRecord.economicActivity || '',
        reasonCode: partialRecord.reasonCode || 'FRD',
        reasonDetail: partialRecord.reasonDetail || '',
        types: partialRecord.types || ['Total'],
        businessUnitsAffected: partialRecord.businessUnitsAffected || [],
        productsAffected: partialRecord.productsAffected || [],
        channelsAffected: partialRecord.channelsAffected || [],
        severity: partialRecord.severity || 'Alta',
        status: 'Activa',
        startDate: partialRecord.startDate || new Date().toISOString().slice(0, 10),
        expirationDate: partialRecord.expirationDate,
        createdDate: new Date().toISOString().slice(0, 10),
        createdBy: 'Comité de Riesgos Corporativos',
        expedienteNumber: partialRecord.expedienteNumber || `EXP-2026-${Math.floor(100 + Math.random() * 900)}`,
        requiresApproval: partialRecord.requiresApproval || false,
        notes: partialRecord.notes || '',
        activePolicies: [],
      };

      setRestrictions((prev) => [updatedRecord, ...prev]);

      // Audit Log
      const logEntry: AuditLog = {
        id: `LOG-${Math.floor(8800 + Math.random() * 1000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        userId: 'USR-901',
        userName: 'Oficial de Riesgos (E. Ramírez)',
        action: 'Creación',
        clientDocId: updatedRecord.clientDocId,
        clientName: updatedRecord.clientName,
        details: `Creación de nueva restricción ${newId} (Motivo: ${updatedRecord.reasonCode}, Gravedad: ${updatedRecord.severity}).`,
        ipAddress: '192.168.1.50',
      };
      setAuditLogs((prev) => [logEntry, ...prev]);
    }
  };

  const handleDeleteRestriction = (id: string) => {
    const target = restrictions.find((r) => r.id === id);
    if (!target) return;

    // Eliminate restriction from the list
    setRestrictions((prev) => prev.filter((r) => r.id !== id));

    if (selectedRecordForDetail?.id === id) {
      setSelectedRecordForDetail(null);
    }

    const logEntry: AuditLog = {
      id: `LOG-${Math.floor(8800 + Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: 'USR-901',
      userName: 'Oficial de Riesgos (E. Ramírez)',
      action: 'Eliminación',
      clientDocId: target.clientDocId,
      clientName: target.clientName,
      details: `Eliminación definitiva de restricción ${id} (Expediente: ${target.expedienteNumber}, Motivo: ${target.reasonCode} - ${target.reasonDetail}, Gravedad: ${target.severity}). Registro retirado de la lista corporativa.`,
      ipAddress: '192.168.1.50',
    };
    setAuditLogs((prev) => [logEntry, ...prev]);
  };

  const handleDeactivateRestriction = (id: string) => {
    handleDeleteRestriction(id);
  };

  const handleLogQuery = (queryDetails: string, clientDocId: string, clientName: string) => {
    const logEntry: AuditLog = {
      id: `LOG-${Math.floor(8800 + Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: 'USR-201',
      userName: 'Agente Suscriptor (Evaluador)',
      action: 'Evaluación de Elegibilidad',
      clientDocId,
      clientName,
      details: queryDetails,
      ipAddress: '192.168.2.80',
    };
    setAuditLogs((prev) => [logEntry, ...prev]);
  };

  const handleRequestApproval = (
    requestData: Omit<ApprovalRequest, 'id' | 'requestDate' | 'status'>
  ) => {
    const newApproval: ApprovalRequest = {
      ...requestData,
      id: `APR-2026-${String(approvals.length + 1).padStart(3, '0')}`,
      requestDate: new Date().toISOString().slice(0, 10),
      status: 'Pendiente',
    };

    setApprovals((prev) => [newApproval, ...prev]);

    // Update restriction record approval status if found
    setRestrictions((prev) =>
      prev.map((r) => {
        if (r.id === requestData.restrictionId || r.clientDocId === requestData.clientDocId) {
          return {
            ...r,
            approvalStatus: 'Pendiente',
          };
        }
        return r;
      })
    );

    const logEntry: AuditLog = {
      id: `LOG-${Math.floor(8800 + Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: 'USR-201',
      userName: 'Agente Suscriptor',
      action: 'Solicitud Excepción',
      clientDocId: requestData.clientDocId,
      clientName: requestData.clientName,
      details: `Solicitud de excepción comercial enviada para producto ${requestData.requestedProduct} en ${requestData.businessUnit}.`,
      ipAddress: '192.168.2.80',
    };
    setAuditLogs((prev) => [logEntry, ...prev]);
  };

  const handleApproveRequest = (id: string, comments: string) => {
    const target = approvals.find((a) => a.id === id);
    if (!target) return;

    const reviewDate = new Date().toISOString().slice(0, 10);

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'Aprobado',
              reviewedBy: 'Comité de Riesgos Corporativos',
              reviewDate,
              comments,
            }
          : a
      )
    );

    // Update the corresponding restriction record so it reflects the approved exception
    setRestrictions((prev) =>
      prev.map((r) => {
        if (r.id === target.restrictionId || r.clientDocId === target.clientDocId) {
          return {
            ...r,
            approvalStatus: 'Aprobada Excepción',
            notes: r.notes 
              ? `${r.notes}\n[Excepción Aprobada ${reviewDate} (${target.requestedProduct})]: ${comments}`
              : `[Excepción Aprobada ${reviewDate} (${target.requestedProduct})]: ${comments}`,
          };
        }
        return r;
      })
    );

    const logEntry: AuditLog = {
      id: `LOG-${Math.floor(8800 + Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: 'USR-901',
      userName: 'Comité de Riesgos',
      action: 'Aprobación',
      clientDocId: target.clientDocId,
      clientName: target.clientName,
      details: `Excepción aprobada para ${target.requestedProduct} (${target.businessUnit}). Comentario: "${comments}".`,
      ipAddress: '192.168.1.50',
    };
    setAuditLogs((prev) => [logEntry, ...prev]);
  };

  const handleRejectRequest = (id: string, comments: string) => {
    const target = approvals.find((a) => a.id === id);
    if (!target) return;

    const reviewDate = new Date().toISOString().slice(0, 10);

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'Rechazado',
              reviewedBy: 'Comité de Riesgos Corporativos',
              reviewDate,
              comments,
            }
          : a
      )
    );

    // Update the corresponding restriction record
    setRestrictions((prev) =>
      prev.map((r) => {
        if (r.id === target.restrictionId || r.clientDocId === target.clientDocId) {
          return {
            ...r,
            approvalStatus: 'Rechazada Excepción',
          };
        }
        return r;
      })
    );

    const logEntry: AuditLog = {
      id: `LOG-${Math.floor(8800 + Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: 'USR-901',
      userName: 'Comité de Riesgos',
      action: 'Rechazo',
      clientDocId: target.clientDocId,
      clientName: target.clientName,
      details: `Excepción rechazada para ${target.requestedProduct}. Comentario: "${comments}".`,
      ipAddress: '192.168.1.50',
    };
    setAuditLogs((prev) => [logEntry, ...prev]);
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'Pendiente').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewModal={handleOpenNewModal}
          pendingApprovalsCount={pendingApprovalsCount}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              restrictions={restrictions}
              reasonsCatalog={reasonsCatalog}
              auditLogs={auditLogs}
              approvals={approvals}
              onNavigateTab={setActiveTab}
              onOpenNewRestriction={handleOpenNewModal}
              onSelectClientForDetail={(record) => {
                setSelectedRecordForDetail(record);
                setActiveTab('directory');
              }}
            />
          )}

          {activeTab === 'directory' && (
            <RestrictionDirectory
              restrictions={restrictions}
              approvals={approvals}
              onOpenNewModal={handleOpenNewModal}
              onEditRestriction={handleEditRecord}
              onDeactivateRestriction={handleDeleteRestriction}
              onDeleteRestriction={handleDeleteRestriction}
              selectedRecordForDetail={selectedRecordForDetail}
              setSelectedRecordForDetail={setSelectedRecordForDetail}
              onNavigateToApprovals={() => setActiveTab('approvals')}
            />
          )}

          {activeTab === 'simulator' && (
            <EligibilityEngineView
              restrictions={restrictions}
              approvals={approvals}
              onLogQuery={handleLogQuery}
              onRequestApproval={handleRequestApproval}
            />
          )}

          {activeTab === 'catalog' && (
            <ReasonCatalogView catalog={reasonsCatalog} restrictions={restrictions} />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsWorkflowView
              approvals={approvals}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
            />
          )}

          {activeTab === 'audit' && <AuditTrailView logs={auditLogs} />}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-xs text-slate-500 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Control Corporativo de Elegibilidad</span>
            <span className="text-slate-300">•</span>
            <span>Motor Centralizado de Inhabilitación y Gobierno de Riesgo</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Cumplimiento Normativo • Suscripción Automática • Auditoría Inmutable
          </div>
        </div>
      </footer>

      {/* Modal Form for Add/Edit */}
      <RestrictionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveRestriction}
        editingRecord={editingRecord}
        reasonsCatalog={reasonsCatalog}
      />
    </div>
  );
}
