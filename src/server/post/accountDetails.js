import UserDetails from "../model/UserDetails.js";
import handleResponse from "./handleResponse.js";

const accountDetails = (req, res, next) => {
  handleResponse(req, res, handleAccountChange, validations, mutations);
};

const handleAccountChange = (req, res) => {
  const updateFields = req.body;
  const userId = req.body.id;
  delete updateFields.id;
  UserDetails.findByIdAndUpdate(userId, updateFields).then((user) => {
    if (user) res.sendStatus(200);
    else res.sendStatus(404);
  });
};

const validations = {
  level: (level) => [0, 1, 2, 3, 4].includes(level),
  id: (id) => typeof id === typeof "",
};

const mutations = {
  level: (level) => Number(level),
};

export default accountDetails;
