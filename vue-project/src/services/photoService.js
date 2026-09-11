// Photo Service — routes all uploads through the backend (→ Cloudinary)
// No Cloudinary credentials are needed on the frontend.
import api from './api'

class PhotoService {
    /**
     * Upload a single photo via the backend.
     * @param {File} file - Image file to upload
     * @param {Function} onProgress - Optional progress callback (0-100)
     * @returns {Promise<string>} - The persisted Cloudinary URL
     */
    async uploadPhoto(file, onProgress = null) {
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image')
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Image must be less than 5MB')
        }

        const formData = new FormData()
        formData.append('photo', file)

        try {
            const response = await api.post('/profile/photos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const pct = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        )
                        onProgress(pct)
                    }
                }
            })
            // Returns { photoUrl, photos }
            return response.data.photoUrl
        } catch (error) {
            const msg =
                error.response?.data?.error ||
                error.message ||
                'Failed to upload photo'
            throw new Error(msg)
        }
    }

    /**
     * Upload multiple photos sequentially.
     * @param {File[]} files
     * @param {Function} onProgress
     * @returns {Promise<string[]>}
     */
    async uploadMultiplePhotos(files, onProgress = null) {
        const urls = []
        for (let i = 0; i < files.length; i++) {
            const url = await this.uploadPhoto(files[i], (pct) => {
                if (onProgress) {
                    const total = ((i + pct / 100) / files.length) * 100
                    onProgress(Math.round(total))
                }
            })
            urls.push(url)
        }
        return urls
    }

    /**
     * Delete a photo by its position in the user's photos array.
     * @param {number} index - 0-based index of the photo to remove
     * @returns {Promise<string[]>} - Updated photos array
     */
    async deletePhoto(index) {
        try {
            const response = await api.delete(`/profile/photos/${index}`)
            return response.data.photos
        } catch (error) {
            const msg =
                error.response?.data?.error ||
                error.message ||
                'Failed to delete photo'
            throw new Error(msg)
        }
    }

    /**
     * Compress an image client-side before uploading (optional helper).
     * @param {File} file
     * @param {number} maxWidth
     * @param {number} quality
     * @returns {Promise<Blob>}
     */
    compressImage(file, maxWidth = 1200, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = (event) => {
                const img = new Image()
                img.src = event.target.result
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    let { width, height } = img
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width
                        width = maxWidth
                    }
                    canvas.width = width
                    canvas.height = height
                    canvas.getContext('2d').drawImage(img, 0, 0, width, height)
                    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality)
                }
                img.onerror = reject
            }
            reader.onerror = reject
        })
    }
}

export const photoService = new PhotoService()
