const AWS = require('aws-sdk');

// Configure AWS Rekognition
const rekognition = new AWS.Rekognition({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

class FaceDetectionService {
    /**
     * Compare face on ID document with profile photos
     * @param {string} idImagePath - Path to ID document image
     * @param {string} profileImagePath - Path to profile photo
     * @returns {Promise<{similarity: number, isMatch: boolean}>}
     */
    async compareFaces(idImagePath, profileImagePath) {
        try {
            const fs = require('fs');

            const idImage = fs.readFileSync(idImagePath);
            const profileImage = fs.readFileSync(profileImagePath);

            const params = {
                SourceImage: { Bytes: idImage },
                TargetImage: { Bytes: profileImage },
                SimilarityThreshold: 70 // Minimum 70% similarity
            };

            const result = await rekognition.compareFaces(params).promise();

            if (result.FaceMatches && result.FaceMatches.length > 0) {
                const similarity = result.FaceMatches[0].Similarity;
                return {
                    similarity: similarity,
                    isMatch: similarity >= 80 // 80% threshold for approval
                };
            }

            return { similarity: 0, isMatch: false };
        } catch (error) {
            console.error('Face comparison error:', error);
            throw new Error('Failed to compare faces');
        }
    }

    /**
     * Detect if image contains a real human face (not cartoon/AI)
     * @param {string} imagePath - Path to image
     * @returns {Promise<{isRealPhoto: boolean, confidence: number}>}
     */
    async detectRealFace(imagePath) {
        try {
            const fs = require('fs');
            const imageBytes = fs.readFileSync(imagePath);

            const params = {
                Image: { Bytes: imageBytes },
                Attributes: ['ALL']
            };

            const result = await rekognition.detectFaces(params).promise();

            if (result.FaceDetails && result.FaceDetails.length > 0) {
                const face = result.FaceDetails[0];

                // Check for real human characteristics
                const hasEyesOpen = face.EyesOpen && face.EyesOpen.Value;
                const hasMouthClosed = face.MouthOpen && !face.MouthOpen.Value;
                const confidence = face.Confidence;

                // Real photos typically have high confidence and natural features
                const isRealPhoto = confidence > 90 && (hasEyesOpen || hasMouthClosed);

                return {
                    isRealPhoto: isRealPhoto,
                    confidence: confidence,
                    faceCount: result.FaceDetails.length
                };
            }

            return { isRealPhoto: false, confidence: 0, faceCount: 0 };
        } catch (error) {
            console.error('Face detection error:', error);
            throw new Error('Failed to detect face');
        }
    }

    /**
     * Detect text on ID document (for authenticity check)
     * @param {string} imagePath - Path to ID document
     * @returns {Promise<{hasText: boolean, textCount: number}>}
     */
    async detectDocumentText(imagePath) {
        try {
            const fs = require('fs');
            const imageBytes = fs.readFileSync(imagePath);

            const params = {
                Image: { Bytes: imageBytes }
            };

            const result = await rekognition.detectText(params).promise();

            const textDetections = result.TextDetections || [];
            const hasText = textDetections.length > 5; // ID should have multiple text fields

            return {
                hasText: hasText,
                textCount: textDetections.length
            };
        } catch (error) {
            console.error('Text detection error:', error);
            return { hasText: false, textCount: 0 };
        }
    }
}

module.exports = new FaceDetectionService();
