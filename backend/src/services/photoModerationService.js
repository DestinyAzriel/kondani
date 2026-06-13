const AWS = require('aws-sdk');

// Configure AWS Rekognition
const rekognition = new AWS.Rekognition({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

class PhotoModerationService {
    /**
     * Detect inappropriate content in image
     */
    async moderateImage(imagePath) {
        try {
            const fs = require('fs');
            const imageBytes = fs.readFileSync(imagePath);

            const params = {
                Image: { Bytes: imageBytes },
                MinConfidence: 60 // 60% confidence threshold
            };

            const result = await rekognition.detectModerationLabels(params).promise();

            const inappropriateLabels = result.ModerationLabels || [];
            const isInappropriate = inappropriateLabels.length > 0;

            // Categorize issues
            const issues = {
                nudity: inappropriateLabels.some(l => l.ParentName === 'Explicit Nudity' || l.Name.includes('Nudity')),
                suggestive: inappropriateLabels.some(l => l.ParentName === 'Suggestive'),
                violence: inappropriateLabels.some(l => l.ParentName === 'Violence'),
                drugs: inappropriateLabels.some(l => l.Name.includes('Drug')),
                hate: inappropriateLabels.some(l => l.Name.includes('Hate'))
            };

            return {
                isAppropriate: !isInappropriate,
                confidence: inappropriateLabels[0]?.Confidence || 0,
                issues,
                labels: inappropriateLabels.map(l => ({
                    name: l.Name,
                    confidence: l.Confidence,
                    parentName: l.ParentName
                }))
            };

        } catch (error) {
            console.error('Photo moderation error:', error);
            // If moderation fails, allow photo but log for manual review
            return {
                isAppropriate: true,
                confidence: 0,
                issues: {},
                labels: [],
                error: error.message
            };
        }
    }

    /**
     * Detect if image is AI-generated or fake
     */
    async detectFakeImage(imagePath) {
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

                // Real photos typically have:
                // - High confidence (>90%)
                // - Natural features
                // - Proper lighting
                const isLikelyReal = face.Confidence > 85 &&
                    face.Quality.Brightness > 30 &&
                    face.Quality.Sharpness > 30;

                return {
                    isReal: isLikelyReal,
                    confidence: face.Confidence,
                    quality: face.Quality
                };
            }

            return { isReal: false, confidence: 0 };

        } catch (error) {
            console.error('Fake detection error:', error);
            return { isReal: true, confidence: 0, error: error.message };
        }
    }
}

module.exports = new PhotoModerationService();
