import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { saveShippingAddress } from '../actions/cartActions'
import CheckoutSteps from '../components/CheckoutSteps'
import FormContainer from '../components/FormContainer'
import './ShippingScreen.css' // Import the CSS file


const ShippingScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const cart = useSelector((state) => state.cart)
  const { shippingAddress } = cart

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const [address, setAddress] = useState(shippingAddress?.address || '')
  const [city, setCity] = useState(shippingAddress?.city || '')
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '')
  const [country, setCountry] = useState(shippingAddress?.country || '')

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/shipping')
    }
    window.scrollTo(0, 0) // Optional: Scroll to top on mount
  }, [userInfo, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(saveShippingAddress({ address, city, postalCode, country }))
    navigate('/payment') // Go to payment screen after saving
  }

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />

      <div className="shipping-form-container">
        <h1>Shipping</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='address' className='mb-3'>
            <Form.Label>Address</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter address'
              value={address}
              required
              onChange={(e) => setAddress(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId='city' className='mb-3'>
            <Form.Label>City</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter city'
              value={city}
              required
              onChange={(e) => setCity(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId='postalCode' className='mb-3'>
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter postal code'
              value={postalCode}
              required
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId='country' className='mb-3'>
            <Form.Label>Country</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter country'
              value={country}
              required
              onChange={(e) => setCountry(e.target.value)}
            />
          </Form.Group>

          <Button type='submit' variant='primary' className='mt-3'>
            Continue
          </Button>
        </Form>
      </div>

    </FormContainer>
  )
}

export default ShippingScreen

