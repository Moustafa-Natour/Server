const { Router } = require('express');
const {
    getUsers,
    saveUser,
    updateUser,
    deleteUser,
    loginUser, // Import the loginUser function
} = require('../controllers/UserController');

const router = Router();

router.get('/getUsers', getUsers);

router.post('/saveUser', saveUser);

router.post('/login', loginUser);

router.put('/updateUser/:id', updateUser);

router.delete('/deleteUser/:id', deleteUser);

module.exports = router;
