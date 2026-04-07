# Konvierte Financial API - Documentación Oficial 🚀

Konvierte es una infraestructura de datos financieros resiliente diseñada para el ecosistema digital venezolano. Ofrece acceso programático a tasas de cambio oficiales (BCV) y mercado P2P (Binance) con redundancia total.

## 🔌 Base URL
Todas las peticiones deben realizarse a la siguiente URL raíz:
`https://konvierte.vercel.app/api`

---

## 🏗️ Endpoints Disponibles

### 1. Global Rates (Tasas Completas) 🌍
Retorna un objeto JSON con todas las tasas disponibles (BCV + Binance P2P).
- **Endpoint**: `/rates`
- **Método**: `GET`
- **URL Completa**: `https://konvierte.vercel.app/api/rates`

### 2. Dólar BCV 💵
Tasa oficial del Banco Central de Venezuela.
- **Endpoint**: `/usd`
- **Método**: `GET`
- **URL Completa**: `https://konvierte.vercel.app/api/usd`

### 3. Euro BCV 💶
Tasa oficial en Euros del Banco Central de Venezuela.
- **Endpoint**: `/eur`
- **Método**: `GET`
- **URL Completa**: `https://konvierte.vercel.app/api/eur`

### 4. USDT Binance P2P ⚡
Promedio ponderado del mercado P2P en Binance.
- **Endpoint**: `/usdt`
- **Método**: `GET`
- **URL Completa**: `https://konvierte.vercel.app/api/usdt`

### 5. Histórico (Completo) 🕰️
Serie temporal de registros financieros históricos. Ahora retorna todos los valores disponibles (sin límites por defecto) en formato compatible con DolarAPI.
- **Endpoint**: `/history`
- **Método**: `GET`
- **Parámetros**: `days` (opcional), `currency` (opcional), `limit` (opcional)
- **URL Completa**: `https://konvierte.vercel.app/api/history`

### 6. Mirror Endpoints (DolarAPI 1:1) 🔄
Para máxima compatibilidad con aplicaciones existentes:
- **Dólares**: `/api/v1/historicos/dolares`
- **Euros**: `/api/v1/historicos/euros`
- **Formato**: Retorna un Array directo `[...]` como se muestra en la referencia.

### 7. Health Status 🟢
Estado operacional de los microservicios y scraper.
- **Endpoint**: `/status`
- **Método**: `GET`
- **URL Completa**: `https://konvierte.vercel.app/api/status`

---

## 💻 Ejemplos de Implementación

### Javascript (Fetch API)
```javascript
fetch("https://konvierte.vercel.app/api/rates")
  .then(res => res.json())
  .then(data => console.log(data));
```

### Python (Requests)
```python
import requests
response = requests.get("https://konvierte.vercel.app/api/rates")
data = response.json()
print(data)
```

### cURL
```bash
curl -X GET "https://konvierte.vercel.app/api/rates"
```

---

## 🏛️ Desarrollador & Licencia
- **Arquitecto**: Rubel Maneiro
- **GitHub**: [rmaneiro28](https://github.com/rmaneiro28)
- **Licencia**: Proyecto de Código Abierto (Open Source).
