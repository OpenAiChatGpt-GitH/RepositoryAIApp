// refundService.ts
import { supabase } from "./supabaseClient";
import {
  MistralInputPayload,
  RefundDecisionResponse,
  RefundRequestForm,
} from "../types";
import {
  MISTRAL_AGENT_ID,
  MISTRAL_API_KEY,
  MISTRAL_API_URL,
} from "../constants";

/**
 * SIMULATED BACKEND HANDLER
 * ---------------------------------------------------------
 * In a real Vercel deployment, this logic should live inside
 * a serverless API route (e.g., /api/evaluate-refund) so that:
 * - Supabase SERVICE ROLE key (if used) and
 * - Mistral API key
 * are never exposed to the browser.
 *
 * For this demo in Google AI Studio, we treat this as a
 * "backend-like" service module.
 */

// ---------------------------------------------------------
// REFUND POLICY TEXT
// ---------------------------------------------------------
const REFUND_POLICY = `
REFUND POLICY
1. GENERAL RULES
- Refunds are allowed based on product category rules.
- Refund must be issued only to the original payment method.
- For all calculations, use Delivered Date from the database and the current date.
- SaleCategory = true -> Product is NON-REFUNDABLE.

2. CATEGORY-SPECIFIC RULES
A. ELECTRONICS
- Refund window: 15 days from Delivered Date.
- Must include original box and accessories.
- Customer-caused damage (broken, scratched) -> REJECT.

B. CLOTHING/APPAREL
- Refund window: 30 days.
- Must have tags attached.
- Clothing must not be worn, washed, or altered.

3. NON-REFUNDABLE RULES
- Any product with SaleCategory = true.
- Digital products
- Gift cards

4. ESCALATION RULES
ESCALATE when:
- Refund amount (product price) > 5000 (Any Category).
- OrderID or ProductID not found.
- Delivery date not available.
- Scenario unclear from provided reason.
- Indications of fraud or abuse.

5. REJECTION RULES
REJECT when:
- Outside refund window (15 days Electronics, 30 days Clothing).
- Sale product.
- Clothing reason suggests used/washed/no tags.
- Electronics reason suggests customer-caused damage.
`;

/**
 * Helper to calculate days between two dates.
 */
function getDaysDifference(fromDate: string, toDate: string): number {
  const d1 = new Date(fromDate);
  const d2 = new Date(toDate);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
}

export const evaluateRefundEligibility = async (
  formData: RefundRequestForm
): Promise<RefundDecisionResponse> => {
  // 1. Fetch order and product from Supabase
  const { orderId, productId } = formData;

  let orderData = null;
  let productData = null;

  // ---- Fetch order ----
  const { data: fetchedOrder, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (orderError || !fetchedOrder) {
    // FALLBACK MOCK DATA FOR DEMO PURPOSES
    // If the DB is empty or connection fails, we use this to allow the demo to proceed.
    if (orderId === "ORD5001") {
      console.warn("Supabase order not found, using MOCK data for ORD5001");
      
      // Dynamic dates relative to today for valid demo testing
      const now = new Date();
      const dOrdered = new Date(now); dOrdered.setDate(now.getDate() - 14);
      const dDelivered = new Date(now); dDelivered.setDate(now.getDate() - 10);

      orderData = {
        order_id: "ORD5001",
        ordered_date: dOrdered.toISOString().split("T")[0],
        delivered_date: dDelivered.toISOString().split("T")[0],
      };
    } else {
      // POLICY RULE: ESCALATE if OrderID not found
      return {
        decision: "ESCALATE",
        confidence: 1.0,
        product_details: {
          product_name: "Unknown Product",
          category: "Unknown",
          refund_amount: 0,
        },
        reasons: [`Order ID '${orderId}' not found in the system. Manual verification required.`],
      };
    }
  } else {
    orderData = fetchedOrder;
  }

  // ---- Fetch product ----
  const { data: fetchedProduct, error: productError } = await supabase
    .from("order_products")
    .select("*")
    .eq("product_id", productId)
    .eq("order_id", orderId)
    .single();

  if (productError || !fetchedProduct) {
    // FALLBACK MOCK DATA FOR DEMO PURPOSES
    if (orderId === "ORD5001") {
      if (productId === "P1001") {
        // Standard item
        productData = {
          product_id: "P1001",
          order_id: "ORD5001",
          name: "Wireless Headphones",
          category: "electronics",
          price: 1500, // < 5000
          sale_category: false,
        };
      } else if (productId === "P1002") {
        // Sale item
        productData = {
          product_id: "P1002",
          order_id: "ORD5001",
          name: "Discounted Smartwatch",
          category: "electronics",
          price: 2500,
          sale_category: true,
        };
      } else if (productId === "P1003") {
        // High Value item (> 5000)
        productData = {
          product_id: "P1003",
          order_id: "ORD5001",
          name: "Premium Gaming Monitor",
          category: "electronics",
          price: 15000, 
          sale_category: false,
        };
      } else {
         // POLICY RULE: ESCALATE if ProductID not found
         return {
          decision: "ESCALATE",
          confidence: 1.0,
          product_details: {
            product_name: "Unknown Product",
            category: "Unknown",
            refund_amount: 0,
          },
          reasons: [`Product ID '${productId}' not found in order '${orderId}'.`],
        };
      }
    } else {
       // POLICY RULE: ESCALATE if ProductID not found
       return {
        decision: "ESCALATE",
        confidence: 1.0,
        product_details: {
          product_name: "Unknown Product",
          category: "Unknown",
          refund_amount: 0,
        },
        reasons: [`Product ID '${productId}' not found in the system.`],
      };
    }
  } else {
    productData = fetchedProduct;
  }

  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  
  // ---------------------------------------------------------
  // DETERMINISTIC POLICY CALCULATIONS (The "Calculation")
  // ---------------------------------------------------------

  // 1. SALE ITEM CHECK
  if (productData.sale_category) {
    console.info(`Rejecting refund automatically: Product ${productData.product_id} is a Sale item.`);
    return {
      decision: "REJECT",
      confidence: 1.0,
      product_details: {
        product_name: productData.name,
        category: productData.category,
        refund_amount: productData.price,
      },
      reasons: ["Item is marked as Final Sale (sale_category=true)."],
    };
  }

  // 2. HIGH VALUE CHECK (> 5000 in ANY category)
  if (productData.price > 5000) {
    return {
      decision: "ESCALATE",
      confidence: 1.0,
      product_details: {
        product_name: productData.name,
        category: productData.category,
        refund_amount: productData.price,
      },
      reasons: [`Refund amount (Rs ${productData.price}) exceeds limit of Rs 5,000. Manual approval required.`],
    };
  }

  // 3. DATE WINDOW CHECK
  const daysSinceDelivery = getDaysDifference(orderData.delivered_date, today);
  const category = productData.category.toLowerCase();
  
  if (category === 'electronics') {
    if (daysSinceDelivery > 15) {
      return {
        decision: "REJECT",
        confidence: 1.0,
        product_details: {
          product_name: productData.name,
          category: productData.category,
          refund_amount: productData.price,
        },
        reasons: [`Return window expired. Electronics must be returned within 15 days. (Current: ${daysSinceDelivery} days since delivery)`],
      };
    }
  } else if (category === 'clothing' || category === 'apparel' || category === 'apparels') {
    if (daysSinceDelivery > 30) {
      return {
        decision: "REJECT",
        confidence: 1.0,
        product_details: {
          product_name: productData.name,
          category: productData.category,
          refund_amount: productData.price,
        },
        reasons: [`Return window expired. Clothing/Apparel must be returned within 30 days. (Current: ${daysSinceDelivery} days since delivery)`],
      };
    }
  }

  // ---------------------------------------------------------
  // AI CHECK (Subjective Reasons)
  // ---------------------------------------------------------
  
  // If deterministic checks pass, we use AI to validate the "Reason".
  const effectiveReason =
    formData.reason === "Other" && formData.otherReasonDescription
      ? formData.otherReasonDescription
      : formData.reason;

  const payload: MistralInputPayload = {
    order_id: orderData.order_id,
    product_id: productData.product_id,
    reason: effectiveReason,
    ordered_date: orderData.ordered_date,
    delivered_date: orderData.delivered_date,
    name: productData.name,
    category: productData.category,
    price: productData.price,
    sale_category: productData.sale_category,
    current_date: today,
  };

  const userPrompt = `
  Analyze this refund request against the attached Policy.
  The strict rules (Date window, Price limit, Sale status) have already been checked and passed.
  
  Your task is to evaluate the REASON.
  - If the reason implies customer-caused damage (Electronics) -> REJECT.
  - If the reason implies worn/washed/no tags (Clothing) -> REJECT.
  - If the reason is valid (e.g., "Item not as described", "Size issue" within window) -> APPROVE.
  - If the reason is unclear or indicates fraud -> ESCALATE.

  Context Data:
  ${JSON.stringify(payload)}

  ${REFUND_POLICY}
  `;

  // 3. Call Mistral Agent API
  try {
    const aiResponse = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        agent_id: MISTRAL_AGENT_ID,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("Mistral API Error:", errText);
      throw new Error("Failed to communicate with AI Agent.");
    }

    const aiJson = await aiResponse.json();
    const contentString = aiJson?.choices?.[0]?.message?.content;

    if (!contentString) {
      console.error("Mistral API response missing content:", aiJson);
      throw new Error("Empty response from AI Agent.");
    }

    const decision: RefundDecisionResponse = JSON.parse(contentString);

    // FORCE OVERWRITE: Ensure product details and amount come from our DB, not AI hallucination.
    decision.product_details = {
      product_name: productData.name,
      category: productData.category,
      refund_amount: productData.price,
    };

    return decision;
  } catch (e) {
    console.error("Error in AI evaluation:", e);
    // If AI fails but we passed strict checks, we might Default to Escalate for safety
    return {
      decision: "ESCALATE",
      confidence: 0.5,
      product_details: {
        product_name: productData.name,
        category: productData.category,
        refund_amount: productData.price,
      },
      reasons: ["AI Evaluation service unavailable. Manual review required."],
    };
  }
};