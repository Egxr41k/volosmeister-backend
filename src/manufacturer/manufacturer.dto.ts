import { IsString } from 'class-validator'

export class ManufacturerDto {
	@IsString()
	name: string
}
