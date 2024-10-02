import React, { useState, useRef, useEffect } from "react"
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
} from '@coreui/react'
import { DocsExample } from 'src/components'


const Typographyy = () => {
  const [formContainers, setFormContainers] = useState(1);
  const [submittedForms, setSubmittedForms] = useState([false]); // Track submission status for each form
  const formRefs = useRef([]); // Use an array to store refs for each form

  const addFormContainer = () => {
    setFormContainers(formContainers + 1);
    setSubmittedForms([...submittedForms, false]); // Add a new submission status for the added form
  };

  const handleSubmit = (event, index) => {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll("input, textarea, select");
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false;
      }
    });

    if (isValid) {
      const newSubmittedForms = [...submittedForms];
      newSubmittedForms[index] = true; // Mark the form as submitted
      setSubmittedForms(newSubmittedForms);
      // Here you can perform additional actions like submitting the form data
    } else {
      alert("Please fill in all fields before submitting.");
    }
  };

  useEffect(() => {
    if (formRefs.current[formContainers - 2]) {
      formRefs.current[formContainers - 2].scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [formContainers]);

  return (
    <div className="container">
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap");

        .text {
          margin-top: 100px;
          font-size: 50px;
          color: rgb(174, 170, 170);
        }

        * {
          font-family: "Open Sans", sans-serif;
        }

        .pageTitle {
          text-align: center;
          font-size: 35px;
          margin-bottom: 50px;
        }

        .container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .formSection {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .formWrapper {
          margin-bottom: 20px;
        }

        .proposalTitle {
          text-align: center;
          font-size: 35px;
          margin-bottom: 20px;
          margin-top: 20px;
        }

        /* Additional CSS for same-length class */
        .sameLength {
          width: calc(100% - 16px);
        }

        .container {
          position: relative;
        }

        .addButton {
          position: fixed;
          bottom: 50px;
          right: 60px;
          width: 75px;
          height: 75px;
          background-color: #8d4242;
          color: #fff;
          border: none;
          border-radius: 50%;
          font-size: 40px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }

        .addButton:hover {
          background-color: #673333;
        }

        .submissionIndicator {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          margin-top: 10px;
        }

        .orange {
          background-color: orange;
        }

        .red {
          background-color: red;
        }

        .green {
          background-color: green;
        }

        @keyframes formEntrance {
          0% {
            opacity: 0;
            transform: scale(0.5); /* Start smaller */
          }
          100% {
            opacity: 1;
            transform: scale(1); /* Pop up to full size */
          }
        }

        .animatedForm {
          animation: formEntrance 0.5s ease forwards;
          opacity: 0;
        }

        .formContainer {
          display: flex;
          width: 900px;
          height: 600px;
          background-color: white;
          border-radius: 20px;
          flex-direction: column;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          margin-top: 50px;
        }

        .formContainer button {
          padding: 12px 24px;
          background-color: #8d4242;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          width: 100px;
          height: 50px;
          position: relative;
          right: 130px;
          top: 100px;
        }

        .formContainer button:hover {
          background-color: #673333;
        }

        .formContainer label {
          font-weight: 600;
        }

        .cont1 {
          /* background-color: pink; */
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 70%;
          padding-top: 70px;
        }

        .cont1 .field {
          display: flex;
          align-items: center;
          width: 100%;
        }

        .cont1 .field label {
          display: inline-block; /* Ensures the width applies */
          width: 120px; /* Adjust the width to your preference */
          text-align: right; /* Aligns the text to the right */
          margin-right: 30px;
        }

        .cont1 .field input,
        .cont1 .field textarea {
          box-sizing: border-box;
          background-color: #d9d9d9;
        }

        .titleInput {
          max-width: 650px;
          border-radius: 15px;
          height: 60px;
        }
        .detailsInput {
          width: 650px;
          height: 150px;
          margin-top: 40px;
          border: none;
          border-radius: 15px;
          padding: 10px;
          resize: none;
          margin-left: 5px;
          font-size: 17px;
        }

        .cont2 {
          /* background-color: skyblue; */
          height: 50%;
          display: flex;
          gap: 40px;
          margin-left: 85px;
        }

        .cont2 .field {
          display: flex;
        }

        .cont2 .field label {
          margin-top: 15px;
          margin-right: 20px;
        }

        .clientInput {
          min-width: 255px;
          height: 30px;
          background-color: #d9d9d9;
          border-radius: 10px;
        }

        .fieldInput {
          width: 275px;
          height: 50px;
          background-color: #d9d9d9;
          border-radius: 10px;
          border: none;
          padding: 5px;
        }
      `}</style>
      
      <div className="formSection">
        <div className="formWrapper">
          <h2 className="pageTitle">PROPOSAL</h2>

          <form onSubmit={(event) => handleSubmit(event, 0)}>
            <div className="formContainer">
              <div className="cont1">
                <div className="field">
                  <label htmlFor="title">Title:</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="titleInput"
                  />
                </div>
                <div className="field">
                  <label htmlFor="details">Details:</label>
                  <textarea
                    type="text"
                    id="details"
                    name="details"
                    rows="4"
                    cols="50"
                    className="detailsInput"
                  />
                </div>
              </div>
              <div className="cont2">
                <div className="field">
                  <label htmlFor="client">Client:</label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    className="clientInput"
                  />
                </div>
                <div className="field">
                  <label htmlFor="field" className="fieldLabel">
                    Field:
                  </label>
                  <select id="field" name="field" className="fieldInput">
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                    {/* Add more options as needed */}
                  </select>
                </div>
                {!submittedForms[0] && <button type="submit">Submit</button>}
                {submittedForms[0] && (
                  <div className="submissionIndicator orange"></div>
                )}
              </div>
            </div>
          </form>
        </div>

        {[...Array(formContainers - 1)].map((_, index) => (
          <div
            className={`formWrapper animatedForm`}
            key={index + 1}
          >
            <form onSubmit={(event) => handleSubmit(event, index + 1)}>
              <div
                className="formContainer"
                ref={(ref) => (formRefs.current[index] = ref)}
              >
                <div className="cont1">
                  <div className="field">
                    <label htmlFor={`title_${index + 1}`}>Title:</label>
                    <input
                      type="text"
                      id={`title_${index + 1}`}
                      name={`title_${index + 1}`}
                      className="titleInput"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`details_${index + 1}`}>Details:</label>
                    <textarea
                      id={`details_${index + 1}`}
                      name={`details_${index + 1}`}
                      rows="4"
                      cols="50"
                      className="detailsInput"
                    />
                  </div>
                </div>
                <div className="cont2">
                  <div className="field">
                    <label htmlFor={`client_${index + 1}`}>Client:</label>
                    <input
                      type="text"
                      id={`client_${index + 1}`}
                      name={`client_${index + 1}`}
                      className="clientInput"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`field_${index + 1}`} className="fieldLabel">
                      Field:
                    </label>
                    <select
                      id={`field_${index + 1}`}
                      name={`field_${index + 1}`}
                      className="fieldInput"
                    >
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                      <option value="option3">Option 3</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>
                  {!submittedForms[index + 1] && (
                    <button type="submit">Submit</button>
                  )}
                  {submittedForms[index + 1] && (
                    <div className="submissionIndicator orange"></div>
                  )}
                </div>
              </div>
            </form>
          </div>
        ))}
      </div>
      <button className="addButton" onClick={addFormContainer}>
        +
      </button>
    </div>
    
  );
}

export default Typographyy
