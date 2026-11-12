const allowRoles = (...allowedRoles) => {
    return (req,res,next)=>{
        if(!req.user || !allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                success:false,
                message:"access denied,you do not have permissions"
            });
        }
   next();
 };

};
module.exports = allowRoles;