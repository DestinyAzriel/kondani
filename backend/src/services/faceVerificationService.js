// Server-side face matching via AWS Rekognition CompareFaces.
// The score is computed on AWS (not the browser), so it can't be faked.
// Configured by env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION.
// If those aren't set, isConfigured() returns false and the caller falls back
// to leaving the verification pending.

const axios = require('axios');

let client = null;
let CompareFacesCommand = null;
const configured = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

if (configured) {
  try {
    const { RekognitionClient, CompareFacesCommand: CFC } = require('@aws-sdk/client-rekognition');
    CompareFacesCommand = CFC;
    client = new RekognitionClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
    console.log('[verify] AWS Rekognition configured — selfie verification is automatic.');
  } catch (e) {
    console.warn('[verify] @aws-sdk/client-rekognition not installed:', e.message);
  }
}

function isConfigured() {
  return !!client;
}

// Turn a Buffer or an image URL into raw bytes (<=5MB for Rekognition).
// Cloudinary URLs get a size-limit transform so big photos don't exceed the cap.
async function toBytes(input) {
  if (Buffer.isBuffer(input)) return input;
  let url = input;
  if (typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    url = url.replace('/image/upload/', '/image/upload/c_limit,w_1200,q_auto/');
  }
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
  return Buffer.from(res.data);
}

/**
 * Compare a reference image (profile photo) to a probe image (selfie).
 * @returns {Promise<{matched:boolean, similarity:number}>}
 */
async function compareFaces(referenceImage, probeImage) {
  const [refBytes, probeBytes] = await Promise.all([toBytes(referenceImage), toBytes(probeImage)]);
  const out = await client.send(new CompareFacesCommand({
    SourceImage: { Bytes: refBytes },
    TargetImage: { Bytes: probeBytes },
    SimilarityThreshold: 1 // return the best match so we can read its score
  }));
  const matches = out.FaceMatches || [];
  const similarity = matches.reduce((max, f) => Math.max(max, f.Similarity || 0), 0);
  return { matched: matches.length > 0, similarity };
}

module.exports = { isConfigured, compareFaces };
