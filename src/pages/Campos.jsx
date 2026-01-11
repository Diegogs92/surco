import { useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { db } from '../firebase.js'
import PageHeader from '../components/PageHeader.jsx'
import { uploadFiles } from '../utils/uploadFiles.js'
import Modal from '../components/Modal.jsx'

const initialForm = {
  nombre: '',
  superficie: '',
  lat: '',
  lng: '',
}
const defaultCenter = { lat: -34.6037, lng: -58.3816 }
const initialLoteForm = { nombre: '', tamano: '', descripcion: '' }
const initialGanadoLoteForm = {
  nombre: '',
  categoria: '',
  cantidad: '',
  pesoPromedio: '',
  etapa: '',
  notas: '',
}
const initialGanadoAnimalForm = {
  identificador: '',
  categoria: '',
  sexo: '',
  fechaNacimiento: '',
  peso: '',
  loteId: '',
  origen: '',
  estado: '',
}
const initialGanadoEventoForm = {
  tipo: '',
  fecha: '',
  loteId: '',
  animalId: '',
  descripcion: '',
  kilos: '',
  costo: '',
  ingreso: '',
}
const initialGanadoPlanForm = {
  tipo: '',
  fecha: '',
  loteId: '',
  responsable: '',
  notas: '',
  estado: 'pendiente',
}

const ganadoCategorias = [
  'Terneros',
  'Novillos',
  'Vaquillonas',
  'Vacas',
  'Toros',
  'Reproductores',
  'Otros',
]
const ganadoEtapas = ['Crianza', 'Engorde', 'Faenado', 'Venta', 'Distribucion']
const ganadoEventosTipos = [
  'Nacimiento',
  'Compra',
  'Venta',
  'Movimiento',
  'Pesaje',
  'Tratamiento sanitario',
  'Mortalidad',
]
const ganadoPlanesTipos = ['Vacuna', 'Desparasitacion', 'Control']

function Campos() {
  const [campos, setCampos] = useState([])
  const [form, setForm] = useState(initialForm)
  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [userCenter, setUserCenter] = useState(null)
  const [editCampo, setEditCampo] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editPhotos, setEditPhotos] = useState([])
  const [editPreviews, setEditPreviews] = useState([])
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')
  const [loteCampo, setLoteCampo] = useState(null)
  const [loteForm, setLoteForm] = useState(initialLoteForm)
  const [savingLote, setSavingLote] = useState(false)
  const [loteError, setLoteError] = useState('')
  const [editLoteCampo, setEditLoteCampo] = useState(null)
  const [editLote, setEditLote] = useState(null)
  const [editLoteForm, setEditLoteForm] = useState(initialLoteForm)
  const [savingEditLote, setSavingEditLote] = useState(false)
  const [editLoteError, setEditLoteError] = useState('')
  const [ganadoCampo, setGanadoCampo] = useState(null)
  const [ganadoLoteForm, setGanadoLoteForm] = useState(initialGanadoLoteForm)
  const [ganadoAnimalForm, setGanadoAnimalForm] = useState(initialGanadoAnimalForm)
  const [ganadoEventoForm, setGanadoEventoForm] = useState(initialGanadoEventoForm)
  const [ganadoPlanForm, setGanadoPlanForm] = useState(initialGanadoPlanForm)
  const [savingGanadoLote, setSavingGanadoLote] = useState(false)
  const [savingGanadoAnimal, setSavingGanadoAnimal] = useState(false)
  const [savingGanadoEvento, setSavingGanadoEvento] = useState(false)
  const [savingGanadoPlan, setSavingGanadoPlan] = useState(false)
  const [ganadoError, setGanadoError] = useState('')
  const [editGanadoLote, setEditGanadoLote] = useState(null)
  const [editGanadoAnimal, setEditGanadoAnimal] = useState(null)
  const [editGanadoEvento, setEditGanadoEvento] = useState(null)
  const [editGanadoPlan, setEditGanadoPlan] = useState(null)
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  })

  useEffect(() => {
    const q = query(collection(db, 'campos'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setCampos(data)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!ganadoCampo) return
    const updated = campos.find((item) => item.id === ganadoCampo.id)
    if (updated) setGanadoCampo(updated)
  }, [campos, ganadoCampo?.id])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        setUserCenter(null)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }, [])

  useEffect(() => {
    if (!photos.length) {
      setPhotoPreviews([])
      return undefined
    }
    const previews = photos.map((file) => URL.createObjectURL(file))
    setPhotoPreviews(previews)
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [photos])

  const mapCenter = useMemo(() => {
    if (form.lat && form.lng) {
      return { lat: Number(form.lat), lng: Number(form.lng) }
    }
    return userCenter || defaultCenter
  }, [form.lat, form.lng, userCenter])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files || [])
    setPhotos(files)
  }

  const handleMapChange = ({ lat, lng }) => {
    setForm((prev) => ({
      ...prev,
      lat: Number(lat).toFixed(6),
      lng: Number(lng).toFixed(6),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.nombre || !form.superficie) return
    setSaving(true)
    setError('')
    try {
      let photoUrls = []
      let photoStatus = 'ok'
      if (photos.length) {
        try {
          photoUrls = await uploadFiles(photos, 'campos')
        } catch {
          photoStatus = 'pendiente'
          setError('No se pudieron subir las fotos del campo.')
        }
      }
      await addDoc(collection(db, 'campos'), {
        ...form,
        superficie: Number(form.superficie),
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
        fotos: photoUrls,
        fotosEstado: photoStatus,
        createdAt: serverTimestamp(),
      })
      setForm(initialForm)
      setPhotos([])
    } catch {
      setError('No se pudo guardar el campo. Intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!editPhotos.length) {
      setEditPreviews([])
      return undefined
    }
    const previews = editPhotos.map((file) => URL.createObjectURL(file))
    setEditPreviews(previews)
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [editPhotos])

  const openEdit = (campo) => {
    setEditCampo(campo)
    setEditForm({
      nombre: campo.nombre || '',
      superficie: campo.superficie || '',
      lat: campo.lat ?? '',
      lng: campo.lng ?? '',
    })
    setEditPhotos([])
    setEditError('')
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditPhotoChange = (event) => {
    const files = Array.from(event.target.files || [])
    setEditPhotos(files)
  }

  const handleEditMapChange = ({ lat, lng }) => {
    setEditForm((prev) => ({
      ...prev,
      lat: Number(lat).toFixed(6),
      lng: Number(lng).toFixed(6),
    }))
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editCampo) return
    setSavingEdit(true)
    setEditError('')
    try {
      let photoUrls = editCampo.fotos || []
      let photoStatus = editCampo.fotosEstado || 'ok'
      if (editPhotos.length) {
        try {
          const uploaded = await uploadFiles(editPhotos, 'campos')
          photoUrls = [...photoUrls, ...uploaded]
          photoStatus = 'ok'
        } catch {
          photoStatus = 'pendiente'
          setEditError('No se pudieron subir las fotos nuevas.')
        }
      }
      await updateDoc(doc(db, 'campos', editCampo.id), {
        ...editForm,
        superficie: Number(editForm.superficie),
        lat: editForm.lat ? Number(editForm.lat) : null,
        lng: editForm.lng ? Number(editForm.lng) : null,
        fotos: photoUrls,
        fotosEstado: photoStatus,
      })
      setEditCampo(null)
    } catch {
      setEditError('No se pudo guardar el campo.')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async (campo) => {
    const confirmDelete = window.confirm('Eliminar campo?')
    if (!confirmDelete) return
    await deleteDoc(doc(db, 'campos', campo.id))
  }

  const openLoteModal = (campo) => {
    setLoteCampo(campo)
    setLoteForm(initialLoteForm)
    setLoteError('')
  }

  const handleLoteChange = (event) => {
    const { name, value } = event.target
    setLoteForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoteSubmit = async (event) => {
    event.preventDefault()
    if (!loteCampo || !loteForm.nombre) return
    setSavingLote(true)
    setLoteError('')
    const tamanoValue = loteForm.tamano ? Number(loteForm.tamano) : null
    const lotePayload = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      nombre: loteForm.nombre,
      tamano: Number.isNaN(tamanoValue) ? null : tamanoValue,
      descripcion: loteForm.descripcion || '',
      createdAt: new Date().toISOString(),
    }
    try {
      await updateDoc(doc(db, 'campos', loteCampo.id), {
        lotes: arrayUnion(lotePayload),
      })
      setLoteCampo(null)
    } catch {
      setLoteError('No se pudo guardar el lote.')
    } finally {
      setSavingLote(false)
    }
  }

  const openEditLote = (campo, lote) => {
    setEditLoteCampo(campo)
    setEditLote(lote)
    setEditLoteForm({
      nombre: lote.nombre || '',
      tamano: lote.tamano ?? '',
      descripcion: lote.descripcion || '',
    })
    setEditLoteError('')
  }

  const handleEditLoteChange = (event) => {
    const { name, value } = event.target
    setEditLoteForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditLoteSubmit = async (event) => {
    event.preventDefault()
    if (!editLoteCampo || !editLote || !editLoteForm.nombre) return
    setSavingEditLote(true)
    setEditLoteError('')
    const tamanoValue = editLoteForm.tamano ? Number(editLoteForm.tamano) : null
    const updatedLotes = (editLoteCampo.lotes || []).map((item) =>
      item.id === editLote.id
        ? {
            ...item,
            nombre: editLoteForm.nombre,
            tamano: Number.isNaN(tamanoValue) ? null : tamanoValue,
            descripcion: editLoteForm.descripcion || '',
          }
        : item,
    )
    try {
      await updateDoc(doc(db, 'campos', editLoteCampo.id), {
        lotes: updatedLotes,
      })
      setEditLoteCampo(null)
      setEditLote(null)
    } catch {
      setEditLoteError('No se pudo guardar el lote.')
    } finally {
      setSavingEditLote(false)
    }
  }

  const handleDeleteLote = async (campo, lote) => {
    const confirmDelete = window.confirm('Eliminar lote?')
    if (!confirmDelete) return
    const updatedLotes = (campo.lotes || []).filter((item) => item.id !== lote.id)
    await updateDoc(doc(db, 'campos', campo.id), {
      lotes: updatedLotes,
    })
  }

  const openGanaderia = (campo) => {
    setGanadoCampo(campo)
    setGanadoLoteForm(initialGanadoLoteForm)
    setGanadoAnimalForm(initialGanadoAnimalForm)
    setGanadoEventoForm(initialGanadoEventoForm)
    setGanadoPlanForm(initialGanadoPlanForm)
    setEditGanadoLote(null)
    setEditGanadoAnimal(null)
    setEditGanadoEvento(null)
    setEditGanadoPlan(null)
    setGanadoError('')
  }

  const handleGanadoLoteChange = (event) => {
    const { name, value } = event.target
    setGanadoLoteForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGanadoAnimalChange = (event) => {
    const { name, value } = event.target
    setGanadoAnimalForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGanadoEventoChange = (event) => {
    const { name, value } = event.target
    setGanadoEventoForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGanadoPlanChange = (event) => {
    const { name, value } = event.target
    setGanadoPlanForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGanadoLoteSubmit = async (event) => {
    event.preventDefault()
    if (editGanadoLote) {
      await handleUpdateGanado('lote')
      return
    }
    if (!ganadoCampo || !ganadoLoteForm.nombre) return
    setSavingGanadoLote(true)
    setGanadoError('')
    const cantidadValue = ganadoLoteForm.cantidad
      ? Number(ganadoLoteForm.cantidad)
      : null
    const pesoValue = ganadoLoteForm.pesoPromedio
      ? Number(ganadoLoteForm.pesoPromedio)
      : null
    const payload = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      nombre: ganadoLoteForm.nombre,
      categoria: ganadoLoteForm.categoria || '',
      cantidad: Number.isNaN(cantidadValue) ? null : cantidadValue,
      pesoPromedio: Number.isNaN(pesoValue) ? null : pesoValue,
      etapa: ganadoLoteForm.etapa || '',
      notas: ganadoLoteForm.notas || '',
      createdAt: new Date().toISOString(),
    }
    try {
      await updateDoc(doc(db, 'campos', ganadoCampo.id), {
        ganadoLotes: arrayUnion(payload),
      })
      setGanadoLoteForm(initialGanadoLoteForm)
    } catch {
      setGanadoError('No se pudo guardar el lote ganadero.')
    } finally {
      setSavingGanadoLote(false)
    }
  }

  const handleGanadoAnimalSubmit = async (event) => {
    event.preventDefault()
    if (editGanadoAnimal) {
      await handleUpdateGanado('animal')
      return
    }
    if (!ganadoCampo || !ganadoAnimalForm.identificador) return
    setSavingGanadoAnimal(true)
    setGanadoError('')
    const pesoValue = ganadoAnimalForm.peso
      ? Number(ganadoAnimalForm.peso)
      : null
    const payload = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      identificador: ganadoAnimalForm.identificador,
      categoria: ganadoAnimalForm.categoria || '',
      sexo: ganadoAnimalForm.sexo || '',
      fechaNacimiento: ganadoAnimalForm.fechaNacimiento || '',
      peso: Number.isNaN(pesoValue) ? null : pesoValue,
      loteId: ganadoAnimalForm.loteId || '',
      origen: ganadoAnimalForm.origen || '',
      estado: ganadoAnimalForm.estado || '',
      createdAt: new Date().toISOString(),
    }
    try {
      await updateDoc(doc(db, 'campos', ganadoCampo.id), {
        ganadoAnimales: arrayUnion(payload),
      })
      setGanadoAnimalForm(initialGanadoAnimalForm)
    } catch {
      setGanadoError('No se pudo guardar el animal.')
    } finally {
      setSavingGanadoAnimal(false)
    }
  }

  const handleGanadoEventoSubmit = async (event) => {
    event.preventDefault()
    if (editGanadoEvento) {
      await handleUpdateGanado('evento')
      return
    }
    if (!ganadoCampo || !ganadoEventoForm.tipo || !ganadoEventoForm.fecha) return
    setSavingGanadoEvento(true)
    setGanadoError('')
    const kilosValue = ganadoEventoForm.kilos
      ? Number(ganadoEventoForm.kilos)
      : null
    const costoValue = ganadoEventoForm.costo
      ? Number(ganadoEventoForm.costo)
      : null
    const ingresoValue = ganadoEventoForm.ingreso
      ? Number(ganadoEventoForm.ingreso)
      : null
    const payload = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      tipo: ganadoEventoForm.tipo,
      fecha: ganadoEventoForm.fecha,
      loteId: ganadoEventoForm.loteId || '',
      animalId: ganadoEventoForm.animalId || '',
      descripcion: ganadoEventoForm.descripcion || '',
      kilos: Number.isNaN(kilosValue) ? null : kilosValue,
      costo: Number.isNaN(costoValue) ? null : costoValue,
      ingreso: Number.isNaN(ingresoValue) ? null : ingresoValue,
      createdAt: new Date().toISOString(),
    }
    try {
      await updateDoc(doc(db, 'campos', ganadoCampo.id), {
        ganadoEventos: arrayUnion(payload),
      })
      setGanadoEventoForm(initialGanadoEventoForm)
    } catch {
      setGanadoError('No se pudo guardar el evento.')
    } finally {
      setSavingGanadoEvento(false)
    }
  }

  const handleGanadoPlanSubmit = async (event) => {
    event.preventDefault()
    if (editGanadoPlan) {
      await handleUpdateGanado('plan')
      return
    }
    if (!ganadoCampo || !ganadoPlanForm.tipo || !ganadoPlanForm.fecha) return
    setSavingGanadoPlan(true)
    setGanadoError('')
    const payload = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      tipo: ganadoPlanForm.tipo,
      fecha: ganadoPlanForm.fecha,
      loteId: ganadoPlanForm.loteId || '',
      responsable: ganadoPlanForm.responsable || '',
      notas: ganadoPlanForm.notas || '',
      estado: ganadoPlanForm.estado || 'pendiente',
      createdAt: new Date().toISOString(),
    }
    try {
      await updateDoc(doc(db, 'campos', ganadoCampo.id), {
        ganadoPlanes: arrayUnion(payload),
      })
      setGanadoPlanForm(initialGanadoPlanForm)
    } catch {
      setGanadoError('No se pudo guardar el recordatorio.')
    } finally {
      setSavingGanadoPlan(false)
    }
  }

  const handleDeleteGanadoItem = async (campo, key, itemId) => {
    const confirmDelete = window.confirm('Eliminar registro?')
    if (!confirmDelete) return
    const updated = (campo[key] || []).filter((item) => item.id !== itemId)
    await updateDoc(doc(db, 'campos', campo.id), {
      [key]: updated,
    })
  }

  const handleOpenEditGanado = (campo, type, item) => {
    setGanadoCampo(campo)
    setGanadoError('')
    if (type === 'lote') {
      setEditGanadoLote(item)
      setGanadoLoteForm({
        nombre: item.nombre || '',
        categoria: item.categoria || '',
        cantidad: item.cantidad ?? '',
        pesoPromedio: item.pesoPromedio ?? '',
        etapa: item.etapa || '',
        notas: item.notas || '',
      })
    }
    if (type === 'animal') {
      setEditGanadoAnimal(item)
      setGanadoAnimalForm({
        identificador: item.identificador || '',
        categoria: item.categoria || '',
        sexo: item.sexo || '',
        fechaNacimiento: item.fechaNacimiento || '',
        peso: item.peso ?? '',
        loteId: item.loteId || '',
        origen: item.origen || '',
        estado: item.estado || '',
      })
    }
    if (type === 'evento') {
      setEditGanadoEvento(item)
      setGanadoEventoForm({
        tipo: item.tipo || '',
        fecha: item.fecha || '',
        loteId: item.loteId || '',
        animalId: item.animalId || '',
        descripcion: item.descripcion || '',
        kilos: item.kilos ?? '',
        costo: item.costo ?? '',
        ingreso: item.ingreso ?? '',
      })
    }
    if (type === 'plan') {
      setEditGanadoPlan(item)
      setGanadoPlanForm({
        tipo: item.tipo || '',
        fecha: item.fecha || '',
        loteId: item.loteId || '',
        responsable: item.responsable || '',
        notas: item.notas || '',
        estado: item.estado || 'pendiente',
      })
    }
  }

  const handleUpdateGanado = async (type) => {
    if (!ganadoCampo) return
    const camposRef = doc(db, 'campos', ganadoCampo.id)
    try {
      if (type === 'lote' && editGanadoLote) {
        const cantidadValue = ganadoLoteForm.cantidad
          ? Number(ganadoLoteForm.cantidad)
          : null
        const pesoValue = ganadoLoteForm.pesoPromedio
          ? Number(ganadoLoteForm.pesoPromedio)
          : null
        const updated = (ganadoCampo.ganadoLotes || []).map((item) =>
          item.id === editGanadoLote.id
            ? {
                ...item,
                nombre: ganadoLoteForm.nombre,
                categoria: ganadoLoteForm.categoria || '',
                cantidad: Number.isNaN(cantidadValue) ? null : cantidadValue,
                pesoPromedio: Number.isNaN(pesoValue) ? null : pesoValue,
                etapa: ganadoLoteForm.etapa || '',
                notas: ganadoLoteForm.notas || '',
              }
            : item,
        )
        await updateDoc(camposRef, { ganadoLotes: updated })
        setEditGanadoLote(null)
        setGanadoLoteForm(initialGanadoLoteForm)
      }
      if (type === 'animal' && editGanadoAnimal) {
        const pesoValue = ganadoAnimalForm.peso
          ? Number(ganadoAnimalForm.peso)
          : null
        const updated = (ganadoCampo.ganadoAnimales || []).map((item) =>
          item.id === editGanadoAnimal.id
            ? {
                ...item,
                identificador: ganadoAnimalForm.identificador,
                categoria: ganadoAnimalForm.categoria || '',
                sexo: ganadoAnimalForm.sexo || '',
                fechaNacimiento: ganadoAnimalForm.fechaNacimiento || '',
                peso: Number.isNaN(pesoValue) ? null : pesoValue,
                loteId: ganadoAnimalForm.loteId || '',
                origen: ganadoAnimalForm.origen || '',
                estado: ganadoAnimalForm.estado || '',
              }
            : item,
        )
        await updateDoc(camposRef, { ganadoAnimales: updated })
        setEditGanadoAnimal(null)
        setGanadoAnimalForm(initialGanadoAnimalForm)
      }
      if (type === 'evento' && editGanadoEvento) {
        const kilosValue = ganadoEventoForm.kilos
          ? Number(ganadoEventoForm.kilos)
          : null
        const costoValue = ganadoEventoForm.costo
          ? Number(ganadoEventoForm.costo)
          : null
        const ingresoValue = ganadoEventoForm.ingreso
          ? Number(ganadoEventoForm.ingreso)
          : null
        const updated = (ganadoCampo.ganadoEventos || []).map((item) =>
          item.id === editGanadoEvento.id
            ? {
                ...item,
                tipo: ganadoEventoForm.tipo,
                fecha: ganadoEventoForm.fecha,
                loteId: ganadoEventoForm.loteId || '',
                animalId: ganadoEventoForm.animalId || '',
                descripcion: ganadoEventoForm.descripcion || '',
                kilos: Number.isNaN(kilosValue) ? null : kilosValue,
                costo: Number.isNaN(costoValue) ? null : costoValue,
                ingreso: Number.isNaN(ingresoValue) ? null : ingresoValue,
              }
            : item,
        )
        await updateDoc(camposRef, { ganadoEventos: updated })
        setEditGanadoEvento(null)
        setGanadoEventoForm(initialGanadoEventoForm)
      }
      if (type === 'plan' && editGanadoPlan) {
        const updated = (ganadoCampo.ganadoPlanes || []).map((item) =>
          item.id === editGanadoPlan.id
            ? {
                ...item,
                tipo: ganadoPlanForm.tipo,
                fecha: ganadoPlanForm.fecha,
                loteId: ganadoPlanForm.loteId || '',
                responsable: ganadoPlanForm.responsable || '',
                notas: ganadoPlanForm.notas || '',
                estado: ganadoPlanForm.estado || 'pendiente',
              }
            : item,
        )
        await updateDoc(camposRef, { ganadoPlanes: updated })
        setEditGanadoPlan(null)
        setGanadoPlanForm(initialGanadoPlanForm)
      }
    } catch {
      setGanadoError('No se pudieron guardar los cambios.')
    }
  }

  const stockPorCategoria = (campo) => {
    const animales = campo?.ganadoAnimales || []
    const lotes = campo?.ganadoLotes || []
    const stock = {}
    if (animales.length) {
      animales.forEach((animal) => {
        const key = animal.categoria || 'Sin categoria'
        stock[key] = (stock[key] || 0) + 1
      })
    } else {
      lotes.forEach((lote) => {
        const key = lote.categoria || 'Sin categoria'
        const cantidad = lote.cantidad || 0
        stock[key] = (stock[key] || 0) + cantidad
      })
    }
    return Object.entries(stock)
  }

  const reportesGanado = (campo) => {
    const eventos = campo?.ganadoEventos || []
    const lotes = campo?.ganadoLotes || []
    const map = {}
    eventos.forEach((evento) => {
      const loteId = evento.loteId || 'sin-lote'
      if (!map[loteId]) {
        const lote = lotes.find((item) => item.id === loteId)
        map[loteId] = {
          lote: lote?.nombre || 'Sin lote',
          kilos: 0,
          costos: 0,
          ingresos: 0,
        }
      }
      if (evento.kilos) map[loteId].kilos += evento.kilos
      if (evento.costo) map[loteId].costos += evento.costo
      if (evento.ingreso) map[loteId].ingresos += evento.ingreso
    })
    return Object.values(map)
  }

  const ganadoLotes = ganadoCampo?.ganadoLotes || []
  const ganadoAnimales = ganadoCampo?.ganadoAnimales || []
  const ganadoEventos = ganadoCampo?.ganadoEventos || []
  const ganadoPlanes = ganadoCampo?.ganadoPlanes || []

  return (
    <div className="page">
      <PageHeader
        title="Campos"
        subtitle="Registro de campos y ubicaciones."
      />
      <section className="two-column">
        <div className="card">
          <h2>Nuevo campo</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input
              className="input"
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              type="number"
              name="superficie"
              placeholder="Superficie (ha)"
              value={form.superficie}
              onChange={handleChange}
              required
            />
            <div className="map-box">
              {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                <div className="empty-state">
                  Configura `VITE_GOOGLE_MAPS_API_KEY` para mostrar el mapa.
                </div>
              ) : isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={12}
                  onClick={(event) =>
                    handleMapChange({
                      lat: event.latLng.lat(),
                      lng: event.latLng.lng(),
                    })
                  }
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                  }}
                >
                  {form.lat && form.lng && (
                    <Marker
                      position={{ lat: Number(form.lat), lng: Number(form.lng) }}
                    />
                  )}
                </GoogleMap>
              ) : (
                <div className="empty-state">Cargando mapa...</div>
              )}
            </div>
            <div className="form-grid">
              <input
                className="input"
                name="lat"
                placeholder="Latitud"
                value={form.lat}
                onChange={handleChange}
              />
              <input
                className="input"
                name="lng"
                placeholder="Longitud"
                value={form.lng}
                onChange={handleChange}
              />
            </div>
            <label className="file-input">
              <span>Fotos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
              />
            </label>
            {photoPreviews.length > 0 && (
              <div className="photo-grid">
                {photoPreviews.map((src) => (
                  <img key={src} src={src} alt="Vista previa" />
                ))}
              </div>
            )}
            {error && <p className="form-error">{error}</p>}
            <button
              className="primary-button field-action"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar campo'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Campos registrados</h2>
          {campos.length === 0 ? (
            <div className="empty-state">No hay campos cargados.</div>
          ) : (
            <div className="table">
              {campos.map((campo) => (
                <div className="table-row with-thumb" key={campo.id}>
                  <div className="thumb">
                    {campo.fotos?.[0] ? (
                      <img src={campo.fotos[0]} alt={campo.nombre} />
                    ) : (
                      <span>Sin foto</span>
                    )}
                  </div>
                  <div>
                    <strong>{campo.nombre}</strong>
                    {campo.lat && campo.lng ? (
                      <span>
                        {Number(campo.lat).toFixed(4)}, {Number(campo.lng).toFixed(4)}
                      </span>
                    ) : (
                      <span>Sin coordenadas</span>
                    )}
                  </div>
                  <div>
                    <span>{campo.superficie} ha</span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openEdit(campo)}
                    >
                      Editar
                    </button>
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openLoteModal(campo)}
                    >
                      Agregar lote
                    </button>
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => openGanaderia(campo)}
                    >
                      Ganaderia
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(campo)}
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="row-details">
                    <span className="detail-label">Lotes</span>
                    {campo.lotes?.length ? (
                      <div className="lote-list">
                        {campo.lotes.map((lote) => (
                          <div className="lote-chip" key={lote.id}>
                            <strong>{lote.nombre}</strong>
                            <span>
                              {lote.tamano ? `${lote.tamano} ha` : 'Tamano sin definir'}
                            </span>
                            {lote.descripcion ? (
                              <span className="lote-description">{lote.descripcion}</span>
                            ) : (
                              <span className="lote-description">Sin descripcion</span>
                            )}
                            <div className="lote-actions">
                              <button
                                className="icon-button"
                                type="button"
                                onClick={() => openEditLote(campo, lote)}
                              >
                                Editar
                              </button>
                              <button
                                className="icon-button danger"
                                type="button"
                                onClick={() => handleDeleteLote(campo, lote)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="detail-muted">Sin lotes registrados.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Modal
        open={Boolean(editCampo)}
        title="Editar campo"
        onClose={() => setEditCampo(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-campo-form"
            disabled={savingEdit}
          >
            {savingEdit ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
          <form className="form-grid" id="edit-campo-form" onSubmit={handleEditSubmit}>
            <input
              className="input"
              name="nombre"
              placeholder="Nombre"
              value={editForm?.nombre || ''}
              onChange={handleEditChange}
              required
            />
          <input
            className="input"
            type="number"
            name="superficie"
            placeholder="Superficie (ha)"
            value={editForm?.superficie || ''}
            onChange={handleEditChange}
            required
          />
          <div className="map-box">
            {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
              <div className="empty-state">
                Configura `VITE_GOOGLE_MAPS_API_KEY` para mostrar el mapa.
              </div>
            ) : isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={
                  editForm?.lat && editForm?.lng
                    ? { lat: Number(editForm.lat), lng: Number(editForm.lng) }
                    : userCenter || defaultCenter
                }
                zoom={12}
                onClick={(event) =>
                  handleEditMapChange({
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng(),
                  })
                }
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                }}
              >
                {editForm?.lat && editForm?.lng && (
                  <Marker
                    position={{
                      lat: Number(editForm.lat),
                      lng: Number(editForm.lng),
                    }}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="empty-state">Cargando mapa...</div>
            )}
          </div>
          <div className="form-grid">
            <input
              className="input"
              name="lat"
              placeholder="Latitud"
              value={editForm?.lat ?? ''}
              onChange={handleEditChange}
            />
            <input
              className="input"
              name="lng"
              placeholder="Longitud"
              value={editForm?.lng ?? ''}
              onChange={handleEditChange}
            />
          </div>
          <label className="file-input">
            <span>Agregar fotos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleEditPhotoChange}
            />
          </label>
          {editPreviews.length > 0 && (
            <div className="photo-grid">
              {editPreviews.map((src) => (
                <img key={src} src={src} alt="Vista previa" />
              ))}
            </div>
          )}
          {editError && <p className="form-error">{editError}</p>}
        </form>
      </Modal>

      <Modal
        open={Boolean(loteCampo)}
        title="Nuevo lote"
        onClose={() => setLoteCampo(null)}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="lote-form"
            disabled={savingLote}
          >
            {savingLote ? 'Guardando...' : 'Guardar lote'}
          </button>
        }
      >
        <form className="form-grid" id="lote-form" onSubmit={handleLoteSubmit}>
          <input
            className="input"
            name="nombre"
            placeholder="Nombre del lote"
            value={loteForm.nombre}
            onChange={handleLoteChange}
            required
          />
          <input
            className="input"
            type="number"
            name="tamano"
            placeholder="Tamano (ha)"
            value={loteForm.tamano}
            onChange={handleLoteChange}
          />
          <textarea
            className="textarea"
            name="descripcion"
            placeholder="Descripcion"
            rows={3}
            value={loteForm.descripcion}
            onChange={handleLoteChange}
          />
          {loteError && <p className="form-error">{loteError}</p>}
        </form>
      </Modal>

      <Modal
        open={Boolean(editLoteCampo && editLote)}
        title="Editar lote"
        onClose={() => {
          setEditLoteCampo(null)
          setEditLote(null)
        }}
        actions={
          <button
            className="primary-button"
            type="submit"
            form="edit-lote-form"
            disabled={savingEditLote}
          >
            {savingEditLote ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      >
        <form className="form-grid" id="edit-lote-form" onSubmit={handleEditLoteSubmit}>
          <input
            className="input"
            name="nombre"
            placeholder="Nombre del lote"
            value={editLoteForm.nombre}
            onChange={handleEditLoteChange}
            required
          />
          <input
            className="input"
            type="number"
            name="tamano"
            placeholder="Tamano (ha)"
            value={editLoteForm.tamano}
            onChange={handleEditLoteChange}
          />
          <textarea
            className="textarea"
            name="descripcion"
            placeholder="Descripcion"
            rows={3}
            value={editLoteForm.descripcion}
            onChange={handleEditLoteChange}
          />
          {editLoteError && <p className="form-error">{editLoteError}</p>}
        </form>
      </Modal>

      <Modal
        open={Boolean(ganadoCampo)}
        title="Ganaderia"
        subtitle={ganadoCampo ? `Campo: ${ganadoCampo.nombre}` : ''}
        onClose={() => setGanadoCampo(null)}
      >
        <div className="section-stack">
          {ganadoError && <p className="form-error">{ganadoError}</p>}

          <div className="section-block">
            <div className="section-header">
              <div>
                <h3 className="section-title">Lotes ganaderos</h3>
                <span className="section-hint">
                  Crianza, engorde, faenado, venta y distribucion.
                </span>
              </div>
            </div>
            <form className="inline-grid" onSubmit={handleGanadoLoteSubmit}>
              <input
                className="input"
                name="nombre"
                placeholder="Nombre del lote"
                value={ganadoLoteForm.nombre}
                onChange={handleGanadoLoteChange}
                required
              />
              <select
                name="categoria"
                value={ganadoLoteForm.categoria}
                onChange={handleGanadoLoteChange}
              >
                <option value="">Categoria</option>
                {ganadoCategorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="number"
                name="cantidad"
                placeholder="Cantidad"
                value={ganadoLoteForm.cantidad}
                onChange={handleGanadoLoteChange}
              />
              <input
                className="input"
                type="number"
                name="pesoPromedio"
                placeholder="Peso promedio (kg)"
                value={ganadoLoteForm.pesoPromedio}
                onChange={handleGanadoLoteChange}
              />
              <select
                name="etapa"
                value={ganadoLoteForm.etapa}
                onChange={handleGanadoLoteChange}
              >
                <option value="">Etapa</option>
                {ganadoEtapas.map((etapa) => (
                  <option key={etapa} value={etapa}>
                    {etapa}
                  </option>
                ))}
              </select>
              <textarea
                className="textarea"
                name="notas"
                placeholder="Notas"
                rows={2}
                value={ganadoLoteForm.notas}
                onChange={handleGanadoLoteChange}
              />
              <div className="inline-actions">
                <button
                  className="primary-button small"
                  type="submit"
                  disabled={savingGanadoLote}
                >
                  {editGanadoLote ? 'Guardar cambios' : 'Agregar lote'}
                </button>
                {editGanadoLote && (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => {
                      setEditGanadoLote(null)
                      setGanadoLoteForm(initialGanadoLoteForm)
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
            <div className="mini-list">
              {ganadoLotes.length ? (
                ganadoLotes.map((lote) => (
                  <div className="mini-card" key={lote.id}>
                    <strong>{lote.nombre}</strong>
                    <span>
                      {lote.categoria || 'Sin categoria'} ·{' '}
                      {lote.cantidad ? `${lote.cantidad} animales` : 'Cantidad N/D'}
                    </span>
                    <span>
                      {lote.pesoPromedio
                        ? `${lote.pesoPromedio} kg prom.`
                        : 'Peso N/D'}
                      {lote.etapa ? ` · ${lote.etapa}` : ''}
                    </span>
                    {lote.notas && <span>{lote.notas}</span>}
                    <div className="mini-actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => handleOpenEditGanado(ganadoCampo, 'lote', lote)}
                      >
                        Editar
                      </button>
                      <button
                        className="icon-button danger"
                        type="button"
                        onClick={() =>
                          handleDeleteGanadoItem(ganadoCampo, 'ganadoLotes', lote.id)
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <span className="detail-muted">Sin lotes ganaderos.</span>
              )}
            </div>
          </div>

          <div className="section-block">
            <div className="section-header">
              <div>
                <h3 className="section-title">Animales</h3>
                <span className="section-hint">Alta individual y stock por categoria.</span>
              </div>
            </div>
            <form className="inline-grid" onSubmit={handleGanadoAnimalSubmit}>
              <input
                className="input"
                name="identificador"
                placeholder="Identificador / Caravana"
                value={ganadoAnimalForm.identificador}
                onChange={handleGanadoAnimalChange}
                required
              />
              <select
                name="categoria"
                value={ganadoAnimalForm.categoria}
                onChange={handleGanadoAnimalChange}
              >
                <option value="">Categoria</option>
                {ganadoCategorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
              <select
                name="sexo"
                value={ganadoAnimalForm.sexo}
                onChange={handleGanadoAnimalChange}
              >
                <option value="">Sexo</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
              <input
                className="input"
                type="date"
                name="fechaNacimiento"
                value={ganadoAnimalForm.fechaNacimiento}
                onChange={handleGanadoAnimalChange}
              />
              <input
                className="input"
                type="number"
                name="peso"
                placeholder="Peso (kg)"
                value={ganadoAnimalForm.peso}
                onChange={handleGanadoAnimalChange}
              />
              <select
                name="loteId"
                value={ganadoAnimalForm.loteId}
                onChange={handleGanadoAnimalChange}
              >
                <option value="">Lote ganadero</option>
                {ganadoLotes.map((lote) => (
                  <option key={lote.id} value={lote.id}>
                    {lote.nombre}
                  </option>
                ))}
              </select>
              <select
                name="origen"
                value={ganadoAnimalForm.origen}
                onChange={handleGanadoAnimalChange}
              >
                <option value="">Origen</option>
                <option value="Nacimiento">Nacimiento</option>
                <option value="Compra">Compra</option>
              </select>
              <select
                name="estado"
                value={ganadoAnimalForm.estado}
                onChange={handleGanadoAnimalChange}
              >
                <option value="">Estado</option>
                <option value="Activo">Activo</option>
                <option value="Vendido">Vendido</option>
                <option value="Baja">Baja</option>
              </select>
              <div className="inline-actions">
                <button
                  className="primary-button small"
                  type="submit"
                  disabled={savingGanadoAnimal}
                >
                  {editGanadoAnimal ? 'Guardar cambios' : 'Agregar animal'}
                </button>
                {editGanadoAnimal && (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => {
                      setEditGanadoAnimal(null)
                      setGanadoAnimalForm(initialGanadoAnimalForm)
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
            <div className="mini-list">
              {ganadoAnimales.length ? (
                ganadoAnimales.map((animal) => (
                  <div className="mini-card" key={animal.id}>
                    <strong>{animal.identificador}</strong>
                    <span>
                      {animal.categoria || 'Sin categoria'} · {animal.sexo || 'Sexo N/D'}
                    </span>
                    <span>
                      {animal.peso ? `${animal.peso} kg` : 'Peso N/D'}
                      {animal.estado ? ` · ${animal.estado}` : ''}
                    </span>
                    <div className="mini-actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => handleOpenEditGanado(ganadoCampo, 'animal', animal)}
                      >
                        Editar
                      </button>
                      <button
                        className="icon-button danger"
                        type="button"
                        onClick={() =>
                          handleDeleteGanadoItem(
                            ganadoCampo,
                            'ganadoAnimales',
                            animal.id,
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <span className="detail-muted">Sin animales registrados.</span>
              )}
            </div>
          </div>

          <div className="section-block">
            <div className="section-header">
              <div>
                <h3 className="section-title">Eventos y trazabilidad</h3>
                <span className="section-hint">
                  Nacimientos, compras, movimientos, pesajes y tratamientos.
                </span>
              </div>
            </div>
            <form className="inline-grid" onSubmit={handleGanadoEventoSubmit}>
              <select
                name="tipo"
                value={ganadoEventoForm.tipo}
                onChange={handleGanadoEventoChange}
                required
              >
                <option value="">Tipo de evento</option>
                {ganadoEventosTipos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="date"
                name="fecha"
                value={ganadoEventoForm.fecha}
                onChange={handleGanadoEventoChange}
                required
              />
              <select
                name="loteId"
                value={ganadoEventoForm.loteId}
                onChange={handleGanadoEventoChange}
              >
                <option value="">Lote ganadero</option>
                {ganadoLotes.map((lote) => (
                  <option key={lote.id} value={lote.id}>
                    {lote.nombre}
                  </option>
                ))}
              </select>
              <select
                name="animalId"
                value={ganadoEventoForm.animalId}
                onChange={handleGanadoEventoChange}
              >
                <option value="">Animal</option>
                {ganadoAnimales.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.identificador}
                  </option>
                ))}
              </select>
              <input
                className="input"
                name="kilos"
                type="number"
                placeholder="Kilos (+/-)"
                value={ganadoEventoForm.kilos}
                onChange={handleGanadoEventoChange}
              />
              <input
                className="input"
                name="costo"
                type="number"
                placeholder="Costo ($)"
                value={ganadoEventoForm.costo}
                onChange={handleGanadoEventoChange}
              />
              <input
                className="input"
                name="ingreso"
                type="number"
                placeholder="Ingreso ($)"
                value={ganadoEventoForm.ingreso}
                onChange={handleGanadoEventoChange}
              />
              <textarea
                className="textarea"
                name="descripcion"
                placeholder="Descripcion"
                rows={2}
                value={ganadoEventoForm.descripcion}
                onChange={handleGanadoEventoChange}
              />
              <div className="inline-actions">
                <button
                  className="primary-button small"
                  type="submit"
                  disabled={savingGanadoEvento}
                >
                  {editGanadoEvento ? 'Guardar cambios' : 'Agregar evento'}
                </button>
                {editGanadoEvento && (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => {
                      setEditGanadoEvento(null)
                      setGanadoEventoForm(initialGanadoEventoForm)
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
            <div className="mini-list">
              {ganadoEventos.length ? (
                ganadoEventos.map((evento) => (
                  <div className="mini-card" key={evento.id}>
                    <strong>{evento.tipo}</strong>
                    <span>{evento.fecha}</span>
                    <span>{evento.descripcion || 'Sin descripcion'}</span>
                    <span>
                      {evento.kilos ? `${evento.kilos} kg` : 'Sin kilos'} ·{' '}
                      {evento.costo ? `$ ${evento.costo}` : '$ 0'} ·{' '}
                      {evento.ingreso ? `$ ${evento.ingreso}` : '$ 0'}
                    </span>
                    <div className="mini-actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => handleOpenEditGanado(ganadoCampo, 'evento', evento)}
                      >
                        Editar
                      </button>
                      <button
                        className="icon-button danger"
                        type="button"
                        onClick={() =>
                          handleDeleteGanadoItem(
                            ganadoCampo,
                            'ganadoEventos',
                            evento.id,
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <span className="detail-muted">Sin eventos registrados.</span>
              )}
            </div>
          </div>

          <div className="section-block">
            <div className="section-header">
              <div>
                <h3 className="section-title">Planificacion y recordatorios</h3>
                <span className="section-hint">
                  Vacunas, desparasitacion y controles sanitarios.
                </span>
              </div>
            </div>
            <form className="inline-grid" onSubmit={handleGanadoPlanSubmit}>
              <select
                name="tipo"
                value={ganadoPlanForm.tipo}
                onChange={handleGanadoPlanChange}
                required
              >
                <option value="">Tipo</option>
                {ganadoPlanesTipos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="date"
                name="fecha"
                value={ganadoPlanForm.fecha}
                onChange={handleGanadoPlanChange}
                required
              />
              <select
                name="loteId"
                value={ganadoPlanForm.loteId}
                onChange={handleGanadoPlanChange}
              >
                <option value="">Lote ganadero</option>
                {ganadoLotes.map((lote) => (
                  <option key={lote.id} value={lote.id}>
                    {lote.nombre}
                  </option>
                ))}
              </select>
              <input
                className="input"
                name="responsable"
                placeholder="Responsable"
                value={ganadoPlanForm.responsable}
                onChange={handleGanadoPlanChange}
              />
              <select
                name="estado"
                value={ganadoPlanForm.estado}
                onChange={handleGanadoPlanChange}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en curso">En curso</option>
                <option value="realizada">Realizada</option>
              </select>
              <textarea
                className="textarea"
                name="notas"
                placeholder="Notas"
                rows={2}
                value={ganadoPlanForm.notas}
                onChange={handleGanadoPlanChange}
              />
              <div className="inline-actions">
                <button
                  className="primary-button small"
                  type="submit"
                  disabled={savingGanadoPlan}
                >
                  {editGanadoPlan ? 'Guardar cambios' : 'Agregar recordatorio'}
                </button>
                {editGanadoPlan && (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => {
                      setEditGanadoPlan(null)
                      setGanadoPlanForm(initialGanadoPlanForm)
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
            <div className="mini-list">
              {ganadoPlanes.length ? (
                ganadoPlanes.map((plan) => (
                  <div className="mini-card" key={plan.id}>
                    <strong>{plan.tipo}</strong>
                    <span>{plan.fecha}</span>
                    <span>{plan.estado}</span>
                    {plan.notas && <span>{plan.notas}</span>}
                    <div className="mini-actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => handleOpenEditGanado(ganadoCampo, 'plan', plan)}
                      >
                        Editar
                      </button>
                      <button
                        className="icon-button danger"
                        type="button"
                        onClick={() =>
                          handleDeleteGanadoItem(
                            ganadoCampo,
                            'ganadoPlanes',
                            plan.id,
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <span className="detail-muted">Sin recordatorios.</span>
              )}
            </div>
          </div>

          <div className="section-block">
            <div className="section-header">
              <div>
                <h3 className="section-title">Reportes basicos</h3>
                <span className="section-hint">
                  Kilos ganados, costos, ingresos y margen por lote.
                </span>
              </div>
            </div>
            <div className="report-grid">
              <div className="report-card">
                <strong>Stock por categoria</strong>
                <div className="mini-list">
                  {stockPorCategoria(ganadoCampo).length ? (
                    stockPorCategoria(ganadoCampo).map(([categoria, total]) => (
                      <span key={categoria}>
                        {categoria}: {total}
                      </span>
                    ))
                  ) : (
                    <span className="detail-muted">Sin datos de stock.</span>
                  )}
                </div>
              </div>
              <div className="report-card">
                <strong>Resumen por lote</strong>
                <div className="mini-list">
                  {reportesGanado(ganadoCampo).length ? (
                    reportesGanado(ganadoCampo).map((reporte) => (
                      <span key={reporte.lote}>
                        {reporte.lote}: {reporte.kilos} kg · $ {reporte.ingresos} -
                        $ {reporte.costos} = $ {reporte.ingresos - reporte.costos}
                      </span>
                    ))
                  ) : (
                    <span className="detail-muted">Sin reportes disponibles.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Campos
