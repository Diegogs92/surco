# Surco Mantenimiento

Aplicacion multiplataforma (web + PWA) para gestion de maquinaria agricola, reportes y usuarios. Pensada para uso en campo y oficina, con soporte offline.

## Requisitos
- Node.js 18+
- Firebase (Auth con Google, Firestore)

## Variables de entorno
El proyecto usa Vite. Las variables ya estan cargadas en `.env`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_GOOGLE_MAPS_API_KEY`

## Desarrollo
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy en Vercel
- Conectar el repo en Vercel.
- Build command: `npm run build`
- Output: `dist`
