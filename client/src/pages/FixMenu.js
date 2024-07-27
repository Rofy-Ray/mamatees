import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Form,
    ListGroup,
    Button,
    Alert,
    Modal,
} from "react-bootstrap";
import { Pencil, Trash } from 'react-bootstrap-icons';
import { useHistory } from 'react-router-dom';

const FixMenu = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const history = useHistory();

    useEffect(() => {
        const fetchFoodItems = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/getFoodItems`);
                setFoodItems(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching food items", error);
                setLoading(false);
            }
        };
        fetchFoodItems();
    }, []);

    const handleCheckboxChange = (id) => {
        setFoodItems((prevItems) =>
            prevItems.map((item) =>
                item._id === id ? { ...item, checked: !item.checked } : item
            )
        );
    };

    const handlePublish = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/updateMenuItems`, {
                items: foodItems
            });
            setAlertMessage("Public menu updated successfully!");
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        } catch (error) {
            console.error("Error updating menu items", error);
            setAlertMessage("Error updating menu items.");
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
            }, 3000); 
        }
    };

    const handleEdit = (id) => {
        const itemToEdit = foodItems.find(item => item._id === id);
        history.push('/edit', { item: itemToEdit });
    };      
      

    const handleDelete = (id) => {
        setDeleteItemId(id);
        setShowModal(true);
    };

    // Function to confirm delete
    const confirmDelete = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_SERVER_URL}/api/deleteFoodItem/${deleteItemId}`);
            setFoodItems(foodItems.filter(item => item._id !== deleteItemId));
            setAlertMessage("Food item deleted successfully!");
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        } catch (error) {
            console.error("Error deleting food item", error);
            setAlertMessage("Error deleting food item.");
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        } finally {
            setShowModal(false);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <Container className="mt-4">
            <h2>Fix Menu</h2>
            <ListGroup className="mt-3" variant="flush">
                {foodItems.map((item) => (
                    <ListGroup.Item action key={item._id} className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                        <Form.Check
                            type="checkbox"
                            checked={item.checked || false}
                            onChange={() => handleCheckboxChange(item._id)}
                            className="me-2"
                        />
                        {item.name}
                        </div>
                        <div>
                            <Pencil className="me-3" style={{ cursor: 'pointer' }} onClick={() => handleEdit(item._id)} />
                            <Trash style={{ cursor: 'pointer', color: '#ff0000' }} onClick={() => handleDelete(item._id)} />
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <Button className="my-5" variant="primary" onClick={handlePublish}>
                Publish
            </Button>
            {showAlert && (
                <Alert variant={alertMessage.includes("successfully") ? "success" : "danger"} 
                       dismissible 
                       onClose={() => setShowAlert(false)}
                       className="position-fixed top-0 start-50 translate-middle-x w-50">
                    {alertMessage}
                </Alert>
            )}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this food item?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Yes, delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default FixMenu;
