// Deprecated endpoint. Coupon logic lives in /api/coupon; kept as a re-export
// so any old caller of /api/coupon/apply keeps working without duplicate logic.
export { POST } from "@/app/api/coupon/route";
