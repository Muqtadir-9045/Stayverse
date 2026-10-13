// Inserts Cloudinary transformations into an image URL so the browser
// gets a resized, compressed copy instead of the original upload.
// Non-Cloudinary URLs (e.g. Unsplash seed data) are returned unchanged.
module.exports = (url, width) => {
    if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
        return url;
    }
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
};
