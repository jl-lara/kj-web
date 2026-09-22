import { isApiError } from './client';

const CODE_MESSAGES = {
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  VALIDATION_ERROR: 'Los datos enviados no son válidos.',
  ALREADY_EXISTS: 'Ya existe un registro con el mismo valor.',
  NOT_FOUND: 'No se encontró el registro.',
  FOREIGN_KEY_CONFLICT: 'No se puede eliminar porque existen registros relacionados.',
  CATEGORY_HAS_PRODUCTS: 'La categoría tiene productos asociados.',
  EMAIL_ALREADY_EXISTS: 'El correo ya está en uso.',
  LAST_ADMIN: 'No se puede desactivar al último administrador activo.',
  UNAUTHORIZED: 'No autorizado.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NETWORK_ERROR: 'No se pudo conectar con el servidor.',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Inicia sesión de nuevo.',
  RATE_LIMIT_EXCEEDED: 'Demasiadas solicitudes. Intenta más tarde.',
  INTERNAL_ERROR: 'Ocurrió un error en el servidor.',
  INVALID_DATA: 'Los datos enviados no son válidos.',
  INVALID_REFRESH_TOKEN: 'No se pudo restaurar la sesión.',
  CATEGORY_NOT_FOUND: 'No se encontró la categoría.',
  PRODUCT_NOT_FOUND: 'No se encontró el producto.',
  LOCATION_NOT_FOUND: 'No se encontró la sucursal.',
  PROMOTION_NOT_FOUND: 'No se encontró la promoción.',
  GALLERY_NOT_FOUND: 'No se encontró el elemento de galería.',
  USER_NOT_FOUND: 'No se encontró el usuario.',
  FILE_TOO_LARGE: 'El archivo es demasiado grande (máximo 5 MB).',
  UNSUPPORTED_MEDIA_TYPE: 'Formato de imagen no permitido (usa JPG, PNG o WebP).',
  INVALID_IMAGE: 'El archivo no es una imagen válida.',
  NO_FILE: 'No se seleccionó ningún archivo.',
  CURRENT_PASSWORD_INCORRECT: 'La contraseña actual es incorrecta.',
  UPLOAD_ERROR: 'Error al subir el archivo.',
  MISSING_STORAGE_KEY: 'Falta la referencia del archivo.',
  INVALID_STORAGE_KEY: 'Referencia de archivo inválida.',
};

export function friendlyError(error, fallback = 'Ocurrió un error.') {
  if (isApiError(error)) {
    if (error.code && CODE_MESSAGES[error.code]) {
      return CODE_MESSAGES[error.code];
    }
    return error.message || fallback;
  }
  return fallback;
}
