const path = require('path')
const { uploadFile, deleteFile, getFileStream } = require('../services/storage/storage.service')
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

const uploadMiddleware = upload.single('file')

async function uploadHandler(req, res, next) {
  try {
    if (!req.file) {return res.status(400).json({ message: 'No file provided.' })}

    const safeName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_')
    const objectName = `${Date.now()}-${safeName}`
    const url = await uploadFile(objectName, req.file.buffer, req.file.mimetype)

    res.status(201).json({ objectName, url })
  } catch (error) {
    next(error)
  }
}

async function getFileHandler(req, res, next) {
  try {
    const { name } = req.params
    const stream = await getFileStream(name)
    res.setHeader('Content-Disposition', `inline; filename="${name}"`)
    stream.pipe(res)
  } catch (error) {
    next(error)
  }
}

async function deleteHandler(req, res, next) {
  try {
    const { name } = req.params
    await deleteFile(name)
    res.json({ message: 'File deleted successfully.' })
  } catch (error) {
    next(error)
  }
}

module.exports = { uploadMiddleware, uploadHandler, getFileHandler, deleteHandler }