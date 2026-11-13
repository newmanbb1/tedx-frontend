import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Ticket,
  Clock,
  CheckCircle2,
  Eye,
  Search,
  ExternalLink,
  Users,
  AlertCircle,
  Award,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Save,
  QrCode,
  Image,
  MessageCircle,
  RefreshCw,
  Power,
  Send,
  Smartphone,
  Check,
  AlertTriangle,
  ShieldCheck,
  KeyRound,
  Copy,
  Pause,
  Play,
  Sliders,
  UserPlus,
  EyeOff,
  Shield,
  X,
  Building2,
  ChevronDown,
} from 'lucide-react';
import {
  DashboardStats,
  AdminUserData,
  UserRole,
  OrderData,
  SpeakerData,
  CertificateTemplateData,
  CertificateCategory,
  TicketTypeData,
  PaymentSettingData,
  BackgroundImageData,
  WhatsAppInstanceStatus,
  WhatsAppQRResponse,
  WhatsAppTestResult,
  WhatsAppQueueStats,
  WhatsAppPairingCodeResponse,
  SponsorData,
} from '../types/index.js';
import { api } from '../services/api.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import { ConfirmModal } from '../components/ui/ConfirmModal.js';
import { AlertModal } from '../components/ui/AlertModal.js';

export const AdminDashboardPage: React.FC = () => {
  const [activeAdminTab, setActiveAdminTab] = useState<'orders' | 'speakers' | 'certificates' | 'tickets' | 'payment' | 'backgrounds' | 'sponsors' | 'whatsapp' | 'users'>('orders');
  const [mobileTabMenuOpen, setMobileTabMenuOpen] = useState(false);

  // Pestaña WhatsApp (Evolution API)
  const [waStatus, setWaStatus] = useState<WhatsAppInstanceStatus | null>(null);
  const [waLoading, setWaLoading] = useState(false);
  const [waQr, setWaQr] = useState<WhatsAppQRResponse | null>(null);
  const [waQrLoading, setWaQrLoading] = useState(false);
  const [waActionLoading, setWaActionLoading] = useState(false);
  const [waMsg, setWaMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [waTestPhone, setWaTestPhone] = useState('');
  const [waTestText, setWaTestText] = useState('');
  const [waTestLoading, setWaTestLoading] = useState(false);
  const [waTestResult, setWaTestResult] = useState<WhatsAppTestResult | null>(null);

  // Estados avanzados: Código de Emparejamiento y Temporizador Anti-Expiración QR
  const [waPairingMode, setWaPairingMode] = useState<'qr' | 'pairing-code'>('qr');
  const [waPairingPhone, setWaPairingPhone] = useState('');
  const [waPairingResponse, setWaPairingResponse] = useState<WhatsAppPairingCodeResponse | null>(null);
  const [waPairingLoading, setWaPairingLoading] = useState(false);
  const [qrCountdown, setQrCountdown] = useState<number>(25);
  const [copiedCode, setCopiedCode] = useState(false);

  // Estados de la Cola Anti-Baneo
  const [waQueueStats, setWaQueueStats] = useState<WhatsAppQueueStats | null>(null);

  // Pestaña Órdenes
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('PAYMENT_SUBMITTED');
  const [searchTerm, setSearchTerm] = useState('');
  const [, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Pestaña Speakers
  const [speakers, setSpeakers] = useState<SpeakerData[]>([]);
  const [speakerModalOpen, setSpeakerModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<SpeakerData | null>(null);
  const [speakerFormName, setSpeakerFormName] = useState('');
  const [speakerFormRole, setSpeakerFormRole] = useState('');
  const [speakerFormTopic, setSpeakerFormTopic] = useState('');
  const [speakerFormBio, setSpeakerFormBio] = useState('');
  const [speakerFormOrder, setSpeakerFormOrder] = useState(0);
  const [speakerFormImage, setSpeakerFormImage] = useState<File | null>(null);
  const [speakerFormImageUrl, setSpeakerFormImageUrl] = useState('');
  const [speakerLoading, setSpeakerLoading] = useState(false);

  // Pestaña Certificados
  const [templates, setTemplates] = useState<CertificateTemplateData[]>([]);
  const [templateModalCategory, setTemplateModalCategory] = useState<CertificateCategory | null>(null);
  const [templateFormTitle, setTemplateFormTitle] = useState('');
  const [templateFormDesc, setTemplateFormDesc] = useState('');
  const [templateFormImage, setTemplateFormImage] = useState<File | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);

  // Emisión Manual de Certificado
  const [manualCertModalOpen, setManualCertModalOpen] = useState(false);
  const [manualCertName, setManualCertName] = useState('');
  const [manualCertDoc, setManualCertDoc] = useState('');
  const [manualCertCategory, setManualCertCategory] = useState<CertificateCategory>('VOLUNTEER');
  const [manualCertMessage, setManualCertMessage] = useState<string | null>(null);

  // Pestaña Tickets y Precios en Bs
  const [ticketTypes, setTicketTypes] = useState<TicketTypeData[]>([]);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketTypeData | null>(null);
  const [ticketFormName, setTicketFormName] = useState('');
  const [ticketFormDescription, setTicketFormDescription] = useState('');
  const [ticketFormPrice, setTicketFormPrice] = useState<number | ''>('');
  const [ticketFormActive, setTicketFormActive] = useState(true);
  const [ticketActionLoading, setTicketActionLoading] = useState(false);
  const [ticketActionError, setTicketActionError] = useState<string | null>(null);

  // Pestaña Configuración de Pago QR Oficial
  const [paymentSetting, setPaymentSetting] = useState<PaymentSettingData | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [instructionsInput, setInstructionsInput] = useState('');
  const [accountHolderInput, setAccountHolderInput] = useState('');
  const [bankNameInput, setBankNameInput] = useState('');
  const [whatsappContactInput, setWhatsappContactInput] = useState('');
  const [paymentMsg, setPaymentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pestaña Imágenes de Fondo Dinámicas
  const [backgroundImages, setBackgroundImages] = useState<BackgroundImageData[]>([]);
  const [bgUploadFile, setBgUploadFile] = useState<File | null>(null);
  const [bgTitleInput, setBgTitleInput] = useState('');
  const [bgLoading, setBgLoading] = useState(false);
  const [bgMsg, setBgMsg] = useState<string | null>(null);

  // Pestaña Auspiciadores y Aliados Oficiales
  const [sponsorsList, setSponsorsList] = useState<SponsorData[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(false);
  const [sponsorNameInput, setSponsorNameInput] = useState('');
  const [sponsorWebsiteInput, setSponsorWebsiteInput] = useState('');
  const [sponsorTierInput, setSponsorTierInput] = useState('Oficial');
  const [sponsorLogoFile, setSponsorLogoFile] = useState<File | null>(null);
  const [sponsorLogoPreview, setSponsorLogoPreview] = useState<string | null>(null);
  const [sponsorSubmitting, setSponsorSubmitting] = useState(false);
  const [sponsorMsg, setSponsorMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pestaña Gestión de Usuarios y Roles del Sistema
  const [usersList, setUsersList] = useState<AdminUserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserData | null>(null);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormRole, setUserFormRole] = useState<UserRole>('VALIDATOR');
  const [showPassword, setShowPassword] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [userActionError, setUserActionError] = useState<string | null>(null);

  // Modals de Confirmación y Alerta UI (Reemplazo total de confirm y alert del navegador)
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [alertModalConfig, setAlertModalConfig] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: 'error' | 'success' | 'warning' | 'info';
    buttonText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showConfirm = (config: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
  }) => {
    setConfirmModalConfig({ ...config, isOpen: true });
  };

  const closeConfirm = () => {
    setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const showAlert = (
    message: string,
    type: 'error' | 'success' | 'warning' | 'info' = 'info',
    title?: string,
    buttonText?: string
  ) => {
    setAlertModalConfig({
      isOpen: true,
      message,
      type,
      title,
      buttonText,
    });
  };

  const closeAlert = () => {
    setAlertModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData] = await Promise.all([
        api.getDashboardStats(),
        api.getOrders(statusFilter, searchTerm),
      ]);
      setStats(statsData);
      setOrders(ordersData.orders);
    } catch (err) {
      console.error('Error cargando datos del admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSpeakers = async () => {
    try {
      const res = await api.getAllSpeakers();
      setSpeakers(res.speakers);
    } catch (err) {
      console.error('Error cargando speakers:', err);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await api.getCertificateTemplates();
      setTemplates(res.templates);
    } catch (err) {
      console.error('Error cargando plantillas de certificados:', err);
    }
  };

  const loadTicketTypes = async () => {
    try {
      const res = await api.getTicketTypes();
      setTicketTypes(res.ticketTypes);
    } catch (err) {
      console.error('Error cargando tickets de admin:', err);
      try {
        const fallback = await api.getPublicEvent();
        setTicketTypes(fallback.event.ticketTypes);
      } catch (e) {
        console.error('Error cargando tickets:', e);
      }
    }
  };

  const loadPaymentSettings = async () => {
    try {
      const res = await api.getAdminPaymentSettings();
      if (res.paymentSetting) {
        setPaymentSetting(res.paymentSetting);
        setInstructionsInput(res.paymentSetting.instructions || '');
        setAccountHolderInput(res.paymentSetting.accountHolder || '');
        setBankNameInput(res.paymentSetting.bankName || '');
        setWhatsappContactInput(res.paymentSetting.whatsappContactNumber || '');
      }
    } catch (err) {
      console.error('Error cargando configuración de pago QR:', err);
    }
  };

  const loadBackgrounds = async () => {
    try {
      const res = await api.getAdminBackgroundImages();
      setBackgroundImages(res.images || []);
    } catch (err) {
      console.error('Error cargando fondos:', err);
    }
  };

  const loadSponsorsList = async () => {
    try {
      setSponsorsLoading(true);
      const res = await api.getAllSponsorsAdmin();
      setSponsorsList(res.sponsors || []);
    } catch (err) {
      console.error('Error cargando auspiciadores:', err);
    } finally {
      setSponsorsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await api.getAdminUsers();
      setUsersList(res.users);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const getUserRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Director / Admin',
          badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
          desc: 'Control total de la plataforma, finanzas, ponentes y configuraciones.',
        };
      case 'VALIDATOR':
        return {
          label: 'Validador de Pagos',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          desc: 'Revisión y aprobación de comprobantes y pagos QR en cola.',
        };
      case 'VOLUNTEER':
        return {
          label: 'Mesa de Registro',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          desc: 'Registro presencial en puerta, cobros en efectivo y WhatsApp.',
        };
      case 'CHECKIN':
        return {
          label: 'Escáner de Puerta',
          badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          desc: 'Acreditación y control de acceso con QR el día del evento.',
        };
      case 'STAFF':
        return {
          label: 'Staff General',
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          desc: 'Personal de apoyo operativo y logística.',
        };
    }
  };

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserFormName('');
    setUserFormEmail('');
    setUserFormPassword('');
    setUserFormRole('VALIDATOR');
    setShowPassword(false);
    setUserActionError(null);
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (u: AdminUserData) => {
    setEditingUser(u);
    setUserFormName(u.name);
    setUserFormEmail(u.email);
    setUserFormPassword('');
    setUserFormRole(u.role);
    setShowPassword(false);
    setUserActionError(null);
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionError(null);

    if (!userFormName.trim()) {
      setUserActionError('El nombre completo es obligatorio.');
      return;
    }

    if (!userFormEmail.trim() || !userFormEmail.includes('@')) {
      setUserActionError('Debes ingresar un correo electrónico válido.');
      return;
    }

    if (!editingUser && (!userFormPassword || userFormPassword.length < 6)) {
      setUserActionError('La contraseña inicial debe tener al menos 6 caracteres.');
      return;
    }

    if (editingUser && userFormPassword && userFormPassword.length < 6) {
      setUserActionError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setUserActionLoading(true);
      if (editingUser) {
        await api.updateAdminUser(editingUser.id, {
          name: userFormName.trim(),
          email: userFormEmail.trim().toLowerCase(),
          role: userFormRole,
          password: userFormPassword.trim() || undefined,
        });
        setUserModalOpen(false);
        showAlert('El usuario ha sido actualizado exitosamente.', 'success', 'Usuario Actualizado');
      } else {
        await api.createAdminUser({
          name: userFormName.trim(),
          email: userFormEmail.trim().toLowerCase(),
          password: userFormPassword.trim(),
          role: userFormRole,
        });
        setUserModalOpen(false);
        showAlert('El nuevo usuario ha sido registrado con sus credenciales de acceso.', 'success', 'Usuario Creado');
      }
      await loadUsers();
    } catch (err: any) {
      setUserActionError(err.message || 'Error al guardar usuario');
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUser = (u: AdminUserData) => {
    showConfirm({
      title: '¿Eliminar usuario del sistema?',
      message: `Estás a punto de eliminar a "${u.name}" (${u.email}) con rol de ${u.role}. Esta acción no se puede deshacer.`,
      variant: 'danger',
      confirmText: 'Sí, eliminar usuario',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          closeConfirm();
          await api.deleteAdminUser(u.id);
          showAlert('El usuario fue removido exitosamente del sistema.', 'success', 'Usuario Eliminado');
          await loadUsers();
        } catch (err: any) {
          showAlert(err.message || 'Error al eliminar usuario', 'error', 'No se pudo eliminar');
        }
      },
    });
  };

  const loadWhatsAppQR = async () => {
    try {
      setWaQrLoading(true);
      const qr = await api.getWhatsAppQR();
      setWaQr(qr);
      setQrCountdown(25); // Reiniciar temporizador de validez
    } catch (err: any) {
      console.warn('Error cargando QR de WhatsApp:', err);
    } finally {
      setWaQrLoading(false);
    }
  };

  const loadWhatsAppStatus = async (silent = false) => {
    try {
      if (!silent) setWaLoading(true);
      const status = await api.getWhatsAppStatus();
      setWaStatus(status);
      if (status.state !== 'open' && !silent) {
        loadWhatsAppQR();
      }
    } catch (err: any) {
      console.error('Error cargando estado de WhatsApp:', err);
    } finally {
      if (!silent) setWaLoading(false);
    }
  };

  const loadWhatsAppQueueStats = async () => {
    try {
      const qStats = await api.getWhatsAppQueueStats();
      setWaQueueStats(qStats);
    } catch (err: any) {
      console.warn('Error cargando cola de WhatsApp:', err);
    }
  };

  const handleGetPairingCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waPairingPhone.trim()) return;
    setWaPairingLoading(true);
    setWaMsg(null);
    try {
      const res = await api.getWhatsAppPairingCode(waPairingPhone);
      setWaPairingResponse(res);
      setWaMsg({ type: 'success', text: 'Código de emparejamiento generado exitosamente.' });
    } catch (err: any) {
      setWaMsg({ type: 'error', text: err.message || 'Error al generar código de emparejamiento' });
    } finally {
      setWaPairingLoading(false);
    }
  };

  const handleToggleQueuePause = async () => {
    if (!waQueueStats) return;
    try {
      const updated = await api.updateWhatsAppQueueConfig({ isPaused: !waQueueStats.config.isPaused });
      setWaQueueStats((prev) => prev ? { ...prev, config: updated.config } : null);
      setWaMsg({
        type: 'success',
        text: updated.config.isPaused ? 'Cola de envíos pausada.' : 'Cola de envíos reanudada.',
      });
    } catch (err: any) {
      setWaMsg({ type: 'error', text: err.message || 'Error al modificar estado de la cola' });
    }
  };

  const handleUpdateQueueDelay = async (minSec: number) => {
    try {
      const updated = await api.updateWhatsAppQueueConfig({
        minDelaySeconds: minSec,
        maxDelaySeconds: minSec + 6,
      });
      setWaQueueStats((prev) => prev ? { ...prev, config: updated.config } : null);
    } catch (err: any) {
      console.warn('Error actualizando delay:', err);
    }
  };

  const handleClearQueue = async () => {
    try {
      const res = await api.clearWhatsAppQueue();
      setWaQueueStats(res.stats);
      setWaMsg({ type: 'success', text: 'Cola de mensajes completados limpiada.' });
    } catch (err: any) {
      setWaMsg({ type: 'error', text: err.message || 'Error al limpiar cola' });
    }
  };

  const handleCopyPairingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRestartWhatsApp = async () => {
    setWaActionLoading(true);
    setWaMsg(null);
    try {
      await api.restartWhatsAppInstance();
      setWaMsg({ type: 'success', text: 'Instancia de WhatsApp reiniciada exitosamente.' });
      await loadWhatsAppStatus();
    } catch (err: any) {
      setWaMsg({ type: 'error', text: err.message || 'Error al reiniciar la instancia.' });
    } finally {
      setWaActionLoading(false);
    }
  };

  const handleLogoutWhatsApp = () => {
    showConfirm({
      title: '¿Desvincular WhatsApp?',
      message: '¿Estás seguro de que deseas desvincular y cerrar la sesión del número actual de WhatsApp? Deberás escanear un nuevo código QR o generar un código de emparejamiento para volver a conectar.',
      confirmText: 'Desvincular Dispositivo',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirm();
        setWaActionLoading(true);
        setWaMsg(null);
        try {
          await api.logoutWhatsAppInstance();
          setWaMsg({ type: 'success', text: 'Dispositivo desvinculado. Escanea el nuevo código QR o genera un código para conectar.' });
          showAlert('El dispositivo de WhatsApp se ha desvinculado correctamente.', 'success', 'WhatsApp Desvinculado');
          await loadWhatsAppStatus();
        } catch (err: any) {
          setWaMsg({ type: 'error', text: err.message || 'Error al desvincular dispositivo.' });
          showAlert(err.message || 'Error al desvincular dispositivo.', 'error', 'Error en WhatsApp');
        } finally {
          setWaActionLoading(false);
        }
      },
    });
  };

  const handleSendWhatsAppTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waTestPhone.trim()) return;
    setWaTestLoading(true);
    setWaTestResult(null);
    setWaMsg(null);
    try {
      const res = await api.sendWhatsAppTest(waTestPhone, waTestText || undefined);
      setWaTestResult(res);
      setWaMsg({ type: 'success', text: res.message });
      loadWhatsAppQueueStats();
    } catch (err: any) {
      setWaTestResult({ success: false, message: err.message || 'Error al enviar mensaje', formattedPhone: waTestPhone });
      setWaMsg({ type: 'error', text: err.message || 'Error al enviar mensaje de prueba' });
    } finally {
      setWaTestLoading(false);
    }
  };

  // Carga inicial y sondeo periódico para WhatsApp
  useEffect(() => {
    loadData();
    loadSpeakers();
    loadTemplates();
    loadTicketTypes();
    loadPaymentSettings();
    loadBackgrounds();
    loadSponsorsList();
    loadUsers();
    loadWhatsAppStatus(true);
    loadWhatsAppQueueStats();
  }, [statusFilter]);

  useEffect(() => {
    if (activeAdminTab === 'users') {
      loadUsers();
    }
    if (activeAdminTab === 'sponsors') {
      loadSponsorsList();
    }
  }, [activeAdminTab]);

  // Temporizador anti-expiración de Código QR (cuenta regresiva de 25s que renueva el QR antes de que caduque)
  useEffect(() => {
    if (activeAdminTab !== 'whatsapp' || waStatus?.state === 'open' || waPairingMode !== 'qr') {
      return;
    }

    const timer = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          loadWhatsAppQR();
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAdminTab, waStatus?.state, waPairingMode]);

  // Sondeo periódico de estado y cola
  useEffect(() => {
    if (activeAdminTab === 'whatsapp') {
      loadWhatsAppStatus();
      loadWhatsAppQueueStats();

      const interval = setInterval(() => {
        loadWhatsAppStatus(true);
        loadWhatsAppQueueStats();
      }, waStatus?.state === 'open' ? 10000 : 4000);

      return () => clearInterval(interval);
    }
  }, [activeAdminTab, waStatus?.state]);

  const handleUploadBackground = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bgUploadFile) return;
    setBgLoading(true);
    setBgMsg(null);
    try {
      const formData = new FormData();
      formData.append('image', bgUploadFile);
      if (bgTitleInput) formData.append('title', bgTitleInput);
      formData.append('order', String(backgroundImages.length + 1));
      formData.append('isActive', 'true');

      await api.uploadBackgroundImage(formData);
      setBgUploadFile(null);
      setBgTitleInput('');
      setBgMsg('Imagen de fondo subida exitosamente');
      loadBackgrounds();
    } catch (err: any) {
      setBgMsg(`Error: ${err.message || 'No se pudo subir la imagen'}`);
    } finally {
      setBgLoading(false);
    }
  };

  const handleDeleteBackground = (id: string) => {
    showConfirm({
      title: '¿Eliminar imagen de fondo?',
      message: '¿Estás seguro de que deseas eliminar esta imagen? Ya no se mostrará en el carrusel de fondo de la portada oficial.',
      confirmText: 'Eliminar Imagen',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirm();
        try {
          await api.deleteBackgroundImage(id);
          showAlert('Imagen de fondo eliminada correctamente.', 'success', 'Imagen Eliminada');
          loadBackgrounds();
        } catch (err: any) {
          showAlert('No se pudo eliminar la imagen de fondo. Inténtalo de nuevo.', 'error', 'Error');
        }
      },
    });
  };

  const handleSponsorLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setSponsorMsg({
          type: 'error',
          text: `El archivo "${file.name}" supera el límite máximo de 50MB (${(file.size / (1024 * 1024)).toFixed(1)}MB). Por favor selecciona una imagen más optimizada.`,
        });
        e.target.value = '';
        setSponsorLogoFile(null);
        setSponsorLogoPreview(null);
        return;
      }
      setSponsorMsg(null);
      setSponsorLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setSponsorLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorNameInput.trim()) {
      setSponsorMsg({ type: 'error', text: 'Por favor ingresa el nombre de la empresa o auspiciador.' });
      return;
    }
    if (!sponsorLogoFile) {
      setSponsorMsg({ type: 'error', text: 'Por favor selecciona el archivo de imagen con el logo.' });
      return;
    }
    if (sponsorLogoFile.size > 50 * 1024 * 1024) {
      setSponsorMsg({
        type: 'error',
        text: 'El archivo seleccionado supera el límite de 50MB. Por favor sube una imagen optimizada.',
      });
      return;
    }

    try {
      setSponsorSubmitting(true);
      setSponsorMsg(null);
      const formData = new FormData();
      formData.append('name', sponsorNameInput.trim());
      formData.append('logo', sponsorLogoFile);
      if (sponsorWebsiteInput.trim()) {
        formData.append('websiteUrl', sponsorWebsiteInput.trim());
      }
      formData.append('tier', sponsorTierInput);
      formData.append('order', String(sponsorsList.length + 1));
      formData.append('isActive', 'true');

      await api.createSponsor(formData);
      setSponsorNameInput('');
      setSponsorWebsiteInput('');
      setSponsorLogoFile(null);
      setSponsorLogoPreview(null);
      setSponsorMsg({ type: 'success', text: 'Auspiciador guardado exitosamente.' });
      loadSponsorsList();
    } catch (err: any) {
      setSponsorMsg({ type: 'error', text: err.message || 'Error al guardar el auspiciador.' });
    } finally {
      setSponsorSubmitting(false);
    }
  };

  const handleDeleteSponsor = (id: string, name: string) => {
    showConfirm({
      title: '¿Eliminar Auspiciador?',
      message: `¿Estás seguro de que deseas eliminar a "${name}" de los auspiciadores oficiales?`,
      confirmText: 'Eliminar Auspiciador',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirm();
        try {
          await api.deleteSponsor(id);
          showAlert('Auspiciador eliminado exitosamente.', 'success', 'Auspiciador Eliminado');
          loadSponsorsList();
        } catch (err: any) {
          showAlert(err.message || 'Error al eliminar el auspiciador.', 'error', 'Error');
        }
      },
    });
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      const reader = new FileReader();
      reader.onload = () => setQrPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentSetting) return;
    setPaymentLoading(true);
    setPaymentMsg(null);
    try {
      let currentSetting = paymentSetting;
      if (qrFile) {
        const uploadRes = await api.uploadPaymentQr(paymentSetting.id, qrFile);
        currentSetting = uploadRes.paymentSetting;
        setQrFile(null);
        setQrPreview(null);
      }

      const updateRes = await api.updatePaymentSettings(currentSetting.id, {
        instructions: instructionsInput,
        accountHolder: accountHolderInput,
        bankName: bankNameInput,
        whatsappContactNumber: whatsappContactInput,
        isActive: true,
      });

      setPaymentSetting(updateRes.paymentSetting);
      setPaymentMsg({ type: 'success', text: '¡Código QR de pago e instrucciones guardadas exitosamente!' });
    } catch (err: any) {
      setPaymentMsg({ type: 'error', text: err.message || 'Error al guardar la configuración de pago QR.' });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await api.approveOrder(selectedOrder.id, adminNotes);
      setActionMessage('¡Orden aprobada exitosamente! Se emitieron los boletos con QR.');
      setTimeout(() => {
        setSelectedOrder(null);
        setActionMessage(null);
        loadData();
      }, 1500);
    } catch (err: any) {
      setActionMessage(`Error: ${err.message || 'No se pudo aprobar la orden'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveAndNotifyWhatsApp = async () => {
    if (!selectedOrder) return;
    const buyerPhone = selectedOrder.buyerPhone.replace(/\D/g, '');
    const phone = buyerPhone.length === 8 ? `591${buyerPhone}` : buyerPhone;
    const msg = `Hola *${selectedOrder.buyerName}*:\nTu orden *#${selectedOrder.orderNumber}* para *TEDx USFX 2026* ha sido APROBADA exitosamente.\n\nPuedes ver tus credenciales oficiales con código QR para el Teatro Gran Mariscal aquí:\n${window.location.origin}/?order=${selectedOrder.orderNumber}\n\nTe esperamos el Sábado 21 de Noviembre a las 9:30 AM.`;
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    await handleApprove();
    window.open(waUrl, '_blank');
  };

  const getBuyerWhatsAppLink = () => {
    if (!selectedOrder) return '#';
    const buyerPhone = selectedOrder.buyerPhone.replace(/\D/g, '');
    const phone = buyerPhone.length === 8 ? `591${buyerPhone}` : buyerPhone;
    const msg = `Hola *${selectedOrder.buyerName}*! Nos comunicamos del equipo organizador de *TEDx USFX 2026* respecto a tu orden *#${selectedOrder.orderNumber}*...`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const quickRejectPills = [
    'Comprobante no visible o ilegible',
    'Monto transferido incompleto',
    'Referencia ya utilizada',
    'Cuenta errónea',
  ];

  const handleReject = async () => {
    if (!selectedOrder) return;
    if (!rejectReason.trim()) {
      setActionMessage('Debes ingresar un motivo de rechazo.');
      return;
    }
    setActionLoading(true);
    setActionMessage(null);
    try {
      await api.rejectOrder(selectedOrder.id, rejectReason);
      setActionMessage('Orden rechazada. Cupos liberados en el sistema.');
      setTimeout(() => {
        setSelectedOrder(null);
        setActionMessage(null);
        loadData();
      }, 1500);
    } catch (err: any) {
      setActionMessage(`Error: ${err.message || 'No se pudo rechazar la orden'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrder = (orderId: string, orderNumber: string) => {
    showConfirm({
      title: `¿Eliminar Orden #${orderNumber}?`,
      message: `¿Estás seguro de eliminar permanentemente la orden #${orderNumber}? Si la orden estaba aprobada, se repondrán los cupos y se eliminarán los boletos de prueba asociados.`,
      confirmText: 'Eliminar Orden',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirm();
        setActionLoading(true);
        try {
          const res = await api.deleteOrder(orderId);
          setSelectedOrder(null);
          showAlert(res.message || `Orden #${orderNumber} eliminada exitosamente.`, 'success', 'Orden Eliminada');
          await loadData();
        } catch (err: any) {
          showAlert(err.message || 'Error al eliminar la orden', 'error', 'Error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // =====================
  // Acciones Speakers
  // =====================
  const handleOpenSpeakerModal = (speaker?: SpeakerData) => {
    if (speaker) {
      setEditingSpeaker(speaker);
      setSpeakerFormName(speaker.name);
      setSpeakerFormRole(speaker.role || 'Speaker Oficial');
      setSpeakerFormTopic(speaker.topic || 'TEDx USFX');
      setSpeakerFormBio(speaker.bio || '');
      setSpeakerFormOrder(speaker.order);
      setSpeakerFormImageUrl(speaker.imageUrl);
    } else {
      setEditingSpeaker(null);
      setSpeakerFormName('');
      setSpeakerFormRole('Speaker Oficial');
      setSpeakerFormTopic('TEDx USFX');
      setSpeakerFormBio('');
      setSpeakerFormOrder(speakers.length + 1);
      setSpeakerFormImageUrl('');
    }
    setSpeakerFormImage(null);
    setSpeakerModalOpen(true);
  };

  const handleSaveSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!speakerFormName.trim()) {
      showAlert('Por favor ingresa el nombre del orador antes de guardar.', 'warning', 'Campo Obligatorio');
      return;
    }
    setSpeakerLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', speakerFormName.trim());
      formData.append('role', speakerFormRole.trim() || 'Speaker Oficial');
      formData.append('topic', speakerFormTopic.trim() || 'TEDx USFX');
      if (speakerFormBio.trim()) formData.append('bio', speakerFormBio.trim());
      formData.append('order', String(speakerFormOrder));

      if (speakerFormImage) {
        formData.append('image', speakerFormImage);
      } else if (speakerFormImageUrl.trim()) {
        formData.append('imageUrl', speakerFormImageUrl.trim());
      }

      if (editingSpeaker) {
        await api.updateSpeaker(editingSpeaker.id, formData);
      } else {
        await api.createSpeaker(formData);
      }

      setSpeakerModalOpen(false);
      showAlert(
        editingSpeaker ? 'Los datos del orador se actualizaron con éxito.' : 'Nuevo orador añadido a la cartelera oficial.',
        'success',
        editingSpeaker ? 'Orador Actualizado' : 'Orador Guardado'
      );
      await loadSpeakers();
    } catch (err: any) {
      showAlert(`Error al guardar orador: ${err.message}`, 'error', 'Error al Guardar');
    } finally {
      setSpeakerLoading(false);
    }
  };

  const handleDeleteSpeaker = (id: string, speakerName?: string) => {
    showConfirm({
      title: speakerName ? `¿Eliminar a "${speakerName}"?` : '¿Eliminar orador?',
      message: 'Esta acción retirará permanentemente al disertante y su afiche oficial de la portada pública de TEDx USFX.',
      confirmText: 'Eliminar Orador',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirm();
        try {
          await api.deleteSpeaker(id);
          showAlert('El orador ha sido retirado de la cartelera oficial.', 'success', 'Orador Eliminado');
          await loadSpeakers();
        } catch (err: any) {
          showAlert(`Error al eliminar: ${err.message}`, 'error', 'Error');
        }
      },
    });
  };

  // =====================
  // Acciones Certificados
  // =====================
  const handleOpenTemplateModal = (template: CertificateTemplateData) => {
    setTemplateModalCategory(template.category);
    setTemplateFormTitle(template.title);
    setTemplateFormDesc(template.description || '');
    setTemplateFormImage(null);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateModalCategory) return;
    setTemplateLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', templateFormTitle);
      formData.append('description', templateFormDesc);
      if (templateFormImage) {
        formData.append('image', templateFormImage);
      }

      await api.updateCertificateTemplate(templateModalCategory, formData);
      setTemplateModalCategory(null);
      showAlert('La plantilla de certificado ha sido actualizada exitosamente.', 'success', 'Plantilla Actualizada');
      await loadTemplates();
    } catch (err: any) {
      showAlert(`Error al actualizar plantilla: ${err.message}`, 'error', 'Error');
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleIssueManualCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualCertMessage(null);
    try {
      const res = await api.issueManualCertificate({
        recipientName: manualCertName,
        recipientDocumentId: manualCertDoc,
        category: manualCertCategory,
      });

      setManualCertMessage(`¡Certificado emitido con éxito! Código: ${res.certificate.certificateCode}`);
      setManualCertName('');
      setManualCertDoc('');
    } catch (err: any) {
      setManualCertMessage(`Error: ${err.message || 'No se pudo emitir'}`);
    }
  };

  // =====================
  // Acciones Tickets en Bs
  // =====================
  const handleOpenTicketModal = (ticket?: TicketTypeData) => {
    if (ticket) {
      setEditingTicket(ticket);
      setTicketFormName(ticket.name);
      setTicketFormDescription(ticket.description || '');
      setTicketFormPrice(ticket.price);
      setTicketFormActive(ticket.isActive);
    } else {
      setEditingTicket(null);
      setTicketFormName('');
      setTicketFormDescription('');
      setTicketFormPrice('');
      setTicketFormActive(true);
    }
    setTicketActionError(null);
    setTicketModalOpen(true);
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketFormName.trim()) {
      setTicketActionError('El nombre de la entrada es obligatorio');
      return;
    }
    if (ticketFormPrice === '' || isNaN(Number(ticketFormPrice)) || Number(ticketFormPrice) < 0) {
      setTicketActionError('Ingresa un precio válido en Bolivianos (Bs)');
      return;
    }

    setTicketActionLoading(true);
    setTicketActionError(null);
    try {
      if (editingTicket) {
        await api.updateTicketType(editingTicket.id, {
          name: ticketFormName.trim(),
          description: ticketFormDescription.trim() || undefined,
          price: Number(ticketFormPrice),
          isActive: ticketFormActive,
        });
      } else {
        await api.createTicketType({
          name: ticketFormName.trim(),
          description: ticketFormDescription.trim() || undefined,
          price: Number(ticketFormPrice),
          totalQuota: 500,
        });
      }
      setTicketModalOpen(false);
      showAlert(
        editingTicket ? 'La entrada se actualizó exitosamente.' : 'Nueva categoría de entrada creada para la venta.',
        'success',
        editingTicket ? 'Entrada Actualizada' : 'Entrada Creada'
      );
      await loadTicketTypes();
      await loadData();
    } catch (err: any) {
      setTicketActionError(err.message || 'Error al guardar la categoría de entrada');
    } finally {
      setTicketActionLoading(false);
    }
  };

  const handleDeleteTicket = (ticketId: string, ticketName: string) => {
    showConfirm({
      title: `¿Retirar categoría "${ticketName}"?`,
      message: `¿Estás seguro de eliminar o retirar la categoría "${ticketName}"? Si ya cuenta con órdenes registradas o boletos emitidos se desactivará de la venta pública para proteger los registros de asistencia.`,
      confirmText: 'Retirar Entrada',
      variant: 'danger',
      onConfirm: async () => {
        closeConfirm();
        try {
          const res = await api.deleteTicketType(ticketId);
          showAlert(res.message || 'Categoría de entrada procesada exitosamente.', 'success', 'Entrada Actualizada');
          await loadTicketTypes();
          await loadData();
        } catch (err: any) {
          showAlert(`Error al eliminar categoría: ${err.message}`, 'error', 'Error en Entrada');
        }
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header del Panel */}
      <div className="border-b border-zinc-800 pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ted-red uppercase tracking-widest mb-1.5">
          <Shield className="w-4 h-4 text-ted-red" />
          Portal Administrativo Oficial TEDx
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Panel de Administración
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
          Control de validación bancaria, conferencistas, tarifas en Bs, configuración de cobro QR y accesos del equipo.
        </p>
      </div>

      {/* Configuración declarativa de pestañas */}
      {(() => {
        const adminTabsConfig = [
          {
            id: 'orders' as const,
            label: 'Órdenes',
            fullLabel: 'Órdenes & Validaciones',
            icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
            badge: stats ? `${stats.pendingApprovals}` : undefined,
          },
          {
            id: 'speakers' as const,
            label: 'Speakers',
            fullLabel: 'Speakers Oficiales',
            icon: <Users className="w-4 h-4 text-purple-400" />,
            badge: speakers.length > 0 ? `${speakers.length}` : undefined,
          },
          {
            id: 'certificates' as const,
            label: 'Certificados',
            fullLabel: 'Certificados Digitales',
            icon: <Award className="w-4 h-4 text-amber-400" />,
          },
          {
            id: 'tickets' as const,
            label: 'Entradas',
            fullLabel: 'Entradas & Tarifas Bs',
            icon: <Ticket className="w-4 h-4 text-rose-400" />,
            badge: ticketTypes.length > 0 ? `${ticketTypes.length}` : undefined,
          },
          {
            id: 'payment' as const,
            label: 'Pago QR',
            fullLabel: 'Configuración Pago QR',
            icon: <QrCode className="w-4 h-4 text-amber-400" />,
          },
          {
            id: 'backgrounds' as const,
            label: 'Fondos',
            fullLabel: 'Fondos Portada',
            icon: <Image className="w-4 h-4 text-sky-400" />,
            badge: backgroundImages.length > 0 ? `${backgroundImages.length}` : undefined,
          },
          {
            id: 'sponsors' as const,
            label: 'Auspiciadores',
            fullLabel: 'Auspiciadores & Aliados',
            icon: <Building2 className="w-4 h-4 text-emerald-400" />,
            badge: sponsorsList.length > 0 ? `${sponsorsList.length}` : undefined,
          },
          {
            id: 'whatsapp' as const,
            label: 'WhatsApp',
            fullLabel: 'Servicio WhatsApp',
            icon: <MessageCircle className="w-4 h-4 text-emerald-400" />,
            hasStatusDot: true,
            statusState: waStatus?.state,
          },
          {
            id: 'users' as const,
            label: 'Usuarios',
            fullLabel: 'Usuarios & Accesos',
            icon: <ShieldCheck className="w-4 h-4 text-blue-400" />,
            badge: usersList.length > 0 ? `${usersList.length}` : undefined,
          },
        ];

        const currentTab = adminTabsConfig.find((t) => t.id === activeAdminTab) || adminTabsConfig[0];

        return (
          <>
            {/* VISTA MÓVIL (sm:hidden): Menú desplegable táctil + Barra de píldoras suave */}
            <div className="sm:hidden space-y-2.5">
              {/* Botón Selector Principal en Celular */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMobileTabMenuOpen(!mobileTabMenuOpen)}
                  className="w-full flex items-center justify-between bg-zinc-900/95 border border-zinc-800 rounded-2xl p-3 text-white text-xs font-bold shadow-lg active:bg-zinc-800 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider shrink-0">Sección:</span>
                    <div className="flex items-center space-x-2 min-w-0">
                      {currentTab.icon}
                      <span className="truncate text-white font-extrabold text-sm">{currentTab.fullLabel}</span>
                    </div>
                    {currentTab.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                        {currentTab.badge}
                      </span>
                    )}
                    {currentTab.hasStatusDot && (
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          currentTab.statusState === 'open'
                            ? 'bg-emerald-400 animate-pulse'
                            : currentTab.statusState === 'connecting'
                            ? 'bg-amber-400 animate-ping'
                            : 'bg-rose-500'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-1 shrink-0 ml-2 text-zinc-400">
                    <span className="text-[10px] text-zinc-500 font-medium">Cambiar</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        mobileTabMenuOpen ? 'rotate-180 text-ted-red' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Menú Desplegable con todas las 9 secciones */}
                {mobileTabMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 shadow-2xl space-y-1">
                    {adminTabsConfig.map((tab) => {
                      const isSelected = activeAdminTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveAdminTab(tab.id);
                            setMobileTabMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-ted-red text-white shadow-md shadow-ted-red/20'
                              : 'text-zinc-300 hover:text-white hover:bg-zinc-900 active:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            {tab.icon}
                            <span>{tab.fullLabel}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {tab.badge && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                                  isSelected
                                    ? 'bg-black/30 text-white'
                                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                                }`}
                              >
                                {tab.badge}
                              </span>
                            )}
                            {tab.hasStatusDot && (
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  tab.statusState === 'open'
                                    ? 'bg-emerald-400'
                                    : tab.statusState === 'connecting'
                                    ? 'bg-amber-400'
                                    : 'bg-rose-500'
                                }`}
                              />
                            )}
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Píldoras Rápidas Deslizables con Gradientes que indican scroll continuo */}
              <div className="relative -mx-4 px-4">
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-ted-black to-transparent z-10" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-ted-black to-transparent z-10" />

                <div className="overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 py-1 px-1">
                  {adminTabsConfig.map((tab) => {
                    const isSelected = activeAdminTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveAdminTab(tab.id)}
                        className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer border ${
                          isSelected
                            ? 'bg-ted-red text-white border-ted-red shadow-lg shadow-ted-red/25'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.hasStatusDot && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tab.statusState === 'open'
                                ? 'bg-emerald-400'
                                : tab.statusState === 'connecting'
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* VISTA DESKTOP / TABLET (hidden sm:block) */}
            <div className="hidden sm:block relative">
              <div className="w-full overflow-x-auto no-scrollbar pb-1">
                <div className="inline-flex min-w-max bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 gap-1.5">
                  {adminTabsConfig.map((tab) => {
                    const isSelected = activeAdminTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveAdminTab(tab.id)}
                        className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? 'bg-ted-red text-white shadow-lg shadow-ted-red/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.badge && (
                          <span className="ml-1 text-[10px] font-mono bg-zinc-950/80 px-1.5 py-0.5 rounded-full border border-zinc-700/60">
                            {tab.badge}
                          </span>
                        )}
                        {tab.hasStatusDot && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              tab.statusState === 'open'
                                ? 'bg-emerald-400 animate-pulse'
                                : tab.statusState === 'connecting'
                                ? 'bg-amber-400 animate-ping'
                                : 'bg-rose-500'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* PESTAÑA 1: ÓRDENES Y VALIDACIONES */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-8">
          {/* Métricas Generales (Mobile-First 2 col -> 4 col) */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Recaudación</span>
                  <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <p className="text-xl sm:text-3xl font-black text-white font-mono truncate">
                  Bs {stats.totalRevenue.toFixed(2)}
                </p>
                <p className="text-[10px] sm:text-[11px] text-zinc-400">
                  {stats.approvedOrdersCount} órdenes aprobadas
                </p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Por Validar</span>
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
                <p className="text-xl sm:text-3xl font-black text-amber-300">
                  {stats.pendingApprovals}
                </p>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">Comprobantes en espera</p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Boletos Emitidos</span>
                  <Ticket className="w-4 h-4 text-ted-red shrink-0" />
                </div>
                <p className="text-xl sm:text-3xl font-black text-white">
                  {stats.totalTickets}
                </p>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">Aprobados con QR</p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Asistencia Puerta</span>
                  <Users className="w-4 h-4 text-blue-400 shrink-0" />
                </div>
                <p className="text-xl sm:text-3xl font-black text-white">
                  {stats.checkedInTickets}{' '}
                  <span className="text-xs sm:text-sm font-normal text-zinc-400">
                    ({stats.checkInPercentage}%)
                  </span>
                </p>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">Acreditados en puerta</p>
              </div>
            </div>
          )}

          {/* Filtros y Búsqueda (Mobile-First Swipeable) */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0 -mx-1 px-1">
              {[
                { id: 'PAYMENT_SUBMITTED', label: 'Por Revisar', count: stats?.pendingApprovals },
                { id: 'APPROVED', label: 'Aprobadas' },
                { id: 'PENDING_PAYMENT', label: 'Sin Comprobante' },
                { id: 'REJECTED', label: 'Rechazadas' },
                { id: 'ALL', label: 'Todas' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    statusFilter === tab.id
                      ? 'bg-ted-red text-white shadow-md shadow-ted-red/20'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && tab.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="w-full md:w-72">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar orden, nombre, CI..."
                  className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-ted-red"
                />
              </div>
            </form>
          </div>

          {/* VISTA 1 (MÓVIL): Tarjetas de Órdenes Touch-Friendly */}
          <div className="md:hidden space-y-3">
            {orders.length === 0 ? (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 text-xs">
                No se encontraron órdenes con los filtros seleccionados.
              </div>
            ) : (
              orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-lg"
                >
                  {/* Cabecera Tarjeta Móvil */}
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                    <div>
                      <span className="font-mono font-bold text-white text-base block">{o.orderNumber}</span>
                      <span className="text-[11px] text-zinc-400">
                        {new Date(o.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <Badge status={o.status} />
                  </div>

                  {/* Datos del Comprador & Total */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/60">
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Comprador</span>
                      <p className="font-bold text-white text-sm truncate">{o.buyerName}</p>
                      <p className="text-zinc-400 text-[11px] font-mono">CI: {o.buyerDocumentId}</p>
                      <p className="text-zinc-400 text-[11px] font-mono">WA: {o.buyerPhone}</p>
                    </div>

                    <div className="text-right flex flex-col justify-between">
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase font-bold">Monto Total</span>
                        <span className="text-lg font-black text-emerald-400 font-mono">
                          Bs {o.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-300 font-medium">
                        {o.tickets?.length || 0} {o.tickets?.length === 1 ? 'boleto' : 'boletos'}
                      </span>
                    </div>
                  </div>

                  {/* Detalle de Comprobante / Referencia */}
                  <div className="flex items-center justify-between text-xs px-1">
                    {o.proofReceiptUrl ? (
                      <a
                        href={o.proofReceiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver Comprobante Adjunto</span>
                        {o.proofReferenceNumber && (
                          <span className="font-mono text-amber-300 text-[10px]">({o.proofReferenceNumber})</span>
                        )}
                      </a>
                    ) : (
                      <span className="text-[11px] text-zinc-500 italic">
                        {o.paymentMethod === 'CASH' ? 'Efectivo presencial (Mesa)' : 'Sin comprobante adjunto'}
                      </span>
                    )}
                  </div>

                  {/* Botones de Acción Móvil */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={o.status === 'PAYMENT_SUBMITTED' ? 'primary' : 'outline'}
                      leftIcon={<Eye className="w-4 h-4" />}
                      className="flex-1 justify-center py-2.5 font-bold text-xs"
                      onClick={() => {
                        setSelectedOrder(o);
                        setAdminNotes('');
                        setRejectReason('');
                        setActionMessage(null);
                      }}
                    >
                      {o.status === 'PAYMENT_SUBMITTED' ? 'Revisar y Validar' : 'Ver Detalles'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(o.id, o.orderNumber)}
                      className="p-2.5 rounded-xl border border-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors shrink-0"
                      title="Eliminar orden"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* VISTA 2 (DESKTOP): Tabla Tradicional con Scroll Horizontal */}
          <div className="hidden md:block bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-950/80 text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Orden / Fecha</th>
                    <th className="px-6 py-4">Comprador</th>
                    <th className="px-6 py-4">Boletos</th>
                    <th className="px-6 py-4">Monto (Bs)</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Comprobante</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 text-sm">
                        No se encontraron órdenes con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-white block">{o.orderNumber}</span>
                          <span className="text-[11px] text-zinc-400">
                            {new Date(o.createdAt).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-white">{o.buyerName}</p>
                          <p className="text-xs text-zinc-400">WhatsApp: {o.buyerPhone}</p>
                          <p className="text-xs text-zinc-400">CI: {o.buyerDocumentId}</p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-white">{o.tickets?.length || 0} boletos</span>
                          <div className="text-[11px] text-zinc-400">
                            {o.orderItems?.map((i) => i.ticketType.name).join(', ')}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                          Bs {o.totalAmount.toFixed(2)}
                        </td>

                        <td className="px-6 py-4">
                          <Badge status={o.status} />
                        </td>

                        <td className="px-6 py-4">
                          {o.proofReceiptUrl ? (
                            <div className="space-y-1">
                              <a
                                href={o.proofReceiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Ver Archivo
                              </a>
                              {o.proofReferenceNumber && (
                                <p className="text-[11px] font-mono text-zinc-400">
                                  Ref: {o.proofReferenceNumber}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400">
                              {o.paymentMethod === 'CASH' ? 'Efectivo presencial' : 'Sin subir'}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant={o.status === 'PAYMENT_SUBMITTED' ? 'primary' : 'secondary'}
                              leftIcon={<Eye className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setSelectedOrder(o);
                                setAdminNotes('');
                                setRejectReason('');
                               setActionMessage(null);
                              }}
                            >
                              Revisar
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(o.id, o.orderNumber)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 transition-colors"
                              title="Eliminar orden"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: GESTOR DE SPEAKERS (ORADORES) */}
      {activeAdminTab === 'speakers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-ted-red" />
                <span>Oradores Oficiales de TEDx USFX</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Añade o edita los disertantes que se presentan públicamente en la Landing Page con sus fotos de alta calidad.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenSpeakerModal()}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-ted-red hover:bg-red-700 text-white text-xs font-bold"
            >
              Nuevo Orador
            </Button>
          </div>

          {speakers.length === 0 ? (
            <div className="p-12 text-center border border-zinc-800/80 rounded-2xl bg-zinc-900/40 space-y-3">
              <Users className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No hay oradores registrados aún</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Registra a los disertantes subiendo su afiche oficial y su nombre para que aparezcan en la portada de TEDx USFX.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenSpeakerModal()}
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-ted-red hover:bg-red-700 text-white text-xs font-bold mt-2"
              >
                Añadir Primer Orador
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {speakers.map((sp) => (
                <div
                  key={sp.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-ted-red/50 transition-all duration-300"
                >
                  <div className="relative">
                    {/* Afiche Oficial (Proporción Poster Vertical) */}
                    <div className="aspect-[4/5] bg-zinc-950 relative overflow-hidden">
                      <img
                        src={sp.imageUrl}
                        alt={sp.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-sm border border-zinc-700/60 text-[11px] font-mono font-bold text-zinc-300">
                        #{sp.order}
                      </div>
                    </div>

                    <div className="p-3.5 bg-gradient-to-t from-zinc-900 via-zinc-900 to-transparent">
                      <h3 className="font-bold text-white text-base tracking-tight truncate">{sp.name}</h3>
                      <p className="text-[11px] text-ted-red font-semibold uppercase tracking-wider mt-0.5">Afiche Oficial</p>
                    </div>
                  </div>

                  <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono">ID: {sp.id.slice(0, 8)}...</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenSpeakerModal(sp)}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSpeaker(sp.id, sp.name)}
                        className="p-1.5 rounded-lg hover:bg-red-950/80 text-zinc-400 hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: PLANTILLAS DE CERTIFICADOS (4 MODELOS) */}
      {activeAdminTab === 'certificates' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-ted-red" />
                <span>Gestión de los 4 Modelos de Certificados</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Sube la imagen de fondo de cada categoría para que el sistema genere el diploma oficial con tipografía y código QR.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setManualCertModalOpen(true)}
              className="border-ted-red text-ted-red hover:bg-ted-red hover:text-white text-xs font-bold"
            >
              Emitir Certificado Especial
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-ted-red/20 text-ted-red border border-ted-red/30">
                    {tpl.category}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenTemplateModal(tpl)}
                    className="text-xs border-zinc-700 text-zinc-300"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Cambiar Imagen / Título
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{tpl.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{tpl.description}</p>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-zinc-800 aspect-[16/9] bg-zinc-950 flex items-center justify-center">
                  <img
                    src={tpl.backgroundImageUrl}
                    alt={tpl.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-mono font-bold text-white px-3 py-1 bg-black/60 rounded-full border border-white/20">
                      Vista previa de fondo oficial
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 4: ENTRADAS Y PRECIOS EN BOLIVIANOS (Bs) */}
      {activeAdminTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-ted-red" />
                <span>Categorías de Entradas y Tarifas Oficiales (Bs)</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Crea nuevas categorías de boletos, define sus precios en Bolivianos (Bs) y gestiona los cupos de aforo.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenTicketModal()}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-ted-red hover:bg-red-700 text-white text-xs font-bold shrink-0 shadow-lg shadow-ted-red/20"
            >
              Nueva Entrada / Tarifa
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ticketTypes.map((tt) => {
              const isSoldOut = tt.remainingQuota <= 0;
              const soldCount = Math.max(0, tt.totalQuota - tt.remainingQuota);

              return (
                <div
                  key={tt.id}
                  className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-black text-white truncate">{tt.name}</h3>
                      {!tt.isActive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">
                          Inactivo
                        </span>
                      ) : isSoldOut ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 uppercase">
                          Agotado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                          Activo
                        </span>
                      )}
                    </div>

                    {tt.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {tt.description}
                      </p>
                    )}

                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60 flex-1 flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Precio Oficial</span>
                          <span className="text-2xl font-black text-emerald-400 font-mono">
                            Bs {tt.price.toFixed(2)}
                          </span>
                        </div>
                        {soldCount > 0 && (
                          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                            {soldCount} {soldCount === 1 ? 'vendida' : 'vendidas'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenTicketModal(tt)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      className="text-xs border-zinc-700 text-zinc-300 hover:text-white"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTicket(tt.id, tt.name)}
                      leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                      className="text-xs border-zinc-800 hover:border-rose-900 text-zinc-400 hover:text-rose-400"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA 5: CONFIGURACIÓN DE PAGO POR CÓDIGO QR */}
      {activeAdminTab === 'payment' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-ted-red" />
              <span>Código QR Oficial de Cobro</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Sube la imagen del código QR neto al que los participantes pagarán sus entradas (Simple QR, BCP, BNB, etc.).
              Este QR se presentará en alta resolución en el proceso de compra (Checkout).
            </p>
          </div>

          {paymentMsg && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
                paymentMsg.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800'
                  : 'bg-red-950/80 text-red-200 border-red-800'
              }`}
            >
              {paymentMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{paymentMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Columna Izquierda: Imagen y Subida de QR */}
            <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Imagen del Código QR
                </span>
                {paymentSetting?.qrImageUrl && (
                  <Badge variant="success">QR Activo en Sistema</Badge>
                )}
              </div>

              {/* Vista previa del QR */}
              <div className="flex flex-col items-center justify-center p-4 bg-zinc-950 rounded-xl border border-zinc-800 min-h-[260px]">
                {qrPreview ? (
                  <div className="text-center space-y-3">
                    <div className="p-3 bg-white rounded-xl inline-block shadow-lg">
                      <img
                        src={qrPreview}
                        alt="Nuevo QR seleccionado"
                        className="w-52 h-52 object-contain"
                      />
                    </div>
                    <p className="text-xs text-amber-400 font-medium">
                      Nuevo archivo seleccionado listo para guardar
                    </p>
                  </div>
                ) : paymentSetting?.qrImageUrl ? (
                  <div className="text-center space-y-3">
                    <div className="p-3 bg-white rounded-xl inline-block shadow-lg">
                      <img
                        src={paymentSetting.qrImageUrl}
                        alt="Código QR Oficial"
                        className="w-52 h-52 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href={paymentSetting.qrImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver en tamaño completo
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 space-y-3 text-zinc-500">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto text-zinc-600">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-300">Aún no has subido tu código QR</p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                        Selecciona abajo tu imagen de cobro QR oficial (captura de Simple QR, BCP, etc.)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input para subir nuevo QR */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  {paymentSetting?.qrImageUrl ? 'Reemplazar Código QR (Imagen):' : 'Seleccionar Código QR (Imagen):'}
                </label>
                <div className="relative border-2 border-dashed border-zinc-700 hover:border-ted-red rounded-xl p-4 text-center cursor-pointer bg-zinc-950/60 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleQrFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1.5 text-zinc-400">
                    <Upload className="w-5 h-5 text-ted-red" />
                    <span className="text-xs font-medium text-white">
                      {qrFile ? qrFile.name : 'Haz clic para seleccionar imagen de QR'}
                    </span>
                    <span className="text-[10px] text-zinc-500">Formatos: PNG, JPG, WebP (Máx. 15MB)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario de Configuración y Detalles */}
            <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <form onSubmit={handleSavePaymentSettings} className="space-y-5">
                <div className="border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Detalles e Instrucciones para el Asistente
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Esta información acompañará al código QR en la pantalla de pago de las entradas.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Instrucciones de Pago al Escanear *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={instructionsInput}
                    onChange={(e) => setInstructionsInput(e.target.value)}
                    placeholder="Ej. Escanea el código QR desde tu app bancaria móvil (Simple QR), transfiere el monto exacto en Bs y adjunta la captura de tu comprobante."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-ted-red leading-relaxed"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Sé claro sobre adjuntar la captura del comprobante con número de referencia o confirmación.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Titular o Razón Social (Opcional)
                    </label>
                    <input
                      type="text"
                      value={accountHolderInput}
                      onChange={(e) => setAccountHolderInput(e.target.value)}
                      placeholder="Ej. TEDx USFX / Fundación"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-ted-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Banco o Plataforma Emisora (Opcional)
                    </label>
                    <input
                      type="text"
                      value={bankNameInput}
                      onChange={(e) => setBankNameInput(e.target.value)}
                      placeholder="Ej. BCP / Banco Sol / Red Simple"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-ted-red"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Oficial para Recibir Comprobantes</span>
                  </label>
                  <input
                    type="text"
                    value={whatsappContactInput}
                    onChange={(e) => setWhatsappContactInput(e.target.value)}
                    placeholder="Ej. 78687799 o 59178687799"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-ted-red font-mono"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Número al que se dirigirán los compradores con el botón 'Enviar Comprobante por WhatsApp' con los datos de su orden.
                  </p>
                </div>

                {/* Banner de Previsualización */}
                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 space-y-2">
                  <span className="text-[11px] font-bold text-ted-red uppercase tracking-wider block">
                    Resumen de lo que verá el comprador:
                  </span>
                  <p className="text-xs text-zinc-300 italic">
                    "{instructionsInput || 'Escanea el código QR oficial y sube tu comprobante.'}"
                  </p>
                  {(accountHolderInput || bankNameInput) && (
                    <div className="text-[11px] text-zinc-400 pt-1 flex items-center gap-2">
                      <span className="font-semibold text-zinc-200">Receptor:</span>
                      <span>{[accountHolderInput, bankNameInput].filter(Boolean).join(' • ')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={paymentLoading}
                    className="bg-ted-red hover:bg-red-700 text-white font-bold px-6 shadow-lg shadow-ted-red/20"
                  >
                    {paymentLoading ? (
                      'Guardando Cambios...'
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2 inline" />
                        <span>Guardar Código QR y Datos</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 6: IMÁGENES DE FONDO DINÁMICAS */}
      {activeAdminTab === 'backgrounds' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Image className="w-5 h-5 text-ted-red" />
              <span>Imágenes de Fondo Dinámicas (Landing Page)</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Sube fotos del Teatro Gran Mariscal, eventos previos o tomas de la USFX. Se reproducirán en bucle en el fondo de la pantalla de bienvenida.
            </p>
          </div>

          {bgMsg && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
              bgMsg.startsWith('Error') ? 'bg-red-950/80 text-red-200 border-red-800' : 'bg-emerald-950/80 text-emerald-200 border-emerald-800'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bgMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Subir Nueva Foto</h3>
              <form onSubmit={handleUploadBackground} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Título / Descripción</label>
                  <input
                    type="text"
                    value={bgTitleInput}
                    onChange={(e) => setBgTitleInput(e.target.value)}
                    placeholder="Ej. Teatro Gran Mariscal - Vista Aérea"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Archivo de Imagen *</label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setBgUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-white"
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={bgLoading}
                  className="w-full bg-ted-red hover:bg-red-700 text-white font-bold"
                >
                  {bgLoading ? 'Subiendo...' : 'Agregar Imagen de Fondo'}
                </Button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Imágenes Activas ({backgroundImages.length})</h3>
              {backgroundImages.length === 0 ? (
                <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 text-xs">
                  No hay fotos de fondo configuradas. Sube una a la izquierda para activar el carrusel de fondo.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {backgroundImages.map((img) => (
                    <div key={img.id} className="relative group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
                      <div className="aspect-video bg-zinc-950">
                        <img src={img.imageUrl} alt={img.title || 'Fondo'} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <span className="text-xs text-zinc-300 font-medium truncate max-w-[180px]">{img.title || 'Sin título'}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBackground(img.id)}
                          className="text-red-400 border-zinc-800 hover:bg-red-950/40 p-1.5 h-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: AUSPICIADORES Y ALIADOS OFICIALES */}
      {activeAdminTab === 'sponsors' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-ted-red" />
              <span>Auspiciadores y Aliados Oficiales</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Sube el logo y nombre de las marcas, empresas e instituciones aliadas. Se mostrarán en la portada y en el pie de página oficial.
            </p>
          </div>

          {sponsorMsg && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
                sponsorMsg.type === 'error'
                  ? 'bg-red-950/80 text-red-200 border-red-800'
                  : 'bg-emerald-950/80 text-emerald-200 border-emerald-800'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{sponsorMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario para Crear Auspiciador */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-ted-red" />
                <span>Nuevo Auspiciador</span>
              </h3>
              <form onSubmit={handleCreateSponsor} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nombre del Auspiciador / Marca *
                  </label>
                  <input
                    type="text"
                    required
                    value={sponsorNameInput}
                    onChange={(e) => setSponsorNameInput(e.target.value)}
                    placeholder="Ej. USFX, Cervecería Sureña, Entel..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-ted-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Logo del Auspiciador * (PNG / JPG / SVG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleSponsorLogoChange}
                    className="w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-white file:cursor-pointer"
                  />
                  {sponsorLogoPreview && (
                    <div className="mt-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center">
                      <img
                        src={sponsorLogoPreview}
                        alt="Vista previa logo"
                        className="max-h-20 max-w-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Sitio Web o Red Social (Opcional)
                  </label>
                  <input
                    type="url"
                    value={sponsorWebsiteInput}
                    onChange={(e) => setSponsorWebsiteInput(e.target.value)}
                    placeholder="https://ejemplo.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-ted-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Categoría / Nivel
                  </label>
                  <select
                    value={sponsorTierInput}
                    onChange={(e) => setSponsorTierInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-ted-red"
                  >
                    <option value="Oficial">Oficial</option>
                    <option value="Platino">Platino</option>
                    <option value="Oro">Oro</option>
                    <option value="Aliado Académico">Aliado Académico</option>
                    <option value="Media Partner">Media Partner</option>
                  </select>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={sponsorSubmitting}
                  className="w-full bg-ted-red hover:bg-red-700 text-white font-bold"
                >
                  {sponsorSubmitting ? 'Guardando...' : 'Guardar Auspiciador'}
                </Button>
              </form>
            </div>

            {/* Listado de Auspiciadores Registrados */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Auspiciadores Registrados ({sponsorsList.length})
                </h3>
                {sponsorsLoading && (
                  <span className="text-xs text-zinc-500 font-mono animate-pulse">Cargando...</span>
                )}
              </div>

              {sponsorsList.length === 0 ? (
                <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 text-xs">
                  No hay auspiciadores registrados aún. Sube el logo y escribe el nombre en el formulario para agregarlo.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sponsorsList.map((sponsor) => (
                    <div
                      key={sponsor.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-all space-y-3"
                    >
                      <div className="h-28 w-full bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.06)_0%,_transparent_75%)] pointer-events-none" />
                        <img
                          src={sponsor.logoUrl.includes('?') ? sponsor.logoUrl : `${sponsor.logoUrl}?v=2`}
                          alt={sponsor.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{sponsor.name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                            {sponsor.tier || 'Oficial'}
                          </span>
                        </div>
                        {sponsor.websiteUrl && (
                          <a
                            href={sponsor.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-ted-red hover:underline flex items-center gap-1 truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{sponsor.websiteUrl}</span>
                          </a>
                        )}
                      </div>
                      <div className="pt-2 border-t border-zinc-800/60 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSponsor(sponsor.id, sponsor.name)}
                          className="text-zinc-400 hover:text-red-400 hover:bg-red-950/40 text-xs flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 7: WHATSAPP (EVOLUTION API) */}
      {activeAdminTab === 'whatsapp' && (
        <div className="space-y-8">
          {/* Header con Estado y Acciones Rápidas */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    Servicio de WhatsApp (Evolution API)
                    {waStatus?.state === 'open' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Conectado
                      </span>
                    ) : waStatus?.state === 'connecting' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        Esperando Vinculación
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Desconectado
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Envío seguro de entradas digitales y credenciales con código QR para TEDx Innova.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadWhatsAppStatus()}
                isLoading={waLoading}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${waLoading ? 'animate-spin' : ''}`} />}
                className="border-zinc-700 text-zinc-300 text-xs flex-1 sm:flex-initial"
              >
                Actualizar
              </Button>

              {waStatus?.state === 'open' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogoutWhatsApp}
                  isLoading={waActionLoading}
                  leftIcon={<Power className="w-3.5 h-3.5" />}
                  className="text-xs flex-1 sm:flex-initial"
                >
                  Desvincular
                </Button>
              )}
            </div>
          </div>

          {/* Banner de Protección Anti-Baneo */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-800/60 p-5 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Motor de Protección Anti-Baneo Activo
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                      Simulación Humana
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Los envíos se procesan secuencialmente con pausas aleatorias ({waQueueStats?.config.minDelaySeconds || 8}s a {waQueueStats?.config.maxDelaySeconds || 15}s), variación dinámica de texto y simulación de presencia "Escribiendo...".
                  </p>
                </div>
              </div>

              {/* Controles de la Cola Anti-Baneo */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleQueuePause}
                  leftIcon={waQueueStats?.config.isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  className="border-zinc-700 text-zinc-300 text-xs"
                >
                  {waQueueStats?.config.isPaused ? 'Reanudar Cola' : 'Pausar Cola'}
                </Button>

                {waQueueStats && (waQueueStats.completedCount > 0 || waQueueStats.failedCount > 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearQueue}
                    className="border-zinc-700 text-zinc-400 hover:text-white text-xs"
                  >
                    Limpiar Historial
                  </Button>
                )}
              </div>
            </div>

            {/* Métricas de Cola en Vivo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-800/80 text-xs font-mono">
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] uppercase">En Cola Pendientes:</span>
                <span className={`text-base font-bold ${waQueueStats?.pendingCount ? 'text-amber-400 animate-pulse' : 'text-zinc-300'}`}>
                  {waQueueStats?.pendingCount ?? 0} mensajes
                </span>
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] uppercase">Enviados Hoy (Seguro):</span>
                <span className="text-base font-bold text-emerald-400">
                  {waQueueStats?.sentTodayCount ?? 0} / {waQueueStats?.config.maxDailyThreshold ?? 250}
                </span>
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] uppercase">Intervalo de Seguridad:</span>
                <span className="text-sm font-bold text-white">
                  {waQueueStats?.config.minDelaySeconds ?? 8}s - {waQueueStats?.config.maxDelaySeconds ?? 15}s (Jitter)
                </span>
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] uppercase">Presencia Simulada:</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Escribiendo... ({waQueueStats?.config.typingDurationSeconds ?? 3}s)
                </span>
              </div>
            </div>
          </div>

          {/* Mensaje de feedback global */}
          {waMsg && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
                waMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-800 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {waMsg.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{waMsg.text}</span>
              </div>
              <button onClick={() => setWaMsg(null)} className="text-zinc-400 hover:text-white ml-2 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Tarjetas de Métricas Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <span className="text-xs text-zinc-400 block font-medium">Estado del Canal</span>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    waStatus?.state === 'open'
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                      : waStatus?.state === 'connecting'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-lg font-bold text-white capitalize">
                  {waStatus?.state === 'open'
                    ? 'Operativo'
                    : waStatus?.state === 'connecting'
                    ? 'Enlace Pendiente'
                    : 'Desconectado'}
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono mt-1 block">
                Instancia: {waStatus?.instanceName || 'senordelastintas'}
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <span className="text-xs text-zinc-400 block font-medium">Teléfono Emisor</span>
              <p className="text-lg font-bold text-white mt-2 font-mono truncate">
                {waStatus?.number ? `+${waStatus.number}` : 'No vinculado'}
              </p>
              <span className="text-[11px] text-zinc-500 truncate block mt-1">
                {waStatus?.profileName || 'Sin perfil activo'}
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <span className="text-xs text-zinc-400 block font-medium">Boletos Despachados</span>
              <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">
                {waStatus?.totalTicketsDispatched ?? 0}
              </p>
              <span className="text-[11px] text-zinc-500 block mt-1">
                En {waStatus?.totalOrdersDispatched ?? 0} órdenes validadas
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <span className="text-xs text-zinc-400 block font-medium">Servidor Evolution</span>
              <p className="text-sm font-bold text-zinc-300 mt-2 font-mono truncate">
                {waStatus?.serverUrl || 'http://localhost:8080'}
              </p>
              <span className="text-[11px] text-emerald-500 font-semibold block mt-1">
                Motor Baileys v2.3
              </span>
            </div>
          </div>

          {/* Grilla Principal de Vinculación y Probador */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Columna Izquierda: QR / Pairing Code / Estado Conectado (7 cols) */}
            <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
              {waStatus?.state === 'open' ? (
                /* Estado Ya Conectado */
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Dispositivo WhatsApp Vinculado</h3>
                      <p className="text-xs text-zinc-400">El canal está activo para emitir credenciales digitales y códigos QR.</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row items-center gap-6">
                    {waStatus.profilePicUrl ? (
                      <img
                        src={waStatus.profilePicUrl}
                        alt="WhatsApp Profile"
                        className="w-20 h-20 rounded-full border-2 border-emerald-500 object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-emerald-950 border-2 border-emerald-600 flex items-center justify-center text-emerald-400 text-2xl font-black">
                        WA
                      </div>
                    )}

                    <div className="space-y-1.5 text-center sm:text-left flex-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="text-lg font-black text-white font-mono">
                          {waStatus.number ? `+${waStatus.number}` : 'Línea Conectada'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          ACTIVO
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium">
                        Nombre: <span className="text-white font-semibold">{waStatus.profileName || 'Línea Oficial TEDx'}</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        JID: {waStatus.ownerJid || 'No reportado'}
                      </p>
                    </div>
                  </div>

                  {/* Configuración de ritmo de envío anti-bloqueo */}
                  <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-200 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-400" />
                        Pausas Humanizadas Anti-Bloqueo
                      </span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {waQueueStats?.config.minDelaySeconds || 8}s - {(waQueueStats?.config.minDelaySeconds || 8) + 6}s
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-zinc-500">Más Rápido (5s)</span>
                      <input
                        type="range"
                        min="5"
                        max="25"
                        step="1"
                        value={waQueueStats?.config.minDelaySeconds || 8}
                        onChange={(e) => handleUpdateQueueDelay(Number(e.target.value))}
                        className="flex-1 accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-[11px] text-zinc-500">Más Seguro (25s)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Recomendado: 8 a 15 segundos para números no verificados por Meta Business.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRestartWhatsApp}
                      isLoading={waActionLoading}
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                      className="border-zinc-700 text-zinc-300"
                    >
                      Reiniciar Conexión
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleLogoutWhatsApp}
                      isLoading={waActionLoading}
                      leftIcon={<Power className="w-4 h-4" />}
                    >
                      Desvincular Dispositivo
                    </Button>
                  </div>
                </div>
              ) : (
                /* Estado Pendiente / Métodos de Vinculación */
                <div className="space-y-6">
                  {/* Selector de Método de Emparejamiento (Mobile-Friendly) */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white">Vincular Número de WhatsApp</h3>
                      <p className="text-xs text-zinc-400">Elige el método de emparejamiento que prefieras.</p>
                    </div>

                    <div className="flex w-full sm:w-auto bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                      <button
                        onClick={() => setWaPairingMode('qr')}
                        className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                          waPairingMode === 'qr' ? 'bg-ted-red text-white shadow' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Código QR
                      </button>
                      <button
                        onClick={() => setWaPairingMode('pairing-code')}
                        className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                          waPairingMode === 'pairing-code' ? 'bg-ted-red text-white shadow' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Código 8 Dígitos
                      </button>
                    </div>
                  </div>

                  {waPairingMode === 'qr' ? (
                    /* Método 1: Código QR con Contador Regresivo Anti-Expiración */
                    <div className="space-y-4">
                      {/* Barra de progreso de auto-renovación */}
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-zinc-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            Validez del QR: <strong className="text-white">{qrCountdown}s</strong>
                          </span>
                          <span className="text-emerald-400">Auto-renovación automática activa</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${(qrCountdown / 25) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80">
                        {/* Contenedor del Código QR */}
                        <div className="relative p-3 bg-white rounded-2xl shadow-2xl shrink-0 flex items-center justify-center min-w-[220px] min-h-[220px]">
                          {waQrLoading ? (
                            <div className="flex flex-col items-center justify-center text-zinc-800 space-y-2">
                              <div className="w-8 h-8 border-3 border-ted-red border-t-transparent rounded-full animate-spin" />
                              <span className="text-[11px] font-mono font-bold">Generando QR fresco...</span>
                            </div>
                          ) : waQr?.base64 ? (
                            <img
                              src={waQr.base64}
                              alt="Código QR de WhatsApp Evolution API"
                              className="w-52 h-52 object-contain rounded-lg"
                            />
                          ) : (
                            <div className="text-center p-4 text-zinc-700 space-y-2">
                              <AlertTriangle className="w-8 h-8 mx-auto text-amber-500" />
                              <p className="text-xs font-bold">QR no disponible aún</p>
                              <Button size="sm" variant="primary" onClick={loadWhatsAppQR}>
                                Obtener QR
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Instrucciones de Escaneo */}
                        <div className="space-y-3 text-xs text-zinc-300 flex-1">
                          <p className="font-bold text-white text-sm">Pasos para conectar:</p>
                          <ol className="space-y-2.5 list-decimal pl-4 leading-relaxed text-zinc-400">
                            <li>
                              Abre <strong className="text-white">WhatsApp</strong> en tu teléfono móvil.
                            </li>
                            <li>
                              Toca <strong className="text-white">Menú</strong> o <strong className="text-white">Configuración</strong> y selecciona <strong className="text-emerald-400 font-semibold">Dispositivos vinculados</strong>.
                            </li>
                            <li>
                              Toca <strong className="text-white">Vincular un dispositivo</strong>.
                            </li>
                            <li>
                              Apunta tu teléfono hacia este código QR.
                            </li>
                          </ol>

                          <div className="pt-2 flex items-center justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={loadWhatsAppQR}
                              isLoading={waQrLoading}
                              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                              className="border-zinc-700 text-zinc-300 text-xs"
                            >
                              Regenerar Ahora
                            </Button>
                            <span className="text-[11px] text-zinc-500">
                              Reintentos: {waQr?.count ?? 1}/8
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Método 2: Código de Emparejamiento por Número (No expira en 20s) */
                    <div className="space-y-6">
                      <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-amber-400" />
                            Emparejar por Código de Teléfono (Alternativa sin QR)
                          </h4>
                          <p className="text-xs text-zinc-400 mt-1">
                            Este método genera un código de 8 caracteres que se introduce directamente en WhatsApp sin usar la cámara, evitando problemas de expiración o enfoque.
                          </p>
                        </div>

                        <form onSubmit={handleGetPairingCode} className="flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold text-xs">
                              +591
                            </span>
                            <input
                              type="text"
                              required
                              value={waPairingPhone}
                              onChange={(e) => setWaPairingPhone(e.target.value)}
                              placeholder="7XXXXXXX"
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-16 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-ted-red"
                            />
                          </div>

                          <Button
                            type="submit"
                            size="md"
                            variant="primary"
                            isLoading={waPairingLoading}
                            leftIcon={<KeyRound className="w-4 h-4" />}
                            className="w-full sm:w-auto justify-center"
                          >
                            Generar Código
                          </Button>
                        </form>

                        {/* Despliegue del Código de 8 Dígitos */}
                        {waPairingResponse?.pairingCode && (
                          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-emerald-700 text-center space-y-4 shadow-xl">
                            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
                              Tu Código de Vinculación de WhatsApp:
                            </span>

                            <div className="flex items-center justify-center gap-3">
                              <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white bg-zinc-950 px-6 py-3 rounded-2xl border border-zinc-700 shadow-inner">
                                {waPairingResponse.pairingCode}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyPairingCode(waPairingResponse.pairingCode)}
                                leftIcon={copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                className="border-zinc-700"
                              >
                                {copiedCode ? 'Copiado' : 'Copiar'}
                              </Button>
                            </div>

                            <div className="text-left text-xs text-zinc-300 bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-1.5">
                              <p className="font-bold text-white">Instrucciones en tu celular:</p>
                              <ol className="list-decimal pl-4 space-y-1 text-zinc-400">
                                <li>Abre WhatsApp &gt; Dispositivos vinculados.</li>
                                <li>Toca <strong>"Vincular un dispositivo"</strong>.</li>
                                <li>Toca abajo en <strong>"Vincular con el número de teléfono"</strong>.</li>
                                <li>Escribe este código de 8 dígitos para finalizar.</li>
                              </ol>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Columna Derecha: Probador de Envíos en Vivo (5 cols) */}
            <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-ted-red">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Probador de Mensajes en Vivo</h3>
                  <p className="text-xs text-zinc-400">Verifica la entrega inmediata de mensajes a un teléfono de prueba.</p>
                </div>
              </div>

              <form onSubmit={handleSendWhatsAppTest} className="space-y-4 text-xs">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1.5 uppercase tracking-wider text-[11px]">
                    Número de Celular Destino *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold text-xs">
                      +591
                    </span>
                    <input
                      type="text"
                      required
                      value={waTestPhone}
                      onChange={(e) => setWaTestPhone(e.target.value)}
                      placeholder="7XXXXXXX"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-16 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Formato estándar Bolivia (8 dígitos). Se añadirá automáticamente el prefijo de país.
                  </span>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1.5 uppercase tracking-wider text-[11px]">
                    Mensaje Personalizado (Opcional)
                  </label>
                  <textarea
                    rows={4}
                    value={waTestText}
                    onChange={(e) => setWaTestText(e.target.value)}
                    placeholder="Escribe un mensaje de prueba o deja vacío para usar la plantilla oficial..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none font-mono"
                  />
                </div>

                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  isLoading={waTestLoading}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/40"
                >
                  Enviar Mensaje de Prueba
                </Button>
              </form>

              {/* Resultado del Envío de Prueba */}
              {waTestResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    waTestResult.success
                      ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {waTestResult.success ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{waTestResult.success ? '¡Mensaje Entregado!' : 'Error en la Entrega'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">{waTestResult.message}</p>
                  <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[10px] font-mono">
                    <span>Destino: +{waTestResult.formattedPhone}</span>
                    <a
                      href={`https://wa.me/${waTestResult.formattedPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      Abrir en WA <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 8: GESTIÓN DE USUARIOS Y ROLES */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          {/* Banner Superior con Acciones y Estadísticas */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ted-red uppercase tracking-widest">
                  <Shield className="w-4 h-4 text-ted-red" />
                  Control de Accesos & Equipo
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Gestión de Usuarios y Roles
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Administra las cuentas del equipo: administradores, validadores financieros, voluntarios de mesa y staff de acreditación.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={loadUsers}
                  variant="outline"
                  className="text-xs border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                  disabled={usersLoading}
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${usersLoading ? 'animate-spin' : ''}`} />
                  Refrescar
                </Button>

                <Button
                  onClick={handleOpenCreateUser}
                  className="bg-ted-red hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-ted-red/20 flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  Nuevo Usuario
                </Button>
              </div>
            </div>

            {/* Mini-Métricas de Roles */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-zinc-800/80">
              <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/60">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Equipo</span>
                <span className="text-xl font-black text-white font-mono">{usersList.length}</span>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/60">
                <span className="text-[10px] uppercase font-bold text-red-400 block">Admins</span>
                <span className="text-xl font-black text-white font-mono">
                  {usersList.filter((u) => u.role === 'ADMIN').length}
                </span>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/60">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Validadores</span>
                <span className="text-xl font-black text-white font-mono">
                  {usersList.filter((u) => u.role === 'VALIDATOR').length}
                </span>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/60">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Voluntarios</span>
                <span className="text-xl font-black text-white font-mono">
                  {usersList.filter((u) => u.role === 'VOLUNTEER').length}
                </span>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/60 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-blue-400 block">Check-in / Staff</span>
                <span className="text-xl font-black text-white font-mono">
                  {usersList.filter((u) => u.role === 'CHECKIN' || u.role === 'STAFF').length}
                </span>
              </div>
            </div>
          </div>

          {/* Filtros por Rol y Buscador */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Pills de Roles */}
            <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-800">
              {[
                { key: 'ALL', label: 'Todos' },
                { key: 'ADMIN', label: 'Admins' },
                { key: 'VALIDATOR', label: 'Validadores' },
                { key: 'VOLUNTEER', label: 'Voluntarios' },
                { key: 'CHECKIN', label: 'Check-in' },
                { key: 'STAFF', label: 'Staff' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setUserRoleFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    userRoleFilter === tab.key
                      ? 'bg-zinc-800 text-white shadow'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Buscador */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-ted-red transition-all"
              />
              {userSearchTerm && (
                <button
                  onClick={() => setUserSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Directorio de Usuarios */}
          {usersLoading && usersList.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-ted-red" />
              Cargando directorio de usuarios...
            </div>
          ) : (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
              {/* Vista Desktop (Tabla) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-950/40">
                      <th className="py-3.5 px-6">Usuario / Correo</th>
                      <th className="py-3.5 px-4">Rol Asignado</th>
                      <th className="py-3.5 px-4 text-center">Actividad Registrada</th>
                      <th className="py-3.5 px-4">Fecha Creación</th>
                      <th className="py-3.5 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {usersList
                      .filter((u) => {
                        const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                        const matchesSearch =
                          !userSearchTerm.trim() ||
                          u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearchTerm.toLowerCase());
                        return matchesRole && matchesSearch;
                      })
                      .map((u) => {
                        const roleConfig = getUserRoleBadge(u.role);
                        const totalActivity =
                          (u._count?.ordersReviewed || 0) +
                          (u._count?.ordersCollected || 0) +
                          (u._count?.ticketsChecked || 0);

                        return (
                          <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-xs uppercase shrink-0">
                                  {u.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-white">{u.name}</p>
                                  <p className="text-zinc-400 text-[11px] font-mono">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleConfig.badgeClass}`}
                              >
                                <Shield className="w-3 h-3" />
                                {roleConfig.label}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {totalActivity > 0 ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-[11px] font-mono text-zinc-300">
                                  {u._count?.ordersReviewed ? `${u._count.ordersReviewed} val.` : ''}
                                  {u._count?.ordersCollected ? ` ${u._count.ordersCollected} cobr.` : ''}
                                  {u._count?.ticketsChecked ? ` ${u._count.ticketsChecked} chk.` : ''}
                                </div>
                              ) : (
                                <span className="text-zinc-600 text-[11px] font-mono">—</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-zinc-400 font-mono text-[11px]">
                              {new Date(u.createdAt).toLocaleDateString('es-BO', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEditUser(u)}
                                  title="Editar usuario y rol"
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  title="Eliminar usuario"
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile (Tarjetas) */}
              <div className="md:hidden divide-y divide-zinc-800/60">
                {usersList
                  .filter((u) => {
                    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                    const matchesSearch =
                      !userSearchTerm.trim() ||
                      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      u.email.toLowerCase().includes(userSearchTerm.toLowerCase());
                    return matchesRole && matchesSearch;
                  })
                  .map((u) => {
                    const roleConfig = getUserRoleBadge(u.role);
                    return (
                      <div key={u.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-xs uppercase shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{u.name}</p>
                              <p className="text-zinc-400 text-xs font-mono">{u.email}</p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleConfig.badgeClass}`}
                          >
                            {roleConfig.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                          <span className="font-mono">
                            Registrado: {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditUser(u)}
                              className="h-7 text-xs px-2.5 border-zinc-700 hover:bg-zinc-800"
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(u)}
                              className="h-7 text-xs px-2.5 border-red-900/40 text-red-400 hover:bg-red-950/50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {usersList.filter((u) => {
                const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                const matchesSearch =
                  !userSearchTerm.trim() ||
                  u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                  u.email.toLowerCase().includes(userSearchTerm.toLowerCase());
                return matchesRole && matchesSearch;
              }).length === 0 && (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  No se encontraron usuarios con el filtro o término de búsqueda aplicado.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Crear / Editar Usuario */}
      {userModalOpen && (
        <Modal
          isOpen={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          title={editingUser ? `Editar Usuario: ${editingUser.name}` : 'Crear Nuevo Usuario del Sistema'}
        >
          <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
            {userActionError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{userActionError}</span>
              </div>
            )}

            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5 uppercase tracking-wider text-[11px]">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={userFormName}
                onChange={(e) => setUserFormName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-ted-red text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5 uppercase tracking-wider text-[11px]">
                Correo Electrónico (Login) *
              </label>
              <input
                type="email"
                required
                value={userFormEmail}
                onChange={(e) => setUserFormEmail(e.target.value)}
                placeholder="ejemplo@tedx.local o personal"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-ted-red text-xs sm:text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5 uppercase tracking-wider text-[11px]">
                Rol en la Plataforma *
              </label>
              <select
                value={userFormRole}
                onChange={(e) => setUserFormRole(e.target.value as UserRole)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-ted-red text-xs sm:text-sm"
              >
                <option value="ADMIN">Administrador (Acceso Total y Configuración)</option>
                <option value="VALIDATOR">Validador (Cola Bancaria y Comprobantes)</option>
                <option value="VOLUNTEER">Voluntario (Mesa de Registro, Efectivo y WhatsApp)</option>
                <option value="CHECKIN">Escáner Puerta (Check-in con QR y Aforo)</option>
                <option value="STAFF">Staff General (Apoyo Logístico)</option>
              </select>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                {getUserRoleBadge(userFormRole).desc}
              </p>
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5 uppercase tracking-wider text-[11px]">
                {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso *'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!editingUser}
                  value={userFormPassword}
                  onChange={(e) => setUserFormPassword(e.target.value)}
                  placeholder={editingUser ? 'Dejar vacío para conservar la actual' : 'Mínimo 6 caracteres'}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-3.5 pr-10 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-ted-red text-xs sm:text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                {editingUser
                  ? 'Si no deseas cambiar la clave del usuario, deja este campo en blanco.'
                  : 'El usuario usará este correo y clave para ingresar al sistema.'}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUserModalOpen(false)}
                disabled={userActionLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-ted-red hover:bg-red-700 text-white font-bold"
                disabled={userActionLoading}
              >
                {userActionLoading
                  ? 'Guardando...'
                  : editingUser
                  ? 'Actualizar Usuario'
                  : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Crear / Editar Categoría de Entrada */}
      {ticketModalOpen && (
        <Modal
          isOpen={ticketModalOpen}
          onClose={() => setTicketModalOpen(false)}
          title={editingTicket ? `Editar Entrada: ${editingTicket.name}` : 'Nueva Entrada / Tarifa Oficial'}
        >
          <form onSubmit={handleSaveTicket} className="space-y-4 text-xs">
            {ticketActionError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{ticketActionError}</span>
              </div>
            )}

            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5 uppercase tracking-wider text-[11px]">
                Nombre de la Entrada *
              </label>
              <input
                type="text"
                required
                value={ticketFormName}
                onChange={(e) => setTicketFormName(e.target.value)}
                placeholder="Ej. General, Estudiantes USFX, VIP..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-ted-red"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5 uppercase tracking-wider text-[11px]">
                Precio en Bolivianos (Bs) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold text-xs">
                  Bs
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={ticketFormPrice}
                  onChange={(e) => setTicketFormPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="50"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-ted-red"
                />
              </div>
            </div>

            {editingTicket && (
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                <input
                  type="checkbox"
                  id="ticketActive"
                  checked={ticketFormActive}
                  onChange={(e) => setTicketFormActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-ted-red focus:ring-ted-red"
                />
                <label htmlFor="ticketActive" className="text-xs text-zinc-300 cursor-pointer">
                  Entrada activa y visible para compra en la Landing Page
                </label>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTicketModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={ticketActionLoading}
                className="bg-ted-red hover:bg-red-700 text-white font-bold"
              >
                {editingTicket ? 'Guardar Cambios' : 'Crear Entrada'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Crear/Editar Speaker */}
      {speakerModalOpen && (
        <Modal
          isOpen={speakerModalOpen}
          onClose={() => setSpeakerModalOpen(false)}
          title={editingSpeaker ? 'Editar Orador / Afiche' : 'Añadir Nuevo Orador'}
        >
          <form onSubmit={handleSaveSpeaker} className="space-y-4 text-xs">
            <div className="p-3 bg-red-950/25 border border-ted-red/30 rounded-xl text-zinc-300 space-y-1">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-ted-red"></span>
                Tarjeta de Afiche Oficial
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Ingresa el nombre del orador y sube su afiche gráfico. La tarjeta en la web mostrará el arte oficial en alta definición con todo su contenido (tema, fecha y lugar).
              </p>
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5">Nombre del Orador *</label>
              <input
                type="text"
                required
                value={speakerFormName}
                onChange={(e) => setSpeakerFormName(e.target.value)}
                placeholder="Ej. Erick Mita"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-ted-red"
              />
            </div>

            <div className="space-y-2">
              <label className="text-zinc-300 font-semibold block">Afiche Oficial / Imagen (Diseño Vertical)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <label className="text-zinc-400 block text-[11px] mb-1.5">Subir Archivo de Imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSpeakerFormImage(e.target.files?.[0] || null)}
                    className="w-full text-zinc-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-zinc-800 file:text-white file:hover:bg-zinc-700 cursor-pointer"
                  />
                  {speakerFormImage && (
                    <p className="text-[10px] text-emerald-400 mt-1 font-mono truncate">
                      Archivo cargado: {speakerFormImage.name}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <label className="text-zinc-400 block text-[11px] mb-1.5">O URL Directa del Afiche</label>
                  <input
                    type="text"
                    value={speakerFormImageUrl}
                    onChange={(e) => setSpeakerFormImageUrl(e.target.value)}
                    placeholder="https://... o /images/..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-ted-red"
                  />
                </div>
              </div>
            </div>

            {/* Vista previa del afiche */}
            {(speakerFormImage || speakerFormImageUrl || (editingSpeaker && editingSpeaker.imageUrl)) && (
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-4">
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-black border border-zinc-800 flex-shrink-0">
                  <img
                    src={speakerFormImage ? URL.createObjectURL(speakerFormImage) : (speakerFormImageUrl || editingSpeaker?.imageUrl)}
                    alt="Preview Afiche"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[11px] text-zinc-400 space-y-0.5">
                  <p className="font-semibold text-white">Vista previa del afiche</p>
                  <p className="text-[10px] text-zinc-500">Se lucirá tal cual como tarjeta de afiche en la portada.</p>
                </div>
              </div>
            )}

            <div>
              <label className="text-zinc-400 block mb-1">Orden de Presentación (opcional)</label>
              <input
                type="number"
                min={1}
                value={speakerFormOrder}
                onChange={(e) => setSpeakerFormOrder(Number(e.target.value))}
                className="w-24 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-ted-red"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setSpeakerModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={speakerLoading}
                className="bg-ted-red hover:bg-red-700 text-white font-bold"
              >
                {speakerLoading ? 'Guardando...' : editingSpeaker ? 'Guardar Cambios' : 'Crear Orador'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Editar Plantilla de Certificado */}
      {templateModalCategory && (
        <Modal
          isOpen={Boolean(templateModalCategory)}
          onClose={() => setTemplateModalCategory(null)}
          title={`Actualizar Plantilla de Certificado: ${templateModalCategory}`}
        >
          <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1">Título del Certificado</label>
              <input
                type="text"
                required
                value={templateFormTitle}
                onChange={(e) => setTemplateFormTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-ted-red"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">Texto Descriptivo del Reconocimiento</label>
              <textarea
                rows={3}
                value={templateFormDesc}
                onChange={(e) => setTemplateFormDesc(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-ted-red"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">Subir Imagen de Fondo (1920x1080 recomendado)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setTemplateFormImage(e.target.files?.[0] || null)}
                className="w-full text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-zinc-800 file:text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setTemplateModalCategory(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={templateLoading}
                className="bg-ted-red hover:bg-red-700 text-white"
              >
                {templateLoading ? 'Subiendo...' : 'Actualizar Plantilla'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Emisión Manual de Certificado */}
      {manualCertModalOpen && (
        <Modal
          isOpen={manualCertModalOpen}
          onClose={() => setManualCertModalOpen(false)}
          title="Emisión Manual de Certificado Especial"
        >
          <form onSubmit={handleIssueManualCertificate} className="space-y-4 text-xs">
            {manualCertMessage && (
              <div
                className={`p-3 rounded-lg border ${
                  manualCertMessage.startsWith('Error')
                    ? 'bg-red-950/60 border-red-800 text-red-200'
                    : 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                }`}
              >
                {manualCertMessage}
              </div>
            )}

            <div>
              <label className="text-zinc-400 block mb-1">Nombre Completo del Beneficiario *</label>
              <input
                type="text"
                required
                value={manualCertName}
                onChange={(e) => setManualCertName(e.target.value)}
                placeholder="Ej. Juan Carlos Flores"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-ted-red"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">Carnet de Identidad (CI) *</label>
              <input
                type="text"
                required
                value={manualCertDoc}
                onChange={(e) => setManualCertDoc(e.target.value)}
                placeholder="Ej. 8492019"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-ted-red"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">Categoría del Certificado *</label>
              <select
                value={manualCertCategory}
                onChange={(e) => setManualCertCategory(e.target.value as CertificateCategory)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-ted-red"
              >
                <option value="VOLUNTEER">Voluntario / Staff de Organización</option>
                <option value="SPEAKER">Orador / Speaker Oficial</option>
                <option value="VIP">Distinción Especial / VIP / Auspiciador</option>
                <option value="ATTENDEE">Asistente Acreditado</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setManualCertModalOpen(false)}>
                Cerrar
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-ted-red hover:bg-red-700 text-white">
                Emitir Certificado con QR
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Inspección de Orden y Validación Express */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Validación Express de Orden: #${selectedOrder?.orderNumber}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {actionMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  actionMessage.startsWith('Error')
                    ? 'bg-red-950/80 text-red-200 border border-red-800'
                    : 'bg-emerald-950/80 text-emerald-200 border border-emerald-800'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionMessage}</span>
              </div>
            )}

            {/* Vista Dividida (Split Screen): Comprobante vs. Datos de la Orden */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda: Comprobante Visual */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Comprobante Adjunto
                  </label>
                  {selectedOrder.proofReceiptUrl && (
                    <a
                      href={selectedOrder.proofReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-ted-red hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir en grande</span>
                    </a>
                  )}
                </div>

                {selectedOrder.proofReceiptUrl ? (
                  selectedOrder.proofReceiptUrl.endsWith('.pdf') ? (
                    <div className="p-8 text-center border border-zinc-800 rounded-2xl bg-zinc-950 space-y-4">
                      <p className="text-sm font-semibold text-white">Comprobante en formato PDF</p>
                      <a
                        href={selectedOrder.proofReceiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <Button size="sm" variant="outline" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          Abrir PDF en Nueva Ventana
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 p-2 flex items-center justify-center min-h-[260px] max-h-[380px]">
                      <img
                        src={selectedOrder.proofReceiptUrl}
                        alt="Comprobante"
                        className="max-h-[360px] w-auto object-contain rounded-xl shadow-lg"
                      />
                    </div>
                  )
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/60 min-h-[200px] flex flex-col items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-zinc-600 mb-2" />
                    <p className="font-semibold text-zinc-300">Sin comprobante subido en web</p>
                    <p className="text-zinc-500 mt-1 max-w-[220px]">
                      {selectedOrder.paymentMethod === 'CASH'
                        ? 'Cobro en efectivo realizado en mesa por voluntario.'
                        : 'El comprobante puede haber sido enviado directamente por WhatsApp.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Columna Derecha: Datos del Comprador y Acreditación */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <span className="text-xs text-zinc-400">Total a Validar</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      Bs {selectedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Comprador</span>
                      <strong className="text-white">{selectedOrder.buyerName}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">CI / Cédula</span>
                      <strong className="text-white font-mono">{selectedOrder.buyerDocumentId}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Celular / WhatsApp</span>
                      <span className="text-zinc-300 font-mono">{selectedOrder.buyerPhone}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Referencia</span>
                      <span className="text-amber-400 font-mono font-bold">
                        {selectedOrder.proofReferenceNumber || 'Sin referencia'}
                      </span>
                    </div>
                  </div>

                  {/* Botón rápido para contactar al comprador por WhatsApp */}
                  <div className="pt-2 border-t border-zinc-800/80">
                    <a
                      href={getBuyerWhatsAppLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Contactar al Comprador por WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Lista de Boletos y Asistentes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Asistentes ({selectedOrder.tickets?.length || 0})
                    </label>
                    <Badge status={selectedOrder.status} />
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {selectedOrder.tickets?.map((t, idx) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs"
                      >
                        <div>
                          <span className="font-bold text-white">#{idx + 1} {t.attendeeName}</span>
                          <span className="text-zinc-400 ml-2 font-mono">CI: {t.attendeeDocumentId}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium border border-zinc-700">
                          {t.ticketType?.name || 'Entrada'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones de Validación Express */}
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              {selectedOrder.status !== 'APPROVED' ? (
                <div className="space-y-4">
                  {/* Píldoras Rápidas de Rechazo */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Motivos Rápidos de Rechazo (1 Clic):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {quickRejectPills.map((pill) => (
                        <button
                          key={pill}
                          type="button"
                          onClick={() => setRejectReason(pill)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            rejectReason === pill
                              ? 'bg-red-900/60 border-red-500 text-red-200'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          {pill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Nota interna de aprobación (Opcional)..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-ted-red"
                    />

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Razón de rechazo..."
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={actionLoading}
                        onClick={handleReject}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>

                  {/* Botones de Aprobación y Eliminación */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteOrder(selectedOrder.id, selectedOrder.orderNumber)}
                      leftIcon={<Trash2 className="w-4 h-4 text-rose-400" />}
                      className="border-zinc-800 hover:border-rose-900 text-zinc-400 hover:text-rose-400 text-xs w-full sm:w-auto"
                    >
                      Eliminar Orden
                    </Button>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="md"
                        isLoading={actionLoading}
                        onClick={handleApprove}
                        leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        className="w-full sm:w-auto"
                      >
                        Aprobar Orden
                      </Button>

                      <Button
                        variant="primary"
                        size="md"
                        isLoading={actionLoading}
                        onClick={handleApproveAndNotifyWhatsApp}
                        leftIcon={<MessageCircle className="w-4 h-4" />}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/40"
                      >
                        Aprobar y Notificar por WhatsApp
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Esta orden fue aprobada y los boletos con código QR están activos.</span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteOrder(selectedOrder.id, selectedOrder.orderNumber)}
                      leftIcon={<Trash2 className="w-4 h-4 text-rose-400" />}
                      className="border-zinc-800 hover:border-rose-900 text-zinc-400 hover:text-rose-400 text-xs"
                    >
                      Eliminar Orden de Prueba
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Confirmación Global de Acciones Críticas */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        cancelText={confirmModalConfig.cancelText}
        variant={confirmModalConfig.variant}
        isLoading={confirmModalConfig.isLoading}
      />

      {/* Modal de Alerta / Notificación UI del Sistema */}
      <AlertModal
        isOpen={alertModalConfig.isOpen}
        onClose={closeAlert}
        title={alertModalConfig.title}
        message={alertModalConfig.message}
        type={alertModalConfig.type}
        buttonText={alertModalConfig.buttonText}
      />
    </div>
  );
};

export default AdminDashboardPage;
