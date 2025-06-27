import { Injectable } from '@nestjs/common'
import { EnumOrderStatus } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { productReturnObject } from 'src/product/return-product.object'
import { OrderDto } from './order.dto'
import { PaymentStatusDto } from './payment-status.dto'

@Injectable()
export class OrderService {
	constructor(private prisma: PrismaService) {}

	async getAll() {
		return this.prisma.order.findMany({
			orderBy: {
				createdAt: 'desc'
			},
			include: {
				items: {
					include: {
						product: {
							select: productReturnObject
						}
					}
				}
			}
		})
	}

	async byId(id: number) {
		return this.prisma.order.findUnique({
			where: { id },
			include: {
				items: {
					include: {
						product: {
							select: productReturnObject
						}
					}
				}
			}
		})
	}

	async getByUserId(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { email: true }
		})
		return this.prisma.order.findMany({
			where: {
				email: user.email
			},
			orderBy: {
				createdAt: 'desc'
			},
			include: {
				items: {
					include: {
						product: {
							select: productReturnObject
						}
					}
				}
			}
		})
	}

	async placeOrder(dto: OrderDto) {
		const { items, ...orderData } = dto
		const order = await this.prisma.order.create({
			data: {
				...orderData,
				items: {
					create: items.map(item => ({
						quantity: item.quantity,
						price: item.price,
						product: {
							connect: { id: item.productId }
						}
					}))
				}
				// user: {
				// 	connect: {
				// 		id: userId
				// 	}
				// }
			}
		})

		return order
	}

	async updateStatus(dto: PaymentStatusDto) {
		if (dto.event === 'payment.waiting_for_capture') {
			return
		}

		if (dto.event === 'payment.succeeded') {
			const orderId = Number(dto.object.description.split('#')[1])

			await this.prisma.order.update({
				where: {
					id: orderId
				},
				data: {
					status: EnumOrderStatus.PAYED
				}
			})

			return true
		}

		return true
	}
}
