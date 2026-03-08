import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

let notificationId = 1;

/**
 * Solicita permiso de notificaciones (solo en plataforma nativa).
 * Debe llamarse una vez al inicio de la app.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return false;

    try {
        const { display } = await LocalNotifications.checkPermissions();
        if (display === 'granted') return true;

        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
    } catch (e) {
        console.warn('[Notifications] Error al solicitar permisos:', e);
        return false;
    }
};

export interface RateNotificationPayload {
    name: string;      // Ej: "Dólar BCV"
    price: number;     // Nuevo precio
    prevPrice: number; // Precio anterior
}

/**
 * Envía una notificación local cuando cambia una tasa de cambio.
 */
export const sendRateUpdateNotification = async (
    payload: RateNotificationPayload
): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return;

    try {
        const { display } = await LocalNotifications.checkPermissions();
        if (display !== 'granted') return;

        const diff = payload.price - payload.prevPrice;
        const diffPct = payload.prevPrice > 0
            ? Math.abs((diff / payload.prevPrice) * 100).toFixed(2)
            : '0.00';
        const arrow = diff > 0 ? '📈' : diff < 0 ? '📉' : '➡️';
        const dir = diff > 0 ? 'subió' : diff < 0 ? 'bajó' : 'sin cambio';

        const title = `${arrow} ${payload.name} actualizado`;
        const body = `La tasa ${dir} a Bs. ${payload.price.toFixed(2)} (${diff > 0 ? '+' : ''}${diffPct}%)`;

        await LocalNotifications.schedule({
            notifications: [
                {
                    id: notificationId++,
                    title,
                    body,
                    schedule: { at: new Date(Date.now() + 500) }, // leve delay para evitar conflictos
                    sound: undefined,
                    smallIcon: 'ic_stat_icon_config_sample',
                    iconColor: '#7C3AED',
                    extra: { rateId: payload.name, price: payload.price },
                },
            ],
        });
    } catch (e) {
        console.warn('[Notifications] Error al enviar notificación:', e);
    }
};
