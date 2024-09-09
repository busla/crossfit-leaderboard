"use client";

import React from "react";
import PaymentForm from "./components/payment";

const PaymentPage: React.FC = () => {
  const handlePaymentSubmit = async (msisdn: string) => {
    const paymentData = {
      msisdn,
      amount: 500, // Example amount
      description: "Aur Posi Web Api",
      orderid: "12345", // Example order ID
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback`, // Update to your callback route
    };

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      console.log(result);
      if (response.ok) {
        console.log("Payment created successfully:", result);
        alert("Payment was successful!");
      } else {
        console.error("Payment creation failed:", result.error);
        alert("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div>
      <h1>Make a Payment</h1>
      <PaymentForm onSubmit={handlePaymentSubmit} />
    </div>
  );
};

export default PaymentPage;
