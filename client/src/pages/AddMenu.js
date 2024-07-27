import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import { useParams, useLocation } from "react-router-dom";

const AddMenu = () => {
  const { id } = useParams();
  const location = useLocation();
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    description: "",
    unit_price: "",
    meal_price: "",
    image: "",
    type: "",
    checked: false,
  });
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (location.state && location.state.item) {
      const data = location.state.item;
      // const imagePublicId = data.image.split('/').slice(-1)[0].split('.').slice(0, -1).join('.');
      setFormData({
        _id: data._id || "",
        name: data.name || "",
        description: data.description || "",
        unit_price: data.unit_price || "",
        meal_price: data.meal_price || "",
        image: data.image || "",
        type: data.type || "",
        checked: data.checked || false,
      });
    } else if (id) {
      fetch(`${process.env.REACT_APP_SERVER_URL}/api/getFoodItem/${id}`)
        .then(response => response.json())
        .then(data => {
          // const imagePublicId = data.image.split('/').slice(-1)[0].split('.').slice(0, -1).join('.');
          setFormData({
            _id: data._id || "",
            name: data.name || "",
            description: data.description || "",
            unit_price: data.unit_price || "",
            meal_price: data.meal_price || "",
            image: data.image || "",
            type: data.type || "",
            checked: data.checked || false,
          });
        })
        .catch(error => console.error("Error fetching food item:", error));
    }
  }, [id, location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);
        imageFormData.append("upload_preset", "ml_default");

        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/uploadImage`, {
          method: "POST",
          body: imageFormData,
        });
        const data = await response.json();
        imageUrl = data.secure_url;
      } else {
        imageUrl = formData.image;
      }

      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/upsertFoodItems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, image: imageUrl }),
      });

      if (response.ok) {
        setMessage(isEditing ? "Food menu item updated successfully!" : "Food menu item added successfully!");
        setFormData({
            _id: "",
            name: "",
            description: "",
            unit_price: "",
            meal_price: "",
            image: "",
            type: "",
            checked: false,
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      } else {
        setMessage(isEditing ? "Failed to update food menu item." : "Failed to add food menu item.");
      }
    } catch (error) {
      console.error("Error: " + error.message);
      setMessage(isEditing ? "Error updating food item to menu." : "Error adding food item to menu.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const alertVariant = message.includes("Error") ? "danger" : "success";

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const isEditing = id || (location.state && location.state.item);

  return (
    <div className="container mt-5" style={{ maxWidth: '75%' }}>
      <h1>{isEditing ? "Edit Food Menu Item" : "Add New Food Menu Item"}</h1>
      <Form onSubmit={handleSubmit}>
        <Row>
            <Col md={6}>
            <Form.Group controlId="formName" className="mb-3">
            <Form.Label className="text-start w-100">Name</Form.Label>
            <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
            />
            </Form.Group>
            </Col>
            <Col md={6}>
            <Form.Group controlId="formChecked" className="mb-3">
              <Form.Label className="text-start w-100">Display?</Form.Label> 
              <Form.Check
                type="checkbox"
                name="checked"
                checked={formData.checked}
                onChange={handleChange}
                className="text-start w-100"
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group controlId="formDescription" className="mb-3">
          <Form.Label className="text-start w-100">Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Row>
          <Col md={6}>
            <Form.Group controlId="formUnitPrice" className="mb-3">
              <Form.Label className="text-start w-100">Unit Price</Form.Label>
              <Form.Control
                type="number"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                required
                min="1"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formMealPrice" className="mb-3">
              <Form.Label className="text-start w-100">Meal Price</Form.Label>
              <Form.Control
                type="number"
                name="meal_price"
                value={formData.meal_price}
                onChange={handleChange}
                min="1"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group controlId="formImage" className="mb-3">
              <Form.Label className="text-start w-100">Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                onChange={handleFileChange}
                required={!isEditing}
                ref={fileInputRef}
              />
              {formData.image && (
                <div className="mt-2" style={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={formData.image}
                    alt="Current"
                    className="image-circle"
                  />
                </div>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formType" className="mb-3">
              <Form.Label className="text-start w-100">Type</Form.Label>
              <Form.Control
                as="select"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="entree">Entree</option>
                <option value="appetizer">Appetizer</option>
                <option value="dessert">Dessert</option>
              </Form.Control>
            </Form.Group>
          </Col>
          
        </Row>
        {message && <Alert className="mt-3" variant={alertVariant}>{message}</Alert>}
        <Button variant="primary" type="submit" className="my-5" disabled={isSubmitting}>
          {isSubmitting ? "Uploading..." : isEditing ? "Update Food Item" : "Add Food Item"}
        </Button>
      </Form>
    </div>
  );
};

export default AddMenu;
