const express = require('express')

const router = express.Router();

//SIGN UP - SIGN IN - LOGOUT - DETAILS
const userSignUpController = require("../controller/Users/userSignUp");
const userSignInController = require('../controller/Users/userSignIn');
const userLogoutController = require('../controller/Users/userLogout');
const userDetailsController = require('../controller/Users/userDetails');

//Google Login - Sign Up
const googleAuthController = require('../controller/Users/googleAuth');


//MIDDLWARE
const authToken = require('../middleware/authToken');

//ADMIN USERS
const AllUsersController = require('../controller/Users/getAllUsers');
const updateUserController = require('../controller/Users/updateUser');
const deleteUserController = require('../controller/Users/deleteUser');

//Roles Permisos
const { getAllRolesPermissions, updateRolePermissions } = require('../controller/RolePermission/rolePermissions');
const { createRole, deleteRole } = require('../controller/RolePermission/create_Delete_RolePermission');


//PROFILE
const updateProfileController = require('../controller/Users/updateProfile');
const deleteProfileController = require('../controller/Users/DeleteProfile');

//PRODUCTS
const uploadProduct = require('../controller/Products/uploadProduct');
const getAllProducts = require('../controller/Products/getAllProducts');
const updateProduct = require('../controller/Products/updateProduct');
const deleteProduct = require('../controller/Products/deleteProduct');
const getOneProductByCategory = require('../controller/Products/getOneProductByCategory');
const getProductsByCategory = require('../controller/Products/getProductsByCategory');
const getProductDetails = require('../controller/Products/getProductDetails');
const searchProducts = require('../controller/Products/searchProducts');
const filterProducts = require('../controller/Products/filterProducts');
const productCategory = require('../controller/Products/productCategory');


//Cart items
const addToCart = require('../controller/Cart/addToCart');
const countAddToCartProduct = require('../controller/Cart/countAddToCart');
const viewCartItems = require('../controller/Cart/viewCartItems');
const deleteCartItems = require('../controller/Cart/deleteCartItems');
const updateCartItems = require('../controller/Cart/updateCartItems');



// review products
const createProductReview = require('../controller/Reviews/createReview');
const getProductReview = require('../controller/Reviews/getProductReview');
const updateReview = require('../controller/Reviews/updateReview');
const getProductReviewAverage = require('../controller/Reviews/getProductReviewAverage');
const deleteReview = require('../controller/Reviews/deleteReview');
const getProductReviews = require('../controller/Reviews/getProductReviews');


//Orders
const payment = require('../controller/Order/payment');
const webhooks = require('../controller/Order/webhook');
const User_Order = require('../controller/Order/User_Order');
const allOrder = require('../controller/Order/allOrder');



// LOG IN - SIGNUP - LOLGOUT
router.post("/signup", userSignUpController);
router.post("/signin", userSignInController);
router.post("/userLogout", userLogoutController) ////se le pone post porque si pongo get hay problemas con las cookies en deployment
router.post("/google-auth", googleAuthController)


//User information
router.get("/user-details", authToken, userDetailsController);

//Admin panel
router.get("/all-user", authToken, AllUsersController); //admin y superadmin pueden hacer esto
router.put("/update-user", authToken, updateUserController); //solo superadmin puede hacer esto
router.delete("/delete-user", authToken, deleteUserController); //solo superadmin puede hacer esto

//Role-Permission
router.put("/role-permissions", authToken, updateRolePermissions); //actualizar
router.get("/role-permissions", authToken, getAllRolesPermissions); //obtener los roles y permisos
router.post("/create-role", authToken, createRole); //obtener los roles y permisos
router.delete("/delete-role/:role", authToken, deleteRole); //elimina un rol , aca puede pasarse el rol por body o params


//profile
router.put("/update-profile", authToken, updateProfileController); //actualizar
router.delete("/delete-profile", authToken, deleteProfileController);

//Products
router.post("/upload-product", authToken, uploadProduct);
router.get("/get-products", authToken, getAllProducts);
router.put("/update-product", authToken, updateProduct); //actualizar
router.delete("/delete-product", authToken, deleteProduct); //eliminar
router.get("/get-OneProductByCategory", getOneProductByCategory); //Obtener 1 producto por categoria para HOME page
//aca es get porque se obtiene productos  pero a atraces de un query se envia la categoria, tambien podra ser bosy 
router.get("/get-productsByCategory", getProductsByCategory); //Obtener todos los productos de una categoria para HOME PAGE
router.get("/product-details", getProductDetails); //detalles de un producto
router.get("/searchProducts", searchProducts); //Seacrh products
router.post("/filterProducts", filterProducts); //Filter products
router.get("/productCategory", productCategory); // get product categories



//  Cart Items(products)
router.post("/addtocart", authToken, addToCart); //agrega un item al carrito
router.get("/countAddToCartProduct", authToken, countAddToCartProduct); //cuenta la cantidad total de productos en el carrito del usuario logeado
router.get("/viewCartItems", authToken, viewCartItems); // trae todos los items del carrito del usuario logueado
router.post("/deleteCartItems", authToken, deleteCartItems); // elimina un item del carrito
router.post("/updateCartItems", authToken, updateCartItems); // actualiza un item del carrito(solo cambia la cantidad de articulos por producto)

// Products review
router.post("/createProductReview", authToken, createProductReview); // crea una review de un producto
router.get("/getProductReview/:productId", authToken, getProductReview); // trae el unico review del usuario logueado de un product en especifico
router.put("/updateReview", authToken, updateReview);  //actualiza un review
router.get("/getProductReviewAverage/:productId", getProductReviewAverage); // sace el promedio de las reviews de un producto
router.delete("/deleteReview", authToken, deleteReview); // elimina el review de un producto
router.delete("/deleteReview", authToken, deleteReview); // elimina el review de un producto
router.get("/getProductReviews/:productId", getProductReviews); // obitne todos los reviews de un producto

//Oders
router.post("/checkout", authToken, payment);
router.post("/webhooks", webhooks); //stripe->  /api/webhook   
router.get("/order-list", authToken, User_Order); // trae todas las ordenes del usuario logueado
router.get("/all-order", authToken, allOrder); // trae todas las ordenes



module.exports = router;