import { Link } from "react-router-dom";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

function DriverDashboard() {
const [rentStatus, setRentStatus] = useState("Pending");
const [showQR, setShowQR] = useState(false);
const [transactionId, setTransactionId] = useState("");
const [paymentDate, setPaymentDate] = useState("");

const handlePayRent = () => {
  const rent = 500;

  if (rent > 1000) {
    alert(
      "⚠️ Warning: Rent amount seems unusually high. Please verify before payment."
    );
    return;
  }

  setShowQR(true);
};
  return (
    <div className="dashboard-page">

      <div className="driver-header">
        <h1>🚗 SmartRide AI</h1>
        <p>Driver Dashboard</p>
      </div>

      {/* Welcome */}
      <div className="dashboard-card">
        <h2>👋 Welcome, Driver</h2>
        <p>Manage your stand rent and payment from here.</p>
      </div>

      {/* Driver Details */}
      <div className="dashboard-card">
        <h3>👤 Driver Details</h3>

        <p>
          Name: <strong>Driver</strong>
        </p>

        <p>
          Vehicle: <strong>Auto</strong>
        </p>

        <p>
          Stand: <strong>Not Assigned</strong>
        </p>
      </div>

      {/* Rent */}
      <div className="dashboard-card">
        <h3>💰 Stand Rent</h3>

        <p>
          Monthly Rent: <strong>₹500</strong>
        </p>

        <p>
          Payment Status:{" "}
          <strong>
            {rentStatus === "Pending" ? "🔴 Pending" : "🟢 Paid"}
          </strong>
        </p>

{rentStatus === "Paid" && (
  <>
    <p>
      🧾 Transaction ID: <strong>{transactionId}</strong>
    </p>

    <p>
      📅 Payment Date: <strong>{paymentDate}</strong>
    </p>
  </>
)}
        {rentStatus === "Pending" && (
          <button
            className="pay-btn"
            onClick={handlePayRent}
          >
            💳 Pay Rent
          </button>
        )}
{showQR && rentStatus === "Pending" && (
  <div className="qr-section">

    <h3>📱 Scan QR Code</h3>

    <div className="qr-placeholder">
      <QRCodeSVG
        value="upi://pay?pa=standowner@upi&pn=SmartRide%20Stand%20Owner&am=500&cu=INR"
        size={200}
      />
    </div>

    <p>
      Scan the QR code to pay your monthly stand rent of ₹500.
    </p>

    <button
      className="pay-btn"
      onClick={() => {
        const id = "TXN" + Date.now();

        setTransactionId(id);
        setPaymentDate(new Date().toLocaleDateString());
        setRentStatus("Paid");
         setShowQR(false);
      }}
    >
      ✅ Verify Payment
    </button>

  </div>
)}
      </div>

      {/* Payment History */}
      <div className="dashboard-card">
        <h3>📜 Payment History</h3>

        {rentStatus === "Paid" ? (
          <p>₹500 — Paid Successfully</p>
        ) : (
          <p>No completed payments yet.</p>
        )}
      </div>

      {/* Logout */}
      <Link to="/" className="logout-btn">
        🚪 Logout
      </Link>

    </div>
  );
}

export default DriverDashboard;