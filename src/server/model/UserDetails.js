import passportLocalMongoose from "passport-local-mongoose";
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const options = {
  errorMessages: {
    MissingPasswordError: "No password was given",
    AttemptTooSoonError: "Account is currently locked. Try again later",
    TooManyAttemptsError:
      "Account locked due to too many failed login attempts",
    NoSaltValueStoredError: "Authentication not possible. No salt value stored",
    IncorrectPasswordError: "Password or username are incorrect",
    IncorrectUsernameError: "Password or username are incorrect",
    MissingUsernameError: "No username was given",
    UserExistsError: "A user with the given username is already registered",
  },
};
const UserDetail = new Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  level: Number,
});

UserDetail.plugin(passportLocalMongoose, options);
const UserDetails = model("userInfo", UserDetail, "userInfo");
export default UserDetails;
