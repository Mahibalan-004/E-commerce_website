import bcrypt from 'bcryptjs'

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '987-654-3210',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '987-654-3210',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '987-654-3210',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'Alice Smith',
    email: 'alice@example.com',
    phone: '123-456-7890',
    password: bcrypt.hashSync('123456', 10),
  },
]

export default users
