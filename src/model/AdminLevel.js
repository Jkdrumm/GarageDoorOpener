export const AdminLevel = Object.freeze({
  OWNER: 4, //   (Owner)      - Cannot have any privelidges removed. Can demote admins. Can transfer ownership
  ADMIN: 3, //   (Admin)      - Can access the admin portal and all of its functions. Can change user admin level up to admin. Cannot demote other admins.
  USER: 2, //    (User)       - Can open/close the garage door
  VIEWER: 1, //  (Viewer)     - Can only view the status of the garage door
  ACCOUNT: 0, // (Account)    - Can view and modify their account information, and delete their account
});

export const getAdminLevelText = (level) => {
  switch (level) {
    case 4:
      return "Owner";
    case 3:
      return "Admin";
    case 2:
      return "User";
    case 1:
      return "Viewer";
    case 0:
      return "Account";
    default:
      return "";
  }
};
