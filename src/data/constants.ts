export const JSON_FILE_NAMES = {
	PRODUCTS: 'products.json',
	CATEGORIES: 'categories.json',
	MANUFACTURERS: 'manufacturers.json',
	USERS: 'users.json'
} as const

export type JsonFileKey = keyof typeof JSON_FILE_NAMES
export type JsonFileName = (typeof JSON_FILE_NAMES)[JsonFileKey]

export const IMAGE_FOLDER = 'images'
