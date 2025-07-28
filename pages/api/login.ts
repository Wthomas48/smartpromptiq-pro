import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // For demo purposes, redirect to a placeholder
    res.redirect(302, '/auth/signin');
  } else if (req.method === 'POST') {
    // Handle login logic here
    const { email, password } = req.body;
    
    // Demo authentication
    if (email && password) {
      res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        user: { email, id: '123' }
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Email and password required' 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
