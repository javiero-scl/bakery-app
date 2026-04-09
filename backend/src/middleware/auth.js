const { Client, Account } = require('node-appwrite');

/**
 * Middleware que verifica la sesión de Appwrite y adjunta el usuario al request.
 * El frontend debe enviar el header: Authorization: Bearer <session-secret>
 *
 * En modo DEVELOPMENT (cuando APPWRITE_PROJECT_ID no está configurado),
 * hace bypass de la validación para facilitar el desarrollo local.
 */
const authMiddleware = async (req, res, next) => {
  // ── BYPASS para desarrollo local ───────────────────────────────────────────
  const isDev = process.env.NODE_ENV !== 'production';
  const hasRealAppwriteConfig =
    process.env.APPWRITE_PROJECT_ID &&
    process.env.APPWRITE_PROJECT_ID !== 'TU_PROJECT_ID_AQUI';

  if (isDev && !hasRealAppwriteConfig) {
    req.user = { $id: 'dev-user', name: 'Developer', email: 'dev@local' };
    return next();
  }
  // ──────────────────────────────────────────────────────────────────────────

  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado: token no proporcionado' });
    }

    const jwtToken = authHeader.split(' ')[1];

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setJWT(jwtToken);

    const account = new Account(client);
    const user = await account.get();

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ message: 'No autorizado: sesión inválida o expirada' });
  }
};

module.exports = authMiddleware;

