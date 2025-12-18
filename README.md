# Bakery App

Aplicación de gestión para pastelería construida con React, TypeScript y Supabase.

## Características

- Gestión de productos, materias primas, recetas, producciones, compras, ventas
- Sistema de usuarios y roles
- Mantenedor de unidades de medida
- Separación de cantidad y unidad en recetas

## Instalación y Desarrollo

1. Clona el repositorio:
   ```bash
   git clone https://github.com/javiero-scl/bakery-app.git
   cd bakery-app
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Configura variables de entorno:
   - Copia `.env.example` a `.env.local`
   - Completa con tus credenciales de Supabase

4. Ejecuta en desarrollo:
   ```bash
   npm start
   ```

## Deploy

### Opción 1: Vercel (Recomendado)

1. Conecta tu repo de GitHub a [Vercel](https://vercel.com)
2. Configura las variables de entorno en Vercel:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
3. Deploy automático en cada push a main

### Opción 2: Netlify

1. Conecta el repo a [Netlify](https://netlify.com)
2. Configura build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
3. Agrega variables de entorno en Netlify

### Opción 3: Manual

```bash
npm run build
# Sube el contenido de la carpeta `build` a tu servidor web
```

## Tecnologías

- React 18
- TypeScript
- Supabase (Backend as a Service)
- React Router
- React Hot Toast
- CSS Modules

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
