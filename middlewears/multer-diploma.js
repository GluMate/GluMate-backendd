

import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/diplomas')
  },
  filename: function (req, file, cb) {
    const fileExt = file.originalname.split('.').pop();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + fileExt)
  }
})
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('application/pdf') ||
    file.mimetype.startsWith('application/msword') ||
    file.mimetype.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  ) {
    // Accept image files, PDFs, and Microsoft Word documents
    cb(null, true);
  } else {
    // Reject audio and video files
    cb(new Error('Audio and video files are not allowed!'), false);
  }
};
const uploadDiplomas = multer({ storage: storage ,
  fileFilter : fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  } })

export default uploadDiplomas ; 