import React, { useState } from "react";
import { Upload, Button, Spin, Radio } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedModel, setSelectedModel] = useState("optimized"); // Default model

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
      const response = await axios.post(
        `http://127.0.0.1:5000/predict/${selectedModel}`, // Send selected model in the URL
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data) {
        setPrediction(translatePrediction(response.data.prediction));
        setConfidence(response.data.confidence);
      } else {
        setError("No prediction received from server.");
      }
    } catch (err) {
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
    <div className="app-container bg">
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
            <img src={imageUrl} alt="Preview" className="image-display" />
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        {/* Radio buttons for selecting the model */}
        <div className="model-selector">
          <Radio.Group
            onChange={(e) => setSelectedModel(e.target.value)}
            value={selectedModel}
          >
            <Radio.Button value="optimized">Optimized Model</Radio.Button>
            <Radio.Button value="vgg16">VGG16</Radio.Button>
            {/* <Radio.Button value="effi">EFFI</Radio.Button> */}
          </Radio.Group>
        </div>

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
            <p className="confidence-text">
              Confidence: {confidence.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
