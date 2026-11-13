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
} from 'lucide-react';
import {
  DashboardStats,
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
} from '../types/index.js';
import { api } from '../services/api.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';

export const AdminDashboardPage: React.FC = () => {
  const [activeAdminTab, setActiveAdminTab] = useState<'orders' | 'speakers' | 'certificates' | 'tickets' | 'payment' | 'backgrounds' | 'whatsapp'>('orders');

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
  const [editingTicket, setEditingTicket] = useState<TicketTypeData | null>(null);
  const [ticketPriceInput, setTicketPriceInput] = useState<number>(0);
  const [ticketQuotaInput, setTicketQuotaInput] = useState<number>(0);

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
      const res = await api.getPublicEvent();
      setTicketTypes(res.event.ticketTypes);
    } catch (err) {
      console.error('Error cargando tickets:', err);
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

  const handleLogoutWhatsApp = async () => {
    if (!confirm('¿Estás seguro de que deseas desvincular y cerrar la sesión del número actual de WhatsApp?')) return;
    setWaActionLoading(true);
    setWaMsg(null);
    try {
      await api.logoutWhatsAppInstance();
      setWaMsg({ type: 'success', text: 'Dispositivo desvinculado. Escanea el nuevo código QR o genera un código para conectar.' });
      await loadWhatsAppStatus();
    } catch (err: any) {
      setWaMsg({ type: 'error', text: err.message || 'Error al desvincular dispositivo.' });
    } finally {
      setWaActionLoading(false);
    }
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
    loadWhatsAppStatus(true);
    loadWhatsAppQueueStats();
  }, [statusFilter]);

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

  const handleDeleteBackground = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta imagen de fondo?')) return;
    try {
      await api.deleteBackgroundImage(id);
      loadBackgrounds();
    } catch (err: any) {
      alert('Error al eliminar imagen');
    }
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

  // =====================
  // Acciones Speakers
  // =====================
  const handleOpenSpeakerModal = (speaker?: SpeakerData) => {
    if (speaker) {
      setEditingSpeaker(speaker);
      setSpeakerFormName(speaker.name);
      setSpeakerFormRole(speaker.role);
      setSpeakerFormTopic(speaker.topic);
      setSpeakerFormBio(speaker.bio || '');
      setSpeakerFormOrder(speaker.order);
      setSpeakerFormImageUrl(speaker.imageUrl);
    } else {
      setEditingSpeaker(null);
      setSpeakerFormName('');
      setSpeakerFormRole('');
      setSpeakerFormTopic('');
      setSpeakerFormBio('');
      setSpeakerFormOrder(speakers.length + 1);
      setSpeakerFormImageUrl('');
    }
    setSpeakerFormImage(null);
    setSpeakerModalOpen(true);
  };

  const handleSaveSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSpeakerLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', speakerFormName);
      formData.append('role', speakerFormRole);
      formData.append('topic', speakerFormTopic);
      formData.append('bio', speakerFormBio);
      formData.append('order', String(speakerFormOrder));

      if (speakerFormImage) {
        formData.append('image', speakerFormImage);
      } else if (speakerFormImageUrl) {
        formData.append('imageUrl', speakerFormImageUrl);
      }

      if (editingSpeaker) {
        await api.updateSpeaker(editingSpeaker.id, formData);
      } else {
        await api.createSpeaker(formData);
      }

      setSpeakerModalOpen(false);
      await loadSpeakers();
    } catch (err: any) {
      alert(`Error al guardar speaker: ${err.message}`);
    } finally {
      setSpeakerLoading(false);
    }
  };

  const handleDeleteSpeaker = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este orador?')) return;
    try {
      await api.deleteSpeaker(id);
      await loadSpeakers();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
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
      await loadTemplates();
    } catch (err: any) {
      alert(`Error al actualizar plantilla: ${err.message}`);
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
  const handleSaveTicketPrice = async (ticketId: string) => {
    try {
      await api.updateTicketType(ticketId, {
        price: Number(ticketPriceInput),
        totalQuota: Number(ticketQuotaInput),
      });
      setEditingTicket(null);
      await loadTicketTypes();
      await loadData();
    } catch (err: any) {
      alert(`Error al actualizar precio: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header y Selector de Secciones Principales */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Panel de Administración TEDx USFX
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Gestión de pagos bancarios, conferencistas, plantillas de certificados y tarifas oficiales en Bs.
          </p>
        </div>

        {/* Pestañas de Navegación del Admin (Mobile-First Touch Swipeable) */}
        <div className="w-full overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pt-2">
          <div className="inline-flex min-w-max bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 gap-1.5">
            <button
              onClick={() => setActiveAdminTab('orders')}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeAdminTab === 'orders' ? 'bg-ted-red text-white shadow-lg shadow-ted-red/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Órdenes y Validaciones</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('speakers')}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeAdminTab === 'speakers' ? 'bg-ted-red text-white shadow-lg shadow-ted-red/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Speakers Oficiales</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('certificates')}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeAdminTab === 'certificates' ? 'bg-ted-red text-white shadow-lg shadow-ted-red/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Plantillas de Certificados</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('tickets')}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeAdminTab === 'tickets' ? 'bg-ted-red text-white shadow-lg shadow-ted-red/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Entradas y Precios (Bs)</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('payment')}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeAdminTab === 'payment' ? 'bg-ted-red text-white shadow-lg shadow-ted-red/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Configuración Pago QR</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('backgrounds')}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeAdminTab === 'backgrounds' ? 'bg-ted-red text-white shadow-lg shadow-ted-red/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Imágenes de Fondo</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('whatsapp')}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeAdminTab === 'whatsapp' ? 'bg-ted-red text-white shadow-lg shadow-ted-red/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp API (Evolution)</span>
              {waStatus && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    waStatus.state === 'open'
                      ? 'bg-emerald-400 animate-pulse'
                      : waStatus.state === 'connecting'
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-rose-500'
                  }`}
                />
              )}
            </button>
          </div>
        </div>
      </div>

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

                  {/* Botón de Acción Móvil */}
                  <Button
                    size="sm"
                    variant={o.status === 'PAYMENT_SUBMITTED' ? 'primary' : 'outline'}
                    leftIcon={<Eye className="w-4 h-4" />}
                    className="w-full justify-center py-2.5 font-bold text-xs"
                    onClick={() => {
                      setSelectedOrder(o);
                      setAdminNotes('');
                      setRejectReason('');
                      setActionMessage(null);
                    }}
                  >
                    {o.status === 'PAYMENT_SUBMITTED' ? 'Revisar y Validar Comprobante' : 'Ver Detalles de Orden'}
                  </Button>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {speakers.map((sp) => (
              <div
                key={sp.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/5] bg-zinc-950 relative overflow-hidden">
                    <img
                      src={sp.imageUrl}
                      alt={sp.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-xs font-mono text-zinc-300">
                      Orden: {sp.order}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-white text-base">{sp.name}</h3>
                    <p className="text-xs font-semibold text-ted-red uppercase tracking-wider">{sp.role}</p>
                    <p className="text-xs text-zinc-300 italic">"{sp.topic}"</p>
                    {sp.bio && <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">{sp.bio}</p>}
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-zinc-800/80 flex items-center justify-end space-x-2 mt-2">
                  <button
                    onClick={() => handleOpenSpeakerModal(sp)}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSpeaker(sp.id)}
                    className="p-1.5 rounded hover:bg-red-950 text-zinc-400 hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-ted-red" />
              <span>Categorías de Entradas y Tarifas Oficiales (Bs)</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Ajusta los precios en moneda nacional boliviana (Bs) y los cupos de aforo para cada categoría.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ticketTypes.map((tt) => {
              const isEditing = editingTicket?.id === tt.id;

              return (
                <div
                  key={tt.id}
                  className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white">{tt.name}</h3>
                    {tt.remainingQuota <= 0 && (
                      <Badge variant="danger">Agotado</Badge>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 min-h-[40px]">{tt.description}</p>

                  <div className="pt-4 border-t border-zinc-800 space-y-3">
                    <div>
                      <span className="text-xs text-zinc-500 block">Tarifa Oficial:</span>
                      {isEditing ? (
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-zinc-400 text-sm font-bold font-mono">Bs</span>
                          <input
                            type="number"
                            value={ticketPriceInput}
                            onChange={(e) => setTicketPriceInput(Number(e.target.value))}
                            className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono w-28 focus:outline-none focus:border-ted-red"
                          />
                        </div>
                      ) : (
                        <span className="text-2xl font-black text-white font-mono">
                          Bs {tt.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-xs text-zinc-500 block">Cupo Total:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={ticketQuotaInput}
                          onChange={(e) => setTicketQuotaInput(Number(e.target.value))}
                          className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono w-28 mt-1 focus:outline-none focus:border-ted-red"
                        />
                      ) : (
                        <span className="text-sm font-mono text-zinc-300">
                          {tt.totalQuota} entradas totales
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex justify-end">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTicket(null)}
                          className="text-xs"
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveTicketPrice(tt.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center space-x-1"
                        >
                          <Save className="w-3.5 h-3.5 mr-1" />
                          <span>Guardar</span>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTicket(tt);
                          setTicketPriceInput(tt.price);
                          setTicketQuotaInput(tt.totalQuota);
                        }}
                        className="text-xs border-zinc-700 text-zinc-300"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Editar Precio y Cupo
                      </Button>
                    )}
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
              <button onClick={() => setWaMsg(null)} className="text-zinc-400 hover:text-white ml-2">
                ✕
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

      {/* MODAL: Crear/Editar Speaker */}
      {speakerModalOpen && (
        <Modal
          isOpen={speakerModalOpen}
          onClose={() => setSpeakerModalOpen(false)}
          title={editingSpeaker ? 'Editar Orador' : 'Añadir Nuevo Orador'}
        >
          <form onSubmit={handleSaveSpeaker} className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={speakerFormName}
                onChange={(e) => setSpeakerFormName(e.target.value)}
                placeholder="Ej. Dra. Camila Valenzuela"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-ted-red"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">Cargo / Especialidad *</label>
              <input
                type="text"
                required
                value={speakerFormRole}
                onChange={(e) => setSpeakerFormRole(e.target.value)}
                placeholder="Ej. Investigadora en Inteligencia Artificial"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-ted-red"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">Tema de la Conferencia *</label>
              <input
                type="text"
                required
                value={speakerFormTopic}
                onChange={(e) => setSpeakerFormTopic(e.target.value)}
                placeholder="Ej. El impacto ético de los modelos generativos"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-ted-red"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">Biografía Breve</label>
              <textarea
                rows={2}
                value={speakerFormBio}
                onChange={(e) => setSpeakerFormBio(e.target.value)}
                placeholder="Trayectoria y logros principales..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-ted-red"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Subir Foto (Archivo)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSpeakerFormImage(e.target.files?.[0] || null)}
                  className="w-full text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-zinc-800 file:text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">O URL de Foto</label>
                <input
                  type="text"
                  value={speakerFormImageUrl}
                  onChange={(e) => setSpeakerFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-ted-red"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">Orden de Presentación</label>
              <input
                type="number"
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
                className="bg-ted-red hover:bg-red-700 text-white"
              >
                {speakerLoading ? 'Guardando...' : 'Guardar Orador'}
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

                  {/* Botones de Aprobación */}
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
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
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Esta orden fue aprobada y los boletos con código QR están activos.</span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboardPage;
