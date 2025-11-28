export interface Order {
  order_id: string;
  ordered_date: string;
  delivered_date: string;
}

export interface OrderProduct {
  product_id: string;
  order_id: string;
  name: string;
  category: 'electronics' | 'clothing' | string;
  price: number;
  sale_category: boolean;
}

export enum RefundReason {
  NOT_AS_DESCRIBED = "Item not as described",
  DAMAGED = "Received damaged",
  WRONG_ITEM = "Wrong item delivered",
  SIZE_ISSUE = "Size issue",
  COLOR_MISMATCH = "Color mismatch",
  CHANGED_MIND = "Changed my mind",
  OTHER = "Other"
}

export interface RefundRequestForm {
  orderId: string;
  productId: string;
  reason: RefundReason | "";
  otherReasonDescription: string;
}

export interface MistralInputPayload {
  order_id: string;
  product_id: string;
  reason: string;
  ordered_date: string;
  delivered_date: string;
  name: string;
  category: string;
  price: number;
  sale_category: boolean;
  current_date: string;
}

export interface ProductDetails {
  product_name: string;
  category: string;
  refund_amount: number;
}

export type DecisionType = "APPROVE" | "REJECT" | "ESCALATE";

export interface RefundDecisionResponse {
  decision: DecisionType;
  confidence: number;
  product_details: ProductDetails;
  reasons?: string[];
}
