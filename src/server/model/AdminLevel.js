const AdminLevel = Object.freeze({
  OWNER: 4, //   (Owner)      - Cannot have any privelidges removed. Can demote admins
  ADMIN: 3, //   (Admin)      - Can access the admin portal and all of its functions. Can change user admin level up to admin. Cannot demote other admins.
  USER: 2, //    (User)       - Can open/close the garage door
  VIEWER: 1, //  (Viewer)     - Can only view the status of the garage door
  ACCOUNT: 0, // (Account)    - Can view and modify their account information, and delete their account
});

export default AdminLevel;
