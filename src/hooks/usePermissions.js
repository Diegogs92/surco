import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Sistema de permisos basado en roles
 * Roles: admin, tecnico, operario
 */

const PERMISSIONS = {
  // Dashboard
  'dashboard:view': ['admin', 'tecnico', 'operario'],

  // Campos
  'campos:view': ['admin', 'tecnico', 'operario'],
  'campos:create': ['admin', 'tecnico'],
  'campos:edit': ['admin', 'tecnico'],
  'campos:delete': ['admin'],

  // Cultivos
  'cultivos:view': ['admin', 'tecnico', 'operario'],
  'cultivos:create': ['admin', 'tecnico'],
  'cultivos:edit': ['admin', 'tecnico'],
  'cultivos:delete': ['admin'],

  // Tareas
  'tareas:view': ['admin', 'tecnico', 'operario'],
  'tareas:create': ['admin', 'tecnico', 'operario'],
  'tareas:edit': ['admin', 'tecnico', 'operario'],
  'tareas:delete': ['admin', 'tecnico'],
  'tareas:assign': ['admin', 'tecnico'],

  // Maquinaria
  'maquinaria:view': ['admin', 'tecnico', 'operario'],
  'maquinaria:create': ['admin', 'tecnico'],
  'maquinaria:edit': ['admin', 'tecnico'],
  'maquinaria:delete': ['admin'],

  // Personal
  'personal:view': ['admin', 'tecnico'],
  'personal:create': ['admin'],
  'personal:edit': ['admin'],
  'personal:delete': ['admin'],
  'usuarios:manage': ['admin'],

  // Insumos
  'insumos:view': ['admin', 'tecnico', 'operario'],
  'insumos:create': ['admin', 'tecnico'],
  'insumos:edit': ['admin', 'tecnico'],
  'insumos:delete': ['admin'],

  // Proveedores
  'proveedores:view': ['admin', 'tecnico'],
  'proveedores:create': ['admin', 'tecnico'],
  'proveedores:edit': ['admin', 'tecnico'],
  'proveedores:delete': ['admin'],

  // Costos
  'costos:view': ['admin', 'tecnico'],
  'costos:create': ['admin', 'tecnico'],
  'costos:edit': ['admin'],
  'costos:delete': ['admin'],

  // Reportes
  'reportes:view': ['admin', 'tecnico'],
  'reportes:export': ['admin', 'tecnico'],

  // Ganadería
  'ganaderia:view': ['admin', 'tecnico', 'operario'],
  'ganaderia:create': ['admin', 'tecnico'],
  'ganaderia:edit': ['admin', 'tecnico'],
  'ganaderia:delete': ['admin'],

  // Alertas
  'alertas:view': ['admin', 'tecnico', 'operario'],
  'alertas:create': ['admin', 'tecnico'],
  'alertas:dismiss': ['admin', 'tecnico', 'operario'],
}

/**
 * Hook para verificar permisos del usuario actual
 */
export function usePermissions() {
  const { user } = useAuth()

  const userRole = useMemo(() => {
    return user?.rol || 'operario'
  }, [user])

  const can = useMemo(() => {
    return (permission) => {
      const allowedRoles = PERMISSIONS[permission]
      if (!allowedRoles) {
        console.warn(`Permiso no definido: ${permission}`)
        return false
      }
      return allowedRoles.includes(userRole)
    }
  }, [userRole])

  const canAny = useMemo(() => {
    return (permissions) => {
      return permissions.some((permission) => can(permission))
    }
  }, [can])

  const canAll = useMemo(() => {
    return (permissions) => {
      return permissions.every((permission) => can(permission))
    }
  }, [can])

  const isAdmin = useMemo(() => userRole === 'admin', [userRole])
  const isTecnico = useMemo(() => userRole === 'tecnico', [userRole])
  const isOperario = useMemo(() => userRole === 'operario', [userRole])

  return {
    can,
    canAny,
    canAll,
    isAdmin,
    isTecnico,
    isOperario,
    userRole,
  }
}

/**
 * Componente para renderizar contenido según permisos
 */
export function Can({ permission, children, fallback = null }) {
  const { can } = usePermissions()

  if (!can(permission)) {
    return fallback
  }

  return children
}

/**
 * HOC para proteger componentes con permisos
 */
export function withPermission(Component, permission, FallbackComponent = null) {
  return function ProtectedComponent(props) {
    const { can } = usePermissions()

    if (!can(permission)) {
      if (FallbackComponent) {
        return <FallbackComponent />
      }
      return (
        <div className="error-message">
          <p>No tienes permisos para acceder a esta sección</p>
        </div>
      )
    }

    return <Component {...props} />
  }
}
