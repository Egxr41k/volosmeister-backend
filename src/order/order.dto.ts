import { EnumOrderStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
	IsArray,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested
} from 'class-validator'

export class OrderDto {
	@IsOptional()
	@IsEnum(EnumOrderStatus)
	status: EnumOrderStatus

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OrderItemDto)
	items: OrderItemDto[]

	@IsString()
	@IsNotEmpty()
	firstname: string

	@IsString()
	@IsNotEmpty()
	lastname: string

	@IsString()
	@IsNotEmpty()
	phone: string

	@IsEmail()
	email: string

	@IsString()
	@IsNotEmpty()
	city: string

	@IsString()
	@IsNotEmpty()
	novaPoshtaBranchNumber: string

	@IsNumber()
	total: number
}

export class OrderItemDto {
	@IsNumber()
	price: number

	@IsNumber()
	quantity: number

	@IsNumber()
	productId: number
}
