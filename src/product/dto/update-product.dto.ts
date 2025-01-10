import { Type } from 'class-transformer'
import { IsArray, IsOptional, ValidateNested } from 'class-validator'
import { FeatureDto } from 'src/feature/feature.dto'
import { PropertyDto } from 'src/property/property.dto'
import { ProductDto } from './product.dto'

export class UpdateProductDto extends ProductDto {
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => FeatureDto) // Указывает класс для вложенных элементов
	features?: FeatureDto[]

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => PropertyDto) // Указывает класс для вложенных элементов
	properties?: PropertyDto[]
}
