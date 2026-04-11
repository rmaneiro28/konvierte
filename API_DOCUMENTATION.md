# Konvierte Financial API - Documentación Oficial 🚀

Konvierte es una infraestructura de datos financieros resiliente diseñada para el ecosistema digital venezolano. Ofrece acceso programático a tasas de cambio oficiales (BCV) y mercado P2P (Binance) con redundancia total.

## 🔌 Base URL
Todas las peticiones deben realizarse a la siguiente URL raíz:
`https://konvierte.vercel.app/docs/api`

---

## 🏗️ Endpoints Disponibles

### 1. Health Status 🟢
Verifica el estado operacional de los microservicios y el scraper.
- **Endpoint**: `/status`
- **Respuesta**:
```json
{
  "status": "operational",
  "uptime": 0.1632,
  "timestamp": "2026-04-10T00:44:07.096Z",
  "engine": "Konvierte v1.1.0-STABLE",
  "services": {
    "bcv_scraper": "active",
    "binance_p2p_average": "active",
    "supabase_connection": "operational"
  }
}
```

### 2. Global Rates (Tasas Completas) 🌍
Retorna un objeto con todas las tasas disponibles sincronizadas en tiempo real.
- **Endpoint**: `/rates`
- **Parámetros (Query)**:
    - `currency`: (Opcional) Filtrar por moneda (USD, EUR, USDT).
- **Respuesta**: Un objeto con las claves `USD`, `EUR` y `USDT`.

### 3. Dólar & Euro BCV 💵💶
Tasas oficiales del Banco Central de Venezuela.
- **Endpoints**: `/usd`, `/eur`
- **Estructura de Respuesta**:
```json
{
  "currency": "USD",
  "price": 476.43,
  "symbol": "BS",
  "source": "Banco Central de Venezuela",
  "last_updated": "2026-04-10T00:30:16.168Z",
  "date_rate": "2026-04-10"
}
```

### 4. USDT Binance P2P ⚡
Promedio representativo del mercado USDT/VES en Binance.
- **Endpoint**: `/usdt`
- **Respuesta**: Similar a los anteriores, con `source: "Binance P2P"`.

### 5. Histórico Inteligente 🕰️
Serie temporal de registros financieros. Ideal para gráficas.
- **Endpoint**: `/history`
- **Parámetros (Query)**:
    - `days`: Número de días atrás (ej: 7, 30, 365).
    - `currency`: Filtrar por moneda específica.
    - `limit`: Cantidades de registros por página.
- **URL Completa**: `https://konvierte.vercel.app/docs/api/history?days=30&currency=USD`

### 6. Series Directas (Arrays Planos) 🔄
Endpoints optimizados para descarga masiva de datos por moneda. Proporcionan el historial **completo sin recortes por defecto**.
- **Dólares**: `/historicos/dolares`
- **Euros**: `/historicos/euros`
- **USDT**: `/historicos/usdt`

### 7. Bancos de Venezuela 🏦
Información institucional de las entidades bancarias venezolanas.
- **Endpoint**: `/banks`
- **Nota**: Este endpoint **no retorna tasas de cambio**, proporciona nombres oficiales, RIF, URLs y logos de los bancos.
- **Estructura de Respuesta**:
```json
[
  {
    "codigo_banco": "0102",
    "nombre_banco": "Banco de Venezuela",
    "nombre_completo": "Banco de Venezuela, S.A. Banco Universal",
    "nombre_corto": "BDV",
    "rif": "G200099976",
    "url": "http://www.bancodevenezuela.com/",
    "logo": "https://www.bancodevenezuela.com/wp-content/uploads/2022/07/cropped-popup-192x192.png"
  },
  ...
]
```

---

## 💻 Ejemplos de Implementación

### Javascript (Fetch API)
```javascript
async function getRates() {
  const res = await fetch("https://konvierte.vercel.app/docs/api/rates");
  const data = await res.json();
  console.log("USD Rate:", data.USD.price);
}
```

### Python (Requests)
```python
import requests
res = requests.get("https://konvierte.vercel.app/docs/api/usd")
print(f"La tasa es: {res.json()['price']}")
```

---

## 🏛️ Desarrollador & Licencia
- **Arquitecto**: Rubel Maneiro
- **GitHub**: [rmaneiro28](https://github.com/rmaneiro28)
- **Estado**: Producción Estable (v1.1.0)
