const sql = require("mssql");
const { pool } = require("./sqlConfig");
const paginate = require("../middleware/pagination");

exports.getProfile = async (id) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("id", sql.Int, id)
      .query(`SELECT * from Admin where id = @id`);
    return query.recordset[0];
  } catch (error) {
    console.log(error);
    res.status(400).json({ "DB ERROR": error });
  }
};
// exports.credit = async (CarID, Amount) => {
//   try {
//     // let pool = await mssql.connect(config);
//     let poolS = await pool;
//     let query = await poolS
//       .request()
//       .input("CarID", sql.Int, CarID)
//       .input("Amount", sql.Int, Amount)
//       .query(`exec CreditCoins @CarID, @Amount, 0`);
//     return query.recordset[0][""];
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({ "DB ERROR": error });
//   }
// };

exports.updateProfile = async (id, post) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS;
    const request = query.request();
    const result = await request
      .input("id", sql.Int, id)
      .input("firstName", sql.VarChar, post.FirstName.toUpperCase())
      .input("lastName", sql.VarChar, post.LastName.toUpperCase())
      .query(`IF EXISTS (SELECT 1 FROM Admin WHERE id = @id)
              BEGIN
                  UPDATE Admin SET 
                      firstName = @firstName, 
                      lastName = @lastName
                  WHERE id = @id;
                  SELECT 1;
              END
              ELSE
              BEGIN
                  SELECT 0;
              END`);
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

exports.search = async (role, col, key, offset, pageSize) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("role", sql.VarChar, role)
      .input("col", sql.VarChar, col)
      .input("key", sql.VarChar, key)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, pageSize)
      .query(`exec DynamicSearch @role,@col,@key,@offset,@pageSize`);
    const fetched = await paginate.resultCount(
      offset,
      query.recordsets[1].length,
      query.recordsets[0][0]["TOTAL"]
    );
    return {
      Results:
        "Showing " +
        fetched +
        " of " +
        query.recordsets[0][0]["TOTAL"] +
        " records",
      Records: query.recordsets[1],
    };
  } catch (error) {
    console.log(error);
    res.status(400).json({ "DB ERROR": error });
  }
};
// exports.searchUserforCredit = async (Email) => {
//   try {
//     // let pool = await mssql.connect(config);
//     let poolS = await pool;
//     let query = await poolS
//       .request()
//       .input("Email", sql.VarChar, Email)
//       .query(`SELECT * FROM CAROWNER WHERE EMAIL = @Email`);
//     return query.recordset[0];
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({ "DB ERROR": error });
//   }
// };
