# SafePick Backend - Frontend Integration Guide

## 📋 Resumen Ejecutivo
Backend SafePick es una API NestJS con Prisma 6 y PostgreSQL que implementa un sistema seguro de retiro de menores en escuelas. El frontend debe comunicarse con esta API para autenticar usuarios, gestionar hijos y crear órdenes de retiro.

---

## 🔐 AUTHENTICATION

### 1. Register - Crear nuevo usuario
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "SecurePass123!@",
  "name": "John Doe",
  "role": "PARENT",
  "cedula": "12345678",
  "phone": "+34123456789"
}
```

**Validaciones:**
- Email: formato válido y único
- Password: mínimo 12 caracteres, contiene mayúscula, minúscula, número y carácter especial (@$!%*?&)
- Cedula: 8-13 dígitos
- Phone: formato internacional
- Roles permitidos: PARENT, GUARDIAN, ADMIN, PICKER

**Response Success (201):**
```json
{
  "id": "cmkd249vu0000ugemhuehoxe6",
  "email": "parent@example.com",
  "name": "John Doe",
  "role": "PARENT",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "User created successfully"
}
```

**Response Error:**
- 409: Email already registered
- 400: Validation error

---

### 2. Login - Autenticar usuario
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "SecurePass123!@"
}
```

**Response Success (200):**
```json
{
  "id": "cmkd249vu0000ugemhuehoxe6",
  "email": "parent@example.com",
  "name": "John Doe",
  "role": "PARENT",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Error:**
- 401: Invalid credentials

**Rate Limiting:** 5 intentos en 5 minutos

---

### 3. Token Management
- **Header:** `Authorization: Bearer <token>`
- **Expiration:** 900 segundos (15 minutos)
- **Refresh:** Hacer login nuevamente

---

## 👨‍👩‍👧 CHILDREN MANAGEMENT

### 1. Get My Children - Listar hijos del usuario
**Endpoint:** `GET /children`
**Auth:** Required (PARENT, GUARDIAN)
**Roles Required:** PARENT, GUARDIAN

**Response Success (200):**
```json
[
  {
    "id": "cmkd24a770002ugem2n0p32xd",
    "name": "Emma Doe",
    "grade": "3rd",
    "school": "Lincoln Elementary"
  },
  {
    "id": "cmkd24b880003ugem3o1q32xe",
    "name": "Lucas Doe",
    "grade": "1st",
    "school": "Lincoln Elementary"
  }
]
```

---

### 2. Get Child Details - Obtener detalles de un hijo
**Endpoint:** `GET /children/:childId`
**Auth:** Required (PARENT, GUARDIAN)

**Response Success (200):**
```json
{
  "id": "cmkd24a770002ugem2n0p32xd",
  "name": "Emma Doe",
  "grade": "3rd",
  "school": "Lincoln Elementary",
  "parentId": "cmkd249vu0000ugemhuehoxe6",
  "createdAt": "2026-01-13T20:39:10.545Z",
  "updatedAt": "2026-01-13T20:39:10.545Z"
}
```

---

## 🚪 WITHDRAWAL ORDERS (Sistema de Retiros)

### 1. Create Withdrawal Order - Crear orden de retiro
**Endpoint:** `POST /withdrawals`
**Auth:** Required (PARENT, GUARDIAN)
**Roles Required:** PARENT, GUARDIAN

**Request Body:**
```json
{
  "childId": "cmkd24a770002ugem2n0p32xd",
  "pickerName": "Maria Garcia",
  "pickerCedula": "87654321",
  "pickerPhone": "+34987654321",
  "relationship": "tía"
}
```

**Validaciones:**
- childId: debe existir y pertenecer al usuario
- pickerName: 3-100 caracteres
- pickerCedula: 8-13 dígitos
- pickerPhone: formato internacional
- relationship: debe ser uno de: padre, madre, abuelo, abuela, tío, tía, hermano, hermana, otro

**Response Success (201):**
```json
{
  "withdrawalOrderId": "cmkd24aiq0004ugemjskf6110",
  "message": "Withdrawal order created successfully",
  "pickerInfo": {
    "name": "Maria Garcia",
    "cedula": "87654321",
    "relationship": "tía"
  },
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

**Response Error:**
- 404: Child not found
- 400: Child does not belong to this user

**Rate Limiting:** 20 órdenes por hora

---

### 2. Get Withdrawal Order - Obtener detalles de una orden
**Endpoint:** `GET /withdrawals/:orderId`
**Auth:** Required

**Response Success (200):**
```json
{
  "id": "cmkd24aiq0004ugemjskf6110",
  "childId": "cmkd24a770002ugem2n0p32xd",
  "parentId": "cmkd249vu0000ugemhuehoxe6",
  "status": "COMPLETED",
  "qrCode": "data:image/png;base64,...",
  "withdrawalDate": "2026-01-13T20:41:20.447Z",
  "child": {
    "id": "cmkd24a770002ugem2n0p32xd",
    "name": "Emma Doe",
    "grade": "3rd",
    "school": "Lincoln Elementary"
  },
  "picker": {
    "id": "cmkd24akq0005ugemkslg7221",
    "name": "Maria Garcia",
    "cedula": "87654321",
    "phone": "+34987654321",
    "relationship": "tía"
  }
}
```

---

### 3. Get User Withdrawal Orders - Listar todas las órdenes del usuario
**Endpoint:** `GET /withdrawals`
**Auth:** Required (PARENT, GUARDIAN)
**Roles Required:** PARENT, GUARDIAN

**Response Success (200):**
```json
[
  {
    "id": "cmkd24aiq0004ugemjskf6110",
    "status": "COMPLETED",
    "child": { "name": "Emma Doe" },
    "picker": { "name": "Maria Garcia" },
    "withdrawalDate": "2026-01-13T20:41:20.447Z",
    "createdAt": "2026-01-13T20:39:10.545Z"
  }
]
```

---

### 4. Complete Withdrawal - Completar retiro (Picker o Admin)
**Endpoint:** `POST /withdrawals/:orderId/complete`
**Auth:** Required (ADMIN, PICKER)
**Roles Required:** ADMIN, PICKER

**Response Success (200):**
```json
{
  "success": true,
  "message": "Withdrawal completed successfully",
  "order": {
    "id": "cmkd24aiq0004ugemjskf6110",
    "status": "COMPLETED",
    "withdrawalDate": "2026-01-13T20:41:20.447Z",
    "child": { "name": "Emma Doe" },
    "picker": { "name": "Maria Garcia" }
  }
}
```

**Validaciones:**
- Orden debe estar en estado VALIDATED

---

### 5. Cancel Withdrawal - Cancelar retiro (Solo el padre)
**Endpoint:** `POST /withdrawals/:orderId/cancel`
**Auth:** Required (PARENT, GUARDIAN)
**Roles Required:** PARENT, GUARDIAN

**Response Success (200):**
```json
{
  "success": true,
  "message": "Withdrawal cancelled",
  "order": {
    "id": "cmkd24aiq0004ugemjskf6110",
    "status": "CANCELLED"
  }
}
```

---

## 📊 WITHDRAWAL ORDER STATES (Flujo de Estados)

```
PENDING → VALIDATED → COMPLETED
          ↓
        CANCELLED
```

- **PENDING:** Orden creada, esperando validación
- **VALIDATED:** QR generado, listo para retiro
- **COMPLETED:** Menor retirado exitosamente
- **CANCELLED:** Padre canceló la orden

---

## 🔒 SECURITY FEATURES

### 1. JWT Authentication
- Token Bearer en header Authorization
- Expiration: 15 minutos
- Secret: 64 caracteres hex

### 2. Rate Limiting
- Global: 5 req/seg, 30 req/min, 100 req/15min
- Register: 3 por hora
- Login: 5 intentos en 5 minutos
- Withdrawal creation: 20 por hora

### 3. Security Headers
- Helmet: HTTP security headers
- CORS restrictivo
- HSTS: max-age 1 año
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

### 4. Validations
- Whitelist: Rechaza campos desconocidos
- Transform: Convierte tipos automáticamente
- Email validation
- Password complexity

---

## 🌍 ALLOWED ORIGINS (CORS)
```
- http://localhost:3001
- http://localhost:3000
```

---

## 📝 USER ROLES

| Rol | Permisos |
|-----|----------|
| PARENT | Ver hijos, crear/cancelar órdenes de retiro |
| GUARDIAN | Ver hijos, crear/cancelar órdenes de retiro |
| ADMIN | Completar retiros, acceso total |
| PICKER | Completar retiros |

---

## 🗄️ DATA MODELS

### User
```typescript
{
  id: string (cuid)
  email: string (unique)
  password: string (hashed)
  name: string
  role: UserRole (PARENT|GUARDIAN|ADMIN|PICKER)
  cedula: string (optional, unique)
  phone: string (optional)
  children: Child[]
  withdrawalOrders: WithdrawalOrder[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Child
```typescript
{
  id: string (cuid)
  name: string
  grade: string
  school: string
  parentId: string (FK)
  parent: User
  withdrawalOrders: WithdrawalOrder[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### WithdrawalOrder
```typescript
{
  id: string (cuid)
  childId: string (FK)
  child: Child
  parentId: string (FK)
  parent: User
  picker: Picker (optional)
  status: WithdrawalStatus (PENDING|VALIDATED|COMPLETED|CANCELLED)
  qrCode: string (optional, base64 PNG)
  withdrawalDate: DateTime (optional)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Picker
```typescript
{
  id: string (cuid)
  name: string
  cedula: string (unique)
  phone: string
  relationship: string (padre|madre|abuelo|abuela|tío|tía|hermano|hermana|otro)
  withdrawalOrderId: string (FK, unique)
  withdrawalOrder: WithdrawalOrder
  createdAt: DateTime
}
```

---

## 🔧 CONFIGURATION

### Environment Variables Required
```env
DATABASE_URL=postgresql://...
JWT_SECRET=64-hex-characters
JWT_EXPIRATION=900
NODE_ENV=development|production
PORT=3000
HOST=localhost
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
```

---

## 📚 FLOW EXAMPLES

### 1. Completo: Crear usuario y retiro
```
1. POST /auth/register → Token
2. GET /children → Listar hijos
3. POST /withdrawals → Crear orden + QR
4. GET /withdrawals → Verificar estado
5. POST /withdrawals/:id/complete → Completar retiro
```

### 2. Ciclo de retiro exitoso
```
User registers → Creates child → Creates withdrawal order 
→ Gets QR code → Picker scans QR → Completes withdrawal
→ Child picked up successfully
```

---

## ⚠️ ERROR HANDLING

Todos los errores siguen este formato:

```json
{
  "statusCode": 400|401|403|404|409|429|500,
  "message": "Error description",
  "error": "BadRequest|Unauthorized|Forbidden|NotFound|Conflict|TooManyRequests|InternalServerError"
}
```

### Common HTTP Codes
- 200: OK
- 201: Created
- 400: Bad Request (validation)
- 401: Unauthorized (auth)
- 403: Forbidden (no role)
- 404: Not Found
- 409: Conflict (unique constraint)
- 429: Too Many Requests (rate limit)
- 500: Server Error

---

## 🚀 DEPLOYMENT

### Build
```bash
npm run build
```

### Start Production
```bash
npm run start:prod
```

### Development
```bash
npm run start:dev
```

---

## 📞 SUPPORT & TESTING

Test flow completo: `npx ts-node test-flow.ts`

Endpoints disponibles:
- Base URL: `http://localhost:3000`
- API Port: `3000`
- Database: PostgreSQL (Railway)

---

## ✅ IMPLEMENTATION CHECKLIST PARA FRONTEND

- [ ] Implementar registro de usuario
- [ ] Implementar login y gestión de token JWT
- [ ] Crear vista de lista de hijos
- [ ] Crear formulario de nueva orden de retiro
- [ ] Mostrar QR code generado
- [ ] Listar órdenes de retiro del usuario
- [ ] Implementar cancelación de órdenes
- [ ] Agregar validaciones de formularios
- [ ] Manejar errores HTTP
- [ ] Implementar rate limiting en UI
- [ ] Agregar logout
- [ ] Proteger rutas con autenticación
