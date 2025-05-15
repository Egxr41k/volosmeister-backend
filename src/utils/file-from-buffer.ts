export const fileFromBuffer = (
	filename: string,
	fileBuffer: Buffer
): Express.Multer.File => {
	return {
		fieldname: 'file',
		originalname: filename,
		encoding: '7bit',
		mimetype: 'image/jpeg',
		buffer: fileBuffer,
		size: fileBuffer.length,
		destination: '',
		filename: '',
		path: ''
	} as Express.Multer.File
}
