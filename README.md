# Especial ChequeaBolivia: promesas de Rodrigo Paz

Sitio editorial estático, sin base de datos ni servicios exclusivos de Vercel. Los archivos de este paquete están intencionalmente todos al mismo nivel para que GitHub no necesite conservar subcarpetas durante la carga. `dist/` se genera al construir.

## Ejecutar localmente

Requiere Node.js 18 o posterior:

```sh
npm run dev
```

Abre `http://localhost:4173`. Si no tienes npm, ejecuta `node build.mjs` y luego `node serve.mjs dist`.

## Subir a GitHub y desplegar en Vercel

Sube todos los archivos de esta carpeta a la raíz del repositorio. En Vercel, conecta ese repositorio y deja el directorio raíz en el valor predeterminado `./`. El build ejecuta `node build.mjs` y publica `dist/`, según `vercel.json`.

En GitHub deben aparecer en el mismo nivel `package.json`, `build.mjs`, `verifications.json`, `index.html`, `app.js`, `article.js`, `styles.css` y `vercel.json`.

## Contenido y artículos

Las 20 verificaciones vacías están en `verifications.json`. No aparecen como publicadas ni cuentan en las estadísticas. Para completar una, edita su objeto: `title`, `status`, `published`, `bodyHtml`, y si hace falta `date`, `coverImage`, `coverAlt` e `images`.

Usa uno de estos valores para `status`: `cumplida`, `incumplida`, `demorada` o `adelantada`, y pon `published: true` para publicarla. El texto completo va en `bodyHtml`, con HTML sencillo como `<p>`, `<h2>`, `<strong>`, `<em>`, `<a>`, `<ul>` y `<ol>`.

Las imágenes se referencian desde `images/`. Por ejemplo: `{"src":"images/documento.jpg","alt":"Detalle del documento","caption":"Pie de foto opcional."}`. El archivo de imagen puede subirse desde GitHub con la ruta `images/documento.jpg`; el sitio conserva proporciones y permite ampliarlo.

Cada entrada conserva una URL como `/verificaciones/verificacion-01/`. `npm run build` genera esas páginas y los metadatos para compartir. `dist/` está excluido del repositorio porque se vuelve a crear en cada despliegue.

## Portada e identidad

El titular y subtítulo iniciales están en `index.html`. La portada actual es `portada-rodrigo-paz.webp`, optimizada para cargar rápido y precargada como imagen principal. El logotipo oficial está en `logo-chequeabolivia.png` y se usa en el encabezado y el pie. La paleta oficial está configurada al inicio de `styles.css`: fucsia `#BF1B68`, azul oscuro `#1E3E59` y verde `#69C2B6`.

Los textos de las cuatro definiciones se conservan como fueron entregados. El pie de página incluye solo el logotipo y el enlace para volver arriba.

## Migración a otro hosting

Ejecuta `npm run build` y publica el contenido de `dist/` en un hosting estático. No requiere adaptadores de Vercel. Si se publica bajo una subruta en lugar de la raíz del dominio, habrá que ajustar las rutas que empiezan por `/` en los archivos HTML y JavaScript y en `build.mjs`.
