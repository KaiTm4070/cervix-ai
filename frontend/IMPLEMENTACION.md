# Frontend CervixAI — entrega local

## Trabajo conservado y completado

- Landing: se conservan la composición, estilos y recursos de tu compañero. Se corrigen las rutas del logo y las referencias a CNN/LSIL; se incorpora el logo proporcionado y acceso a demostración.
- Login, registro y objetivo: se conservan los formularios existentes y su simulación local. Se conecta el destino `/app`, se corrige el recurso del logo y se sustituye el aviso emergente de recuperación por un mensaje dentro del formulario.
- Nuevo: estructura clínica con menú lateral, cabecera, navegación móvil y tema claro/oscuro.
- Nuevo: dashboard, carga y previsualización JPG/PNG, validación de tipo/tamaño y lectura, reemplazo/eliminación, selección de modalidad y cancelación del procesamiento simulado.
- Nuevo: listado con búsqueda/filtros, detalle del resultado, imagen ampliada, revisión con observaciones y confirmación, historial, perfil editable, configuración y ayuda.
- Nuevo: informe HTML imprimible; el usuario puede elegir Guardar como PDF en el navegador. No requiere un servicio de generación de PDF.
- Nuevo: páginas informativas provisionales de privacidad, términos, datos y contacto. Sus textos definitivos requieren definición del equipo.

## Probar

```powershell
cd C:\Users\samue\cervix-ai\frontend
npm install
npm run dev
```

Entra a `/demo` para acceder sin registro, o crea una cuenta desde la landing. Desde Inicio puedes abrir un ejemplo; desde Analizar imagen puedes seleccionar una muestra o usar la ilustración incluida.

## Límites de la demostración

No se modificó el backend. No se ejecuta inferencia ni se transmite la imagen a un servidor. La clase ANORMAL y el 87% son valores fijos de ejemplo; no dependen de la imagen. El modelo del repositorio declara NORMAL/ANORMAL y arquitectura ViT, sin clasificaciones LSIL/HSIL ni categorías de riesgo.

Los análisis y observaciones se guardan en localStorage y el perfil activo en sessionStorage, siguiendo la base del proyecto. Son datos de demostración compartidos dentro del mismo navegador, sin aislamiento de cuentas ni seguridad de producción. Las imágenes grandes pueden exceder la cuota local; la interfaz muestra un error si no puede guardar. DICOM queda explícitamente pendiente.

## Integración pendiente con el equipo del backend

- Sustituir `src/services/authService.ts` por autenticación real y acordar sesiones, errores y permisos.
- Sustituir el adaptador `src/services/analysisService.ts` por llamadas HTTP. Acordar carga multipart, modalidades soportadas, identificador del trabajo, consulta de estado, cancelación, resultados y errores.
- Incorporar persistencia del servidor para resultados, historial, revisiones y perfil, con autorización por usuario.
- Confirmar soporte real del modelo para cada modalidad y formatos de archivo; no asumirlo por la selección de la interfaz.
- Definir recuperación/cambio de contraseña, notificaciones reales, política de datos y contenido legal final.
- Acordar generación/descarga de informes desde el servidor si se necesita PDF directo.

## Verificación realizada

`npm run build` y `npm run lint` correctos. En navegador se verificó: entrada demo → dashboard → carga del ejemplo → simulación → resultado → observaciones → guardado de revisión. Se inspeccionó la carga a 390 px de ancho. No se ha probado inferencia ni autenticación real porque no están expuestas por la API actual.
