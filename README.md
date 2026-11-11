# TEDx Innova - Frontend Web App

Aplicación web desarrollada en **React 18 + Vite + TypeScript** y estilizada con **Tailwind CSS** para la plataforma oficial de venta de entradas, consulta de credenciales y acreditación en puerta del evento **TEDx Innova**.

---

## 🛠️ Tecnologías

- **React + Vite**: SPA ultrarrápida construida con TypeScript.
- **Tailwind CSS**: Diseño moderno con identidad de marca TEDx (acento rojo `#EB0028`, fondos de alto contraste y tipografía Inter).
- **Lucide React**: Iconografía minimalista y accesible.
- **HTML5-QRCode**: Escáner de códigos QR en tiempo real mediante cámara web o dispositivo móvil para el Staff.
- **Canvas-Confetti**: Feedback visual interactivo en la confirmación de compras y órdenes aprobadas.

---

## 🚀 Instalación y Puesta en Marcha

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## 📱 Módulos de la Aplicación

- **Landing Page**: Información oficial del evento, conferencistas, cronograma y selección interactiva de entradas por categorías.
- **Checkout**: Formulario de acreditación individual de cada asistente, datos bancarios con copiado rápido y subida de comprobantes con vista previa.
- **Consulta de Orden**: Estado en tiempo real del pedido y visualización de boletos con códigos QR generados.
- **Credencial Digital**: Vista individual y versión imprimible para asistentes.
- **Panel Administrativo (`/admin`)**: Métricas de ventas, visualización y aprobación/rechazo de pagos por transferencia.
- **Escáner Staff (`/checkin`)**: Lector de códigos QR con la cámara web, feedback sonoro/visual y prevención de reingresos duplicados.
