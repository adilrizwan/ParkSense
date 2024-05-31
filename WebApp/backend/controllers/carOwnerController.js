const carOwnerOps = require("../db/carOwnerOps");
const paginate = require("../middleware/pagination");
const { fb } = require("../db/firebaseConfig");

exports.viewVehicles = async (req, res) => {
  if (req.user.role === "CAROWNER") {
    try {
      const pages = await paginate.paginate(req.query.page);
      const profile = await carOwnerOps.viewVehicles(
        req.user.id,
        pages.start,
        pages.limit
      );
      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
exports.getProfile = async (req, res) => {
  if (req.user.role === "CAROWNER") {
    try {
      const profile = await carOwnerOps.getProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
exports.updateProfile = async (req, res) => {
  if (req.user.role === "CAROWNER") {
    try {
      const post = req.body;
      const update = await carOwnerOps.updateProfile(req.user.id, post);
      if (update === 1) {
        res.status(200).json({ message: "Success" });
      } else {
        res.status(204).json({ message: "User not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
exports.addCar = async (req, res) => {
  if (req.user.role === "CAROWNER") {
    try {
      const post = req.body;
      if (
        !post.RegNo ||
        !post.Make ||
        !post.Model ||
        !post.RegYear ||
        !post.Color ||
        !post.RegisteredCountry ||
        !post.Type
      ) {
        res.status(400).json({ message: "Enter all required fields." });
        return;
      }
      const update = await carOwnerOps.addCar(req.user.id, post);
      if (update === 1) {
        res.status(200).json({ message: "Success" });
      } else {
        res.status(409).json({ message: "Car is already registered." });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
exports.support = async (req, res) => {
  if (req.user.role === "CAROWNER") {
    try {
      const subject = req.body.subject;
      const id = req.user.id + ": " + subject;
      const body = req.body.body;

      if (!subject || !body) {
        res.status(400).json({ message: "Enter all required fields." });
        return;
      }
      if (subject.length > 65) {
        res
          .status(400)
          .json({ message: "Subject must be maximum 60 characters long." });
        return;
      }

      if (body.length > 510) {
        res
          .status(400)
          .json({ message: "Body must be maximum 500 characters long." });
        return;
      }
      const response = await fb
        .collection("Car-Support")
        .doc(id)
        .set({ subject, body, status: "PENDING" });
      res.send(response);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.deleteCar = async (req, res) => {
  if (req.user.role === "CAROWNER") {
    try {
      const carNum = decodeURIComponent(req.params.regno);
      const update = await carOwnerOps.deleteCar(req.user.id, carNum);
      if (update === 1) {
        res.status(200).json({ message: "Success" });
      } else {
        res.status(204).json({ message: "Car not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};


exports.getHistory = async (req, res) => {
  if (req.user.role === "CAROWNER") {
    try {
      const userID = req.user.id;
      const pastSessions = await carOwnerOps.getHistory(userID);

      // Calculate and format duration for each session
      const sessionsWithDuration = pastSessions.map((session) => {
        const inTime = new Date(session.InTime);
        const outTime = new Date(session.OutTime);
        const durationInMilliseconds = outTime - inTime;

        let duration;
        if (durationInMilliseconds < 3600000) {
          // Less than 1 hour (60 * 60 * 1000)
          duration = Math.ceil(durationInMilliseconds / (1000 * 60)); // Convert milliseconds to minutes
          duration = duration + " mins";
        } else {
          const hours = Math.floor(durationInMilliseconds / (1000 * 60 * 60)); // Convert milliseconds to hours
          const minutes = Math.ceil(
            (durationInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
          ); // Remaining minutes
          duration = hours + " hr " + minutes + " mins";
        }

        return {
          ...session,
          Duration: duration,
        };
      });

      res.json(sessionsWithDuration);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.getUserCoins = async (req, res) => {
  if (req.user.role === "CAROWNER") {
    try {
      const userId = req.user.id;
      const result = await carOwnerOps.getUserCoins(userId);
      if (result) {
        res.json({ coins: result.Coins });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Failed to fetch user coins", error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
