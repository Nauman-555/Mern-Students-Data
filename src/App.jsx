import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getDatabase,
  ref,
  onValue,
  push,
  remove,
  set,
} from "firebase/database";
import firebaseConfig from "./firebaseConfig";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [updateIndex, setUpdateIndex] = useState(null);
  const [updatedValues, setUpdatedValues] = useState({});

  useEffect(() => {
    const dataRef = ref(db, "csvData");
    onValue(dataRef, (snapshot) => {
      const fetchedData = snapshot.val();
      if (fetchedData) {
        const dataArray = Object.entries(fetchedData).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setData(dataArray);
      } else {
        setData([]);
      }
    });
  }, [db]);

  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = function (event) {
        const csvOutput = event.target.result;
        Papa.parse(csvOutput, {
          header: true,
          complete: function (results) {
            const parsedData = results.data;
            const dataRef = ref(db, "csvData");
            parsedData.forEach((item) => {
              push(dataRef, item);
            });
          },
        });
      };
      fileReader.readAsText(file);
    }
  };

  const handleUpdate = (index) => {
    setUpdateIndex(index);
    setUpdatedValues(data[index]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedValues({ ...updatedValues, [name]: value });
  };

  const handleUpdateSubmit = () => {
    // Update item in Firebase
    const itemRef = ref(db, `csvData/${data[updateIndex].id}`);
    set(itemRef, updatedValues);

    // Update item in the state
    const updatedData = [...data];
    updatedData[updateIndex] = updatedValues;
    setData(updatedData);

    // Clear update index and updated values
    setUpdateIndex(null);
    setUpdatedValues({});
  };

  const handleDelete = (index) => {
    // Remove item from Firebase
    const itemRef = ref(db, `csvData/${data[index].id}`);
    remove(itemRef);

    // Remove item from state
    const updatedData = [...data];
    updatedData.splice(index, 1);
    setData(updatedData);
  };

  const handleExportToPDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Add table headers
    const headers = Object.keys(data[0]).filter((key) => key !== "id");
    const tableData = data.map((item) =>
      Object.values(item).filter((value, index) => index !== 0)
    ); // Exclude 'id' values
    doc.autoTable({ head: [headers], body: tableData });

    // Save the PDF file
    doc.save("data.pdf");
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4 text-center">
        REACTJS CSV IMPORT EXAMPLE
      </h1>
      <form
        onSubmit={handleOnSubmit}
        className="mb-4 flex items-center justify-center"
      >
        <input
          type="file"
          id="csvFileInput"
          accept=".csv"
          onChange={handleOnChange}
          className="border border-gray-300 px-4 py-2 mr-2"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          IMPORT CSV
        </button>
      </form>
      <div className="w-full flex justify-center">
        <div className="w-3/4">
          <h2 className="text-center mb-4">
            Data from Firebase Realtime Database
          </h2>
          {data.length > 0 ? (
            <table className="table-auto mx-auto">
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key, index) => {
                    if (key !== "id") {
                      return (
                        <th key={index} className="py-2 px-4">
                          {key}
                        </th>
                      );
                    }
                    return null;
                  })}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    {Object.entries(item).map(([key, value]) => {
                      if (key !== "id") {
                        return (
                          <td key={key} className="py-2 px-4">
                            {value}
                          </td>
                        );
                      }
                      return null;
                    })}
                    {item.Name !== "" && (
                      <td className="py-2 px-4">
                        <button
                          onClick={() => handleUpdate(index)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center">No data available</p>
          )}
        </div>
      </div>
      {updateIndex !== null && (
        <div className="update-form mt-4">
          <h2 className="text-center mb-2">Update Item</h2>
          <form
            onSubmit={handleUpdateSubmit}
            className="flex flex-col items-center"
          >
            {Object.keys(updatedValues).map((key, index) => (
              <div key={index} className="mb-2">
                <label htmlFor={key} className="mr-2">
                  {key}
                </label>
                <input
                  type="text"
                  id={key}
                  name={key}
                  value={updatedValues[key]}
                  onChange={handleInputChange}
                  className="border border-gray-300 px-2 py-1"
                />
              </div>
            ))}
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Update
            </button>
          </form>
        </div>
      )}
      <div className="flex justify-center">
        <button
          onClick={handleExportToPDF}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Export to PDF
        </button>
      </div>
    </div>
  );
}

export default App;
