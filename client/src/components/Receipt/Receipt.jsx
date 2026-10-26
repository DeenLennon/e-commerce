
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  FiDownload,
  FiImage,
  FiShare2,
} from "react-icons/fi";

import "./Receipt.scss";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(Number(amount || 0));

const Receipt = ({ order }) => {
  const receiptRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  // Only show a receipt for an order marked as paid.
  if (
    !order ||
    String(order.payment_status || "").toLowerCase() !== "paid"
  ) {
    return null;
  }

  const items = Array.isArray(order.items) ? order.items : [];

  const getReceiptImage = async () => {
    if (!receiptRef.current) {
      throw new Error("Receipt is not available.");
    }

    return html2canvas(receiptRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
  };

  const getFilename = () =>
    `DIRECTLINKS-receipt-${order.order_number || order.id || "order"}`;

  const handleDownloadImage = async () => {
    try {
      setBusy(true);
      setMessage("");

      const canvas = await getReceiptImage();
      const link = document.createElement("a");

      link.download = `${getFilename()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Receipt image error:", error);
      setMessage("Unable to create the receipt image. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setBusy(true);
      setMessage("");

      const canvas = await getReceiptImage();
      const image = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imageWidth = pageWidth - margin * 2;
      const imageHeight =
        (canvas.height * imageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = margin;

      pdf.addImage(
        image,
        "PNG",
        margin,
        position,
        imageWidth,
        imageHeight
      );

      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = margin - (imageHeight - heightLeft);
        pdf.addPage();

        pdf.addImage(
          image,
          "PNG",
          margin,
          position,
          imageWidth,
          imageHeight
        );

        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(`${getFilename()}.pdf`);
    } catch (error) {
      console.error("Receipt PDF error:", error);
      setMessage("Unable to create the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    try {
      setBusy(true);
      setMessage("");

      if (!navigator.share) {
        setMessage(
          "File sharing is not supported in this browser. Download the PNG to share it manually."
        );
        return;
      }

      const canvas = await getReceiptImage();

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Could not create receipt image."));
        }, "image/png");
      });

      const file = new File(
        [blob],
        `${getFilename()}.png`,
        { type: "image/png" }
      );

      if (
        navigator.canShare &&
        !navigator.canShare({ files: [file] })
      ) {
        setMessage(
          "Your browser cannot share image files. Download the PNG and share it manually."
        );
        return;
      }

      await navigator.share({
        title: "DIRECTLINKS Order Receipt",
        text: `Receipt for order ${order.order_number || order.id}`,
        files: [file],
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Receipt sharing error:", error);
        setMessage("Unable to share the receipt. You can download the PNG instead.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="receipt-wrapper">
      <div className="receipt" id="order-receipt" ref={receiptRef}>
        <header className="receipt-header">
          <h1>DIRECTLINKS</h1>
          <p>PAYMENT RECEIPT</p>
          <span>Thank you for shopping with us!</span>
          <strong className="receipt-paid">PAYMENT CONFIRMED</strong>
        </header>

        <div className="receipt-details">
          <div>
            <span>Order Number</span>
            <strong>{order.order_number || order.id}</strong>
          </div>

          <div>
            <span>Order Date</span>
            <strong>
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString("en-NG")
                : "Not available"}
            </strong>
          </div>

          <div>
            <span>Order Status</span>
            <strong>{order.order_status || order.status || "Pending"}</strong>
          </div>

          <div>
            <span>Payment Status</span>
            <strong>Paid</strong>
          </div>
        </div>

        <div className="receipt-address">
          <h3>Delivery Address</h3>
          <p>
            {order.shipping_first_name || ""}{" "}
            {order.shipping_last_name || ""}
          </p>
          <p>{order.shipping_address || ""}</p>
          <p>
            {[
              order.shipping_city,
              order.shipping_state,
              order.shipping_country,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          {order.shipping_postal_code && (
            <p>{order.shipping_postal_code}</p>
          )}
          <p>{order.shipping_phone || ""}</p>
        </div>

        <div className="receipt-items">
          <h3>Items Purchased</h3>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{item.product_name || item.name || "Product"}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>
                    {formatCurrency(
                      item.subtotal ??
                        Number(item.price || 0) *
                          Number(item.quantity || 0)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="receipt-totals">
          <p>
            <span>Subtotal</span>
            <strong>{formatCurrency(order.subtotal)}</strong>
          </p>
          <p>
            <span>Shipping</span>
            <strong>{formatCurrency(order.shipping_fee)}</strong>
          </p>
          <p>
            <span>Discount</span>
            <strong>{formatCurrency(order.discount)}</strong>
          </p>
          <p className="receipt-grand-total">
            <span>Total Paid</span>
            <strong>{formatCurrency(order.total_amount)}</strong>
          </p>
        </div>

        <footer className="receipt-footer">
          <p>DIRECTLINKS — Quality products, trusted service.</p>
          <small>Keep this receipt for your records.</small>
        </footer>
      </div>

      <div className="receipt-actions">
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={busy}
        >
          <FiDownload />
          Download PDF
        </button>

        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={busy}
        >
          <FiImage />
          Download PNG
        </button>

        <button
          type="button"
          onClick={handleShare}
          disabled={busy}
        >
          <FiShare2 />
          Share Receipt
        </button>
      </div>

      {busy && <p className="receipt-message">Preparing your receipt...</p>}
      {message && <p className="receipt-message">{message}</p>}
    </section>
  );
};

export default Receipt;
