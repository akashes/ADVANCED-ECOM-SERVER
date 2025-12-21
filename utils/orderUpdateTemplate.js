import dotenv from 'dotenv'
dotenv.config()

export const orderUpdateTemplate = (name, orderId, orderStatus) => {
  const statusMap = {
    pending: { label: "Pending", icon: "⏳", class: "pending" },
    confirmed: { label: "Confirmed", icon: "✔", class: "confirmed" },
    shipped: { label: "Shipped", icon: "🚚", class: "shipped" },
    "on-the-way": { label: "On The Way", icon: "➡", class: "ontheway" },
    delivered: { label: "Delivered", icon: "✅", class: "delivered" },
  };

  const current = statusMap[orderStatus];

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Order Status Update</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 20px auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
      h2 { text-align: center; color: #333; }
      .status-list { list-style: none; padding: 0; margin: 20px 0; }
      .status-item { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; font-size: 16px; }
      .icon { width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #fff; font-size: 14px; font-weight: bold; }
      .pending { background: #ffc107; }
      .confirmed { background: #17a2b8; }
      .shipped { background: #007bff; }
      .ontheway { background: #6f42c1; }
      .delivered { background: #28a745; }
      .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>📦 Order Status Update</h2>
      <p>Hello, ${name}</p>
      <p>Your order <strong>(${orderId})</strong> STATUS has been updated!</p>

      <ul class="status-list">
        ${
          current
            ? `<li class="status-item">
                 <span class="icon ${current.class}">${current.icon}</span> 
                 ${current.label}
               </li>`
            : ""
        }
      </ul>

<p style="margin-top:20px;">
👉 You can track your order anytime by visiting 
<a href="${process.env.USER_FRONTEND_URL}/order/${orderId}">your order page</a>.
</p>
      <div class="footer">
        <p>Thank you for shopping with <strong>YourShop</strong>!</p>
      </div>
    </div>
  </body>
  </html>`;
};
