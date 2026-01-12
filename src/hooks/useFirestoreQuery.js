import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase.js'

/**
 * Custom hook para queries de Firestore con loading, error y data
 * Optimiza y simplifica el uso de Firestore en componentes
 */
export function useFirestoreQuery(collectionName, queryConstraints = []) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!collectionName) {
      setLoading(false)
      return undefined
    }

    setLoading(true)
    setError(null)

    try {
      const q = query(collection(db, collectionName), ...queryConstraints)

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const documents = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setData(documents)
          setLoading(false)
        },
        (err) => {
          console.error(`Error en query ${collectionName}:`, err)
          setError(err.message)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error(`Error configurando query ${collectionName}:`, err)
      setError(err.message)
      setLoading(false)
      return undefined
    }
  }, [collectionName, JSON.stringify(queryConstraints)])

  return { data, loading, error }
}

/**
 * Hook para obtener un solo documento
 */
export function useFirestoreDoc(collectionName, docId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!collectionName || !docId) {
      setLoading(false)
      return undefined
    }

    setLoading(true)
    setError(null)

    try {
      const docRef = doc(db, collectionName, docId)

      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setData({ id: docSnap.id, ...docSnap.data() })
          } else {
            setData(null)
          }
          setLoading(false)
        },
        (err) => {
          console.error(`Error en documento ${collectionName}/${docId}:`, err)
          setError(err.message)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error(`Error configurando documento ${collectionName}/${docId}:`, err)
      setError(err.message)
      setLoading(false)
      return undefined
    }
  }, [collectionName, docId])

  return { data, loading, error }
}

/**
 * Hook para queries con paginación
 */
export function useFirestorePagination(collectionName, pageSize = 10, queryConstraints = []) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState(null)

  const loadMore = () => {
    // Implementar paginación con startAfter
    console.log('Load more...')
  }

  const reset = () => {
    setData([])
    setLastDoc(null)
    setHasMore(true)
  }

  useEffect(() => {
    if (!collectionName) {
      setLoading(false)
      return undefined
    }

    setLoading(true)
    setError(null)

    try {
      const q = query(
        collection(db, collectionName),
        ...queryConstraints,
        limit(pageSize)
      )

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const documents = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setData(documents)
          setHasMore(documents.length === pageSize)
          if (documents.length > 0) {
            setLastDoc(snapshot.docs[snapshot.docs.length - 1])
          }
          setLoading(false)
        },
        (err) => {
          console.error(`Error en query paginada ${collectionName}:`, err)
          setError(err.message)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error(`Error configurando query paginada ${collectionName}:`, err)
      setError(err.message)
      setLoading(false)
      return undefined
    }
  }, [collectionName, pageSize, JSON.stringify(queryConstraints)])

  return { data, loading, error, hasMore, loadMore, reset }
}
