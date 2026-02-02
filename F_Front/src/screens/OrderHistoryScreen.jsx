import React, { useEffect } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { listMyOrders } from '../actions/orderActions';
import { Link } from 'react-router-dom';
import './HistoryText.css'; // Use your actual CSS file if this is correct

const OrderHistoryScreen = () => {
  const dispatch = useDispatch();

  const orderListMy = useSelector((state) => state.orderListMy);
  const { loading, error, orders } = orderListMy;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (!userInfo) {
      window.location.href = '/login?redirect=/orderhistory';
    } else {
      dispatch(listMyOrders());
    }
  }, [dispatch, userInfo]);

  return (
    <>
      <h2>My Orders</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>TRACKING ID</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>₹{order.totalPrice.toFixed(2)}</td>
                <td>{order.isPaid ? order.paidAt.substring(0, 10) : '❌'}</td>
                <td>{order.isDelivered ? order.deliveredAt.substring(0, 10) : '❌'}</td>
                <td>
                  {order.trackingId ? (
                    <div>
                      <Badge bg="success" className="mb-1">
                        {order.trackingId}
                      </Badge>
                      <br />
                      <small >
                        Track your order with this ID
                      </small>
                    </div>
                  ) : (
                    <Badge bg="secondary">
                      Not assigned yet
                    </Badge>
                  )}
                </td>
                <td>
                  <Link to={`/order/${order._id}`}>
                    <Button className="btn-sm" variant="light">
                      Details
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default OrderHistoryScreen;