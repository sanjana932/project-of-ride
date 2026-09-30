
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";

function StandOwnerDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDriver, setSelectedDriver] = useState(null);

  const [showQR, setShowQR] = useState(false);
  const [paymentDriver, setPaymentDriver] = useState(null);

  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [transactionId, setTransactionId] = useState("");

  const [paymentHistory, setPaymentHistory] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState("Auto");

  const rentAmount = 500;

  const vehicleTypes = [
    {
      name: "Auto",
      icon: "🚗",
    },
    {
      name: "E-Rickshaw",
      icon: "🛺",
    },
    {
      name: "Bike",
      icon: "🏍️",
    },
    {
      name: "Taxi",
      icon: "🚕",
    },
    {
      name: "Bus",
      icon: "🚌",
    },
  ];

  // ===============================
  // Fetch Drivers
  // ===============================

  const fetchDrivers = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/auth/drivers"
      );

      if (response.data.success) {
        setDrivers(response.data.drivers || []);
      }
    } catch (error) {
      console.error("DRIVER FETCH ERROR:", error);

      if (error.response) {
        alert(
          `❌ ${
            error.response.data.message ||
            "Unable to load drivers"
          }`
        );
      } else {
        alert(
          "❌ Backend se drivers ka data nahi aa raha."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // ===============================
  // Selected Vehicle Drivers
  // ===============================

  const selectedVehicleDrivers = drivers.filter(
    (driver) =>
      driver.vehicle === selectedVehicle
  );

  // ===============================
  // Mark Driver Left
  // ===============================

  const handleMarkLeft = async (driver) => {
    const confirmLeft = window.confirm(
      `Are you sure you want to mark ${driver.name} as Left?`
    );

    if (!confirmLeft) {
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/auth/drivers/${driver._id}/left`
      );

      if (response.data.success) {
        alert("✅ Driver marked as Left");

        await fetchDrivers();

        setSelectedDriver(response.data.driver);
      }
    } catch (error) {
      console.error("MARK LEFT ERROR:", error);

      alert(
        `❌ ${
          error.response?.data?.message ||
          "Unable to mark driver as Left"
        }`
      );
    }
  };

  // ===============================
  // Payment
  // ===============================

  const handlePayment = (driver) => {
    if (driver.status === "left") {
      alert(
        "🔴 This driver has left. Rent payment is disabled."
      );
      return;
    }

    if (rentAmount > 1000) {
      alert(
        "⚠️ Warning!\nRent amount seems unusually high. Please verify the amount."
      );
      return;
    }

    setPaymentDriver(driver);
    setPaymentStatus("Pending");
    setTransactionId("");
    setShowQR(true);
  };

  // ===============================
  // Verify Payment
  // ===============================

  const handleVerifyPayment = () => {
    if (!paymentDriver) {
      return;
    }

    const id = "TXN" + Date.now();

    setTransactionId(id);
    setPaymentStatus("Paid");

    const newPayment = {
      driverId: paymentDriver._id,
      driver: paymentDriver.name,
      vehicle: paymentDriver.vehicle,
      amount: rentAmount,
      status: "Paid",
      transactionId: id,
      date: new Date().toLocaleDateString(),
    };

    setPaymentHistory((prev) => [
      ...prev,
      newPayment,
    ]);

    setShowQR(false);

    alert(
      `✅ Payment Verified!\nDriver: ${paymentDriver.name}\nTransaction ID: ${id}`
    );
  };

  // ===============================
  // Driver Details
  // ===============================

  const openDriverDetails = (driver) => {
    setSelectedDriver(driver);
  };

  const closeDriverDetails = () => {
    setSelectedDriver(null);
  };

  return (
    <div className="dashboard-page">

      {/* ===============================
          Header
      =============================== */}

      <div className="owner-header">
        <h1>🏢 SmartRide AI</h1>
        <p>Stand Owner Dashboard</p>
      </div>

      {/* ===============================
          Welcome
      =============================== */}

      <div className="dashboard-card">
        <h2>
          👋 Welcome, {user?.name || "Stand Owner"}
        </h2>

        <p>
          Manage your stand, drivers and rent payments.
        </p>
      </div>

      {/* ===============================
          Stand Details
      =============================== */}

      <div className="dashboard-card">
        <h3>📍 Stand Details</h3>

        <p>
          Stand Name:{" "}
          <strong>
            {user?.standName || "Main City Stand"}
          </strong>
        </p>

        <p>
          Location:{" "}
          <strong>
            {user?.city || "Not Available"}
          </strong>
        </p>

        <p>
          Total Drivers:{" "}
          <strong>{drivers.length}</strong>
        </p>
      </div>

      {/* ===============================
          Vehicle Selector
      =============================== */}

      <div className="dashboard-card">

        <h2>🚘 Select Vehicle</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          {vehicleTypes.map((vehicle) => {
            const count = drivers.filter(
              (driver) =>
                driver.vehicle === vehicle.name
            ).length;

            const isSelected =
              selectedVehicle === vehicle.name;

            return (
              <button
                key={vehicle.name}
                type="button"
                onClick={() =>
                  setSelectedVehicle(
                    vehicle.name
                  )
                }
                style={{
                  padding: "14px 10px",
                  borderRadius: "10px",
                  border: isSelected
                    ? "2px solid #000"
                    : "1px solid #ccc",
                  background: isSelected
                    ? "#eeeeee"
                    : "#ffffff",
                  cursor: "pointer",
                  fontWeight: isSelected
                    ? "bold"
                    : "normal",
                  minHeight: "70px",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                  }}
                >
                  {vehicle.icon}
                </div>

                <div>
                  {vehicle.name}
                </div>

                <small>
                  {count} Driver
                  {count !== 1 ? "s" : ""}
                </small>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===============================
          Selected Vehicle Drivers
      =============================== */}

      <div className="dashboard-card">

        <h2>
          {
            vehicleTypes.find(
              (vehicle) =>
                vehicle.name === selectedVehicle
            )?.icon
          }{" "}
          {selectedVehicle} Drivers
        </h2>

        <p>
          Showing only{" "}
          <strong>{selectedVehicle}</strong>{" "}
          drivers.
        </p>

        {loading ? (
          <p>⏳ Loading drivers...</p>
        ) : selectedVehicleDrivers.length === 0 ? (
          <div
            style={{
              padding: "25px",
              textAlign: "center",
              border: "1px dashed #ccc",
              borderRadius: "10px",
            }}
          >
            <p>
              📭 No {selectedVehicle} drivers.
            </p>
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 8px",
              tableLayout: "auto",
              marginTop: "15px",
            }}
          >

            <thead>
              <tr>

                <th
                  style={{
                    width: "20%",
                    padding: "14px 18px",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    minWidth: "150px",
                  }}
                >
                  Driver
                </th>

                <th
                  style={{
                    width: "15%",
                    padding: "14px 18px",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    minWidth: "120px",
                  }}
                >
                  Vehicle
                </th>

                <th
                  style={{
                    width: "20%",
                    padding: "14px 18px",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    minWidth: "180px",
                  }}
                >
                  Stand
                </th>

                <th
                  style={{
                    width: "15%",
                    padding: "14px 18px",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    minWidth: "130px",
                  }}
                >
                  Status
                </th>

                <th
                  style={{
                    width: "30%",
                    padding: "14px 18px",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    minWidth: "190px",
                  }}
                >
                  Action
                </th>

              </tr>
            </thead>

            <tbody>
              {selectedVehicleDrivers.map(
                (driver) => (
                  <tr
                    key={driver._id}
                    style={{
                      background: "#f8f9fa",
                    }}
                  >

                    {/* Driver */}

                    <td
                      style={{
                        padding: "14px 18px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          openDriverDetails(driver)
                        }
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontWeight: "bold",
                          textDecoration:
                            "underline",
                          fontSize: "15px",
                          padding: 0,
                        }}
                      >
                        👤 {driver.name}
                      </button>
                    </td>

                    {/* Vehicle */}

                    <td
                      style={{
                        padding: "14px 18px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {driver.vehicle}
                    </td>

                    {/* Stand */}

                    <td
                      style={{
                        padding: "14px 18px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {driver.assignedStand ||
                        driver.standName ||
                        "Not Assigned"}
                    </td>

                    {/* Status */}

                    <td
                      style={{
                        padding: "14px 18px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {driver.status === "left" ? (
                        <strong>
                          🔴 Left
                        </strong>
                      ) : (
                        <strong>
                          🟢 Active
                        </strong>
                      )}
                    </td>

                    {/* Action */}

                    <td
                      style={{
                        padding: "14px 18px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {driver.status === "left" ? (
                        <button
                          type="button"
                          disabled
                          style={{
                            padding: "9px 14px",
                            opacity: 0.5,
                            cursor: "not-allowed",
                          }}
                        >
                          💳 Rent Disabled
                        </button>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <button
                            type="button"
                            className="pay-btn"
                            onClick={() =>
                              handlePayment(driver)
                            }
                            style={{
                              padding: "9px 14px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            💳 Rent
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleMarkLeft(driver)
                            }
                            style={{
                              padding: "9px 14px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            🔴 Left
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                )
              )}
            </tbody>

          </table>
        )}
      </div>

      {/* ===============================
          Payment QR
      =============================== */}

      {showQR && paymentDriver && (
        <div className="dashboard-card">

          <h2>💰 Rent Payment</h2>

          <p>
            Driver:{" "}
            <strong>
              {paymentDriver.name}
            </strong>
          </p>

          <p>
            Vehicle:{" "}
            <strong>
              {paymentDriver.vehicle}
            </strong>
          </p>

          <p>
            Monthly Rent:{" "}
            <strong>
              ₹{rentAmount}
            </strong>
          </p>

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
              Transaction ID:{" "}
              <strong>
                {transactionId}
              </strong>
            </p>
          )}

          <h3>📱 Scan QR Code</h3>

          <div className="qr-placeholder">
            <QRCodeSVG
              value={`upi://pay?pa=standowner@upi&pn=SmartRide%20Stand%20Owner&am=${rentAmount}&cu=INR`}
              size={200}
            />
          </div>

          <p>
            Scan this QR code to complete the
            rent payment.
          </p>

          {paymentStatus === "Pending" && (
            <button
              type="button"
              className="pay-btn"
              onClick={handleVerifyPayment}
            >
              ✅ Verify Payment
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setShowQR(false);
              setPaymentDriver(null);
            }}
            style={{
              marginLeft: "10px",
              padding: "9px 12px",
            }}
          >
            ❌ Close
          </button>

        </div>
      )}

      {/* ===============================
          Payment History
      =============================== */}

      <div className="dashboard-card">

        <h2>📜 Payment History</h2>

        {paymentHistory.length === 0 ? (
          <p>
            No payment history yet.
          </p>
        ) : (
          paymentHistory.map(
            (payment, index) => (
              <div key={index}>

                <p>
                  👤 Driver:{" "}
                  <strong>
                    {payment.driver}
                  </strong>
                </p>

                <p>
                  🚗 Vehicle:{" "}
                  <strong>
                    {payment.vehicle}
                  </strong>
                </p>

                <p>
                  💰 Amount:{" "}
                  <strong>
                    ₹{payment.amount}
                  </strong>
                </p>

                <p>
                  🟢 Status:{" "}
                  <strong>
                    {payment.status}
                  </strong>
                </p>

                <p>
                  🧾 Transaction ID:{" "}
                  <strong>
                    {payment.transactionId}
                  </strong>
                </p>

                <p>
                  📅 Date:{" "}
                  <strong>
                    {payment.date}
                  </strong>
                </p>

                <hr />

              </div>
            )
          )
        )}

      </div>

      {/* ===============================
          Driver Details
      =============================== */}

      {selectedDriver && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >

          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "25px",
              borderRadius: "10px",
            }}
          >

            <h2>
              👤 Driver Details
            </h2>

            <p>
              Name:{" "}
              <strong>
                {selectedDriver.name}
              </strong>
            </p>

            <p>
              Email:{" "}
              <strong>
                {selectedDriver.email}
              </strong>
            </p>

            <p>
              Phone:{" "}
              <strong>
                {selectedDriver.phone ||
                  "Not Available"}
              </strong>
            </p>

            <p>
              Vehicle:{" "}
              <strong>
                {selectedDriver.vehicle}
              </strong>
            </p>

            <p>
              City:{" "}
              <strong>
                {selectedDriver.city ||
                  "Not Available"}
              </strong>
            </p>

            <p>
              Stand:{" "}
              <strong>
                {selectedDriver.assignedStand ||
                  selectedDriver.standName ||
                  "Not Assigned"}
              </strong>
            </p>

            <p>
              Join Date:{" "}
              <strong>
                {selectedDriver.joinedDate
                  ? new Date(
                      selectedDriver.joinedDate
                    ).toLocaleDateString()
                  : "Not Available"}
              </strong>
            </p>

            <p>
              Leave Date:{" "}
              <strong>
                {selectedDriver.leftDate
                  ? new Date(
                      selectedDriver.leftDate
                    ).toLocaleDateString()
                  : "—"}
              </strong>
            </p>

            <p>
              Status:{" "}
              <strong>
                {selectedDriver.status === "left"
                  ? "🔴 Left"
                  : "🟢 Active"}
              </strong>
            </p>

            <h3>
              📜 Payment History
            </h3>

            {paymentHistory.filter(
              (payment) =>
                payment.driverId ===
                selectedDriver._id
            ).length === 0 ? (
              <p>
                No payment history for this
                driver.
              </p>
            ) : (
              paymentHistory
                .filter(
                  (payment) =>
                    payment.driverId ===
                    selectedDriver._id
                )
                .map(
                  (payment, index) => (
                    <div key={index}>

                      <p>
                        💰 Rent: ₹
                        {payment.amount}
                      </p>

                      <p>
                        🟢 Status:{" "}
                        {payment.status}
                      </p>

                      <p>
                        🧾 Transaction ID:{" "}
                        {payment.transactionId}
                      </p>

                      <p>
                        📅 Date:{" "}
                        {payment.date}
                      </p>

                      <hr />

                    </div>
                  )
                )
            )}

            <button
              type="button"
              onClick={closeDriverDetails}
              style={{
                marginTop: "15px",
                padding: "10px 20px",
              }}
            >
              ❌ Close
            </button>

          </div>
        </div>
      )}

      {/* ===============================
          Logout
      =============================== */}

      <Link
        to="/"
        className="logout-btn"
      >
        🚪 Logout
      </Link>

    </div>
  );
}

export default StandOwnerDashboard;

