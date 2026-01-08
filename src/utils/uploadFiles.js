import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../firebase.js'

export async function uploadFiles(files, pathPrefix) {
  if (!files || files.length === 0) return []

  const timestamp = Date.now()
  const uploads = Array.from(files).map(async (file, index) => {
    const safeName = file.name.replace(/\s+/g, '-').toLowerCase()
    const storageRef = ref(
      storage,
      `${pathPrefix}/${timestamp}-${index}-${safeName}`,
    )
    await uploadBytes(storageRef, file)
    return getDownloadURL(storageRef)
  })

  return Promise.all(uploads)
}
