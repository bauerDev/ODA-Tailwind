# Documentación técnica – Oracle of Art (ODA)

**Propósito:** Preparación para la defensa del proyecto ante el tribunal. Incluye stack, plugins, funcionalidades, flujos y respuestas a preguntas frecuentes.

---

## 1. Resumen del proyecto

**Oracle of Art** es un portal educativo web para explorar la historia del arte. Permite:

- Navegar un catálogo de obras con filtros (autor, movimiento, técnica, año).
- Subir una imagen y que la **IA** identifique la obra (título, autor, año, movimiento, técnica, descripción, etc.).
- Gestionar **colecciones personales** de obras (crear colecciones, añadir/quitar obras).
- En la ficha de una obra: **análisis de personajes** por IA (identificación de figuras y su significado).
- Panel **admin** para gestionar obras, usuarios y colecciones.

**Público objetivo:** Estudiantes, docentes y aficionados al arte.

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Lenguaje** | TypeScript |
| **UI / estilos** | React 19, Tailwind CSS 4, CSS con variables (tema) |
| **Autenticación** | NextAuth.js 4 (JWT, Credentials + Google opcional) |
| **Base de datos** | PostgreSQL (cliente `pg`) |
| **IA** | OpenAI API (modelo configurable, por defecto `gpt-4o-mini`) con visión |
| **Subida de imágenes (admin)** | Cloudinary (upload directo desde el cliente con preset) |
| **Procesamiento de imágenes (servidor)** | Sharp (redimensionado para enviar a OpenAI), Formidable (multipart) |

---

## 3. Plugins y dependencias relevantes

### 3.1 Build y estilos

- **Tailwind CSS 4**  
  - Uso de `@tailwindcss/postcss` en `postcss.config.mjs` (sin plugin clásico `tailwindcss` en `tailwind.config.ts`; en v4 el motor se usa vía PostCSS).  
  - Contenido escaneado en `app/globals.css` con `@import "tailwindcss"` y `@source` para `app`, `components` y `pages`.  
  - Tema en `tailwind.config.ts`: colores (primary, background, muted, border), fuentes (base, heading), espaciados (xs → 6xl). No hay plugins adicionales en `plugins: []`.

- **PostCSS**  
  - Solo plugin: `@tailwindcss/postcss`.  
  - Autoprefixer está en devDependencies para compatibilidad de prefijos si se requiere.

### 3.2 Frontend

- **Choices.js**  
  - Librería para selects múltiples en la **Galería** (filtros por autor, movimiento, técnica).  
  - Se importa dinámicamente (`import("choices.js")`) solo en el cliente para evitar `document is not defined` en SSR.  
  - Estilos: `choices.js/public/assets/styles/choices.css`; en `globals.css` se sobreescriben colores de los ítems seleccionados con `var(--primary)` para mantener la identidad visual del proyecto.

### 3.3 Backend y APIs

- **NextAuth**  
  - Proveedores: Credentials (email/contraseña con bcrypt) y Google (si existen `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`).  
  - Callbacks: `signIn`, `jwt`, `session` para persistir `id`, `isAdmin`, `role` en la sesión.  
  - Estrategia JWT, duración de sesión 30 días, página de login personalizada `/login`.

- **OpenAI (`openai`)**  
  - Uso en dos APIs:  
    1. **Reconocimiento de obra** (`/api/ai-recognition`): imagen en base64, respuesta JSON con `is_artwork`, título, autor, año, movimiento, técnica, dimensiones, ubicación, descripción, `image_url`.  
    2. **Análisis de personajes** (`/api/artworks/[id]/analyze-characters`): imagen por URL, respuesta con `obra` (incl. `has_characters`) y array `personajes` (nombre, disciplina, ubicación en la obra, identificación visual, representa, objetivo_del_autor).

- **Formidable**  
  - Parseo de `multipart/form-data` en `/api/ai-recognition` (campo `image` o `file`).  
  - Se desactiva el bodyParser por defecto de Next.js para esa ruta (`bodyParser: false`).

- **Sharp**  
  - Redimensionado y compresión de la imagen recibida en el servidor antes de enviarla a OpenAI (objetivo ~90 KB para no exceder límites de contexto).  
  - Si Sharp falla, se envía el buffer original (con aviso en consola).

- **bcryptjs**  
  - Hash de contraseñas en registro y comparación en login (Credentials).

- **pg**  
  - Pool de conexiones a PostgreSQL; consultas en `lib/db/db.ts`, `lib/db/users.ts`, `lib/db/collections.ts`.

---

## 4. Estructura del proyecto (resumida)

```
ODA-Tailwind/
├── app/                    # App Router (Next.js)
│   ├── layout.tsx          # Layout raíz (Header, Footer, Providers)
│   ├── page.tsx            # Home (presentación, enlaces a Galería, IA, Mi Colección)
│   ├── gallery/            # Galería con filtros
│   ├── ai-recognition/     # Subida de imagen + análisis IA
│   ├── artwork/
│   │   ├── preview/        # Vista previa tras reconocimiento (sessionStorage)
│   │   └── [id]/           # Detalle de obra (zoom, colecciones, análisis personajes)
│   ├── my-collection/      # Listado de colecciones del usuario
│   │   └── [id]/           # Detalle de una colección (obras)
│   ├── login, register/
│   ├── contact/
│   └── admin/              # Panel admin (manage-artworks, manage-users, manage-collections)
├── components/             # Header, Footer, UploadImage, Providers
├── pages/api/              # Rutas API
│   ├── auth/               # NextAuth [...nextauth], register
│   ├── artworks.ts         # GET lista, POST crear
│   ├── artworks/[id].ts    # GET/PUT/PATCH/DELETE una obra
│   ├── artworks/[id]/analyze-characters.ts
│   ├── artworks/[id]/collections.ts  # GET colecciones del usuario que contienen la obra
│   ├── ai-recognition.ts   # POST imagen → OpenAI → JSON obra
│   ├── collections/        # GET/POST colecciones del usuario
│   └── collections/[id]/   # CRUD colección + artworks
├── lib/
│   ├── auth.ts             # authOptions NextAuth
│   └── db/                 # db.ts (pool), users.ts, collections.ts
├── types/                  # artwork.ts, next-auth.d.ts
├── tailwind.config.ts
├── postcss.config.mjs
└── next.config.ts
```

---

## 5. Funcionalidades principales

### 5.1 Reconocimiento de obra por IA

- **Entrada:** Imagen (JPG, PNG, WEBP, GIF) desde el cliente.  
- **Cliente:** Comprueba tipo MIME, comprime iterativamente (Canvas + `toBlob`) hasta ~250 KB para reducir payload.  
- **Servidor:** Recibe multipart con Formidable, valida tipo (y magic bytes si hace falta), redimensiona con Sharp si supera ~90 KB, convierte a base64 y llama a OpenAI con prompt de “experto en historia del arte”.  
- **Respuesta:** JSON con `is_artwork` y metadatos. Si `is_artwork === true`, se guarda en `sessionStorage` (`ai:recognition:result`, `ai:recognition:image`) y se redirige a `/artwork/preview`.  
- **Preview:** Lee de `sessionStorage`, muestra título, autor, año, movimiento, técnica, dimensiones, ubicación, descripción e imagen; permite volver a `/ai-recognition`.

### 5.2 Galería y filtros

- **Datos:** GET `/api/artworks` devuelve todas las obras (orden por id).  
- **Filtros:** Autor, movimiento, técnica (multiselect con Choices.js) y rango de años (slider dual + inputs numéricos en móvil).  
- **Aplicar / Limpiar:** Los filtros son “pendientes” hasta pulsar “Apply filters”; “Clear filters” resetea todo y sincroniza Choices.js.

### 5.3 Colecciones de usuario

- **Crear colección:** POST `/api/collections` (nombre obligatorio; descripción y visibilidad opcionales). Solo usuarios autenticados.  
- **Listar:** GET `/api/collections` devuelve las colecciones del usuario.  
- **Añadir obra a colección:** Desde la ficha de la obra (`/artwork/[id]`) se abre un modal con las colecciones del usuario; se llama a la API que inserta en `collection_artworks`.  
- **Ver colección:** `/my-collection/[id]` obtiene la colección y sus obras (solo si el usuario es dueño).  
- **Quitar obra de una colección:** Desde la ficha de la obra, si la obra está en alguna colección del usuario, se muestran “pills” con opción de eliminar.

### 5.4 Ficha de obra (/artwork/[id])

- **Datos:** GET `/api/artworks/[id]`.  
- **Lightbox:** Imagen con zoom y pan (teclado: Escape, +, -).  
- **“Añadir a colección”:** Modal con lista de colecciones; POST a `/api/collections/[id]/artworks` (o equivalente).  
- **“En tus colecciones”:** GET `/api/artworks/[id]/collections` para mostrar en qué colecciones está y permitir quitar.  
- **Análisis de personajes:** Botón que llama POST `/api/artworks/[id]/analyze-characters`; la API carga la obra de la BD, usa la URL de la imagen y OpenAI devuelve `obra` + `personajes`; se muestra en la misma página.

### 5.5 Panel de administración

- **Acceso:** Rutas bajo `/admin`; en la práctica se suele restringir por rol (isAdmin en sesión).  
- **Gestión de obras:** Listado, alta, edición, borrado. Para imágenes se usa el componente `UploadImage` que sube a Cloudinary (preset `oda-images`) y devuelve la URL para el campo `image`.  
- **Gestión de usuarios y colecciones:** Listado y acciones (por ejemplo borrar usuario, ver colecciones).

### 5.6 Autenticación y roles

- **Registro:** POST `/api/auth/register` crea usuario en tabla `users` con contraseña hasheada (bcrypt).  
- **Login:** NextAuth Credentials (email + contraseña) o Google. Usuario por defecto `admin`/`admin` para pruebas.  
- **Sesión:** JWT con `id`, `email`, `name`, `isAdmin`, `role` (Teacher/Student según `user_type` en BD).  
- **Google:** Si está configurado, en `signIn` y `jwt` se hace upsert en `users` por `google_id` / email.

---

## 6. Flujos principales (para explicar en defensa)

### 6.1 Flujo “Reconocer una obra con IA”

1. Usuario entra en `/ai-recognition`.  
2. Selecciona/sube una imagen (validación de tipo en cliente).  
3. Cliente comprime la imagen y envía POST a `/api/ai-recognition` (FormData).  
4. Servidor: Formidable → validación → Sharp (si aplica) → base64 → OpenAI (vision) con prompt de historiador del arte.  
5. Servidor responde JSON (`is_artwork`, título, autor, año, etc.).  
6. Si `is_artwork`, el cliente guarda en `sessionStorage` y redirige a `/artwork/preview`.  
7. Preview lee `sessionStorage` y muestra el resultado (sin guardar aún en BD; es solo vista previa del reconocimiento).

### 6.2 Flujo “Añadir obra a mi colección”

1. Usuario autenticado está en `/artwork/[id]`.  
2. Pulsa “Añadir a colección”; se abre modal.  
3. Cliente hace GET `/api/collections` y muestra la lista de sus colecciones.  
4. Usuario elige una colección; cliente hace POST a la ruta que añade la relación (ej. `/api/collections/[id]/artworks` con `artwork_id`).  
5. Se actualiza la lista “En tus colecciones” con GET `/api/artworks/[id]/collections`.

### 6.3 Flujo “Filtrar en la galería”

1. Usuario en `/gallery`; la página hace GET `/api/artworks` y construye listas únicas de autores, movimientos y técnicas.  
2. Tras cargar, se inicializa Choices.js sobre tres `<select multiple>`.  
3. Usuario selecciona filtros y/o mueve el rango de años; al pulsar “Apply filters” se actualiza el estado “aplicado” y se filtra la lista en memoria.  
4. “Clear filters” vacía selecciones y resetea el rango de años y Choices.

### 6.4 Flujo “Subir imagen en Admin (Cloudinary)”

1. Admin en gestión de obras, al crear/editar necesita una URL de imagen.  
2. Componente `UploadImage` (embedido o página): el usuario arrastra o elige un fichero.  
3. Cliente convierte la imagen a WebP (Canvas) y envía POST a Cloudinary (`/v1_1/do2td5gs1/image/upload`) con `upload_preset`: `oda-images`.  
4. Cloudinary devuelve `secure_url`; se rellena el campo “Image URL” del formulario de la obra.  
5. Al guardar la obra se hace POST o PUT a `/api/artworks` o `/api/artworks/[id]` con ese `image`.

---

## 7. APIs (resumen)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/api/artworks` | Lista de todas las obras |
| POST   | `/api/artworks` | Crear obra (admin; title, author, image obligatorios) |
| GET    | `/api/artworks/[id]` | Una obra |
| PUT/PATCH | `/api/artworks/[id]` | Actualizar obra (COALESCE) |
| DELETE | `/api/artworks/[id]` | Borrar obra |
| GET    | `/api/artworks/[id]/collections` | Colecciones del usuario que contienen la obra |
| POST   | `/api/artworks/[id]/analyze-characters` | Análisis IA de personajes |
| POST   | `/api/ai-recognition` | Reconocimiento IA de obra (body: multipart imagen) |
| GET    | `/api/collections` | Colecciones del usuario (requiere sesión) |
| POST   | `/api/collections` | Crear colección (requiere sesión) |
| GET/PUT/DELETE | `/api/collections/[id]` | Una colección |
| GET    | `/api/collections/[id]/artworks` | Obras de la colección |
| POST   | `/api/collections/[id]/artworks` | Añadir obra a colección |
| DELETE | `/api/collections/[id]/artworks?artwork_id=...` | Quitar obra de la colección |

---

## 8. Base de datos (PostgreSQL)

- **artworks:** id, title, author, year, movement, technique, dimensions, ubication, image, description.  
- **users:** id, email, name, password_hash, user_type, institution, google_id, is_admin, created_at.  
- **user_collections:** id, user_id, name, description, visibility, created_at.  
- **collection_artworks:** (collection_id, artwork_id) PK; FK a user_collections y referencia a artworks.id.

Las tablas de usuarios y colecciones se crean o actualizan bajo demanda (`ensureUsersTable`, `ensureCollectionsTables`) con `CREATE TABLE IF NOT EXISTS` y `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

---

## 9. Variables de entorno (relevantes para defensa)

- **Base de datos:** `PG_USER`, `PG_HOST`, `PG_DATABASE`, `PG_PASSWORD`, `PG_PORT`.  
- **NextAuth:** `NEXTAUTH_SECRET`, `NEXTAUTH_URL`; opcional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.  
- **OpenAI:** `OPENAI_API_KEY`; opcional `OPENAI_MODEL` (por defecto `gpt-4o-mini`).  
- **Cloudinary:** no se usan variables en el código mostrado; la URL y el preset están en el cliente (para producción convendría usar variables de entorno).

---

## 10. Preguntas frecuentes para la defensa

**¿Qué plugin de Tailwind usáis?**  
Tailwind v4 con `@tailwindcss/postcss` en PostCSS. No hay plugins extra en `tailwind.config.ts`; el tema se define con `theme.extend` (colores, fuentes, espaciados).

**¿Por qué Choices.js?**  
Para tener selects múltiples con búsqueda y buena UX en los filtros de la galería (autor, movimiento, técnica). Se carga dinámicamente en el cliente para evitar SSR con `document`.

**¿Cómo se procesa la imagen en el reconocimiento por IA?**  
En cliente: validación de tipo y compresión con Canvas hasta ~250 KB. En servidor: Formidable para multipart, validación de tipo (y magic bytes), Sharp para redimensionar/comprimir si supera ~90 KB, luego base64 a OpenAI Vision.

**¿Dónde se guarda el resultado del reconocimiento?**  
En `sessionStorage` (`ai:recognition:result` y `ai:recognition:image`). La página `/artwork/preview` solo muestra esos datos; no se persisten en BD automáticamente (el guardado en catálogo sería desde Admin).

**¿Qué modelo de OpenAI se usa?**  
El configurado en `OPENAI_MODEL`; por defecto `gpt-4o-mini`, que soporta visión y es suficiente para reconocimiento y análisis de personajes.

**¿Cómo se suben las imágenes del catálogo (admin)?**  
Mediante el componente `UploadImage`: el navegador convierte a WebP y sube a Cloudinary con un preset; la URL devuelta se usa como campo `image` de la obra en la API.

**¿Cómo se protegen las rutas de admin?**  
Con la sesión de NextAuth; el rol `isAdmin` (y comprobaciones en las páginas/APIs de admin) restringe el acceso a gestión de obras, usuarios y colecciones.

**¿Qué pasa si no hay OPENAI_API_KEY?**  
Las rutas que usan OpenAI (`/api/ai-recognition` y `/api/artworks/[id]/analyze-characters`) devuelven error 500 con mensaje indicando que falta la clave.

**¿La galería filtra en servidor o en cliente?**  
En cliente: se cargan todas las obras con GET `/api/artworks` y se filtran en memoria según autor, movimiento, técnica y rango de años.

---

*Documento generado para la defensa del proyecto Oracle of Art. Revisar rutas y nombres exactos en el código si han cambiado.*
