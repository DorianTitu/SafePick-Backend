# 🚀 SafePick Frontend - Instrucciones para Copilot

## Contexto Rápido
Backend SafePick ya está completamente implementado y funcionando. Es un sistema seguro de retiro de menores en escuelas con:
- ✅ API REST en NestJS con Prisma 6
- ✅ Autenticación JWT
- ✅ Base de datos PostgreSQL (Railway)
- ✅ Rate limiting y seguridad implementada
- ✅ Flujo completo de retiros probado y funcionando

**URL Backend:** `http://localhost:3000` (development)

---

## 📋 Tarea para el Frontend

Implementar interfaz web completa que permita a padres/tutores:

1. **Registrarse e iniciar sesión** con email y contraseña
2. **Ver hijos registrados** en el sistema
3. **Crear orden de retiro** especificando:
   - Hijo a retirar
   - Nombre del picker (persona que retira)
   - Cédula del picker
   - Teléfono del picker
   - Relación familiar (padre, tía, etc.)
4. **Ver código QR** generado automáticamente
5. **Listar todas las órdenes** de retiro (estado, fecha, picker)
6. **Cancelar órdenes** si es necesario
7. **Gestionar sesión** (logout)

---

## 🔌 API Endpoints Disponibles

### Authentication
- `POST /auth/register` - Crear cuenta
- `POST /auth/login` - Iniciar sesión

### Children
- `GET /children` - Listar mis hijos
- `GET /children/:childId` - Ver detalles de un hijo

### Withdrawals
- `POST /withdrawals` - Crear orden de retiro (automáticamente genera QR)
- `GET /withdrawals` - Listar mis órdenes
- `GET /withdrawals/:orderId` - Ver detalles de una orden
- `POST /withdrawals/:orderId/cancel` - Cancelar una orden

---

## 📦 Modelos de Datos

### User (después de login)
```javascript
{
  id: "cmkd249vu0000ugemhuehoxe6",
  email: "parent@example.com",
  name: "John Doe",
  role: "PARENT",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Child
```javascript
{
  id: "cmkd24a770002ugem2n0p32xd",
  name: "Emma Doe",
  grade: "3rd",
  school: "Lincoln Elementary"
}
```

### WithdrawalOrder
```javascript
{
  id: "cmkd24aiq0004ugemjskf6110",
  childId: "cmkd24a770002ugem2n0p32xd",
  status: "VALIDATED", // PENDING, VALIDATED, COMPLETED, CANCELLED
  qrCode: "data:image/png;base64,iVBORw0KGgo...",
  withdrawalDate: null, // Se llena cuando se completa
  picker: {
    id: "cmkd24akq0005ugem",
    name: "Maria Garcia",
    cedula: "87654321",
    phone: "+34987654321",
    relationship: "tía"
  }
}
```

---

## 🛡️ Headers Requeridos

```javascript
// Para endpoints autenticados
headers: {
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

---

## 📝 Validaciones Requeridas

### Register/Login
- Email: válido y único
- Password: mín 12 caracteres, mayúscula, minúscula, número, carácter especial

### Withdrawal Order
- Cedula picker: 8-13 dígitos
- Phone: formato internacional (+XX...)
- Relationship: padre, madre, abuelo, abuela, tío, tía, hermano, hermana, otro
- Child debe pertenecer al usuario autenticado

---

## 🔄 Flujo Principal

```
1. Usuario accede → Si no tiene cuenta, registrarse
2. Login → Recibe token JWT
3. Guardar token en localStorage/sessionStorage
4. Ver lista de hijos
5. Seleccionar hijo → Crear orden de retiro
6. Sistema genera automáticamente el QR
7. Ver QR y compartir con picker
8. Seguimiento de estado de orden
9. Logout → Limpiar token
```

---

## ⚠️ Manejo de Errores

Respuestas de error:
```javascript
{
  statusCode: 400|401|403|404|409|429|500,
  message: "Error description",
  error: "BadRequest|Unauthorized|Forbidden|..."
}
```

**Casos importantes:**
- 409: Email ya registrado
- 401: Credenciales inválidas
- 403: No tienes permiso para esta acción
- 429: Demasiadas peticiones (rate limit)

---

## 🎨 Recomendaciones de UI/UX

### Pantallas Principales
1. **Landing/Auth** - Register e Login
2. **Dashboard** - Resumen de hijos y órdenes recientes
3. **Children List** - Lista de hijos con opción crear orden
4. **Withdrawal Form** - Crear nueva orden de retiro
5. **Withdrawal Details** - Ver QR y estado de orden
6. **Withdrawal History** - Historial de todas las órdenes

### Elementos Visuales
- Mostrar QR como imagen descargable
- Indicador de estado de orden (PENDING/VALIDATED/COMPLETED/CANCELLED)
- Botón cancelar solo si orden está en PENDING
- Información clara del picker y relación familiar
- Timestamps legibles

---

## 🔐 Consideraciones de Seguridad

- ✅ Almacenar token en localStorage con cuidado (considerar httpOnly)
- ✅ Limpiar token al logout
- ✅ Validar permisos (solo PARENT/GUARDIAN pueden crear órdenes)
- ✅ No exponer contraseñas en logs
- ✅ Manejar errores sin revelar detalles sensibles
- ✅ Implementar timeout de sesión
- ✅ Rate limit en envío de formularios (esperar después de cada envío)

---

## 📋 Checklist de Implementación

### Phase 1: Authentication
- [ ] Página de registro
- [ ] Página de login
- [ ] Almacenamiento de token
- [ ] Logout
- [ ] Rutas protegidas

### Phase 2: Dashboard
- [ ] Mostrar información del usuario
- [ ] Listar hijos
- [ ] Listar órdenes recientes

### Phase 3: Children Management
- [ ] Crear nueva orden de retiro (formulario)
- [ ] Mostrar QR generado
- [ ] Descargar QR

### Phase 4: Orders Management
- [ ] Ver detalles de orden
- [ ] Ver historial completo
- [ ] Cancelar orden

### Phase 5: UX/Polish
- [ ] Manejo de errores
- [ ] Loading states
- [ ] Validaciones en tiempo real
- [ ] Responsive design
- [ ] Notificaciones/Toast

---

## 🧪 Testing

Usar flujo de prueba backend:
```bash
npx ts-node test-flow.ts
```

Datos de prueba:
- Email: cualquier email único
- Password: SecurePass123!@
- Child: cualquier nombre
- Picker: cualquier nombre con relación válida

---

## 📚 Documentación Completa

Ver: [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)

Contiene:
- Todos los endpoints detallados
- Ejemplos de request/response
- Validaciones completas
- Modelos de datos
- Estados del sistema
- Manejo de errores

---

## 🎯 Stack Recomendado

**Frontend:**
- React/Vue/Angular (tu preferencia)
- TypeScript
- Axios/Fetch para HTTP
- Zustand/Pinia/Redux para estado

**Consideraciones:**
- Responsive (mobile first)
- Accessible (WCAG)
- PWA capability (guardar QR offline)

---

## 📞 Endpoints Base

- **Development:** `http://localhost:3000`
- **Production:** (será actualizado)
- **CORS:** ✅ Habilitado para localhost

---

**¡Listo para comenzar! El backend está 100% operacional y listo para que implementes el frontend.**
