import jwt from 'jsonwebtoken'


const isAuth = (req, res, next) => {
   try {
      const token = req.cookies.token
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' })
        }   
        req.userId = decoded.id
        next()
   } catch (error) {
      console.error('Authentication error:', error)
      res.status(401).json({ message: 'Unauthorized: Invalid token', error: error.message })
   }    }


   export default isAuth;