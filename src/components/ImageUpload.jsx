import React, { useState } from "react";
import { Upload, Button, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const handleFileChange = ({ file }) => {
    const selectedFile = file.originFileObj || file;

    if (selectedFile instanceof Blob) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
      setError("");
    } else {
      setError("Invalid file format");
    }

    // Reset prediction and confidence when a new file is selected
    setPrediction(null);
    setConfidence(null);
  };

  const translatePrediction = (pred) => {
    switch (pred) {
      case "half_ripened":
        return "Half ripened";
      case "fully_ripened":
        return "Fully ripened";
      case "green":
        return "Green";
      default:
        return pred;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please upload a file first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("https://tomatoes-classification-be.onrender.com/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data) {
        // Update with translated prediction
        setPrediction(translatePrediction(response.data.prediction));
        setConfidence(response.data.confidence);
      } else {
        setError("No prediction received from server.");
      }
    } catch (err) {
      // Handle errors from the server
      if (err.response) {
        setError(`Error: ${err.response.data.error || "Unknown error occurred."}`);
      } else {
        setError("Error occurred while uploading image.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="upload-container">
        <h2 className="title">Upload an Image for Prediction</h2>

        <Upload
          beforeUpload={() => false} // Prevent automatic upload
          onChange={handleFileChange}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} className="upload-button">
            Select Image
          </Button>
        </Upload>

        {imageUrl && (
          <div className="image-preview">
            <img
              src={imageUrl}
              alt="Preview"
              className="image-display"
            />
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        <Button
          type="primary"
          onClick={handleUpload}
          disabled={loading}
          className="predict-button"
        >
          {loading ? <Spin /> : "Upload and Predict"}
        </Button>

        {prediction && (
          <div className="result-container">
            <p className="result-text">Prediction: {prediction}</p>
            <p className="confidence-text">Confidence: {confidence.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
