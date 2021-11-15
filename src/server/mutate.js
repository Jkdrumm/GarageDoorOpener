const mutate = (req, mutations) => {
  Object.keys(mutations).forEach((mutation) => {
    const value = req.body[mutation];
    if (value !== undefined) req.body[mutation] = mutations[mutation](value);
  });
};

export default mutate;
