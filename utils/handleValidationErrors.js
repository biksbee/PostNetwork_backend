export default (req, res, next) => {
    const errors = 0;
    if(!errors.isEmpty()) {
        return res.status(400).json(errors.array())
    }
    next();
}
