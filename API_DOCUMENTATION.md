# 🚀 Konvierte API Public Documentation v1.0

¡Bienvenido a la API oficial de **Konvierte**! La herramienta definitiva para desarrolladores que necesitan tasas de cambio en tiempo real para Venezuela con redundancia inteligente.

---

## 📍 Endpoint Único

Para obtener las tasas actuales, realiza una petición **GET** a la siguiente URL:

```http
GET https://konvierte.vercel.app/api/rates
```

---

## ⚡ Respuesta (JSON)

La API responde con un objeto JSON optimizado que incluye tasas oficiales y el promedio P2P de Binance.

### **Ejemplo de Respuesta**
```json
{
  "rates": {
    "usd_bcv": 47.06,
    "eur_bcv": 51.12,
    "usdt_binance": 54.25
  },
  "sources": {
    "official": "BCV (Sitio Web Oficial)",
    "p2p": "Binance P2P (USDT/VES)"
  },
  "last_updated": "2026-04-06T19:35:00Z",
  "status": "online",
  "database_synced": true
}
```

---

## 🔍 Definición de Campos

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `usd_bcv` | Number | Tasa oficial del Dólar estadounidense del Banco Central de Venezuela. |
| `eur_bcv` | Number | Tasa oficial del Euro del Banco Central de Venezuela. |
| `usdt_binance` | Number | **Promedio aritmético** de los mejores 10 anuncios de venta en Binance P2P. |
| `last_updated` | ISO8601 | Marca de tiempo exacta de la última recolección de datos. |

---

## 🛠️ Ejemplos de Implementación

### **JavaScript (Fetch)**
```javascript
const getRates = async () => {
    const res = await fetch('https://konvierte.app/api/rates');
    const { rates } = await res.json();
    console.log(`Dólar BCV: ${rates.usd_bcv} BS`);
};
```

### **Python (Requests)**
```python
import requests

url = "https://konvierte.app/api/rates"
response = requests.get(url)
data = response.json()
print(f"USDT Binance: {data['rates']['usdt_binance']} VES")
```

---

## 🛡️ Robustez y Redundancia
Konvierte API utiliza un sistema de **"Intento en Cadena"** para asegurar la disponibilidad del dato:
1. **BCV Web Scraper**: Intenta obtener los datos del sitio oficial del BCV.
2. **Instagram Secondary Scraper**: Si la web oficial está caída, el sistema conmuta automáticamente a fuentes en redes sociales.
3. **Binance P2P Direct API**: Consulta directa a los libros de órdenes de Binance para el mercado VES/USDT.

---

## 📜 Términos de Uso
Esta API es gratuita y abierta para desarrolladores. Se recomienda implementar un caché de al menos **15 minutos** en el lado del cliente para optimizar el rendimiento.

---

*Hecho con ❤️ por [Konvierte Digital](https://konvierte.app).*
