import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    const shortcuts = {
      'd': '/dashboard',
      'c': '/campos',
      't': '/tareas',
      'm': '/maquinaria',
      'r': '/reportes',
      'p': '/personal',
      'i': '/insumos',
      'v': '/proveedores',
      'a': '/alertas',
      'l': '/lotes-agricolas',
      's': '/registros-agricolas',
      'g': '/ganaderia',
    }

    let gPressed = false
    let timeout

    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.contentEditable === 'true'
      ) {
        return
      }

      // Check for 'g' key press (first key in sequence)
      if (e.key === 'g' && !gPressed) {
        gPressed = true
        // Reset after 2 seconds if second key not pressed
        timeout = setTimeout(() => {
          gPressed = false
        }, 2000)
        return
      }

      // Check for second key in sequence
      if (gPressed && shortcuts[e.key]) {
        e.preventDefault()
        clearTimeout(timeout)
        navigate(shortcuts[e.key])
        gPressed = false
      }
    }

    const handleKeyUp = () => {
      // Reset on any key up to prevent stuck state
      if (gPressed) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          gPressed = false
        }, 2000)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      clearTimeout(timeout)
    }
  }, [navigate])
}
