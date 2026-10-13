const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder:  "wanderlust_DEV", 
    allowed_formats: ['jpeg', 'png', 'jpg'],
    // cap stored images at 1600px wide so huge phone photos are not kept at full size
    transformation: [{ width: 1600, crop: "limit", quality: "auto" }],
  },
});

module.exports = { 
    cloudinary ,
    storage ,
};