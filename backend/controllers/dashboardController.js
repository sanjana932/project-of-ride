// Passenger Dashboard
export const passengerDashboard = (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome Passenger ${req.user.name}`,
  });
};

// Driver Dashboard
export const driverDashboard = (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome Driver ${req.user.name}`,
  });
};

// Stand Owner Dashboard
export const StandOwnerDashboard = (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome Stand Owner ${req.user.name}`,
  });
};