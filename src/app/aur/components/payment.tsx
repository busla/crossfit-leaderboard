import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

interface PaymentFormProps {
  onSubmit: (msisdn: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit }) => {
  const [msisdn, setMsisdn] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (msisdn.length !== 7 || !/^\d+$/.test(msisdn)) {
      setError("Please enter a valid 7-digit phone number.");
      return;
    }
    setError("");
    onSubmit(msisdn);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <TextField
        label="Phone Number"
        value={msisdn}
        onChange={(e) => setMsisdn(e.target.value)}
        error={!!error}
        helperText={error || "Enter a 7-digit phone number"}
        inputProps={{ maxLength: 7 }}
      />
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </Box>
  );
};

export default PaymentForm;
