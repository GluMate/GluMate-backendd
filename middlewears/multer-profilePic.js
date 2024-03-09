

import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/profile-pic')
  },
  filename: function (req, file, cb) {
    const fileExt = file.originalname.split('.').pop();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + fileExt)
  }
})

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
const uploadProfilePic = multer({ storage: storage ,
  fileFilter : imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }})

export default uploadProfilePic ; 