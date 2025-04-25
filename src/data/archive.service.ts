import { Injectable } from '@nestjs/common'
import { mkdtemp, readdir, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { basename, extname, join } from 'path'
import * as unzipper from 'unzipper'

@Injectable()
export class ArchiveService {
	async unzip(archive: Express.Multer.File): Promise<string[]> {
		// 1. Создаём временную папку
		const tempDir = await mkdtemp(join(tmpdir(), 'temp-'))

		// 2. Путь к zip-файлу
		const zipPath = join(tempDir, archive.originalname)
		await writeFile(zipPath, archive.buffer)

		// 3. Распаковка архива в ту же папку
		await unzipper.Open.file(zipPath).then(d => d.extract({ path: tempDir }))

		// 4. Получаем список всех файлов
		const outputDir = join(tempDir, basename(zipPath, extname(zipPath)))
		const files = await readdir(outputDir)

		// 5. (опционально) удаляем сам zip-файл
		await rm(zipPath, { force: true })

		// 6. Возвращаем список файлов
		return files
	}

	async zip() {}
}
