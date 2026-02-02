import React from "react";
import { QRCodeCanvas } from "qrcode.react";

const OrderQRCode = ({ order, size = 150 }) => {
  if (!order) return null;

  const qrValue = `📦 Order Details
--------------------
👤 Name: ${order.user?.name}
📞 Phone: ${order.user?.phone}
🏠 Address: ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}
--------------------
🛒 Products:
${order.orderItems
  .map(
    (item) =>
      `${item.name} x ${item.qty} = ₹${(item.price * item.qty).toFixed(2)}`
  )
  .join("\n")}
--------------------
💰 Total: ₹${order.totalPrice.toFixed(2)}
💳 Payment: ${order.paymentMethod}
🆔 Order ID: ${order._id}`;

  return (
    <div className="text-center">
      <QRCodeCanvas
        value={qrValue}
        size={size}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
        includeMargin={true}
      />
      <p className="small text-muted mt-1">Scan to view order #{order._id}</p>
    </div>
  );
};

export default OrderQRCode;