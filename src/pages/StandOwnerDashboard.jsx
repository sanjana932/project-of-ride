import { Link } from "react-router-dom";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

function StandOwnerDashboard() {
  const [showQR, setShowQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("Pending");
const [transactionId, setTransactionId] = useState("");
const [paymentHistory, setPaymentHistory] = useState([]);

  const rentAmount = 500;

  const handlePayment = () => {
    if (rentAmount > 1000) {
      alert(
        "⚠️ Warning!\nRent amount seems unusually high. Please verify the amount before accepting payment."
      );
      return;
    }

    setShowQR(true);
  };

  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="owner-header">
        <h1>🏢 SmartRide AI</h1>
        <p>Stand Owner Dashboard</p>
      </div>

      {/* Welcome */}
      <div className="dashboard-card">
        <h2>👋 Welcome, Stand Owner</h2>
        <p>
          Manage your stand, drivers and rent payments.
        </p>
      </div>

      {/* Stand Details */}
      <div className="dashboard-card">
        <h3>📍 Stand Details</h3>

        <p>
          Stand Name: <strong>Main City Stand</strong>
        </p>

        <p>
          Location: <strong>Lucknow</strong>
        </p>

        <p>
          Total Drivers: <strong>5</strong>
        </p>
      </div>

      {/* Driver Details */}
      <div className="dashboard-card">
        <h3>👥 Drivers</h3>

        <p>🚗 Rahul — Rent: ₹500</p>
        <p>🚗 Amit — Rent: ₹500</p>
        <p>🚗 Raj — Rent: ₹500</p>
      </div>

      {/* Rent Payment */}
      <div className="dashboard-card">
        <h3>💰 Rent Payment</h3>

        <p>
          Monthly Rent: <strong>₹{rentAmount}</strong>
        </p>

        {/* Payment Status */}
        <p>
          Payment Status:{" "}
          <strong>
            {paymentStatus === "Paid"
          
              ? "🟢 Paid"
              : "🟡 Pending"}
          </strong>
        </p>

          {paymentStatus === "Paid" && (
  <p>
    Transaction ID: <strong>{transactionId}</strong>
  </p>
)}
        <button
          className="pay-btn"
          onClick={handlePayment}
        >
          📱 Generate QR / Pay
        </button>

        {/* QR */}
        {showQR && (
          <div className="qr-section">

            <h3>📱 Scan QR Code</h3>

            <div className="qr-placeholder">
              <QRCodeSVG
                value="upi://pay?pa=standowner@upi&pn=SmartRide%20Stand%20Owner&am=500&cu=INR"
                size={200}
              />
            </div>

            <p>
              Scan this QR code to complete the rent payment.
            </p>

           {paymentStatus === "Pending" && (
  <button
    className="pay-btn"
    onClick={() => {
      const id = "TXN" + Date.now();

      setTransactionId(id);
      setPaymentStatus("Paid");

      setPaymentHistory((prev) => {
        // Duplicate payment prevent
        if (prev.some((payment) => payment.status === "Paid")) {
          return prev;
        }

        return [
          ...prev,
          {
            driver: "Rahul",
            amount: rentAmount,
            status: "Paid",
            transactionId: id,
            date: new Date().toLocaleDateString(),
          },
        ];
      });

      setShowQR(false);
    }}
  >
    ✅ Verify Payment
  </button>
)}

          </div>
        )}
      </div>

      {/* Payment History */}
<div className="dashboard-card">
  <h3>📜 Payment History</h3>

  {paymentHistory.length === 0 ? (
    <p>No payment history yet.</p>
  ) : (
    paymentHistory.map((payment, index) => (
      <div key={index}>
        <p>
          👤 Driver: <strong>{payment.driver}</strong>
        </p>

        <p>
          💰 Amount: <strong>₹{payment.amount}</strong>
        </p>

        <p>
          🟢 Status: <strong>{payment.status}</strong>
        </p>

        <p>
          🧾 Transaction ID: <strong>{payment.transactionId}</strong>
        </p>

        <p>
          📅 Date: <strong>{payment.date}</strong>
        </p>

        <hr />
      </div>
    ))
  )}
</div>

      {/* Logout */}
      <Link to="/" className="logout-btn">
        🚪 Logout
      </Link>

    </div>
  );
}

export default StandOwnerDashboard;