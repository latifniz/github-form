"use client";

import React, { useState, useEffect } from "react";
// import { useRouter } from 'next/router'; // For navigation
import styles from "../styles/form.module.css";

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    githubUsername: "",
    githubPassword: "",
    githubEmail: "",
    githubToken: "",
  });

  // Check for login credentials in localStorage
  // useEffect(() => {
  //   const storedUsername = localStorage.getItem("user");
  //   const storedPassword = localStorage.getItem("pass");

  //   // If the credentials are not found, redirect to login page
  //   if (
  //     !storedUsername ||
  //     !storedPassword ||
  //     storedUsername !== "test" ||
  //     storedPassword !== "gotu123"
  //   ) {
  //     window.location.href = "/login"; // Redirect to login page if not logged in
  //   }
  // }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/form", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("Submitted successfully!");
      } else if (response.status === 400) {
        alert("An account already exists");
      } else if (response.status === 401) {
        alert(
          "Invalid GitHub credentials. Please check your username and token."
        );
      } else {
        alert("Something went wrong");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Submit GitHub Credentials</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {["githubUsername", "githubPassword", "githubEmail", "githubToken"].map(
          (field) => (
            <div key={field} className={styles.inputGroup}>
              <label htmlFor={field}>
                {field.replace("github", "").replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={formData[field as keyof typeof formData]}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          )
        )}
        <button type="submit" className={styles.button}>
          Submit
        </button>
      </form>
    </div>
  );
}
