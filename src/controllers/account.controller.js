const accountModel = require("../models/account.model");

/**
 * - Controller to create a new user account.
 *
 * - Handles account creation by validating input data,
 * - creating a new account record, and returning the result.
 */
async function createAccountController(req, res) {
  const user = req.user;

  const account = await accountModel.create({
    user: user._id,
  });

  res.status(201).json({
    account,
  });
}

/**
 * - Controller to retrieve all accounts associated with a user.
 * - Fetches and returns a list of accounts belonging to the authenticated user
 */
async function getUserAccountsControler(req, res) {
  const accounts = await accountModel.find({ user: req.user._id });
  res.status(200).json({
    accounts,
  });
}

module.exports = {
  createAccountController,
  getUserAccountsControler,
};
