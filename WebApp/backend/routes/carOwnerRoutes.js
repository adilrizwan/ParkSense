const express = require("express");
const router = express.Router();
const register = require("../controllers/registerController");
const carOwnerController = require("../controllers/carOwnerController");
const auth = require("../middleware/auth");

router.post("/register" , register.registerAuth)

router.get("/", auth , carOwnerController.viewVehicles)
router.get("/history", auth , carOwnerController.getHistory)
router.get("/coins", auth , carOwnerController.getUserCoins)
router.get("/profile", auth, carOwnerController.getProfile)
router.put("/profile", auth , carOwnerController.updateProfile)
router.post("/", auth , carOwnerController.addCar)
router.post("/support", auth , carOwnerController.support)
router.delete("/:regno", auth , carOwnerController.deleteCar)

module.exports = router;