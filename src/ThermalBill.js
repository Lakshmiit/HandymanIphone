import React from "react";

export default function ThermalBill() {
  const customerName = "Ramesh";
  const address = "MG Road";
  const district = "Hyderabad";
  const state = "Telangana";
  const pincode = "500001";
  const mobileNumber = "9876543210";
  const date = new Date().toISOString();

  const items = [
    {
      name: "Rice 1Kg",
      quantity: 2,
      afterDiscountPrice: 50,
      total: 100,
    },
    {
      name: "Sunflower Oil 1L",
      quantity: 1,
      afterDiscountPrice: 120,
      total: 120,
    },
  ];

  const grandTotal = items.reduce((sum, item) => sum + Number(item.total), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={handlePrint}
        style={{
          background: "red",
          color: "white",
          borderRadius: "20px",
          padding: "8px 18px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Print Bill
      </button>

      {/* Thermal Receipt */}
      <div className="thermal-print">
        <div className="receipt">
          <h2 className="center">DMART</h2>
          <p className="center">Thank You Visit Again</p>
          <hr />

          <p>
            <strong>Customer:</strong> {customerName}
          </p>
          <p>
            {[address, district, state, pincode, mobileNumber]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p>Date: {date.split("T")[0]}</p>

          <hr />

          {items.map((item, index) => (
            <div key={index} className="item">
              <div>
                {index + 1}. {item.name}
              </div>
              <div className="row">
                <span>
                  {item.quantity} × {item.afterDiscountPrice}
                </span>
                <span>{item.total}</span>
              </div>
            </div>
          ))}

          <hr />

          <h3 className="right">Total: Rs. {grandTotal}</h3>

          <hr />
          <p className="center">***** Thank You *****</p>
        </div>
      </div>
    </div>
  );
}
