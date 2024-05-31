const sql = require("mssql");
const { pool } = require("./sqlConfig");
const paginate = require("../middleware/pagination");

exports.viewVehicles = async (ID, offset, pageSize) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("ID", sql.Int, ID)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, pageSize)
      .query(`EXEC ViewVehicles @ID, @offset, @pageSize`);
    const fetched = await paginate.resultCount(
      offset,
      query.recordsets[1].length,
      query.recordsets[0].TOTAL
    );
    return {
      Results:
        "Showing " +
        fetched +
        " of " +
        query.recordsets[0][0].TOTAL +
        " results",
      MyVehicles: query.recordsets[1],
    };
  } catch (error) {
    console.log(error);
    res.status(400).json({ "DB ERROR": error });
  }
};
exports.getProfile = async (ID) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("ID", sql.Int, ID)
      .query(`SELECT * from CarOwner where ID = @ID`);
    return query.recordset[0];
  } catch (error) {
    console.log(error);
    res.status(400).json({ "DB ERROR": error });
  }
};
exports.updateProfile = async (ID, post) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS;
    const request = query.request();
    const result = await request
      .input("ID", sql.Int, ID)
      .input("FirstName", sql.VarChar, post.FirstName)
      .input("LastName", sql.VarChar, post.LastName)
      .input("Gender", sql.VarChar, post.Gender)
      .input("DOB", sql.Date, post.DOB)
      .input("City", sql.VarChar, post.City)
      .input("Country", sql.VarChar, post.Country)
      .input("PhoneNo", sql.VarChar, post.PhoneNo)
      .input("AvatarID", sql.TinyInt, post.AvatarID)
      .query(
        `EXEC UpdateCarOwnerProfile @ID, @FirstName, @LastName, @Gender, @DOB, @City, @Country, @PhoneNo, @AvatarID`
      );
    if (result.recordset[0][""] === 0) {
      return 0;
    } else if (result.recordset[0][""] === 1) {
      return 1;
    } else {
      res.status(400).json({ "DB ERROR": error });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ "DB ERROR": error });
  }
};
exports.addCar = async (ID, post) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS;
    const request = query.request();
    const result = await request
      .input("ID", sql.Int, ID)
      .input("RegistrationNumber", sql.VarChar, post.RegNo.toUpperCase())
      .input("Make", sql.VarChar, post.Make)
      .input("Model", sql.VarChar, post.Model)
      .input("RegYear", sql.Int, post.RegYear)
      .input("Color", sql.VarChar, post.Color)
      .input("Type", sql.VarChar, post.Type)
      .input("RegisteredCountry", sql.VarChar, post.RegisteredCountry)
      .input("RegisteredCity", sql.VarChar, post.RegisteredCity)
      .query(
        `EXEC AddCar @ID, @RegistrationNumber, @Make, @Model, @RegYear, @Color, @Type, @RegisteredCountry, @RegisteredCity`
      );
    if (result.recordset[0][""] === 0) {
      return 0;
    } else if (result.recordset[0][""] === 1) {
      return 1;
    } else {
      res.status(400).json({ "DB ERROR": error });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ "DB ERROR": error });
  }
};
exports.deleteCar = async (OwnerID, RegNo) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS;
    const request = query.request();
    const result = await request
      .input("OwnerID", sql.Int, OwnerID)
      .input("RegNo", sql.VarChar, RegNo)
      // .input("Status", sql.VarChar, post.Status)
      .query(`EXEC DeleteCar @OwnerID, @RegNo`);
    if (result.recordset[0][""] === 0) {
      return 0;
    } else if (result.recordset[0][""] === 1) {
      return 1;
    } else {
      res.status(400).json({ "DB ERROR": error });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ "DB ERROR": error });
  }
};
exports.getHistory = async (userID) => {
  try {
    let poolS = await pool;
    let query = await poolS.request().input("UserID", sql.Int, userID)
      .query(`SELECT ps.*, c.RegistrationNumber, c.Make, c.Model, l.LotName
      FROM ParkingSession ps
      INNER JOIN Car c ON ps.CarID = c.CarID
      INNER JOIN Lot l ON ps.LotID = l.LotID
      WHERE c.OwnerID = @UserID AND ps.OutTime IS NOT NULL;
      `);
    return query.recordset;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getUserCoins = async (userId) => {
  try {
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("UserID", sql.Int, userId)
      .query(`SELECT Coins FROM CarOwner WHERE ID = @UserID`);
    return query.recordset[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};
