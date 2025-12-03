import React, { useEffect } from 'react';

const PaymentSuccess = () => {
  useEffect(() => {
    // Redirect to home page after 3 seconds
    setTimeout(() => {
      window.location.href = "http://localhost:5173"; // Or any page you want to redirect to
    }, 3000); // 3 seconds delay
  }, []);

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Redirecting to the home page...</p>
    </div>
  );
};

export default PaymentSuccess;
