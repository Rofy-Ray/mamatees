import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import {
    Container,
    Form,
    ListGroup,
    Button,
    Alert,
} from "react-bootstrap";

const FixMenu = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);
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
                history.push('/orders');
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

    if (loading) return <p>Loading...</p>;

    return (
        <Container className="mt-4">
            <h2>Fix Menu</h2>
            <ListGroup className="mt-3" variant="flush" striped hover>
                {foodItems.map((item) => (
                    <ListGroup.Item key={item._id} className="d-flex align-items-center">
                        <Form.Check
                            type="checkbox"
                            checked={item.checked || false}
                            onChange={() => handleCheckboxChange(item._id)}
                            className="me-2"
                        />
                        {item.name}
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
        </Container>
    );
};

export default FixMenu;
