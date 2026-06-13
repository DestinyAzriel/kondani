// Photo Upload Service - Cloudinary Integration
import axios from 'axios'

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'kondani'
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'kondani_photos'

class PhotoService {
    /**
     * Upload photo to Cloudinary
     * @param {File} file - Image file to upload
     * @param {Function} onProgress - Progress callback (0-100)
     * @returns {Promise<string>} - Uploaded photo URL
     */
    async uploadPhoto(file, onProgress = null) {
        try {
            // Validate file
            if (!file.type.startsWith('image/')) {
                throw new Error('File must be an image')
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Image must be less than 5MB')
            }

            // Create form data
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
            formData.append('folder', 'kondani/profiles')

            // Add transformations for optimization
            formData.append('transformation', JSON.stringify([
                { width: 800, height: 1000, crop: 'fill', quality: 'auto:good' },
                { fetch_format: 'auto' } // Auto WebP conversion
            ]))

            // Upload to Cloudinary
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        if (onProgress) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            )
                            onProgress(percentCompleted)
                        }
                    }
                }
            )

            return response.data.secure_url
        } catch (error) {
            console.error('Photo upload failed:', error)
            throw new Error(error.response?.data?.error?.message || 'Failed to upload photo')
        }
    }

    /**
     * Upload multiple photos
     * @param {File[]} files - Array of image files
     * @param {Function} onProgress - Progress callback
     * @returns {Promise<string[]>} - Array of uploaded photo URLs
     */
    async uploadMultiplePhotos(files, onProgress = null) {
        const uploadPromises = files.map((file, index) => {
            return this.uploadPhoto(file, (progress) => {
                if (onProgress) {
                    const totalProgress = ((index + (progress / 100)) / files.length) * 100
                    onProgress(Math.round(totalProgress))
                }
            })
        })

        return Promise.all(uploadPromises)
    }

    /**
     * Delete photo from Cloudinary
     * @param {string} photoUrl - URL of photo to delete
     * @returns {Promise<void>}
     */
    async deletePhoto(photoUrl) {
        try {
            // Extract public_id from URL
            const publicId = this.extractPublicId(photoUrl)

            // Note: Deletion requires backend API call with Cloudinary API secret
            // This should be done server-side for security
            console.log('Delete photo:', publicId)

            // TODO: Call backend API to delete
            // await api.delete('/photos', { data: { publicId } })
        } catch (error) {
            console.error('Photo deletion failed:', error)
            throw error
        }
    }

    /**
     * Extract Cloudinary public_id from URL
     * @param {string} url - Cloudinary URL
     * @returns {string} - Public ID
     */
    extractPublicId(url) {
        const matches = url.match(/\/v\d+\/(.+)\.\w+$/)
        return matches ? matches[1] : null
    }

    /**
     * Compress image before upload (client-side)
     * @param {File} file - Image file
     * @param {number} maxWidth - Max width in pixels
     * @param {number} quality - Quality (0-1)
     * @returns {Promise<Blob>} - Compressed image blob
     */
    async compressImage(file, maxWidth = 1200, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)

            reader.onload = (event) => {
                const img = new Image()
                img.src = event.target.result

                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    let width = img.width
                    let height = img.height

                    // Calculate new dimensions
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width
                        width = maxWidth
                    }

                    canvas.width = width
                    canvas.height = height

                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, height)

                    canvas.toBlob(
                        (blob) => resolve(blob),
                        'image/jpeg',
                        quality
                    )
                }

                img.onerror = reject
            }

            reader.onerror = reject
        })
    }
}

export const photoService = new PhotoService()
