import { Router } from "express";

// middleware
import {isLogin} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
// controller 
import { addNewCategory, deleteCategory, getAllCategories, getCategoryDetails, updateCategoryPic, updateCategoryTitle } from "../controllers/category.controller";
import { addNewProduct, changeProductPic, deleteProduct, updateProductDetails, updateStoke } from "../controllers/product.controller.js"

const productRouter = Router()

// category routes
productRouter.route("/:userId/addNewCategory").post(isLogin, upload.single("pic"), addNewCategory)
productRouter.route("/:userId/getCategoryDetails/:categoryId").ger(isLogin, getCategoryDetails)
productRouter.route("/:userId/getAllCategory").get(isLogin, getAllCategories)
productRouter.route("/:userId/updateCategoryTitle/:categoryId").patch(isLogin, updateCategoryTitle)
productRouter.route("/:userId/changeCategoryPic/:categoryId").patch(isLogin, upload.single("pic"), updateCategoryPic)
productRouter.route(":userId/removeCategory/:categoryId").patch(isLogin, deleteCategory)

// product routes

productRouter.route("/:userId/addNewProduct").post(isLogin, upload.single("pic"), addNewProduct)
productRouter.route("/:userId/updateProductDetails/:productId").patch(isLogin, updateProductDetails)
productRouter.route("/:userId/changeProductPic/:productId").patch(isLogin, upload.single("pic"), changeProductPic)
productRouter.route("/:userId/updateProductStock/:productId").patch(isLogin, updateStoke)
productRouter.route("/:userId/deleteProduct/:productId").patch(isLogin, deleteProduct)



export default productRouter