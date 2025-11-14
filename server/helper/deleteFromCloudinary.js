import cloudinary from "../config/cloudinary.js";

export const deleteFromCloudinary = async (fileUrl, resourceType = "image") => {
  if (!fileUrl) {
    throw new Error("File URL is required for deletion.");
  }

  try {
    const urlParts = new URL(fileUrl);
    const pathname = urlParts.pathname;
   
    let publicIdWithExtension = pathname.substring(
      pathname.indexOf("/upload/") + 8
    );
 
    publicIdWithExtension = publicIdWithExtension.replace(/^v\d+\//, "");

 
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

 
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return result;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw error;
  }
};

export default deleteFromCloudinary;