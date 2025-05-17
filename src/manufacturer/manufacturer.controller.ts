import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { ManufacturerDto } from './manufacturer.dto'
import { ManufacturerService } from './manufacturer.service'

@Controller('manufacturers')
export class ManufacturerController {
	constructor(private readonly manufacturerService: ManufacturerService) {}

	@Post()
	@Auth('admin')
	create(@Body() createManufacturerDto: ManufacturerDto) {
		return this.manufacturerService.create(createManufacturerDto)
	}

	@Get()
	findAll() {
		return this.manufacturerService.getAll()
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.manufacturerService.findOne(+id)
	}

	@Get('by-slug/:slug')
	async findBySlug(@Param('slug') slug: string) {
		return this.manufacturerService.bySlug(slug)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateManufacturerDto: ManufacturerDto
	) {
		return this.manufacturerService.update(+id, updateManufacturerDto)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Delete(':id')
	@Auth('admin')
	remove(@Param('id') id: string) {
		return this.manufacturerService.remove(+id)
	}
}
