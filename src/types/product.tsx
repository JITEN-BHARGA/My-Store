export interface Product {
  _id?: string
  name: string
  imageURL: string[]
  currentPrice: number
  discount: number
  companyName: string
  itemInfo : string
  finalPrice : number
  averageRating?: number
  reviewCount?: number
  stock: number
}
