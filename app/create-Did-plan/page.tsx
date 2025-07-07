"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/Header";

function Page() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // ✅ Form Data & Errors
  const [formData, setFormData] = useState({
    planname: '',
    country: '',
    description: '',
    price: '',
    call_limit: '',
    sms_limit: '',
    data_limit: '',
    validity: '',
    number_assign: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    if (savedState !== null) {
      setSidebarOpen(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const currentState = localStorage.getItem("sidebarOpen");
      if (currentState !== null) {
        setSidebarOpen(JSON.parse(currentState));
      }
    };
    const intervalId = setInterval(handleStorageChange, 300);
    return () => clearInterval(intervalId);
  }, []);

  // ✅ Handle Input Changes (includes $ formatting for price)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "price") {
      let priceValue = value.startsWith("$") ? value : `$${value}`;
      if (!priceValue.match(/^\$\d*\.?\d{0,2}$/)) return; // optional: prevent invalid price
      setFormData({ ...formData, [name]: priceValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Validation on Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    if (!formData.planname.trim()) newErrors.planname = "Plan name is required.";
    if (!formData.country.trim()) newErrors.country = "Country is required.";
    if (!formData.price || !formData.price.startsWith("$")) newErrors.price = "Valid price is required.";
    if (!formData.validity.trim()) newErrors.validity = "Validity is required.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // ✅ Submit form or API call here
      console.log("Form submitted:", formData);
    }
  };

  return (
    <>
      <div style={styles.pageContainer}>
        <Sidebar />
        <div
          style={{
            ...styles.mainWrapper,
            marginLeft: isSidebarOpen ? "257px" : "70px",
            transition: "margin-left 0.3s ease-in-out",
          }}
        >
          <Header />
          <div style={styles.contentWrapper}>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                {[
                  { label: "Plan Name", name: "planname", placeholder: "Enter plan name", required: true },
                  { label: "Country", name: "country", placeholder: "Enter country", required: true },
                  { label: "Description", name: "description", placeholder: "Enter description" },
                  { label: "Price (USD)", name: "price", placeholder: "Enter price (e.g., 40.00)", required: true },
                  { label: "Call Limit", name: "call_limit", placeholder: "Enter call limit (e.g., 10)" },
                  { label: "SMS Limit", name: "sms_limit", placeholder: "Enter SMS limit (e.g., 5)" },
                  { label: "Data Limit", name: "data_limit", placeholder: "Enter data limit (e.g., 5)" },
                  { label: "Validity (In Days)", name: "validity", placeholder: "Enter validity in days (e.g., 5)", required: true },
                  // { label: "Number Assign", name: "number_assign", placeholder: "Enter number assign", disabled: true },
                ].map(({ label, name, placeholder, required }) => (
                  <div key={name} style={styles.formGroup as React.CSSProperties}>
                    <label style={styles.label}>
                      {label} {required && <span style={{ color: "red" }}>*</span>}
                    </label>
                    <input
                      type="text"
                      name={name}
                      value={formData[name as keyof typeof formData]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      // disabled={disabled}
                      style={styles.input}
                      required={required}
                    />
                    {errors[name] && <span style={{ color: "red", fontSize: "0.8rem" }}>{errors[name]}</span>}
                  </div>
                ))}
              </div>
              <div style={styles.buttonGroup}>
                <button type="submit" style={styles.createButton}>
                  Create plan
                </button>
                <button type="button" style={styles.detailsButton} onClick={() => router.push("/DidPlanList")}>
  Details
</button>

              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}


export default Page;


const styles = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#f5f6f7'
  },
  mainWrapper: {
    flex: 1,
    marginLeft: '257px', 
    padding: '0rem'
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingTop: '1rem'
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '1.5rem'
  },
  
  formContainer: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1rem',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
  },
  formTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#444'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontWeight: '500',
    marginBottom: '0.1rem',
    color: '#333'
  },
  input: {
    padding: '0.4rem',
    border: '1px solid #ccc',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    outline: 'none'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem'
  },
  createButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  detailsButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid #ccc',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: 'pointer'
  }
};